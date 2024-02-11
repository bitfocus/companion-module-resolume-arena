import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../arena-api/osc';
import ArenaRestApi from '../arena-api/rest';
import {getLayerGroupOption} from '../defaults';
import {LayerGroupOptions} from '../arena-api/child-apis/layer-group-options/LayerGroupOptions';

export function bypassLayerGroup(
	restApi: () => ArenaRestApi | null,
	_oscApi: () => ArenaOscApi | null
): CompanionActionDefinition {
	return {
		name: 'Bypass Layer Group',
		options: [
			...getLayerGroupOption(),
			{
				id: 'bypass',
				type: 'dropdown',
				choices: [
					{
						id: 'on',
						label: 'On',
					},
					{
						id: 'off',
						label: 'Off',
					},
					{
						id: 'toggle',
						label: 'Toggle',
					},
				],
				default: 'toggle',
				label: 'Bypass',
			},
		],
		callback: async ({options}: {options: any}) => {
			let theApi = restApi();
			if (options.bypass == 'toggle') {
				var settings = (await theApi?.LayerGroups.getSettings(options.layerGroup)) as LayerGroupOptions;
				await theApi?.LayerGroups.updateSettings(options.layerGroup, {
					bypassed: !settings.bypassed?.value,
				});
			} else {
				await theApi?.LayerGroups.updateSettings(options.layerGroup, {
					bypassed: options.bypass == 'on',
				});
			}
		},
	};
}
