import {CompanionAdvancedFeedbackResult, CompanionFeedbackInfo} from '@companion-module/base';
import {drawPercentage, drawVolume} from '../../image-utils';
import {ResolumeArenaModuleInstance} from '../../index';
import {compositionState, parameterStates} from '../../state';
import {MessageSubscriber} from '../../websocket';

export class CompositionUtils implements MessageSubscriber {
	private resolumeArenaInstance: ResolumeArenaModuleInstance;

	private compositionMasterSubscriptions: Map<string, Set<string>> = new Map<string, Set<string>>();
	private compositionSpeedSubscriptions: Map<string, Set<string>> = new Map<string, Set<string>>();

	constructor(resolumeArenaInstance: ResolumeArenaModuleInstance) {
		this.resolumeArenaInstance = resolumeArenaInstance;
		this.resolumeArenaInstance.log('debug', 'CompositionUtils constructor called');
	}

	messageUpdates(data: {path: any}, isComposition: boolean) {
		if (isComposition) {
			this.resolumeArenaInstance.getWebsocketApi()?.unsubscribeParam(compositionState.get()!.tempoController?.tempo?.id!);
			this.resolumeArenaInstance.getWebsocketApi()?.subscribeParam(compositionState.get()!.tempoController?.tempo?.id!);
			this.resolumeArenaInstance.getWebsocketApi()?.unsubscribeParam(compositionState.get()?.audio?.volume?.id!);
			this.resolumeArenaInstance.getWebsocketApi()?.subscribeParam(compositionState.get()?.audio?.volume?.id!);
			this.resolumeArenaInstance.getWebsocketApi()?.unsubscribeParam(compositionState.get()?.video?.opacity?.id!);
			this.resolumeArenaInstance.getWebsocketApi()?.subscribeParam(compositionState.get()?.video?.opacity?.id!);
		}

		if (data.path) {
			if (!!data.path.match(/\/composition\/master/)) {
				this.resolumeArenaInstance.checkFeedbacks('compositionMaster');
			}
			if (!!data.path.match(/\/composition\/video\/opacity/)) {
				this.resolumeArenaInstance.checkFeedbacks('compositionOpacity');
			}
			if (!!data.path.match(/\/composition\/audio\/volume/)) {
				this.resolumeArenaInstance.checkFeedbacks('compositionVolume');
			}
			if (!!data.path.match(/\/composition\/speed/)) {
				this.resolumeArenaInstance.checkFeedbacks('compositionSpeed');
			}
			if (!!data.path.match(/\/composition\/tempocontroller\/tempo/)) {
				this.resolumeArenaInstance.checkFeedbacks('tempo');
			}
		}
	}

	/////////////////////////////////////////////////
	// Master
	/////////////////////////////////////////////////

	compositionMasterFeedbackCallback(_feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		const master = parameterStates.get()['/composition/master']?.value;
		if (master !== undefined) {
			return {
				text: Math.round(master * 100) + '%',
				show_topbar: false,
				imageBuffer: drawPercentage(master)
			};
		}
		return {text: '?'};
	}

	compositionMasterFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		if (!this.compositionMasterSubscriptions.get('composition')) {
			this.compositionMasterSubscriptions.set('composition', new Set());
			this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/master');
		}
		this.compositionMasterSubscriptions.get('composition')?.add(feedback.id);
	}

	compositionMasterFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		const compositionMasterSubscription = this.compositionMasterSubscriptions.get('composition');
		if (compositionMasterSubscription) {
			compositionMasterSubscription.delete(feedback.id);
			if (compositionMasterSubscription.size === 0) {
				this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/master');
				this.compositionMasterSubscriptions.delete('composition');
			}
		}
	}

	/////////////////////////////////////////////////
	// Volume
	/////////////////////////////////////////////////

	compositionVolumeFeedbackCallback(_feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		const volume = parameterStates.get()['/composition/audio/volume']?.value;
		if (volume !== undefined) {
			return {
				text: Math.round(volume * 100)/100+ 'db',
				show_topbar: false,
				imageBuffer: drawVolume(volume)
			};
		}
		return {text: '?'};
	}


	/////////////////////////////////////////////////
	// Opacity
	/////////////////////////////////////////////////

	compositionOpacityFeedbackCallback(_feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		const opacity = parameterStates.get()['/composition/video/opacity']?.value;
		if (opacity !== undefined) {
			return {
				text: Math.round(opacity * 100) + '%',
				show_topbar: false,
				imageBuffer: drawPercentage(opacity),
			};
		}
		return {text: '?'};
	}

	/////////////////////////////////////////////////
	// Speed
	/////////////////////////////////////////////////

	compositionSpeedFeedbackCallback(_feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		const speed = parameterStates.get()['/composition/speed']?.value;
		if (speed !== undefined) {
			return {
				text: Math.round(speed * 100) + '%',
				show_topbar: false,
				imageBuffer: drawPercentage(speed)
			};
		}
		return {text: '?'};
	}

	compositionSpeedFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		if (!this.compositionSpeedSubscriptions.get('composition')) {
			this.compositionSpeedSubscriptions.set('composition', new Set());
			this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/speed');
		}
		this.compositionSpeedSubscriptions.get('composition')?.add(feedback.id);
	}

	compositionSpeedFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		const compositionSpeedSubscription = this.compositionSpeedSubscriptions.get('composition');
		if (compositionSpeedSubscription) {
			compositionSpeedSubscription.delete(feedback.id);
			if (compositionSpeedSubscription.size === 0) {
				this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/speed');
				this.compositionSpeedSubscriptions.delete('composition');
			}
		}
	}

	/////////////////////////////////////////////////
	// Tempo
	/////////////////////////////////////////////////

	compositionTempoFeedbackCallback(_feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		const tempo = parameterStates.get()['/composition/tempocontroller/tempo']?.value;
		if (tempo !== undefined) {
			return {
				text: Math.round(tempo * 100) / 100 + '',
				show_topbar: false
			};
		}
		return {text: '?'};
	}
}
