import {CompanionFeedbackInfo} from '@companion-module/base';
import {ClipStatus} from '../../arena-api/child-apis/clip-options/ClipStatus';
import {ResolumeArenaModuleInstance} from '../../index';
import {ClipId} from './clip-id';

export class ClipUtils {
	private resolumeArenaInstance: ResolumeArenaModuleInstance;
	private connectedClips: Set<string> = new Set<string>();
	private clipStatusSubscriptions: Map<string, ClipId> = new Map<string, ClipId>();
	private clipThumbSubscriptions: Map<string, ClipId> = new Map<string, ClipId>();
	private clipConnectedSubscriptions: Map<string, ClipId> = new Map<string, ClipId>();
	private clipStatus: Map<string, ClipStatus> = new Map<string, ClipStatus>();
	private clipThumbs: Map<string, string> = new Map<string, string>();
	private clipNames: Map<string, string> = new Map<string, string>();

	constructor(resolumeArenaInstance: ResolumeArenaModuleInstance) {
		this.resolumeArenaInstance = resolumeArenaInstance;
		this.resolumeArenaInstance.log('debug', 'ClipUtils constructor called');
	}

	async poll() {
		let connectedChanged = false;
		let nameChanged = false;
		let thumbChanged = false;

		var clipIds: Array<ClipId> = this.getDistinctClipIds();
		if (clipIds.length > 0) {
			for (var clipId of clipIds) {
				let idChanged = false;
				var status = (await this.resolumeArenaInstance.restApi?.Clips.getStatus(clipId)) as ClipStatus;
				var name = status?.name?.value;
				if (this.clipStatus.get(clipId.getIdString())?.id !== status.id) {
					idChanged = true;
				}
				this.clipStatus.set(clipId.getIdString(), status);
				if (name !== this.clipNames.get(clipId.getIdString())) {
					this.clipNames.set(clipId.getIdString(), name);
					nameChanged = true;
				}
				var isConnected = status?.connected.value === 'Connected';
				if (isConnected) {
					if (!this.connectedClips.has(clipId.getIdString())) {
						connectedChanged = true;
						this.connectedClips.add(clipId.getIdString());
					}
				} else {
					if (this.connectedClips.has(clipId.getIdString())) {
						connectedChanged = true;
						this.connectedClips.delete(clipId.getIdString());
					}
				}

				if (
					(idChanged || nameChanged || (this.clipThumbs.get(clipId.getIdString()) ?? '').length < 1) &&
					this.includesClipId(this.clipThumbSubscriptions, clipId)
				) {
					var thumb = await this.resolumeArenaInstance.restApi?.Clips.getThumb(clipId);
					this.clipThumbs.set(clipId.getIdString(), thumb ?? '');
					thumbChanged = true;
				}
			}
		}
		if (connectedChanged) {
			this.resolumeArenaInstance.checkFeedbacks('connectedClip');
		}
		if (nameChanged || thumbChanged) {
			this.resolumeArenaInstance.checkFeedbacks('clipInfo');
		}
	}

	private getDistinctClipIds(): Array<ClipId> {
		var clipSubscriptionsClips: Map<string, ClipId> = new Map<string, ClipId>();
		let mergedMap: Map<string, ClipId> = new Map([
			...Array.from(this.clipStatusSubscriptions.entries()),
			...Array.from(this.clipConnectedSubscriptions.entries()),
		]);

		mergedMap.forEach((clipId: ClipId) => clipSubscriptionsClips.set(clipId.getIdString(), clipId));

		return Array.from(clipSubscriptionsClips, function (entry) {
			return entry[1];
		});
	}

	private includesClipId(subscriptions: Map<string, ClipId>, clipId: ClipId): boolean {
		var clipSubscriptionsClips: Set<string> = new Set<string>();
		subscriptions.forEach((clipId: ClipId) => clipSubscriptionsClips.add(clipId.getIdString()));

		return clipSubscriptionsClips.has(clipId.getIdString());
	}

	hasPollingSubscriptions(): boolean {
		return this.clipConnectedSubscriptions.size > 0 || this.clipStatusSubscriptions.size > 0;
	}

	connectedClipsFeedbackCallback(feedback: CompanionFeedbackInfo): boolean {
		var layer = feedback.options.layer as number;
		var column = feedback.options.column as number;
		if (ClipId.isValid(layer, column)) {
			return this.connectedClips.has(new ClipId(layer, column).getIdString());
		}
		return false;
	}

	connectedClipsSubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		var column = feedback.options.column as number;
		if (ClipId.isValid(layer, column)) {
			this.addClipConnectedSubscription(feedback.id, layer, column);
		}
	}

	connectedClipsUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		var column = feedback.options.column as number;
		if (ClipId.isValid(layer, column)) {
			this.removeClipConnectedSubscription(feedback.id);
		}
	}

	clipInfoFeedbackCallback(feedback: CompanionFeedbackInfo): {text: string | undefined; png64?: string | undefined} {
		var layer = feedback.options.layer as number;
		var column = feedback.options.column as number;
		if (ClipId.isValid(layer, column)) {
			var key = new ClipId(layer, column);
			var result: {
				text: string | undefined;
				png64: string | undefined;
			} = {
				text: '',
				png64: undefined,
			};
			if (feedback.options.showName) {
				result.text = this.clipNames.get(key.getIdString());
			}
			if (feedback.options.showThumb) {
				result.png64 = this.clipThumbs.get(key.getIdString());
			}
			return result;
		} else {
			return {
				text: 'not found',
			};
		}
	}

	clipInfoSubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		var column = feedback.options.column as number;
		if (ClipId.isValid(layer, column)) {
			this.addClipStatusSubscription(feedback.id, layer, column);
			if (feedback.options.showThumb) {
				this.addClipThumbSubscription(feedback.id, layer, column);
			} else {
				this.removeClipThumbSubscription(feedback.id);
			}
		}
	}

	clipInfoUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		var column = feedback.options.column as number;
		if (ClipId.isValid(layer, column)) {
			this.removeClipStatusSubscription(feedback.id);
			this.removeClipThumbSubscription(feedback.id);
		}
	}

	private addClipConnectedSubscription(subscriberId: string, layer: number, column: number) {
		this.clipConnectedSubscriptions.set(subscriberId, new ClipId(layer, column));
		this.resolumeArenaInstance.pollStatus();
		this.resolumeArenaInstance.checkFeedbacks('connectedClip');
	}

	private removeClipConnectedSubscription(subscriberId: string) {
		this.clipConnectedSubscriptions.delete(subscriberId);
	}

	private addClipThumbSubscription(subscriberId: string, layer: number, column: number) {
		this.clipThumbSubscriptions.set(subscriberId, new ClipId(layer, column));
		this.resolumeArenaInstance.pollStatus();
		this.resolumeArenaInstance.checkFeedbacks('clipInfo');
	}

	private removeClipThumbSubscription(subscriberId: string) {
		this.clipThumbSubscriptions.delete(subscriberId);
	}

	private addClipStatusSubscription(subscriberId: string, layer: number, column: number) {
		this.clipStatusSubscriptions.set(subscriberId, new ClipId(layer, column));
		this.resolumeArenaInstance.pollStatus();
		this.resolumeArenaInstance.checkFeedbacks('clipInfo');
	}

	private removeClipStatusSubscription(subscriberId: string) {
		this.clipStatusSubscriptions.delete(subscriberId);
	}
}
