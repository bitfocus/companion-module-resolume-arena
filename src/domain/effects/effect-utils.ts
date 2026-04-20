import {ResolumeArenaModuleInstance} from '../../index';
import {compositionState} from '../../state';
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

	constructor(resolumeArenaInstance: ResolumeArenaModuleInstance) {
		this.resolumeArenaInstance = resolumeArenaInstance;
		this.resolumeArenaInstance.log('debug', 'EffectUtils constructor called');
	}

	messageUpdates(_data: {path: string; value: string | boolean | number}, isComposition: boolean): void {
		if (isComposition) {
			this.resolumeArenaInstance.checkFeedbacks('effectBypassed');
			this.resolumeArenaInstance.checkFeedbacks('effectParameter');
		}
	}

	effectsUpdated(): void {
		this.resolumeArenaInstance.checkFeedbacks('effectBypassed');
		this.resolumeArenaInstance.checkFeedbacks('effectParameter');
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
