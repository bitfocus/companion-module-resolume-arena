import {combineRgb} from '@companion-module/base'
import type {CompanionPresetDefinitions, CompanionPresetDefinition as CompanionButtonPresetDefinition, CompanionPresetFeedback, CompanionOptionValues} from '@companion-module/base'
import type {DomainPresetBundle, PresetSubGroup} from '../types.js'

// ── Shared Colors ──
const white = combineRgb(255, 255, 255)
const black = combineRgb(0, 0, 0)
const red = combineRgb(255, 0, 0)
const green = combineRgb(0, 200, 0)
const blue = combineRgb(0, 100, 255)
const orange = combineRgb(255, 140, 0)
const yellow = combineRgb(204, 204, 0)
const purple = combineRgb(160, 60, 255)
const darkGray = combineRgb(40, 40, 40)

// Color scheme (consistent across all preset groups):
// green    = trigger / play / bypass off / master 100% / opacity 100%
// red      = clear / pause / bypass on / master 0% / opacity 0%
// blue     = reverse / jog
// purple   = countdown jumps (60s)
// orange   = countdown jumps (30s)
// yellow   = countdown jumps (15s)
// darkGray = navigation / info / utility

// Preset order (consistent across Layer / Group / Composition):
// 1. Trigger (column or clip)
// 2. Navigation (next/prev column or clip)
// 3. Clear
// 4. Transport (pause, play, reverse, restart)
// 5. Bypass (on, off)
// 6. Master / Opacity (100%, 0%)
// 7. Jog (layer only)
// 8. Countdown jumps (layer only)
// 9. Timer displays (layer only)
// 10. Deck (composition only)
// 11. Tempo (composition only)
// 12. Utility (composition only)

function btn(
	_category: string,
	name: string,
	text: string,
	color: number,
	bgcolor: number,
	size: string,
	actions: Array<[string, Record<string, string>]>,
	feedbacks?: Array<{feedbackId: string; options: CompanionOptionValues}>
): CompanionButtonPresetDefinition {
	return {
		type: 'simple',
		name,
		style: { size: (size || 'auto') as any, text, color: color || white, bgcolor: bgcolor || darkGray },
		steps: [{ down: actions.map(a => ({ actionId: a[0], options: a[1] })), up: [] }],
		feedbacks: (feedbacks || []) as CompanionPresetFeedback[],
	}
}

export function getOscTransportPresets(instanceLabel: string, extraLayers?: Set<number>): CompanionPresetDefinitions {
	const moduleId = instanceLabel || 'resolume-arena'
	const presets: CompanionPresetDefinitions = {}
	for (let l = 1; l <= 10; l++) Object.assign(presets, getLayerPresets(l, moduleId));
	if (extraLayers) {
		for (const l of extraLayers) {
			if (l > 10) Object.assign(presets, getLayerPresets(l, moduleId));
		}
	}
	for (let g = 1; g <= 3; g++) Object.assign(presets, getGroupPresets(g));
	Object.assign(presets, getCompositionPresets(moduleId));
	return presets
}

