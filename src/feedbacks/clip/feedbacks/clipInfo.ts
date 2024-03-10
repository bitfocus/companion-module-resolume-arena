import {ResolumeArenaModuleInstance} from '../../../index';
import {CompanionFeedbackDefinition} from '@companion-module/base';
import {getColumnOption, getLayerOption} from '../../../defaults';

export function clipInfo(resolumeArenaInstance: ResolumeArenaModuleInstance):CompanionFeedbackDefinition{
	return {
		type: 'advanced',
		name: 'Clip Info',
		options: [
			...getLayerOption(),
			...getColumnOption(),
			{
				id: 'showThumb',
				type: 'checkbox',
				label: 'Show Thumbnail',
				default: false
			},
			{
				id: 'showName',
				type: 'checkbox',
				label: 'Show Name',
				default: true
			}
		],
		callback: resolumeArenaInstance.getClipUtils()!.clipDetailsFeedbackCallback.bind(resolumeArenaInstance.getClipUtils()!),
		subscribe: resolumeArenaInstance.getClipUtils()!.clipDetailsFeedbackSubscribe.bind(resolumeArenaInstance.getClipUtils()!),
		unsubscribe: resolumeArenaInstance.getClipUtils()!.clipDetailsFeedbackUnsubscribe.bind(resolumeArenaInstance.getClipUtils()!)
	}
}