import {CompanionAdvancedFeedbackResult, CompanionFeedbackInfo, DropdownChoice} from '@companion-module/base';
import {CompanionCommonCallbackContext} from '@companion-module/base/dist/module-api/common';
import {ResolumeArenaModuleInstance} from '../../index';
import {compositionState, parameterStates} from '../../state';
import {MessageSubscriber} from '../../websocket';
import {ParameterCollection, VideoEffect} from '../api';

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
			this.resolumeArenaInstance.checkFeedbacks('effectBypassed');
			this.resolumeArenaInstance.checkFeedbacks('effectParameter');
		} else if (data.path?.match(/\/video\/effects\/\d+\/bypassed/)) {
			this.resolumeArenaInstance.checkFeedbacks('effectBypassed');
		} else if (data.path?.match(/\/video\/effects\/\d+\/(params|mixer|effect)\//)) {
			this.resolumeArenaInstance.checkFeedbacks('effectParameter');
		}
	}

	effectsUpdated(): void {
		this.resolumeArenaInstance.checkFeedbacks('effectBypassed');
		this.resolumeArenaInstance.checkFeedbacks('effectParameter');
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
	 * Returns dropdown choices for all effects across all scopes in the current composition.
	 * Each choice id encodes `scope:layer:column:layerGroup:effectIdx` and the label is human-readable.
	 */
	buildEffectChoices(): DropdownChoice[] {
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
				const groupLabel = (group.name as any)?.value ?? `Group ${gi + 1}`;
				choices.push({id: `layergroup:0:0:${gi + 1}:${ei + 1}`, label: `${groupLabel} – ${label} (#${ei + 1})`});
			});
		});

		// Layer effects
		(state.layers ?? []).forEach((layer, li) => {
			(layer.video?.effects ?? []).forEach((eff, ei) => {
				const label = eff.displayName ?? eff.name ?? `Effect ${ei + 1}`;
				const layerLabel = (layer.name as any)?.value ?? `Layer ${li + 1}`;
				choices.push({id: `layer:${li + 1}:0:0:${ei + 1}`, label: `${layerLabel} – ${label} (#${ei + 1})`});
			});
			// Clip effects (for each clip in the layer)
			(layer.clips ?? []).forEach((clip, ci) => {
				(clip.video?.effects ?? []).forEach((eff, ei) => {
					const label = eff.displayName ?? eff.name ?? `Effect ${ei + 1}`;
					const layerLabel = (layer.name as any)?.value ?? `Layer ${li + 1}`;
					const clipLabel = (clip.name as any)?.value ?? `Clip ${ci + 1}`;
					choices.push({id: `clip:${li + 1}:${ci + 1}:0:${ei + 1}`, label: `${layerLabel}/${clipLabel} – ${label} (#${ei + 1})`});
				});
			});
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

	getEffectBypassedParamId(scope: EffectScope, location: EffectLocation, effectIdx: number): number | undefined {
		const effects = this.getEffectsArray(scope, location);
		if (!effects) return undefined;
		return effects[effectIdx - 1]?.bypassed?.id;
	}

	getEffectParamId(scope: EffectScope, location: EffectLocation, effectIdx: number, collection: EffectCollection, paramName: string): number | undefined {
		const effects = this.getEffectsArray(scope, location);
		if (!effects) return undefined;
		const eff = effects[effectIdx - 1];
		if (!eff) return undefined;
		return (eff[collection] as ParameterCollection | undefined)?.[paramName]?.id;
	}

	/////////////////////////////////////////////////
	// EFFECT BYPASS
	/////////////////////////////////////////////////

	async effectBypassedFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<boolean> {
		const {scope, location, effectIdx} = await this.parseScopeOptions(feedback.options, context);
		if (!effectIdx) return false;
		return !!parameterStates.get()[this.effectBypassPath(scope, location, effectIdx)]?.value;
	}

	async effectBypassedFeedbackSubscribe(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<void> {
		const {scope, location, effectIdx} = await this.parseScopeOptions(feedback.options, context);
		if (!effectIdx) return;
		const key = this.subscriptionKey(scope, location, effectIdx);
		if (!this.effectBypassedSubscriptions.has(key)) {
			this.effectBypassedSubscriptions.set(key, new Set());
			this.resolumeArenaInstance.getWebsocketApi()?.subscribePath(this.effectBypassPath(scope, location, effectIdx));
		}
		this.effectBypassedSubscriptions.get(key)!.add(feedback.id);
	}

	async effectBypassedFeedbackUnsubscribe(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<void> {
		const {scope, location, effectIdx} = await this.parseScopeOptions(feedback.options, context);
		if (!effectIdx) return;
		const key = this.subscriptionKey(scope, location, effectIdx);
		const subs = this.effectBypassedSubscriptions.get(key);
		if (!subs) return;
		subs.delete(feedback.id);
		if (subs.size === 0) {
			this.effectBypassedSubscriptions.delete(key);
			this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath(this.effectBypassPath(scope, location, effectIdx));
		}
	}

	/////////////////////////////////////////////////
	// EFFECT PARAMETER
	/////////////////////////////////////////////////

	async effectParameterFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<CompanionAdvancedFeedbackResult> {
		const {scope, location, effectIdx} = await this.parseScopeOptions(feedback.options, context);
		const collection = feedback.options.collection as EffectCollection;
		const paramName = await context.parseVariablesInString(feedback.options.paramName as string);
		if (!effectIdx || !collection || !paramName) return {text: '?'};
		const path = this.effectParamPath(scope, location, effectIdx, collection, paramName);
		const current = parameterStates.get()[path]?.value;
		if (current === undefined) return {text: '?'};
		return {text: String(current)};
	}

	async effectParameterFeedbackSubscribe(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<void> {
		const {scope, location, effectIdx} = await this.parseScopeOptions(feedback.options, context);
		const collection = feedback.options.collection as EffectCollection;
		const paramName = await context.parseVariablesInString(feedback.options.paramName as string);
		if (!effectIdx || !collection || !paramName) return;
		const path = this.effectParamPath(scope, location, effectIdx, collection, paramName);
		if (!this.effectParameterSubscriptions.has(path)) {
			this.effectParameterSubscriptions.set(path, new Set());
			this.resolumeArenaInstance.getWebsocketApi()?.subscribePath(path);
		}
		this.effectParameterSubscriptions.get(path)!.add(feedback.id);
	}

	async effectParameterFeedbackUnsubscribe(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<void> {
		const {scope, location, effectIdx} = await this.parseScopeOptions(feedback.options, context);
		const collection = feedback.options.collection as EffectCollection;
		const paramName = await context.parseVariablesInString(feedback.options.paramName as string);
		if (!effectIdx || !collection || !paramName) return;
		const path = this.effectParamPath(scope, location, effectIdx, collection, paramName);
		const subs = this.effectParameterSubscriptions.get(path);
		if (!subs) return;
		subs.delete(feedback.id);
		if (subs.size === 0) {
			this.effectParameterSubscriptions.delete(path);
			this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath(path);
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
		const scope = (options.scope as EffectScope) ?? 'layer';

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
