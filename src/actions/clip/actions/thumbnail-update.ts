import {CompanionActionDefinition} from '@companion-module/base';
import {getClipOption} from '../../../defaults';
import {ClipUtils} from '../../../domain/clip/clip-utils';
import {ResolumeArenaModuleInstance} from '../../../index';

export function thumbnailUpdate(
	clipUtils: () => (ClipUtils | null),
	resolumeArenaModuleInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Refresh Clip Thumbnail',
		description: 'Re-fetch the current thumbnail for a clip from Resolume and update Companion buttons immediately',
		options: [...getClipOption()],
		callback: async ({options}: {options: any}): Promise<void> => {
			const utils = clipUtils();
			if (!utils) {
				resolumeArenaModuleInstance.log('warn', 'Refresh Clip Thumbnail requires a REST connection');
				return;
			}
			const layer = +await resolumeArenaModuleInstance.parseVariablesInString(options.layer);
			const column = +await resolumeArenaModuleInstance.parseVariablesInString(options.column);
			await utils.refreshThumbnail(layer, column);
		},
	};
}
