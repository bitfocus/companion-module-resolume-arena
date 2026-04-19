import {CompanionActionDefinitions} from '@companion-module/base'
import type {CompanionInputFieldTextInput} from '@companion-module/base'
import type {ResolumeArenaModuleInstance} from '../../index'
import {getSpeedValue} from '../../defaults'

/**
 * OSC Transport Actions — Millumin-equivalent actions for Resolume Arena.
 *
 * These actions use ONLY OSC (no REST/WebSocket required) and provide
 * transport control similar to what Millumin's Companion module offers.
 *
 * All text inputs support Companion variables via useVariables: true.
 */
export function getOscTransportActions(
	resolumeArenaModuleInstance: ResolumeArenaModuleInstance
): CompanionActionDefinitions {
	const oscApi = () => resolumeArenaModuleInstance.getOscApi()
	const oscState = () => resolumeArenaModuleInstance.getOscState()
	const parse = (s: string) => resolumeArenaModuleInstance.parseVariablesInString(s)
	const parseIntParam = async (s: string): Promise<number | undefined> => {
		const n = parseInt(await parse(s), 10)
		return isNaN(n) ? undefined : n
	}
	const parseFloatParam = async (s: string): Promise<number | undefined> => {
		const n = parseFloat(await parse(s))
		return isNaN(n) ? undefined : n
	}

	// ─── Shared option builders ───

	const layerOption: CompanionInputFieldTextInput = {
		id: 'layer',
		type: 'textinput',
		label: 'Layer',
		default: '1',
		useVariables: true,
	}

	const columnOption: CompanionInputFieldTextInput = {
		id: 'column',
		type: 'textinput',
		label: 'Column',
		default: '1',
		useVariables: true,
	}

	const clipOptions: CompanionInputFieldTextInput[] = [layerOption, columnOption]

	return {
		// ══════════════════════════════════════════════════════════
		//  COLUMN / COMPOSITION TRANSPORT
		// ══════════════════════════════════════════════════════════

		oscTriggerColumn: {
			name: 'OSC: Trigger Column',
			options: [
				{
					id: 'column',
					type: 'textinput',
					label: 'Column',
					default: '1',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const col = await parseIntParam(options.column);
				if (col === undefined) return;
				oscApi()?.triggerColumn(col);
				// Query columns after a short delay to pick up the new state
				oscState()?.scheduleQuickRefresh();
			},
		},

		oscNextColumn: {
			name: 'OSC: Next Column',
			options: [],
			callback: async () => {
				oscApi()?.compNextCol();
				oscState()?.scheduleQuickRefresh();
			},
		},

		oscPrevColumn: {
			name: 'OSC: Previous Column',
			options: [],
			callback: async () => {
				oscApi()?.compPrevCol();
				oscState()?.scheduleQuickRefresh();
			},
		},

		oscClearAllLayers: {
			name: 'OSC: Clear All Layers (Stop All)',
			options: [],
			callback: async () => {
				oscApi()?.clearAllLayers();
			},
		},

		oscSelectColumn: {
			name: 'OSC: Select Column',
			description: 'Select (highlight) a column without triggering it.',
			options: [
				{
					id: 'column',
					type: 'textinput',
					label: 'Column',
					default: '1',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const col = await parseIntParam(options.column);
				if (col === undefined) return;
				oscApi()?.send(`/composition/columns/${col}/select`, { type: 'i', value: 1 });
			},
		},

		// ══════════════════════════════════════════════════════════
		//  CLIP CONNECT / DISCONNECT
		// ══════════════════════════════════════════════════════════

		oscConnectClip: {
			name: 'OSC: Connect Clip (Play)',
			options: [...clipOptions],
			callback: async ({options}: {options: Record<string, any>}) => {
				const layer = await parseIntParam(options.layer);
				if (layer === undefined) return;
				const column = await parseIntParam(options.column);
				if (column === undefined) return;
				oscApi()?.connectClip(layer, column);
				oscState()?.scheduleQuickRefresh();
			},
		},

		oscClearLayer: {
			name: 'OSC: Clear Layer (Stop)',
			options: [layerOption],
			callback: async ({options}: {options: Record<string, any>}) => {
				const layer = await parseIntParam(options.layer);
				if (layer === undefined) return;
				oscApi()?.clearLayer(layer);
				oscState()?.scheduleQuickRefresh();
			},
		},

		oscLayerNextClip: {
			name: 'OSC: Layer Next Clip',
			options: [layerOption],
			callback: async ({options}: {options: Record<string, any>}) => {
				const layer = await parseIntParam(options.layer);
				if (layer === undefined) return;
				oscApi()?.layerNextCol(layer);
				oscState()?.scheduleQuickRefresh();
			},
		},

		oscLayerPrevClip: {
			name: 'OSC: Layer Previous Clip',
			options: [layerOption],
			callback: async ({options}: {options: Record<string, any>}) => {
				const layer = await parseIntParam(options.layer);
				if (layer === undefined) return;
				oscApi()?.layerPrevCol(layer);
				oscState()?.scheduleQuickRefresh();
			},
		},

		// ══════════════════════════════════════════════════════════
		//  CLIP TRANSPORT (Play / Pause / Speed / Position)
		// ══════════════════════════════════════════════════════════

		oscClipPauseResume: {
			name: 'OSC: Clip Pause / Resume',
			description: 'Control playback direction on a layer. Backward (0), Pause (1), Play Forward (2), or Toggle.',
			options: [
				layerOption,
				{
					id: 'state',
					type: 'dropdown',
					label: 'State',
					choices: [
						{ id: 'backward', label: 'Play Backward (0)' },
						{ id: 'pause', label: 'Pause (1)' },
						{ id: 'forward', label: 'Play Forward (2)' },
						{ id: 'toggle', label: 'Play / Pause Toggle' },
					],
					default: 'pause',
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const layer = await parseIntParam(options.layer);
				if (layer === undefined) return;
				const api = oscApi();
				if (!api) return;
				const path = `/composition/layers/${layer}/direction`;
				const state = options.state as string
				if (state === 'toggle') {
					const oscSt = oscState();
					const layerData = oscSt?.getLayer(layer);
					if (layerData && layerData.direction === 1) {
						api.send(path, { type: 'i', value: 2 }); // was paused → play
					} else {
						api.send(path, { type: 'i', value: 1 }); // was playing → pause
					}
				} else {
					const dirMap: Record<string, number> = { backward: 0, pause: 1, forward: 2 };
					api.send(path, { type: 'i', value: dirMap[state] });
				}
			},
		},

		oscClipSpeed: {
			name: 'OSC: Set Clip Speed',
			description: 'Set the playback speed of the active clip on a layer. Uses the same percentage scale as the built-in clip speed action: 100 = normal speed, 200 = double speed, 50 = half speed.',
			options: [
				layerOption,
				{
					id: 'speed',
					type: 'textinput',
					label: 'Speed % (100 = normal, 200 = double)',
					default: '100',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const layer = await parseIntParam(options.layer);
				if (layer === undefined) return;
				const speedPct = await parseFloatParam(options.speed);
				if (speedPct === undefined) return;
				const api = oscApi();
				if (!api) return;
				const state = oscState();
				const clip = state?.getActiveClipColumn(layer);
				if (!clip) return;
				api.send(`/composition/layers/${layer}/clips/${clip}/transport/position/behaviour/speed`, { type: 'f', value: getSpeedValue(speedPct) });
			},
		},

		oscClipOpacity: {
			name: 'OSC: Set Clip Opacity',
			description: 'Set the opacity of the active clip on a layer.',
			options: [
				layerOption,
				{
					id: 'value',
					type: 'textinput',
					label: 'Opacity (0.0 - 1.0)',
					default: '1.0',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const layer = await parseIntParam(options.layer);
				if (layer === undefined) return;
				const value = await parseFloatParam(options.value);
				if (value === undefined) return;
				const api = oscApi();
				if (!api) return;
				const state = oscState();
				const clip = state?.getActiveClipColumn(layer);
				if (!clip) return;
				api.send(`/composition/layers/${layer}/clips/${clip}/video/opacity`, { type: 'f', value });
			},
		},

		oscClipVolume: {
			name: 'OSC: Set Clip Volume',
			description: 'Set the audio volume of the active clip on a layer.',
			options: [
				layerOption,
				{
					id: 'value',
					type: 'textinput',
					label: 'Volume (0.0 - 1.0)',
					default: '1.0',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const layer = await parseIntParam(options.layer);
				if (layer === undefined) return;
				const value = await parseFloatParam(options.value);
				if (value === undefined) return;
				const api = oscApi();
				if (!api) return;
				const state = oscState();
				const clip = state?.getActiveClipColumn(layer);
				if (!clip) return;
				api.send(`/composition/layers/${layer}/clips/${clip}/audio/volume`, { type: 'f', value });
			},
		},

		oscSelectClip: {
			name: 'OSC: Select Clip',
			description: 'Select a clip (highlight it in the UI) without triggering playback.',
			options: [...clipOptions],
			callback: async ({options}: {options: Record<string, any>}) => {
				const layer = await parseIntParam(options.layer);
				if (layer === undefined) return;
				const column = await parseIntParam(options.column);
				if (column === undefined) return;
				oscApi()?.selectClip(layer, column);
			},
		},

		oscClipGoToPosition: {
			name: 'OSC: Clip Go to Position (Normalized)',
			description: 'Jump to a normalized position in the active clip. 0.0 = start, 1.0 = end.',
			options: [
				layerOption,
				{
					id: 'position',
					type: 'textinput',
					label: 'Position (0.0 - 1.0)',
					default: '0.0',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const layer = await parseIntParam(options.layer);
				if (layer === undefined) return;
				const position = await parseFloatParam(options.position);
				if (position === undefined) return;
				const api = oscApi();
				if (!api) return;
				const state = oscState();
				const clip = state?.getActiveClipColumn(layer);
				if (!clip) return;
				api.send(`/composition/layers/${layer}/clips/${clip}/transport/position`, { type: 'f', value: position });
			},
		},

		oscClipGoToTime: {
			name: 'OSC: Clip Go to Time (Seconds)',
			description: 'Jump to a specific time in seconds in the active clip on a layer. Requires duration data.',
			options: [
				layerOption,
				{
					id: 'time',
					type: 'textinput',
					label: 'Time (seconds)',
					default: '0',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const layer = await parseIntParam(options.layer);
				if (layer === undefined) return;
				const timeSec = await parseFloatParam(options.time);
				if (timeSec === undefined) return;
				const api = oscApi();
				if (!api) return;
				const state = oscState();
				if (!state) return;
				const clip = state.getActiveClipColumn(layer);
				if (!clip) return;
				const durationSec = state.getLayerDurationSeconds(layer);
				if (durationSec <= 0) {
					resolumeArenaModuleInstance.log('warn', `OSC GoToTime: No duration data for layer ${layer}`);
					return;
				}
				const normalized = Math.max(0, Math.min(1, timeSec / durationSec));
				api.send(`/composition/layers/${layer}/clips/${clip}/transport/position`, { type: 'f', value: normalized });
			},
		},

		oscClipJogTime: {
			name: 'OSC: Clip Jog Time (±Seconds)',
			description: 'Jump forward or backward by a number of seconds in the active clip. Use negative for backward.',
			options: [
				layerOption,
				{
					id: 'time',
					type: 'textinput',
					label: 'Jog Time (seconds, negative = backward)',
					default: '5',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const layer = await parseIntParam(options.layer);
				if (layer === undefined) return;
				const jogSec = await parseFloatParam(options.time);
				if (jogSec === undefined) return;
				const api = oscApi();
				if (!api) return;
				const state = oscState();
				if (!state) return;
				const clip = state.getActiveClipColumn(layer);
				if (!clip) return;
				const durationSec = state.getLayerDurationSeconds(layer);
				if (durationSec <= 0) {
					resolumeArenaModuleInstance.log('warn', `OSC JogTime: No duration data for layer ${layer}`);
					return;
				}
				const currentElapsed = state.getLayerElapsedSeconds(layer);
				const newTime = Math.max(0, Math.min(durationSec, currentElapsed + jogSec));
				const normalized = newTime / durationSec;
				api.send(`/composition/layers/${layer}/clips/${clip}/transport/position`, { type: 'f', value: normalized });
			},
		},

		oscClipGoToSecondsFromEnd: {
			name: 'OSC: Clip Go to Seconds from End',
			description: 'Jump to a position N seconds before the end of the active clip.',
			options: [
				layerOption,
				{
					id: 'seconds',
					type: 'textinput',
					label: 'Seconds from End',
					default: '10',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const layer = await parseIntParam(options.layer);
				if (layer === undefined) return;
				const secFromEnd = await parseFloatParam(options.seconds);
				if (secFromEnd === undefined) return;
				const api = oscApi();
				if (!api) return;
				const state = oscState();
				if (!state) return;
				const clip = state.getActiveClipColumn(layer);
				if (!clip) return;
				const durationSec = state.getLayerDurationSeconds(layer);
				if (durationSec <= 0) {
					resolumeArenaModuleInstance.log('warn', `OSC GoToSecondsFromEnd: No duration data for layer ${layer}`);
					return;
				}
				const targetSec = Math.max(0, durationSec - secFromEnd);
				const normalized = targetSec / durationSec;
				api.send(`/composition/layers/${layer}/clips/${clip}/transport/position`, { type: 'f', value: normalized });
			},
		},

		oscClipRestartMedia: {
			name: 'OSC: Restart Clip on Layer',
			description: 'Restarts the currently active clip on the given layer from the beginning.',
			options: [layerOption],
			callback: async ({options}: {options: Record<string, any>}) => {
				const layer = await parseIntParam(options.layer);
				if (layer === undefined) return;
				const api = oscApi();
				if (!api) return;
				const state = oscState();
				const clip = state?.getActiveClipColumn(layer);
				if (!clip) return;
				// Jump to position 0 to restart
				api.send(`/composition/layers/${layer}/clips/${clip}/transport/position`, { type: 'f', value: 0 });
			},
		},

		oscClipDirection: {
			name: 'OSC: Clip Direction (specific clip)',
			description: 'Set playback direction on a specific clip. Backward (0), Pause (1), Play Forward (2), or Toggle.',
			options: [
				layerOption,
				columnOption,
				{
					id: 'state',
					type: 'dropdown',
					label: 'Direction',
					choices: [
						{ id: 'backward', label: 'Play Backward' },
						{ id: 'pause', label: 'Pause' },
						{ id: 'forward', label: 'Play Forward' },
						{ id: 'toggle', label: 'Play / Pause Toggle' },
					],
					default: 'pause',
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const layer = await parseIntParam(options.layer);
				if (layer === undefined) return;
				const column = await parseIntParam(options.column);
				if (column === undefined) return;
				const api = oscApi();
				if (!api) return;
				const path = `/composition/layers/${layer}/clips/${column}/transport/position/behaviour/direction`;
				const state = options.state as string;
				if (state === 'toggle') {
					// No per-clip direction state — default to send '!' toggle modifier
					api.send(path, [{ type: 's', value: '!' }]);
				} else {
					const dirMap: Record<string, number> = { backward: 0, pause: 1, forward: 2 };
					api.send(path, { type: 'i', value: dirMap[state] });
				}
			},
		},

		oscCompositionDirection: {
			name: 'OSC: Composition Direction',
			description: 'Set the playback direction for the whole composition.',
			options: [
				{
					id: 'state',
					type: 'dropdown',
					label: 'Direction',
					choices: [
						{ id: 'backward', label: 'Play Backward' },
						{ id: 'pause', label: 'Pause' },
						{ id: 'forward', label: 'Play Forward' },
					],
					default: 'forward',
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const api = oscApi();
				if (!api) return;
				const state = options.state as string;
				if (state === 'backward') {
					api.send('/composition/backwards', { type: 'i', value: 1 });
				} else if (state === 'pause') {
					api.send('/composition/paused', { type: 'i', value: 1 });
				} else {
					api.send('/composition/forwards', { type: 'i', value: 1 });
				}
			},
		},

		oscGroupDirection: {
			name: 'OSC: Group Direction',
			description: 'Set the playback direction for a layer group.',
			options: [
				{
					id: 'group',
					type: 'textinput',
					label: 'Group',
					default: '1',
					useVariables: true,
				},
				{
					id: 'state',
					type: 'dropdown',
					label: 'Direction',
					choices: [
						{ id: 'backward', label: 'Play Backward' },
						{ id: 'pause', label: 'Pause' },
						{ id: 'forward', label: 'Play Forward' },
					],
					default: 'forward',
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const group = await parseIntParam(options.group);
				if (group === undefined) return;
				const api = oscApi();
				if (!api) return;
				const state = options.state as string;
				if (state === 'backward') {
					api.send(`/composition/groups/${group}/backwards`, { type: 'i', value: 1 });
				} else if (state === 'pause') {
					api.send(`/composition/groups/${group}/paused`, { type: 'i', value: 1 });
				} else {
					api.send(`/composition/groups/${group}/forwards`, { type: 'i', value: 1 });
				}
			},
		},

		// ══════════════════════════════════════════════════════════
		//  COMPOSITION / MASTER CONTROLS
		// ══════════════════════════════════════════════════════════

		oscSetMasterOpacity: {
			name: 'OSC: Set Composition Opacity',
			description: 'Set the composition master video opacity. 0.0-1.0.',
			options: [
				{
					id: 'value',
					type: 'textinput',
					label: 'Opacity (0.0 - 1.0)',
					default: '1.0',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const value = await parseFloatParam(options.value);
				if (value === undefined) return;
				oscApi()?.send('/composition/video/opacity', { type: 'f', value });
			},
		},

		oscSetMasterVolume: {
			name: 'OSC: Set Composition Volume',
			description: 'Set the composition master audio volume. 0.0-1.0.',
			options: [
				{
					id: 'value',
					type: 'textinput',
					label: 'Volume (0.0 - 1.0)',
					default: '1.0',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const value = await parseFloatParam(options.value);
				if (value === undefined) return;
				oscApi()?.send('/composition/audio/volume', { type: 'f', value });
			},
		},

		oscSetCompositionMaster: {
			name: 'OSC: Set Composition Master',
			description: 'Set the composition master level. 0.0-1.0.',
			options: [
				{
					id: 'value',
					type: 'textinput',
					label: 'Master (0.0 - 1.0)',
					default: '1.0',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const value = await parseFloatParam(options.value);
				if (value === undefined) return;
				oscApi()?.send('/composition/master', { type: 'f', value });
			},
		},

		oscSetCompositionSpeed: {
			name: 'OSC: Set Composition Speed',
			description: 'Set the global composition speed.',
			options: [
				{
					id: 'value',
					type: 'textinput',
					label: 'Speed (0.0 - 1.0 normalized)',
					default: '0.5',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const value = await parseFloatParam(options.value);
				if (value === undefined) return;
				oscApi()?.send('/composition/speed', { type: 'f', value });
			},
		},

		oscSetCompositionTempo: {
			name: 'OSC: Set Composition Tempo',
			description: 'Set the composition BPM tempo.',
			options: [
				{
					id: 'tempo',
					type: 'textinput',
					label: 'BPM',
					default: '120',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const tempo = await parseFloatParam(options.tempo);
				if (tempo === undefined) return;
				oscApi()?.send('/composition/tempocontroller/tempo', { type: 'f', value: tempo });
			},
		},

		oscTempoTap: {
			name: 'OSC: Tempo Tap',
			options: [],
			callback: async () => {
				oscApi()?.tempoTap();
			},
		},

		oscTempoResync: {
			name: 'OSC: Tempo Resync',
			options: [],
			callback: async () => {
				oscApi()?.tempoResync();
			},
		},

		// ══════════════════════════════════════════════════════════
		//  LAYER CONTROLS
		// ══════════════════════════════════════════════════════════

		oscSetLayerOpacity: {
			name: 'OSC: Set Layer Opacity',
			options: [
				layerOption,
				{
					id: 'value',
					type: 'textinput',
					label: 'Opacity (0.0 - 1.0)',
					default: '1.0',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const layer = await parseIntParam(options.layer);
				if (layer === undefined) return;
				const value = await parseFloatParam(options.value);
				if (value === undefined) return;
				oscApi()?.send(`/composition/layers/${layer}/video/opacity`, { type: 'f', value });
			},
		},

		oscSetLayerVolume: {
			name: 'OSC: Set Layer Volume',
			options: [
				layerOption,
				{
					id: 'value',
					type: 'textinput',
					label: 'Volume (0.0 - 1.0)',
					default: '1.0',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const layer = await parseIntParam(options.layer);
				if (layer === undefined) return;
				const value = await parseFloatParam(options.value);
				if (value === undefined) return;
				oscApi()?.send(`/composition/layers/${layer}/audio/volume`, { type: 'f', value });
			},
		},

		oscSetLayerMaster: {
			name: 'OSC: Set Layer Master',
			options: [
				layerOption,
				{
					id: 'value',
					type: 'textinput',
					label: 'Master (0.0 - 1.0)',
					default: '1.0',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const layer = await parseIntParam(options.layer);
				if (layer === undefined) return;
				const value = await parseFloatParam(options.value);
				if (value === undefined) return;
				oscApi()?.send(`/composition/layers/${layer}/master`, { type: 'f', value });
			},
		},

		oscBypassLayer: {
			name: 'OSC: Bypass Layer',
			options: [
				layerOption,
				{
					id: 'bypass',
					type: 'dropdown',
					label: 'Bypass',
					choices: [
						{ id: 'on', label: 'Bypass On' },
						{ id: 'off', label: 'Bypass Off' },
						{ id: 'toggle', label: 'Toggle' },
					],
					default: 'toggle',
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const layer = await parseIntParam(options.layer);
				if (layer === undefined) return;
				const api = oscApi();
				if (!api) return;
				const bypass = options.bypass as string
				switch (bypass) {
					case 'on':
						api.send(`/composition/layers/${layer}/bypassed`, { type: 'i', value: 1 });
						break;
					case 'off':
						api.send(`/composition/layers/${layer}/bypassed`, { type: 'i', value: 0 });
						break;
					case 'toggle':
						api.send(`/composition/layers/${layer}/bypassed`, [{ type: 's', value: '!' }]);
						break;
				}
			},
		},

		oscSoloLayer: {
			name: 'OSC: Solo Layer',
			options: [
				layerOption,
				{
					id: 'solo',
					type: 'dropdown',
					label: 'Solo',
					choices: [
						{ id: 'on', label: 'Solo On' },
						{ id: 'off', label: 'Solo Off' },
						{ id: 'toggle', label: 'Toggle' },
					],
					default: 'toggle',
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const layer = await parseIntParam(options.layer);
				if (layer === undefined) return;
				const api = oscApi();
				if (!api) return;
				const solo = options.solo as string
				switch (solo) {
					case 'on':
						api.send(`/composition/layers/${layer}/solo`, { type: 'i', value: 1 });
						break;
					case 'off':
						api.send(`/composition/layers/${layer}/solo`, { type: 'i', value: 0 });
						break;
					case 'toggle':
						api.send(`/composition/layers/${layer}/solo`, [{ type: 's', value: '!' }]);
						break;
				}
			},
		},

		oscSelectLayer: {
			name: 'OSC: Select Layer',
			description: 'Select (highlight) a layer in the Resolume UI.',
			options: [layerOption],
			callback: async ({options}: {options: Record<string, any>}) => {
				const layer = await parseIntParam(options.layer);
				if (layer === undefined) return;
				oscApi()?.send(`/composition/layers/${layer}/select`, { type: 'i', value: 1 });
			},
		},

		oscLayerTransitionDuration: {
			name: 'OSC: Layer Transition Duration',
			description: 'Set the transition duration for a layer.',
			options: [
				layerOption,
				{
					id: 'value',
					type: 'textinput',
					label: 'Duration (0.0 - 1.0 normalized)',
					default: '0.5',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const layer = await parseIntParam(options.layer);
				if (layer === undefined) return;
				const value = await parseFloatParam(options.value);
				if (value === undefined) return;
				oscApi()?.send(`/composition/layers/${layer}/transition/duration`, { type: 'f', value });
			},
		},

		oscSetLayerSpeed: {
			name: 'OSC: Set Layer Speed',
			description: 'Set the speed for a layer.',
			options: [
				layerOption,
				{
					id: 'value',
					type: 'textinput',
					label: 'Speed (0.0 - 1.0 normalized)',
					default: '0.5',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const layer = await parseIntParam(options.layer);
				if (layer === undefined) return;
				const value = await parseFloatParam(options.value);
				if (value === undefined) return;
				oscApi()?.send(`/composition/layers/${layer}/speed`, { type: 'f', value });
			},
		},

		// ══════════════════════════════════════════════════════════
		//  DECK NAVIGATION
		// ══════════════════════════════════════════════════════════

		oscNextDeck: {
			name: 'OSC: Next Deck',
			options: [],
			callback: async () => {
				oscApi()?.compNextDeck();
			},
		},

		oscPrevDeck: {
			name: 'OSC: Previous Deck',
			options: [],
			callback: async () => {
				oscApi()?.compPrevDeck();
			},
		},

		oscSelectDeck: {
			name: 'OSC: Select Deck',
			options: [
				{
					id: 'deck',
					type: 'textinput',
					label: 'Deck',
					default: '1',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const deck = await parseIntParam(options.deck);
				if (deck === undefined) return;
				oscApi()?.send(`/composition/decks/${deck}/select`, { type: 'i', value: 1 });
			},
		},

		// ══════════════════════════════════════════════════════════
		//  GROUP CONTROLS
		// ══════════════════════════════════════════════════════════

		oscGroupTriggerColumn: {
			name: 'OSC: Group Trigger Column',
			description: 'Trigger a specific column within a layer group.',
			options: [
				{
					id: 'group',
					type: 'textinput',
					label: 'Group',
					default: '1',
					useVariables: true,
				},
				{
					id: 'column',
					type: 'textinput',
					label: 'Column',
					default: '1',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const group = await parseIntParam(options.group);
				if (group === undefined) return;
				const column = await parseIntParam(options.column);
				if (column === undefined) return;
				oscApi()?.triggerlayerGroupColumn(group, column);
				oscState()?.scheduleQuickRefresh();
			},
		},

		oscGroupNextColumn: {
			name: 'OSC: Group Next Column',
			description: 'Trigger the next column in a layer group. Requires last column number to wrap around.',
			options: [
				{
					id: 'group',
					type: 'textinput',
					label: 'Group',
					default: '1',
					useVariables: true,
				},
				{
					id: 'lastColumn',
					type: 'textinput',
					label: 'Last Column (total columns)',
					default: '10',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const group = await parseIntParam(options.group);
				if (group === undefined) return;
				const lastColumn = await parseIntParam(options.lastColumn);
				if (lastColumn === undefined) return;
				oscApi()?.layerGroupNextCol(group, lastColumn);
				oscState()?.scheduleQuickRefresh();
			},
		},

		oscGroupPrevColumn: {
			name: 'OSC: Group Previous Column',
			description: 'Trigger the previous column in a layer group. Requires last column number to wrap around.',
			options: [
				{
					id: 'group',
					type: 'textinput',
					label: 'Group',
					default: '1',
					useVariables: true,
				},
				{
					id: 'lastColumn',
					type: 'textinput',
					label: 'Last Column (total columns)',
					default: '10',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const group = await parseIntParam(options.group);
				if (group === undefined) return;
				const lastColumn = await parseIntParam(options.lastColumn);
				if (lastColumn === undefined) return;
				oscApi()?.groupPrevCol(group, lastColumn);
				oscState()?.scheduleQuickRefresh();
			},
		},

		oscGroupClear: {
			name: 'OSC: Group Clear (Disconnect Layers)',
			description: 'Disconnect all layers in a group.',
			options: [
				{
					id: 'group',
					type: 'textinput',
					label: 'Group',
					default: '1',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const group = await parseIntParam(options.group);
				if (group === undefined) return;
				oscApi()?.clearLayerGroup(group);
				oscState()?.scheduleQuickRefresh();
			},
		},

		oscGroupBypass: {
			name: 'OSC: Group Bypass',
			options: [
				{
					id: 'group',
					type: 'textinput',
					label: 'Group',
					default: '1',
					useVariables: true,
				},
				{
					id: 'bypass',
					type: 'dropdown',
					label: 'Bypass',
					choices: [
						{ id: 'on', label: 'Bypass On' },
						{ id: 'off', label: 'Bypass Off' },
						{ id: 'toggle', label: 'Toggle' },
					],
					default: 'on',
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const group = await parseIntParam(options.group);
				if (group === undefined) return;
				const api = oscApi();
				if (!api) return;
				const bypass = options.bypass as string
				switch (bypass) {
					case 'on':
						api.bypassLayerGroup(group, { type: 'i', value: 1 } as any)
						break;
					case 'off':
						api.bypassLayerGroup(group, { type: 'i', value: 0 } as any)
						break;
					case 'toggle':
						api.send(`/composition/groups/${group}/bypassed`, [{ type: 's', value: '!' }])
						break;
				}
			},
		},

		oscGroupSetMaster: {
			name: 'OSC: Group Set Master',
			options: [
				{
					id: 'group',
					type: 'textinput',
					label: 'Group',
					default: '1',
					useVariables: true,
				},
				{
					id: 'value',
					type: 'textinput',
					label: 'Master (0.0 - 1.0)',
					default: '1.0',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const group = await parseIntParam(options.group);
				if (group === undefined) return;
				const value = await parseFloatParam(options.value);
				if (value === undefined) return;
				oscApi()?.send(`/composition/groups/${group}/master`, { type: 'f', value });
			},
		},

		oscGroupSetOpacity: {
			name: 'OSC: Group Set Opacity',
			options: [
				{
					id: 'group',
					type: 'textinput',
					label: 'Group',
					default: '1',
					useVariables: true,
				},
				{
					id: 'value',
					type: 'textinput',
					label: 'Opacity (0.0 - 1.0)',
					default: '1.0',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const group = await parseIntParam(options.group);
				if (group === undefined) return;
				const value = await parseFloatParam(options.value);
				if (value === undefined) return;
				oscApi()?.send(`/composition/groups/${group}/video/opacity`, { type: 'f', value });
			},
		},

		oscGroupSetVolume: {
			name: 'OSC: Group Set Volume',
			options: [
				{
					id: 'group',
					type: 'textinput',
					label: 'Group',
					default: '1',
					useVariables: true,
				},
				{
					id: 'value',
					type: 'textinput',
					label: 'Volume (0.0 - 1.0)',
					default: '1.0',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const group = await parseIntParam(options.group);
				if (group === undefined) return;
				const value = await parseFloatParam(options.value);
				if (value === undefined) return;
				oscApi()?.send(`/composition/groups/${group}/audio/volume`, { type: 'f', value });
			},
		},

		oscGroupSetSpeed: {
			name: 'OSC: Group Set Speed',
			options: [
				{
					id: 'group',
					type: 'textinput',
					label: 'Group',
					default: '1',
					useVariables: true,
				},
				{
					id: 'value',
					type: 'textinput',
					label: 'Speed (0.0 - 1.0 normalized)',
					default: '0.5',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const group = await parseIntParam(options.group);
				if (group === undefined) return;
				const value = await parseFloatParam(options.value);
				if (value === undefined) return;
				oscApi()?.send(`/composition/groups/${group}/speed`, { type: 'f', value });
			},
		},

		oscGroupSolo: {
			name: 'OSC: Group Solo',
			options: [
				{
					id: 'group',
					type: 'textinput',
					label: 'Group',
					default: '1',
					useVariables: true,
				},
				{
					id: 'solo',
					type: 'dropdown',
					label: 'Solo',
					choices: [
						{ id: 'on', label: 'Solo On' },
						{ id: 'off', label: 'Solo Off' },
					],
					default: 'on',
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const group = await parseIntParam(options.group);
				if (group === undefined) return;
				const solo = options.solo as string
				const val = solo === 'on' ? 1 : 0;
				oscApi()?.send(`/composition/groups/${group}/solo`, { type: 'i', value: val });
			},
		},

		oscSelectGroup: {
			name: 'OSC: Select Group',
			description: 'Select (highlight) a layer group in the Resolume UI.',
			options: [
				{
					id: 'group',
					type: 'textinput',
					label: 'Group',
					default: '1',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const group = await parseIntParam(options.group);
				if (group === undefined) return;
				oscApi()?.send(`/composition/groups/${group}/select`, { type: 'i', value: 1 });
			},
		},

		oscSelectGroupColumn: {
			name: 'OSC: Select Group Column',
			description: 'Select (highlight) a column within a layer group without triggering it.',
			options: [
				{
					id: 'group',
					type: 'textinput',
					label: 'Group',
					default: '1',
					useVariables: true,
				},
				{
					id: 'column',
					type: 'textinput',
					label: 'Column',
					default: '1',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const group = await parseIntParam(options.group);
				if (group === undefined) return;
				const column = await parseIntParam(options.column);
				if (column === undefined) return;
				oscApi()?.send(`/composition/groups/${group}/columns/${column}/select`, { type: 'i', value: 1 });
			},
		},

		// ══════════════════════════════════════════════════════════
		//  CUSTOM OSC
		// ══════════════════════════════════════════════════════════

		oscCustomCommand: {
			name: 'OSC: Custom OSC Command',
			description: 'Send any OSC message to Resolume. Use this for anything not covered by the built-in actions.',
			options: [
				{
					id: 'customPath',
					type: 'textinput',
					label: 'Custom OSC Path',
					default: '/composition/tempo',
					tooltip: 'e.g. /composition/layers/1/clips/1/connect',
					useVariables: true,
				},
				{
					id: 'relativeType',
					type: 'dropdown',
					label: 'Relative Modifier',
					tooltip: 'Prepend +, -, or * for relative adjustments',
					choices: [
						{ id: 'n', label: 'None' },
						{ id: '+', label: '+ (Add)' },
						{ id: '-', label: '- (Subtract)' },
						{ id: '*', label: '* (Multiply)' },
					],
					default: 'n',
				},
				{
					id: 'oscType',
					type: 'dropdown',
					label: 'Value Type',
					tooltip: 'Type of OSC argument to send',
					choices: [
						{ id: 'n', label: 'None (trigger)' },
						{ id: 'i', label: 'Integer' },
						{ id: 'f', label: 'Float' },
						{ id: 's', label: 'String' },
					],
					default: 'f',
				},
				{
					id: 'customValue',
					type: 'textinput',
					label: 'Value',
					default: '',
					useVariables: true,
				},
			],
			callback: async ({options}: {options: Record<string, any>}) => {
				const path = await parse(options.customPath);
				const value = await parse(options.customValue);
				oscApi()?.customOsc(path, options.oscType, value, options.relativeType);
			},
		},

		// ══════════════════════════════════════════════════════════
		//  QUERY (Manual Re-query)
		// ══════════════════════════════════════════════════════════

		oscReQueryClip: {
			name: 'OSC: Re-Query Active Clip Info',
			description: 'Re-sends ? queries for all tracked layers to refresh duration and name data.',
			options: [],
			callback: async () => {
				oscState()?.queryAllLayers();
			},
		},
	};
}
