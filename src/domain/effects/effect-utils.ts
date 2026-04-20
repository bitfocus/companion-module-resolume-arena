import {CompanionAdvancedFeedbackResult, CompanionFeedbackInfo, DropdownChoice} from '@companion-module/base';
import {CompanionCommonCallbackContext} from '@companion-module/base/dist/module-api/common';
import {ResolumeArenaModuleInstance} from '../../index';
import {compositionState, parameterStates} from '../../state';
import {MessageSubscriber} from '../../websocket';
import {ChoiceParameter, ParameterCollection, VideoEffect} from '../api';

export interface EffectMeta {
	idx: number;
	id: number;
	name: string;
	displayName: string;
	bypassedParamId: number | undefined;
	params: ParameterCollection | undefined;
	mixer: ParameterCollection | undefined;
	effect: ParameterCollection | undefined;
}

export type EffectCollection = 'params' | 'mixer' | 'effect';
export type EffectScope = 'composition' | 'layergroup' | 'layer' | 'clip';

export interface EffectLocation {
	layer?: number;
	column?: number;
	layerGroup?: number;
}

export const MANUAL_EFFECT_CHOICE = '__manual__';
export const MANUAL_PARAM_CHOICE = '__manual_param__';
export const MANUAL_VALUE_CHOICE = '__manual_value__';
export type EffectParamMode = 'set' | 'increase' | 'decrease' | 'toggle';

function resolveName(raw: string | undefined, idx: number, fallbackPrefix: string): string {
	if (!raw) return `${fallbackPrefix} ${idx}`;
	return raw.replace('#', String(idx));
}

export class EffectUtils implements MessageSubscriber {
	private resolumeArenaInstance: ResolumeArenaModuleInstance;

	private effectBypassedSubscriptions: Map<string, Set<string>> = new Map();
	private effectParameterSubscriptions: Map<string, Set<string>> = new Map();

	constructor(resolumeArenaInstance: ResolumeArenaModuleInstance) {
		this.resolumeArenaInstance = resolumeArenaInstance;
		this.resolumeArenaInstance.log('debug', 'EffectUtils constructor called');
	}

