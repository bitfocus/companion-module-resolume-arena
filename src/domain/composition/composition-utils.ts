import { CompanionAdvancedFeedbackResult, CompanionFeedbackInfo } from '@companion-module/base';
import { drawPercentage } from '../../defaults';
import { ResolumeArenaModuleInstance } from '../../index';
import { parameterStates } from '../../state';
import { MessageSubscriber } from '../../websocket';

export class CompositionUtils implements MessageSubscriber {
	private resolumeArenaInstance: ResolumeArenaModuleInstance;

	private compositionOpacitySubscriptions: Map<string, Set<string>> = new Map<string, Set<string>>();

	constructor(resolumeArenaInstance: ResolumeArenaModuleInstance) {
		this.resolumeArenaInstance = resolumeArenaInstance;
		this.resolumeArenaInstance.log('debug', 'CompositionUtils constructor called');
	}

	messageUpdates(data: {path: any}, _isComposition: boolean) {
		if (data.path) {
			if (!!data.path.match(/\/composition\/master/)) {
				this.resolumeArenaInstance.checkFeedbacks('compositionOpacity');
			}
		}
	}
	

	messageFilter() {
		return (message: any) => !!(message.path && message.path.match(/\/composition\/.*/));
	}

	
	/////////////////////////////////////////////////
	// Opacity
	/////////////////////////////////////////////////

	compositionOpacityFeedbackCallback(_feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		const opacity = parameterStates.get()['/composition/master']?.value;
		if (opacity!==undefined) {
			return {
				text: Math.round(opacity * 100) + '%',
				show_topbar: false,
				png64: drawPercentage(opacity),
			};
		}
		return {text: '?'};
	}

	compositionOpacityFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
			if (!this.compositionOpacitySubscriptions.get('composition')) {
				this.compositionOpacitySubscriptions.set('composition', new Set());
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/master');
			}
			this.compositionOpacitySubscriptions.get('composition')?.add(feedback.id);
	}

	compositionOpacityFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		const compositionOpacitySubscription = this.compositionOpacitySubscriptions.get('composition');
		if (compositionOpacitySubscription) {
			compositionOpacitySubscription.delete(feedback.id);
			if (compositionOpacitySubscription.size === 0) {
				this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/master');
				this.compositionOpacitySubscriptions.delete('composition');
			}
		}
	}
}
