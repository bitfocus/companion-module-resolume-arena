import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc';
import ArenaRestApi from '../../../arena-api/rest';
import {getClipOption} from '../../../defaults';
import {WebsocketInstance} from '../../../websocket';
import {ResolumeArenaModuleInstance} from '../../../index';
import {ClipUtils} from '../../../domain/clip/clip-utils';
import {ClipId} from '../../../domain/clip/clip-id';
import {parameterStates} from '../../../state';

export function clipOpacityChange(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	_oscApi: () => ArenaOscApi | null,
	clipUtils: () => ClipUtils | null,
	resolumeArenaInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Clip Opacity Change',
		options: [
			...getClipOption(),
			{
				id: 'action',
				type: 'dropdown',
				choices: [
					{
						id: 'add',
						label: '+'
					},
					{
						id: 'subtract',
						label: '-'
					},
					{
						id: 'set',
						label: '='
					}
				],
				default: 'add',
				label: 'Action'
			},
			{
				type: 'textinput',
				id: 'value',
				label: 'Value in percentage (e.g. 100 or 10)',
				useVariables: true
			}
		],
		callback: async ({options}: {options: any}) => {
			const theApi = restApi();
			const theClipUtils = clipUtils();
			if (!theApi || !theClipUtils) return;

			const inputValue: number = (+(await resolumeArenaInstance.parseVariablesInString(options.value))) / 100;
			const layerInput = +await resolumeArenaInstance.parseVariablesInString(options.layer);
			const columnInput = +await resolumeArenaInstance.parseVariablesInString(options.column);

			const clip = theClipUtils.getClipFromCompositionState(layerInput, columnInput);
			const id = clip?.video?.opacity?.id;
			if (id === undefined) {
				resolumeArenaInstance.log('warn', 'clipOpacityChange: paramId should not be undefined');
				return;
			}

			let value: number | undefined;
			if (options.action === 'set') {
				value = inputValue;
			} else {
				const cached = parameterStates.get()[`/parameter/by-id/${id}`]?.value;
				const currentValue = cached !== undefined
					? +cached
					: (await theApi.Clips.getStatus(new ClipId(layerInput, columnInput))).video?.opacity.value;
				if (currentValue === undefined) return;
				value = options.action === 'add' ? currentValue + inputValue : currentValue - inputValue;
			}

			if (value !== undefined) {
				await websocketApi()?.subscribeParam(id);
				await websocketApi()?.setParam(String(id), value);
			}
		}
	};
}