function getLayerPresets(layer: number, moduleId: string): CompanionPresetDefinitions {
	const cat = `OSC Transport / Layer ${layer}`
	const L = `${layer}`
	const pfx = `oscL${L}`
	const lp = `Layer ${layer}\\n`

	return {
		// 1. Trigger
		[`${pfx}_TriggerClip`]: btn(cat, 'Trigger Clip', `${lp}Trigger\\nClip`, white, green, 'auto', [['oscConnectClip', { layer: L, column: '1' }]]),

		// 2. Navigation
		[`${pfx}_PrevClip`]: btn(cat, 'Previous Clip', `${lp}◀\\nPrevious\\nClip`, white, darkGray, 'auto', [['oscLayerPrevClip', { layer: L }]]),
		[`${pfx}_NextClip`]: btn(cat, 'Next Clip', `${lp}▶\\nNext\\nClip`, white, darkGray, 'auto', [['oscLayerNextClip', { layer: L }]]),

		// 3. Clear
		[`${pfx}_Clear`]: btn(cat, 'Clear', `${lp}Clear`, white, red, 'auto', [['oscClearLayer', { layer: L }]]),

		// 4. Transport
		[`${pfx}_Reverse`]: btn(cat, 'Reverse', `${lp}◀◀\\nReverse`, white, blue, 'auto', [['oscClipPauseResume', { layer: L, state: 'backward' }]]),
		[`${pfx}_Pause`]: btn(cat, 'Pause', `${lp}⏸\\nPause`, white, red, 'auto', [['oscClipPauseResume', { layer: L, state: 'pause' }]]),
		[`${pfx}_Play`]: btn(cat, 'Play', `${lp}▶\\nPlay`, white, green, 'auto', [['oscClipPauseResume', { layer: L, state: 'forward' }]]),
		[`${pfx}_Toggle`]: btn(cat, 'Play/Pause Toggle', `${lp}⏯\\nToggle`, white, orange, 'auto', [['oscClipPauseResume', { layer: L, state: 'toggle' }]]),
		[`${pfx}_Restart`]: btn(cat, 'Restart', `${lp}⏮\\nRestart`, white, green, '18', [['oscClipRestartMedia', { layer: L }]]),

		// 5. Bypass
		[`${pfx}_BypassOff`]: btn(cat, 'Bypass Off', `${lp}Bypass\\nOff`, white, green, 'auto', [['oscBypassLayer', { layer: L, bypass: 'off' }]]),
		[`${pfx}_BypassOn`]: btn(cat, 'Bypass On', `${lp}Bypass\\nOn`, white, red, 'auto', [['oscBypassLayer', { layer: L, bypass: 'on' }]]),

		// 6. Opacity
		[`${pfx}_Opacity0`]: btn(cat, 'Opacity 0%', `${lp}Opacity\\n0%`, white, red, 'auto', [['oscSetLayerOpacity', { layer: L, value: '0.0' }]]),
		[`${pfx}_Opacity100`]: btn(cat, 'Opacity 100%', `${lp}Opacity\\n100%`, white, green, 'auto', [['oscSetLayerOpacity', { layer: L, value: '1.0' }]]),

		// 7. Jog
		[`${pfx}_JogBack`]: btn(cat, 'Jog -10s', `${lp}◀◀\\n10s`, white, blue, 'auto', [['oscClipJogTime', { layer: L, time: '-10' }]]),
		[`${pfx}_JogFwd`]: btn(cat, 'Jog +10s', `${lp}▶▶\\n10s`, white, blue, 'auto', [['oscClipJogTime', { layer: L, time: '10' }]]),

		// 8. Countdown Jumps
		[`${pfx}_GoToLast60`]: btn(cat, 'Last 60s', `${lp}Last 60s`, white, purple, 'auto', [['oscClipGoToSecondsFromEnd', { layer: L, seconds: '60' }]]),
		[`${pfx}_GoToLast30`]: btn(cat, 'Last 30s', `${lp}Last 30s`, white, orange, 'auto', [['oscClipGoToSecondsFromEnd', { layer: L, seconds: '30' }]]),
		[`${pfx}_GoToLast15`]: btn(cat, 'Last 15s', `${lp}Last 15s`, black, yellow, 'auto', [['oscClipGoToSecondsFromEnd', { layer: L, seconds: '15' }]]),
		[`${pfx}_GoToLast10`]: btn(cat, 'Last 10s', `${lp}Last 10s`, white, red, 'auto', [['oscClipGoToSecondsFromEnd', { layer: L, seconds: '10' }]]),

		// 9. Timer Displays
		[`${pfx}_TRT`]: {
			type: 'simple',
			name: 'TRT',
			style: {
				size: '14',
				text: `TRT\\n$(${moduleId}:osc_layer_${L}_duration)\\n$(${moduleId}:osc_layer_${L}_remaining)`,
				color: white,
				bgcolor: black,
			},
			steps: [{ down: [], up: [] }],
			feedbacks: [
				{ feedbackId: 'oscProgressBar', options: { layer: L, hideWhenNotRunning: true, orangeSeconds: 15, redSeconds: 10, runningColor: green, warningColor: yellow, criticalColor: red } },
			],
		},

		[`${pfx}_ClipNameRemaining`]: {
			type: 'simple',
			name: 'Clip Name + Remaining',
			style: {
				size: 'auto',
				text: `$(${moduleId}:osc_layer_${L}_clip_name)\\n$(${moduleId}:osc_layer_${L}_remaining)`,
				color: white,
				bgcolor: black,
			},
			steps: [{ down: [], up: [] }],
			feedbacks: [
				{ feedbackId: 'oscProgressBar', options: { layer: L, hideWhenNotRunning: true, orangeSeconds: 15, redSeconds: 10, runningColor: green, warningColor: yellow, criticalColor: red } },
			],
		},

		// 10. Progress Bar
		[`${pfx}_ProgressBar`]: {
			type: 'simple',
			name: 'Progress Bar',
			style: {
				size: '18',
				text: `$(${moduleId}:osc_layer_${L}_remaining)`,
				color: white,
				bgcolor: black,
			},
			steps: [{ down: [], up: [] }],
			feedbacks: [
				{ feedbackId: 'oscProgressBar', options: { layer: L, hideWhenNotRunning: true, orangeSeconds: 30, redSeconds: 10, runningColor: green, warningColor: orange, criticalColor: red } },
			],
		},
	}
}

