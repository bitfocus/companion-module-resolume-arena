import {CompanionActionDefinition} from '@companion-module/base';
import ArenaRestApi from '../../../arena-api/rest.js';
import {ClipId} from '../../../domain/clip/clip-id.js';
import {ClipUtils} from '../../../domain/clip/clip-utils.js';
import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getClipOption} from '../../../defaults.js';

export function updateClipThumbnail(
	restApi: () => ArenaRestApi | null,
	clipUtils: () => ClipUtils | null,
	_resolumeArenaModuleInstance: ResolumeArenaModuleInstance
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
				// referenced by isVisibleExpression below, so it cannot be an expression itself
				disableAutoExpression: true,
			},
			...getClipOption().map((opt) => ({...opt, isVisibleExpression: '$(options:target) == "layerColumn"'})),
		],
		callback: async ({options}: {options: any}): Promise<void> => {
			const rest = restApi();
			if (!rest) return;

			if (options.target === 'selected') {
				await rest.Clips.updateSelectedThumb();
			} else {
				const layer = +options.layer;
				const column = +options.column;
				await rest.Clips.updateThumb(new ClipId(layer, column));
			}

			setTimeout(() => {
				clipUtils()?.initDetailsFromComposition();
			}, 1000);
		},
	};
}
