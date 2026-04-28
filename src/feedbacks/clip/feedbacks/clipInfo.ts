import {ResolumeArenaModuleInstance} from '../../../index.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';
import {getColumnOption, getLayerOption} from '../../../defaults.js';

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
			},
			{
				id: 'showText',
				type: 'checkbox',
				label: 'Show Text',
				default: false
			}
		],
		// Companion 4.3 / module-api 2.0 dropped support for `subscribe:` on
		// advanced feedback definitions (it warns and ignores it). The callback
		// itself registers its subscription on each invocation; see
		// clipDetailsFeedbackCallback for the call into clipDetailsFeedbackSubscribe.
		callback: resolumeArenaInstance.getClipUtils()!.clipDetailsFeedbackCallback.bind(resolumeArenaInstance.getClipUtils()!),
		unsubscribe: resolumeArenaInstance.getClipUtils()!.clipDetailsFeedbackUnsubscribe.bind(resolumeArenaInstance.getClipUtils()!)
	} as any;
}