function getGroupPresets(group: number): CompanionPresetDefinitions {
	const cat = `OSC Transport / Group ${group}`
	const G = `${group}`
	const pfx = `oscG${G}`
	const gp = `Group ${group}\\n`

	return {
		// 1. Trigger
		[`${pfx}_TriggerCol`]: btn(cat, 'Trigger Column', `${gp}Trigger\\nColumn`, white, green, 'auto', [['oscGroupTriggerColumn', { group: G, column: '1' }]]),

		// 2. Navigation
		[`${pfx}_PrevCol`]: btn(cat, 'Previous Column', `${gp}◀\\nPrevious\\nColumn`, white, darkGray, 'auto', [['oscGroupPrevColumn', { group: G, lastColumn: '10' }]]),
		[`${pfx}_NextCol`]: btn(cat, 'Next Column', `${gp}▶\\nNext\\nColumn`, white, darkGray, 'auto', [['oscGroupNextColumn', { group: G, lastColumn: '10' }]]),

		// 3. Clear
		[`${pfx}_Clear`]: btn(cat, 'Clear', `${gp}Clear`, white, red, 'auto', [['oscGroupClear', { group: G }]]),

		// 4. Transport
		[`${pfx}_Reverse`]: btn(cat, 'Reverse', `${gp}◀◀\\nReverse`, white, blue, 'auto', [['oscGroupDirection', { group: G, state: 'backward' }]]),
		[`${pfx}_Pause`]: btn(cat, 'Pause', `${gp}⏸\\nPause`, white, red, 'auto', [['oscGroupDirection', { group: G, state: 'pause' }]]),
		[`${pfx}_Play`]: btn(cat, 'Play', `${gp}▶\\nPlay`, white, green, 'auto', [['oscGroupDirection', { group: G, state: 'forward' }]]),
		[`${pfx}_Toggle`]: btn(cat, 'Play/Pause Toggle', `${gp}⏯\\nToggle`, white, orange, 'auto', [['oscGroupDirection', { group: G, state: 'toggle' }]]),

		// 5. Bypass
		[`${pfx}_BypassOff`]: btn(cat, 'Bypass Off', `${gp}Bypass\\nOff`, white, green, 'auto', [['oscGroupBypass', { group: G, bypass: 'off' }]]),
		[`${pfx}_BypassOn`]: btn(cat, 'Bypass On', `${gp}Bypass\\nOn`, white, red, 'auto', [['oscGroupBypass', { group: G, bypass: 'on' }]]),

		// 6. Master
		[`${pfx}_Master0`]: btn(cat, 'Master 0%', `${gp}Master\\n0%`, white, red, 'auto', [['oscGroupSetMaster', { group: G, value: '0.0' }]]),
		[`${pfx}_Master100`]: btn(cat, 'Master 100%', `${gp}Master\\n100%`, white, green, 'auto', [['oscGroupSetMaster', { group: G, value: '1.0' }]]),

	}
}