	messageUpdates(data: {path: string; value: string | boolean | number}, isComposition: boolean): void {
		if (isComposition) {
			this.checkAllBypassFeedbacks();
			this.checkAllParameterFeedbacks();
		} else if (data.path?.match(/\/video\/effects\/\d+\/bypassed/)) {
			this.checkAllBypassFeedbacks();
		} else if (data.path?.match(/\/video\/effects\/\d+\/(params|mixer|effect)\//)) {
			this.checkAllParameterFeedbacks();
		} else if (data.path?.startsWith('/parameter/by-id/')) {
			if (this.effectBypassedSubscriptions.has(data.path)) {
				this.checkAllBypassFeedbacks();
			}
			if (this.effectParameterSubscriptions.has(data.path)) {
				this.checkAllParameterFeedbacks();
			}
		}
	}

	private checkAllBypassFeedbacks(): void {
		for (const id of ['effectBypassedLayer', 'effectBypassedClip', 'effectBypassedClipList', 'effectBypassedGroup', 'effectBypassedComposition']) {
			this.resolumeArenaInstance.checkFeedbacks(id);
		}
	}

	private checkAllParameterFeedbacks(): void {
		for (const id of ['effectParameterLayer', 'effectParameterClip', 'effectParameterClipList', 'effectParameterGroup', 'effectParameterComposition']) {
			this.resolumeArenaInstance.checkFeedbacks(id);
		}
	}

	effectsUpdated(): void {
		this.checkAllBypassFeedbacks();
		this.checkAllParameterFeedbacks();
		// Rebuild action/feedback definitions so effect dropdowns reflect current composition
		this.resolumeArenaInstance.rebuildDynamicDefinitions();
	}

	/////////////////////////////////////////////////
	// PATHS
	/////////////////////////////////////////////////

	effectBypassPath(scope: EffectScope, location: EffectLocation, effectIdx: number): string {
		return `${this.scopeBasePath(scope, location)}/video/effects/${effectIdx}/bypassed`;
	}

	effectParamPath(scope: EffectScope, location: EffectLocation, effectIdx: number, collection: EffectCollection, paramName: string): string {
		return `${this.scopeBasePath(scope, location)}/video/effects/${effectIdx}/${collection}/${paramName}`;
	}

	private scopeBasePath(scope: EffectScope, location: EffectLocation): string {
		switch (scope) {
			case 'composition':
				return '/composition';
			case 'layergroup':
				return `/composition/layergroups/${location.layerGroup ?? 1}`;
			case 'layer':
				return `/composition/layers/${location.layer ?? 1}`;
			case 'clip':
				return `/composition/layers/${location.layer ?? 1}/clips/${location.column ?? 1}`;
		}
	}

	/////////////////////////////////////////////////
	// DISCOVERY HELPERS
	/////////////////////////////////////////////////

	listEffects(layer: number): EffectMeta[] {
		return this.listEffectsForScope('layer', {layer});
	}

	listEffectsForScope(scope: EffectScope, location: EffectLocation): EffectMeta[] {
		const effects = this.getEffectsArray(scope, location);
		if (!effects) return [];
		return this.mapEffects(effects);
	}

	private getEffectsArray(scope: EffectScope, location: EffectLocation): VideoEffect[] | undefined {
		const state = compositionState.get();
		if (!state) return undefined;
		switch (scope) {
			case 'composition':
				return state.video?.effects;
			case 'layergroup': {
				const groups = state.layergroups;
				if (!groups || !location.layerGroup) return undefined;
				return groups[location.layerGroup - 1]?.video?.effects;
			}
			case 'layer': {
				const layers = state.layers;
				if (!layers || !location.layer) return undefined;
				return layers[location.layer - 1]?.video?.effects;
			}
			case 'clip': {
				const layers = state.layers;
				if (!layers || !location.layer || !location.column) return undefined;
				const clips = layers[location.layer - 1]?.clips;
				if (!clips) return undefined;
				return clips[location.column - 1]?.video?.effects;
			}
		}
	}

	private mapEffects(effects: VideoEffect[]): EffectMeta[] {
		return effects.map((eff, idx) => ({
			idx: idx + 1,
			id: eff.id ?? 0,
			name: eff.name ?? '',
			displayName: eff.displayName ?? eff.name ?? '',
			bypassedParamId: eff.bypassed?.id,
			params: eff.params,
			mixer: eff.mixer,
			effect: eff.effect,
		}));
	}

	/**
	 * Returns dropdown choices for effects in the current composition.
	 * When includeClips is true, clip effects are included — only use this for
	 * compositions known to be small; large compositions can have thousands of entries.
	 */
	buildEffectChoices(includeClips = false): DropdownChoice[] {
		const choices: DropdownChoice[] = [{id: MANUAL_EFFECT_CHOICE, label: 'Manual (enter index below)'}];
		const state = compositionState.get();
		if (!state) return choices;

		// Composition-level effects
		if (state.video?.effects?.length) {
			this.mapEffects(state.video.effects).forEach((e) => {
				choices.push({id: `composition:0:0:0:${e.idx}`, label: `Composition – ${e.displayName || e.name} (#${e.idx})`});
			});
		}

		// Layer-group effects
		(state.layergroups ?? []).forEach((group, gi) => {
			(group.video?.effects ?? []).forEach((eff, ei) => {
				const label = eff.displayName ?? eff.name ?? `Effect ${ei + 1}`;
				const groupLabel = resolveName((group.name as any)?.value, gi + 1, 'Group');
				choices.push({id: `layergroup:0:0:${gi + 1}:${ei + 1}`, label: `${groupLabel} – ${label} (#${ei + 1})`});
			});
		});

		// Layer effects
		(state.layers ?? []).forEach((layer, li) => {
			(layer.video?.effects ?? []).forEach((eff, ei) => {
				const label = eff.displayName ?? eff.name ?? `Effect ${ei + 1}`;
				const layerLabel = resolveName((layer.name as any)?.value, li + 1, 'Layer');
				choices.push({id: `layer:${li + 1}:0:0:${ei + 1}`, label: `${layerLabel} – ${label} (#${ei + 1})`});
			});
			if (includeClips) {
				(layer.clips ?? []).forEach((clip, ci) => {
					(clip.video?.effects ?? []).forEach((eff, ei) => {
						const label = eff.displayName ?? eff.name ?? `Effect ${ei + 1}`;
						const layerLabel = resolveName((layer.name as any)?.value, li + 1, 'Layer');
						const clipLabel = resolveName((clip.name as any)?.value, ci + 1, 'Clip');
						choices.push({id: `clip:${li + 1}:${ci + 1}:0:${ei + 1}`, label: `${layerLabel}/${clipLabel} – ${label} (#${ei + 1})`});
					});
				});
			}
		});

		return choices;
	}

	/**
	 * Decodes an effect choice id back into scope+location+effectIdx.
	 * Returns null for MANUAL_EFFECT_CHOICE.
	 */
	decodeEffectChoice(id: string): {scope: EffectScope; location: EffectLocation; effectIdx: number} | null {
		if (id === MANUAL_EFFECT_CHOICE) return null;
		const parts = id.split(':');
		if (parts.length !== 5) return null;
		const [scope, layer, column, layerGroup, effectIdx] = parts;
		return {
			scope: scope as EffectScope,
			location: {
				layer: Number(layer) || undefined,
				column: Number(column) || undefined,
				layerGroup: Number(layerGroup) || undefined,
			},
			effectIdx: Number(effectIdx),
		};
	}

	/**
	 * Returns a deduplicated list of parameter names for a single collection across the entire composition.
	 * Prefixed with the manual sentinel so the user can still type freely.
	 */
	buildParamChoicesForCollection(collection: EffectCollection): DropdownChoice[] {
		const choices: DropdownChoice[] = [{id: MANUAL_PARAM_CHOICE, label: 'Manual (type below)'}];
		const seen = new Set<string>();

		const state = compositionState.get();
		if (!state) return choices;

		const addFromEffect = (eff: VideoEffect) => {
			const coll = eff[collection] as ParameterCollection | undefined;
			if (!coll) return;
			for (const name of Object.keys(coll)) {
				if (!seen.has(name)) {
					seen.add(name);
					choices.push({id: name, label: name});
				}
			}
		};

		(state.video?.effects ?? []).forEach(addFromEffect);
		(state.layergroups ?? []).forEach((g) => (g.video?.effects ?? []).forEach(addFromEffect));
		(state.layers ?? []).forEach((l) => {
			(l.video?.effects ?? []).forEach(addFromEffect);
			(l.clips ?? []).forEach((c) => (c.video?.effects ?? []).forEach(addFromEffect));
		});

		return choices;
	}

	/**
	 * Returns deduplicated ChoiceParameter option strings for a single collection.
	 * Used to build per-collection value choice dropdowns.
	 */
	buildValueChoicesForCollection(collection: EffectCollection): DropdownChoice[] {
		const choices: DropdownChoice[] = [{id: MANUAL_VALUE_CHOICE, label: 'Manual (type below)'}];
		const seen = new Set<string>();

		const addFromEffect = (eff: VideoEffect) => {
			const coll = eff[collection] as ParameterCollection | undefined;
			if (!coll) return;
			for (const param of Object.values(coll)) {
				if (param.valuetype === 'ParamChoice' || param.valuetype === 'ParamState') {
					for (const opt of (param as ChoiceParameter).options ?? []) {
						if (!seen.has(opt)) {
							seen.add(opt);
							choices.push({id: opt, label: opt});
						}
					}
				}
			}
		};

		const state = compositionState.get();
		if (!state) return choices;

		(state.video?.effects ?? []).forEach(addFromEffect);
		(state.layergroups ?? []).forEach((g) => (g.video?.effects ?? []).forEach(addFromEffect));
		(state.layers ?? []).forEach((l) => {
			(l.video?.effects ?? []).forEach(addFromEffect);
			(l.clips ?? []).forEach((c) => (c.video?.effects ?? []).forEach(addFromEffect));
		});

		return choices;
	}

	/**
	 * Returns a deduplicated list of all known string options from ChoiceParameter/ParamState
	 * parameters across the entire composition. Prefixed with the manual sentinel.
	 */
	buildValueChoices(): DropdownChoice[] {
		const choices: DropdownChoice[] = [{id: MANUAL_VALUE_CHOICE, label: 'Manual (type below)'}];
		const seen = new Set<string>();

		const addFromEffect = (eff: VideoEffect) => {
			for (const coll of [eff.params, eff.mixer, eff.effect] as (ParameterCollection | undefined)[]) {
				if (!coll) continue;
				for (const param of Object.values(coll)) {
					if (param.valuetype === 'ParamChoice' || param.valuetype === 'ParamState') {
						for (const opt of (param as ChoiceParameter).options ?? []) {
							if (!seen.has(opt)) {
								seen.add(opt);
								choices.push({id: opt, label: opt});
							}
						}
					}
				}
			}
		};

		const state = compositionState.get();
		if (!state) return choices;

		(state.video?.effects ?? []).forEach(addFromEffect);
		(state.layergroups ?? []).forEach((g) => (g.video?.effects ?? []).forEach(addFromEffect));
		(state.layers ?? []).forEach((l) => {
			(l.video?.effects ?? []).forEach(addFromEffect);
			(l.clips ?? []).forEach((c) => (c.video?.effects ?? []).forEach(addFromEffect));
		});

		return choices;
	}

	getEffectBypassedParamId(scope: EffectScope, location: EffectLocation, effectIdx: number): number | undefined {
		const effects = this.getEffectsArray(scope, location);
		if (!effects) return undefined;
		return effects[effectIdx - 1]?.bypassed?.id;
	}

	getEffectParamId(scope: EffectScope, location: EffectLocation, effectIdx: number, collection: EffectCollection, paramName: string): number | undefined {
		return this.getEffectParam(scope, location, effectIdx, collection, paramName)?.id;
	}

	getEffectParam(
		scope: EffectScope,
		location: EffectLocation,
		effectIdx: number,
		collection: EffectCollection,
		paramName: string
	): (ParameterCollection[string] & {id?: number; value?: any}) | undefined {
		const effects = this.getEffectsArray(scope, location);
		if (!effects) return undefined;
		const eff = effects[effectIdx - 1];
		if (!eff) return undefined;
		return (eff[collection] as ParameterCollection | undefined)?.[paramName];
	}

	/**
	 * Finds a parameter by name across all three collections (params / mixer / effect).
	 * Use this when the collection is not known or should not constrain the lookup.
	 */
	findEffectParam(
		scope: EffectScope,
		location: EffectLocation,
		effectIdx: number,
		paramName: string
	): (ParameterCollection[string] & {id?: number; value?: any}) | undefined {
		for (const coll of ['params', 'mixer', 'effect'] as EffectCollection[]) {
			const p = this.getEffectParam(scope, location, effectIdx, coll, paramName);
			if (p !== undefined) return p;
		}
		return undefined;
	}

	/////////////////////////////////////////////////
	// EFFECT BYPASS
	// scope is the first param so these can be partially applied via .bind(eu, scope)
	// and the Companion SDK will call them as (feedback, context)
	/////////////////////////////////////////////////

	async effectBypassedFeedbackCallback(scope: EffectScope, feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<boolean> {
		const resolved = await this.parseScopeOptions({...feedback.options, scope}, context);
		if (!resolved.effectIdx) return false;
		return !!parameterStates.get()[this.effectBypassPath(resolved.scope, resolved.location, resolved.effectIdx)]?.value;
	}

	async effectBypassedFeedbackSubscribe(scope: EffectScope, feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<void> {
		const resolved = await this.parseScopeOptions({...feedback.options, scope}, context);
		if (!resolved.effectIdx) return;
		const key = this.subscriptionKey(resolved.scope, resolved.location, resolved.effectIdx);
		if (!this.effectBypassedSubscriptions.has(key)) {
			this.effectBypassedSubscriptions.set(key, new Set());
			this.resolumeArenaInstance.getWebsocketApi()?.subscribePath(this.effectBypassPath(resolved.scope, resolved.location, resolved.effectIdx));
		}
		this.effectBypassedSubscriptions.get(key)!.add(feedback.id);
	}

	async effectBypassedFeedbackUnsubscribe(scope: EffectScope, feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<void> {
		const resolved = await this.parseScopeOptions({...feedback.options, scope}, context);
		if (!resolved.effectIdx) return;
		const key = this.subscriptionKey(resolved.scope, resolved.location, resolved.effectIdx);
		const subs = this.effectBypassedSubscriptions.get(key);
		if (!subs) return;
		subs.delete(feedback.id);
		if (subs.size === 0) {
			this.effectBypassedSubscriptions.delete(key);
			this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath(this.effectBypassPath(resolved.scope, resolved.location, resolved.effectIdx));
		}
	}

	/////////////////////////////////////////////////
	// EFFECT PARAMETER
	/////////////////////////////////////////////////

	private async resolveParamName(options: Record<string, any>, context: CompanionCommonCallbackContext): Promise<string> {
		const collection = options.collection as EffectCollection;
		const rawChoice = options[`paramChoice_${collection}`] as string | undefined;
		if (rawChoice && rawChoice !== MANUAL_PARAM_CHOICE) return rawChoice;
		return context.parseVariablesInString(options.paramName as string ?? '');
	}

	private resolveEffectParam(
		options: Record<string, any>,
		scope: EffectScope,
		location: EffectLocation,
		effectIdx: number,
		paramName: string
	): (ParameterCollection[string] & {id?: number; value?: any}) | undefined {
		return this.getEffectParam(scope, location, effectIdx, options.collection as EffectCollection, paramName);
	}

	async effectParameterFeedbackCallback(scope: EffectScope, feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<CompanionAdvancedFeedbackResult> {
		const resolved = await this.parseScopeOptions({...feedback.options, scope}, context);
		const paramName = await this.resolveParamName(feedback.options, context);
		if (!resolved.effectIdx || !paramName) return {text: '?'};
		const param = this.resolveEffectParam(feedback.options, resolved.scope, resolved.location, resolved.effectIdx, paramName);
		if (param?.id === undefined) return {text: '?'};
		const current = parameterStates.get()['/parameter/by-id/' + param.id]?.value;
		if (current === undefined) return {text: '?'};
		return {text: String(current)};
	}

	async effectParameterFeedbackSubscribe(scope: EffectScope, feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<void> {
		const resolved = await this.parseScopeOptions({...feedback.options, scope}, context);
		const paramName = await this.resolveParamName(feedback.options, context);
		if (!resolved.effectIdx || !paramName) return;
		const param = this.resolveEffectParam(feedback.options, resolved.scope, resolved.location, resolved.effectIdx, paramName);
		if (param?.id === undefined) return;
		const key = '/parameter/by-id/' + param.id;
		if (!this.effectParameterSubscriptions.has(key)) {
			this.effectParameterSubscriptions.set(key, new Set());
			this.resolumeArenaInstance.getWebsocketApi()?.subscribeParam(param.id);
		}
		this.effectParameterSubscriptions.get(key)!.add(feedback.id);
	}

	async effectParameterFeedbackUnsubscribe(scope: EffectScope, feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<void> {
		const resolved = await this.parseScopeOptions({...feedback.options, scope}, context);
		const paramName = await this.resolveParamName(feedback.options, context);
		if (!resolved.effectIdx || !paramName) return;
		const param = this.resolveEffectParam(feedback.options, resolved.scope, resolved.location, resolved.effectIdx, paramName);
		if (param?.id === undefined) return;
		const key = '/parameter/by-id/' + param.id;
		const subs = this.effectParameterSubscriptions.get(key);
		if (!subs) return;
		subs.delete(feedback.id);
		if (subs.size === 0) {
			this.effectParameterSubscriptions.delete(key);
			this.resolumeArenaInstance.getWebsocketApi()?.unsubscribeParam(param.id);
		}
	}

	/////////////////////////////////////////////////
	// SCOPE PARSING (public for action callbacks)
	/////////////////////////////////////////////////

	async parseScopeOptionsFromAction(
		options: Record<string, any>,
		instance: {parseVariablesInString: (s: string) => Promise<string>}
	): Promise<{scope: EffectScope; location: EffectLocation; effectIdx: number}> {
		const fakeContext: CompanionCommonCallbackContext = {
			parseVariablesInString: instance.parseVariablesInString.bind(instance),
		};
		return this.parseScopeOptions(options, fakeContext);
	}

	private async parseScopeOptions(
		options: Record<string, any>,
		context: CompanionCommonCallbackContext
	): Promise<{scope: EffectScope; location: EffectLocation; effectIdx: number}> {
		// Caller always embeds scope in options (from action/feedback scope param)
		const scope = options.scope as EffectScope;

		// If a preset effect choice is selected, decode it
		const effectChoice = options.effectChoice as string | undefined;
		if (effectChoice && effectChoice !== MANUAL_EFFECT_CHOICE) {
			const decoded = this.decodeEffectChoice(effectChoice);
			if (decoded) {
				return decoded;
			}
		}

		// Manual path: resolve layer/column/layerGroup + effectIdx from textinputs
		const layer = scope === 'layer' || scope === 'clip'
			? +(await context.parseVariablesInString(options.layer as string ?? '0'))
			: 0;
		const column = scope === 'clip'
			? +(await context.parseVariablesInString(options.column as string ?? '0'))
			: 0;
		const layerGroup = scope === 'layergroup'
			? +(await context.parseVariablesInString(options.layerGroup as string ?? '0'))
			: 0;
		const effectIdx = +(await context.parseVariablesInString(options.effectIdx as string ?? '0'));

		const location: EffectLocation = {
			layer: layer || undefined,
			column: column || undefined,
			layerGroup: layerGroup || undefined,
		};

		// Guard: required location fields must be present for the given scope
		if (scope === 'layer' && !location.layer) return {scope, location, effectIdx: 0};
		if (scope === 'clip' && (!location.layer || !location.column)) return {scope, location, effectIdx: 0};
		if (scope === 'layergroup' && !location.layerGroup) return {scope, location, effectIdx: 0};

		return {scope, location, effectIdx};
	}

	private subscriptionKey(scope: EffectScope, location: EffectLocation, effectIdx: number): string {
		return `${scope}:${location.layer ?? 0}:${location.column ?? 0}:${location.layerGroup ?? 0}:${effectIdx}`;
	}
}
