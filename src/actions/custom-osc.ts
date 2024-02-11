import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../arena-api/osc';
import {ResolumeArenaModuleInstance} from '..';

export function customOscCommand(
	oscApi: () => ArenaOscApi | null,
	resolumeArenaInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Custom OSC Command',
		options: [
			{
				type: 'textinput',
				label: 'Custom OSC Path',
				id: 'customPath',
				tooltip: 'must start with /',
				required: true,
				regex: '/^((\\/\\w+)+|(\\$\\(\\w+\\:\\w+\\)))$/',
				useVariables: true,
			},
			{
				type: 'dropdown',
				label: 'OSC Relative Type',
				id: 'relativeType',
				tooltip: 'select the relative type of the value data',
				choices: [
					{id: 'n', label: 'none'},
					{id: '+', label: 'add'},
					{id: '-', label: 'subtract'},
					{id: '*', label: 'multiply'},
				],
				default: 'n',
			},
			{
				type: 'dropdown',
				label: 'OSC Type Flag',
				id: 'oscType',
				tooltip: 'select the type of the value data',
				choices: [
					{id: 'n', label: 'none'},
					{id: 'i', label: 'integer'},
					{id: 'f', label: 'float'},
					{id: 's', label: 'string'},
				],
				default: 'n',
			},
			{
				type: 'textinput',
				label: 'Value',
				id: 'customValue',
				useVariables: true,
			},
		],
		callback: async ({options}: {options: any}) =>
			oscApi()?.customOsc(
				await resolumeArenaInstance.parseVariablesInString(options.customPath),
				options.oscType,
				await resolumeArenaInstance.parseVariablesInString(options.customValue),
				options.relativeType
			),
	};
}
