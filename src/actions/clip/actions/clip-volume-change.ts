import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc.js';
import ArenaRestApi from '../../../arena-api/rest.js';
import {getClipOption} from '../../../defaults.js';
import {WebsocketInstance} from '../../../websocket.js';
import {ResolumeArenaModuleInstance} from '../../../index.js';
import {ClipUtils} from '../../../domain/clip/clip-utils.js';
import {ClipId} from '../../../domain/clip/clip-id.js';
import {parameterStates} from '../../../state.js';

export function clipVolumeChange(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	_oscApi: () => ArenaOscApi | null,
	clipUtils: () => ClipUtils | null,
	resolumeArenaInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Clip Volume Change',
		options: [
			...getClipOption(),
			{
				id: 'action',
				type: 'dropdown',
				choices: [
					{id: 'add', label: '+'},
					{id: 'subtract', label: '-'},
					{id: 'set', label: '='}
				],
				default: 'add',
				label: 'Action'
			},
			{
				type: 'textinput',
				id: 'value',
				label: 'Value in db (e.g. 100 or 10)',
				useVariables: true
			}
		],
		callback: async ({options}: {options: any}) => {
			const theApi = restApi();
			const theClipUtils = clipUtils();
			if (!theApi || !theClipUtils) return;

			const inputValue: number = +(options.value);
			const layerInput = +(options.layer);
			const columnInput = +(options.column);

			const clip = theClipUtils.getClipFromCompositionState(layerInput, columnInput);
			const id = clip?.audio?.volume?.id;
			if (id === undefined) {
				resolumeArenaInstance.log('warn', 'clipVolumeChange: paramId should not be undefined');
				return;
			}

			let value: number | undefined;
			if (options.action === 'set') {
				value = inputValue;
			} else {
				const cached = parameterStates.get()[`/parameter/by-id/${id}`]?.value;
				const currentValue = cached !== undefined
					? +cached
					: (await theApi.Clips.getStatus(new ClipId(layerInput, columnInput))).audio?.volume.value;
				if (currentValue === undefined) return;
				value = options.action === 'add' ? currentValue + inputValue : currentValue - inputValue;
			}

			if (value !== undefined) {
				websocketApi()?.subscribeParam(id);
				await websocketApi()?.setParam(String(id), value);
			}
		}
	};
}
