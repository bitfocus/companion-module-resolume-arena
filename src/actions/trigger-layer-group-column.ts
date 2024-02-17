import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../arena-api/osc';
import ArenaRestApi from '../arena-api/rest';
import {getColumnOption, getLayerGroupOption} from '../defaults';

export function triggerLayerGroupColumn(
	restApi: () => ArenaRestApi | null,
	oscApi: () => ArenaOscApi | null
): CompanionActionDefinition {
	return {
		name: 'Trigger Layer Group Column',
		options: [...getLayerGroupOption(), ...getColumnOption()],
		callback: async ({options}: {options: any}) => {
			let rest = restApi();
			if (rest) {
				await rest.LayerGroups.connectColumn(options.layerGroup, options.column);
			} else {
				oscApi()?.triggerlayerGroupColumn(options.layerGroup, options.column);
			}
		},
	};
}
