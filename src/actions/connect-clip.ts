import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../arena-api/osc';
import ArenaRestApi from '../arena-api/rest';
import {getColumnOption, getLayerOption} from '../defaults';
import {ClipId} from '../domain/clip/clip-id';

export function connectClip(
	restApi: () => ArenaRestApi | null,
	oscApi: () => ArenaOscApi | null
): CompanionActionDefinition {
	return {
		name: 'Trigger Clip',
		options: [...getLayerOption(), ...getColumnOption()],
		callback: async ({options}: {options: any}): Promise<void> => {
			let rest = restApi();
			if (rest) {
				await rest.Clips.connect(new ClipId(options.layer, options.column));
			} else {
				oscApi()?.connectClip(options.layer, options.column);
			}
		},
	};
}
