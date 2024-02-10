import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../arena-api/osc';
import ArenaRestApi from '../arena-api/rest';
import {ClipId} from '../domain/clip/clip-id';
import {getLayerOption, getColumnOption} from '../defaults';

export function selectClip(
	restApi: () => ArenaRestApi | null,
	_oscApi: () => ArenaOscApi | null
): CompanionActionDefinition {
	return {
		name: 'Select Clip',
		options: [...getLayerOption(), ...getColumnOption()],
		callback: async ({options}: {options: any}) =>
			await restApi()?.Clips.select(new ClipId(options.layer, options.column)),
	};
}
