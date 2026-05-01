import {CompanionActionDefinition} from '@companion-module/base';
import ArenaRestApi from '../../../arena-api/rest';
import {ClipId} from '../../../domain/clip/clip-id';
import {ClipUtils} from '../../../domain/clip/clip-utils';
import {ResolumeArenaModuleInstance} from '../../../index';
import {getClipOption} from '../../../defaults';

export function updateClipThumbnail(
	restApi: () => ArenaRestApi | null,
	clipUtils: () => ClipUtils | null,
	resolumeArenaModuleInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Update Clip Thumbnail',
		options: [
			{
				id: 'target',
				type: 'dropdown',
				label: 'Target',
				choices: [
					{id: 'layerColumn', label: 'Layer / Column'},
					{id: 'selected', label: 'Selected clip'},
				],
				default: 'layerColumn',
			},
			...getClipOption().map((opt) => ({...opt, isVisible: (options: any) => options.target === 'layerColumn'})),
		],
		callback: async ({options}: {options: any}): Promise<void> => {
			const rest = restApi();
			if (!rest) return;

			if (options.target === 'selected') {
				await rest.Clips.updateSelectedThumb();
			} else {
				const layer = +await resolumeArenaModuleInstance.parseVariablesInString(options.layer);
				const column = +await resolumeArenaModuleInstance.parseVariablesInString(options.column);
				await rest.Clips.updateThumb(new ClipId(layer, column));
			}

			setTimeout(() => {
				clipUtils()?.initDetailsFromComposition();
			}, 1000);
		},
	};
}
