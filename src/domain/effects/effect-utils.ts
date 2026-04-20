import {CompanionFeedbackInfo} from '@companion-module/base';
import {CompanionCommonCallbackContext} from '@companion-module/base/dist/module-api/common';
import {ResolumeArenaModuleInstance} from '../../index';
import {compositionState, parameterStates} from '../../state';
import {MessageSubscriber} from '../../websocket';
import {ParameterCollection} from '../api';

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

export class EffectUtils implements MessageSubscriber {
	private resolumeArenaInstance: ResolumeArenaModuleInstance;

	private effectBypassedSubscriptions: Map<string, Set<string>> = new Map();

	constructor(resolumeArenaInstance: ResolumeArenaModuleInstance) {
		this.resolumeArenaInstance = resolumeArenaInstance;
		this.resolumeArenaInstance.log('debug', 'EffectUtils constructor called');
	}

	messageUpdates(data: {path: string; value: string | boolean | number}, isComposition: boolean): void {
		if (isComposition) {
			this.resolumeArenaInstance.checkFeedbacks('effectBypassed');
			this.resolumeArenaInstance.checkFeedbacks('effectParameter');
		} else if (data.path?.match(/\/composition\/layers\/\d+\/video\/effects\/\d+\/bypassed/)) {
			this.resolumeArenaInstance.checkFeedbacks('effectBypassed');
		}
	}

	effectsUpdated(): void {
		this.resolumeArenaInstance.checkFeedbacks('effectBypassed');
		this.resolumeArenaInstance.checkFeedbacks('effectParameter');
	}

	/////////////////////////////////////////////////
	// EFFECT BYPASS
	/////////////////////////////////////////////////

	private effectBypassPath(layer: number, effectIdx: number): string {
		return `/composition/layers/${layer}/video/effects/${effectIdx}/bypassed`;
	}

	async effectBypassedFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<boolean> {
		const layer = +await context.parseVariablesInString(feedback.options.layer as string);
		const effectIdx = +await context.parseVariablesInString(feedback.options.effectIdx as string);
		if (!layer || !effectIdx) return false;
		return !!parameterStates.get()[this.effectBypassPath(layer, effectIdx)]?.value;
	}

	async effectBypassedFeedbackSubscribe(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<void> {
		const layer = +await context.parseVariablesInString(feedback.options.layer as string);
		const effectIdx = +await context.parseVariablesInString(feedback.options.effectIdx as string);
		if (!layer || !effectIdx) return;
		const key = `${layer}:${effectIdx}`;
		if (!this.effectBypassedSubscriptions.has(key)) {
			this.effectBypassedSubscriptions.set(key, new Set());
			this.resolumeArenaInstance.getWebsocketApi()?.subscribePath(this.effectBypassPath(layer, effectIdx));
		}
		this.effectBypassedSubscriptions.get(key)!.add(feedback.id);
	}

	async effectBypassedFeedbackUnsubscribe(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<void> {
		const layer = +await context.parseVariablesInString(feedback.options.layer as string);
		const effectIdx = +await context.parseVariablesInString(feedback.options.effectIdx as string);
		if (!layer || !effectIdx) return;
		const key = `${layer}:${effectIdx}`;
		const subs = this.effectBypassedSubscriptions.get(key);
		if (!subs) return;
		subs.delete(feedback.id);
		if (subs.size === 0) {
			this.effectBypassedSubscriptions.delete(key);
			this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath(this.effectBypassPath(layer, effectIdx));
		}
	}

	listEffects(layer: number): EffectMeta[] {
		const layers = compositionState.get()?.layers;
		if (!layers) return [];
		const layerObj = layers[layer - 1];
		if (!layerObj?.video?.effects) return [];
		return layerObj.video.effects.map((eff, idx) => ({
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

	getEffectBypassedParamId(layer: number, effectIdx: number): number | undefined {
		const layers = compositionState.get()?.layers;
		if (!layers) return undefined;
		const layerObj = layers[layer - 1];
		if (!layerObj?.video?.effects) return undefined;
		return layerObj.video.effects[effectIdx - 1]?.bypassed?.id;
	}

	getEffectParamId(layer: number, effectIdx: number, collection: 'params' | 'mixer' | 'effect', paramName: string): number | undefined {
		const layers = compositionState.get()?.layers;
		if (!layers) return undefined;
		const layerObj = layers[layer - 1];
		if (!layerObj?.video?.effects) return undefined;
		const eff = layerObj.video.effects[effectIdx - 1];
		if (!eff) return undefined;
		return (eff[collection] as ParameterCollection | undefined)?.[paramName]?.id;
	}
}