function getCompositionPresets(moduleId: string): CompanionPresetDefinitions {
	const cat = 'OSC Transport / Composition'

	return {
		// 1. Trigger
		oscComp_TriggerCol: btn(cat, 'Trigger Column', 'Trigger\\nColumn', white, green, 'auto', [['oscTriggerColumn', { column: '1' }]]),

		// 2. Navigation
		oscComp_PrevCol: btn(cat, 'Previous Column', '◀\\nPrevious\\nColumn', white, darkGray, 'auto', [['oscPrevColumn', {}]]),
		oscComp_NextCol: btn(cat, 'Next Column', '▶\\nNext\\nColumn', white, darkGray, 'auto', [['oscNextColumn', {}]]),

		// 3. Clear
		oscComp_ClearAll: btn(cat, 'Clear All', 'Clear\\nAll', white, red, 'auto', [['oscClearAllLayers', {}]]),

		// 4. Transport
		oscComp_Reverse: btn(cat, 'Reverse', '◀◀\\nReverse', white, blue, 'auto', [['oscCompositionDirection', { state: 'backward' }]]),
		oscComp_Pause: btn(cat, 'Pause', '⏸\\nPause', white, red, 'auto', [['oscCompositionDirection', { state: 'pause' }]]),
		oscComp_Play: btn(cat, 'Play', '▶\\nPlay', white, green, 'auto', [['oscCompositionDirection', { state: 'forward' }]]),
		oscComp_Toggle: btn(cat, 'Play/Pause Toggle', '⏯\\nToggle', white, orange, 'auto', [['oscCompositionDirection', { state: 'toggle' }]]),

		// 5. (no bypass at composition level)

		// 6. Master
		oscComp_Master0: btn(cat, 'Master 0%', 'Master\\n0%', white, red, 'auto', [['oscCustomCommand', { customPath: '/composition/master', oscType: 'f', customValue: '0.0', relativeType: 'n' }]]),
		oscComp_Master100: btn(cat, 'Master 100%', 'Master\\n100%', white, green, 'auto', [['oscCustomCommand', { customPath: '/composition/master', oscType: 'f', customValue: '1.0', relativeType: 'n' }]]),

		// 10. Deck
		oscComp_PrevDeck: btn(cat, 'Previous Deck', '◀\\nPrevious\\nDeck', white, darkGray, 'auto', [['oscPrevDeck', {}]]),
		oscComp_NextDeck: btn(cat, 'Next Deck', '▶\\nNext\\nDeck', white, darkGray, 'auto', [['oscNextDeck', {}]]),

		// 11. Tempo
		oscComp_TempoTap: btn(cat, 'Tempo Tap', 'Tempo\\nTap', white, darkGray, 'auto', [['oscTempoTap', {}]]),

		// 12. Utility
		oscComp_ReQuery: btn(cat, 'Refresh Clip Data', 'Refresh\\nClip Data', white, darkGray, 'auto', [['oscReQueryClip', {}]]),

		// Info
		oscComp_ActiveColumn: {
			type: 'simple',
			name: 'Active Column',
			style: { size: 'auto', text: `Column\\n$(${moduleId}:osc_active_column)`, color: white, bgcolor: darkGray },
			steps: [{ down: [], up: [] }],
			feedbacks: [],
		},

		oscComp_ActiveColumnName: {
			type: 'simple',
			name: 'Active Column Name',
			style: { size: 'auto', text: `$(${moduleId}:osc_active_column_name)`, color: white, bgcolor: darkGray },
			steps: [{ down: [], up: [] }],
			feedbacks: [],
		},

	};
}

// Bundle view: takes the flat preset record and splits it into sub-groups by
// id prefix — Composition (oscComp_*), Layer 01..10 (oscL{N}_*), Group 01..03
// (oscG{N}_*), plus any dynamically-discovered layers > 10 in an "Additional
// Layers" sub-group. Sub-groups render in array order inside the section.
export function getOscTransportPresetBundle(instanceLabel: string, extraLayers?: Set<number>): DomainPresetBundle {
	const presets = getOscTransportPresets(instanceLabel, extraLayers)
	const ids = Object.keys(presets)

	const compIds = ids.filter(id => id.startsWith('oscComp_'))
	const extraLayerIds = ids.filter(id => /^osc_layer_/.test(id))

	const groups: PresetSubGroup[] = []
	if (compIds.length) groups.push({id: 'osc_comp', type: 'simple', name: 'Composition', presets: compIds})

	for (let l = 1; l <= 10; l++) {
		const layerIds = ids.filter(id => id.startsWith(`oscL${l}_`))
		if (layerIds.length) {
			groups.push({
				id: `osc_layer_${l}`,
				type: 'simple',
				name: `Layer ${String(l).padStart(2, '0')}`,
				presets: layerIds,
			})
		}
	}

	for (let g = 1; g <= 3; g++) {
		const groupIds = ids.filter(id => id.startsWith(`oscG${g}_`))
		if (groupIds.length) {
			groups.push({
				id: `osc_group_${g}`,
				type: 'simple',
				name: `Group ${String(g).padStart(2, '0')}`,
				presets: groupIds,
			})
		}
	}

	if (extraLayerIds.length) {
		groups.push({id: 'osc_extra', type: 'simple', name: 'Additional Layers', presets: extraLayerIds})
	}

	return {
		section: {id: 'oscTransport', name: 'OSC Transport', definitions: groups},
		presets,
	}
}
