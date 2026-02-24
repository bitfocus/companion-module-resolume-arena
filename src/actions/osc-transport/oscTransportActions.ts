import {CompanionActionDefinitions} from '@companion-module/base'
import type {CompanionInputFieldTextInput} from '@companion-module/base'
import type {ResolumeArenaModuleInstance} from '../../index'

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
                const col = +await parse(options.column);
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
                const col = +await parse(options.column);
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
                const layer = +await parse(options.layer);
                const column = +await parse(options.column);
                oscApi()?.connectClip(layer, column);
                oscState()?.scheduleQuickRefresh();
            },
        },

        oscClearLayer: {
            name: 'OSC: Clear Layer (Stop)',
            options: [layerOption],
            callback: async ({options}: {options: Record<string, any>}) => {
                const layer = +await parse(options.layer);
                oscApi()?.clearLayer(layer);
                oscState()?.scheduleQuickRefresh();
            },
        },

        oscLayerNextClip: {
            name: 'OSC: Layer Next Clip',
            options: [layerOption],
            callback: async ({options}: {options: Record<string, any>}) => {
                const layer = +await parse(options.layer);
                oscApi()?.layerNextCol(layer);
                oscState()?.scheduleQuickRefresh();
            },
        },

        oscLayerPrevClip: {
            name: 'OSC: Layer Previous Clip',
            options: [layerOption],
            callback: async ({options}: {options: Record<string, any>}) => {
                const layer = +await parse(options.layer);
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
                const layer = +await parse(options.layer);
                const api = oscApi();
                if (!api) return;
                const path = `/composition/layers/${layer}/direction`;
                const state = options.state as string
                if (state === 'toggle') {
                    const state = oscState();
                    const layerData = state?.getLayer(layer);
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
            description: 'Set the playback speed of the active clip on a layer. 1.0 = normal, 0.5 = half, 2.0 = double.',
            options: [
                layerOption,
                {
                    id: 'speed',
                    type: 'textinput',
                    label: 'Speed (1.0 = normal)',
                    default: '1.0',
                    useVariables: true,
                },
            ],
            callback: async ({options}: {options: Record<string, any>}) => {
                const layer = +await parse(options.layer);
                const speed = parseFloat(await parse(options.speed));
                const api = oscApi();
                if (!api) return;
                const state = oscState();
                const clip = state?.getActiveClipColumn(layer);
                if (!clip) return;
                // Resolume speed is normalized — need to use getSpeedValue conversion
                // But for OSC, we can send the raw normalized value
                // Speed in Resolume OSC: the range is nonlinear, 0-1 maps to the speed slider
                // A value of ~0.467 = 1x speed. We send the float directly and let the user calibrate.
                api.send(`/composition/layers/${layer}/clips/${clip}/transport/position/behaviour/speed`, { type: 'f', value: speed });
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
                const layer = +await parse(options.layer);
                const value = parseFloat(await parse(options.value));
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
                const layer = +await parse(options.layer);
                const value = parseFloat(await parse(options.value));
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
                const layer = +await parse(options.layer);
                const column = +await parse(options.column);
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
                const layer = +await parse(options.layer);
                const position = parseFloat(await parse(options.position));
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
                const layer = +await parse(options.layer);
                const timeSec = parseFloat(await parse(options.time));
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
                const layer = +await parse(options.layer);
                const jogSec = parseFloat(await parse(options.time));
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
                const layer = +await parse(options.layer);
                const secFromEnd = parseFloat(await parse(options.seconds));
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
                const layer = +await parse(options.layer);
                const api = oscApi();
                if (!api) return;
                const state = oscState();
                const clip = state?.getActiveClipColumn(layer);
                if (!clip) return;
                // Jump to position 0 to restart
                api.send(`/composition/layers/${layer}/clips/${clip}/transport/position`, { type: 'f', value: 0 });
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
                const value = parseFloat(await parse(options.value));
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
                const value = parseFloat(await parse(options.value));
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
                const value = parseFloat(await parse(options.value));
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
                const value = parseFloat(await parse(options.value));
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
                const tempo = parseFloat(await parse(options.tempo));
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
                const layer = +await parse(options.layer);
                const value = parseFloat(await parse(options.value));
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
                const layer = +await parse(options.layer);
                const value = parseFloat(await parse(options.value));
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
                const layer = +await parse(options.layer);
                const value = parseFloat(await parse(options.value));
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
                const layer = +await parse(options.layer);
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
                const layer = +await parse(options.layer);
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
                const layer = +await parse(options.layer);
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
                const layer = +await parse(options.layer);
                const value = parseFloat(await parse(options.value));
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
                const layer = +await parse(options.layer);
                const value = parseFloat(await parse(options.value));
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
                const deck = +await parse(options.deck);
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
                const group = +await parse(options.group);
                const column = +await parse(options.column);
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
                const group = +await parse(options.group);
                const lastColumn = +await parse(options.lastColumn);
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
                const group = +await parse(options.group);
                const lastColumn = +await parse(options.lastColumn);
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
                const group = +await parse(options.group);
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
                    ],
                    default: 'on',
                },
            ],
            callback: async ({options}: {options: Record<string, any>}) => {
                const group = +await parse(options.group);
                const api = oscApi();
                if (!api) return;
                const bypass = options.bypass as string
                const val = bypass === 'on' ? { type: 'i', value: 1 } : { type: 'i', value: 0 }
                api.bypassLayerGroup(group, val as any)
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
                const group = +await parse(options.group);
                const value = parseFloat(await parse(options.value));
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
                const group = +await parse(options.group);
                const value = parseFloat(await parse(options.value));
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
                const group = +await parse(options.group);
                const value = parseFloat(await parse(options.value));
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
                const group = +await parse(options.group);
                const value = parseFloat(await parse(options.value));
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
                const group = +await parse(options.group);
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
                const group = +await parse(options.group);
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
                const group = +await parse(options.group);
                const column = +await parse(options.column);
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
