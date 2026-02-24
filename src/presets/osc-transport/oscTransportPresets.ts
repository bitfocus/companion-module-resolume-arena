import {combineRgb} from '@companion-module/base'
import type {CompanionPresetDefinitions, CompanionButtonPresetDefinition, CompanionPresetFeedback, CompanionOptionValues} from '@companion-module/base'

// ── Shared Colors ──
const white = combineRgb(255, 255, 255)
const black = combineRgb(0, 0, 0)
const red = combineRgb(255, 0, 0)
const green = combineRgb(0, 200, 0)
const blue = combineRgb(0, 100, 255)
const orange = combineRgb(255, 140, 0)
const yellow = combineRgb(255, 220, 0)
const purple = combineRgb(160, 60, 255)
const darkGray = combineRgb(40, 40, 40)

const moduleId = 'resolume-arena'

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
	category: string,
	name: string,
	text: string,
	color: number,
	bgcolor: number,
	size: string,
	actions: Array<[string, Record<string, string>]>,
	feedbacks?: Array<{feedbackId: string; options: CompanionOptionValues}>
): CompanionButtonPresetDefinition {
	return {
        type: 'button',
        category,
        name,
        style: { size: (size || 'auto') as any, text, color: color || white, bgcolor: bgcolor || darkGray },
        steps: [{ down: actions.map(a => ({ actionId: a[0], options: a[1] })), up: [] }],
		feedbacks: (feedbacks || []) as CompanionPresetFeedback[],
	}
}

export function getOscTransportPresets(extraLayers?: Set<number>): CompanionPresetDefinitions {
    const presets: CompanionPresetDefinitions = {}
    for (let l = 1; l <= 10; l++) Object.assign(presets, getLayerPresets(l));
    if (extraLayers) {
        for (const l of extraLayers) {
            if (l > 10) Object.assign(presets, getLayerPresets(l));
        }
    }
    for (let g = 1; g <= 3; g++) Object.assign(presets, getGroupPresets(g));
    Object.assign(presets, getCompositionPresets());
    return presets
}

function getLayerPresets(layer: number): CompanionPresetDefinitions {
    const cat = `OSC Transport / Layer ${layer}`
    const L = `${layer}`
    const pfx = `oscL${L}`
    const lp = `Layer ${layer}\\n`

    return {
        // 1. Trigger
        [`${pfx}_TriggerClip`]: btn(cat, 'Trigger Clip', `${lp}Trigger\\nClip`, white, green, 'auto', [['oscConnectClip', { layer: L, column: '1' }]]),

        // 2. Navigation
        [`${pfx}_PrevClip`]: btn(cat, 'Previous Clip', `${lp}Previous\\nClip`, white, darkGray, 'auto', [['oscLayerPrevClip', { layer: L }]]),
        [`${pfx}_NextClip`]: btn(cat, 'Next Clip', `${lp}Next\\nClip`, white, darkGray, 'auto', [['oscLayerNextClip', { layer: L }]]),

        // 3. Clear
        [`${pfx}_Clear`]: btn(cat, 'Clear', `${lp}Clear`, white, red, 'auto', [['oscClearLayer', { layer: L }]]),

        // 4. Transport
        [`${pfx}_Reverse`]: btn(cat, 'Reverse', `${lp}Reverse`, white, blue, '18', [['oscClipPauseResume', { layer: L, state: 'backward' }]]),
        [`${pfx}_Pause`]: btn(cat, 'Pause', `${lp}Pause`, white, red, '18', [['oscClipPauseResume', { layer: L, state: 'pause' }]]),
        [`${pfx}_Play`]: btn(cat, 'Play', `${lp}Play`, white, green, 'auto', [['oscClipPauseResume', { layer: L, state: 'forward' }]]),
        [`${pfx}_Restart`]: btn(cat, 'Restart', `${lp}Restart`, white, green, '18', [['oscClipRestartMedia', { layer: L }]]),

        // 5. Bypass
        [`${pfx}_BypassOff`]: btn(cat, 'Bypass Off', `${lp}Bypass\\nOff`, white, green, 'auto', [['oscBypassLayer', { layer: L, bypass: 'off' }]]),
        [`${pfx}_BypassOn`]: btn(cat, 'Bypass On', `${lp}Bypass\\nOn`, white, red, 'auto', [['oscBypassLayer', { layer: L, bypass: 'on' }]]),

        // 6. Opacity
        [`${pfx}_Opacity0`]: btn(cat, 'Opacity 0%', `${lp}Opacity\\n0%`, white, red, 'auto', [['oscSetLayerOpacity', { layer: L, value: '0.0' }]]),
        [`${pfx}_Opacity100`]: btn(cat, 'Opacity 100%', `${lp}Opacity\\n100%`, white, green, 'auto', [['oscSetLayerOpacity', { layer: L, value: '1.0' }]]),

        // 7. Jog
        [`${pfx}_JogBack`]: btn(cat, 'Jog -10s', `${lp}Jog -10s`, white, blue, 'auto', [['oscClipJogTime', { layer: L, time: '-10' }]]),
        [`${pfx}_JogFwd`]: btn(cat, 'Jog +10s', `${lp}Jog +10s`, white, blue, 'auto', [['oscClipJogTime', { layer: L, time: '10' }]]),

        // 8. Countdown Jumps
        [`${pfx}_GoToLast60`]: btn(cat, 'Last 60s', `${lp}Last 60s`, white, purple, 'auto', [['oscClipGoToSecondsFromEnd', { layer: L, seconds: '60' }]]),
        [`${pfx}_GoToLast30`]: btn(cat, 'Last 30s', `${lp}Last 30s`, white, orange, 'auto', [['oscClipGoToSecondsFromEnd', { layer: L, seconds: '30' }]]),
        [`${pfx}_GoToLast15`]: btn(cat, 'Last 15s', `${lp}Last 15s`, black, yellow, 'auto', [['oscClipGoToSecondsFromEnd', { layer: L, seconds: '15' }]]),
        [`${pfx}_GoToLast10`]: btn(cat, 'Last 10s', `${lp}Last 10s`, white, red, 'auto', [['oscClipGoToSecondsFromEnd', { layer: L, seconds: '10' }]]),

        // 9. Timer Displays
        [`${pfx}_TRT`]: {
            type: 'button',
            category: cat,
            name: 'TRT',
            style: {
                size: 'auto',
                text: `TRT\\n$(${moduleId}:osc_layer_${L}_duration)\\n$(${moduleId}:osc_layer_${L}_remaining)`,
                color: white,
                bgcolor: green,
            },
            steps: [{ down: [], up: [] }],
            feedbacks: [
                { feedbackId: 'oscCountdownWarning', options: { layer: L, color_30: orange, color_10: red, text_color: white } },
            ],
        },

        [`${pfx}_ClipNameRemaining`]: {
            type: 'button',
            category: cat,
            name: 'Clip Name + Remaining',
            style: {
                size: 'auto',
                text: `$(${moduleId}:osc_layer_${L}_clip_name)\\n$(${moduleId}:osc_layer_${L}_remaining)`,
                color: white,
                bgcolor: green,
            },
            steps: [{ down: [], up: [] }],
            feedbacks: [
                { feedbackId: 'oscCountdownWarning', options: { layer: L, color_30: orange, color_10: red, text_color: white } },
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
        [`${pfx}_PrevCol`]: btn(cat, 'Previous Column', `${gp}Previous\\nColumn`, white, darkGray, 'auto', [['oscGroupPrevColumn', { group: G, lastColumn: '10' }]]),
        [`${pfx}_NextCol`]: btn(cat, 'Next Column', `${gp}Next\\nColumn`, white, darkGray, 'auto', [['oscGroupNextColumn', { group: G, lastColumn: '10' }]]),

        // 3. Clear
        [`${pfx}_Clear`]: btn(cat, 'Clear', `${gp}Clear`, white, red, 'auto', [['oscGroupClear', { group: G }]]),

        // 4. Transport
        [`${pfx}_Reverse`]: btn(cat, 'Reverse', `${gp}Reverse`, white, blue, '18', [['oscCustomCommand', { customPath: `/composition/groups/${G}/backwards`, oscType: 'i', customValue: '1', relativeType: 'n' }]]),
        [`${pfx}_Pause`]: btn(cat, 'Pause', `${gp}Pause`, white, red, '18', [['oscCustomCommand', { customPath: `/composition/groups/${G}/paused`, oscType: 'i', customValue: '1', relativeType: 'n' }]]),
        [`${pfx}_Play`]: btn(cat, 'Play', `${gp}Play`, white, green, 'auto', [['oscCustomCommand', { customPath: `/composition/groups/${G}/forwards`, oscType: 'i', customValue: '1', relativeType: 'n' }]]),

        // 5. Bypass
        [`${pfx}_BypassOff`]: btn(cat, 'Bypass Off', `${gp}Bypass\\nOff`, white, green, 'auto', [['oscGroupBypass', { group: G, bypass: 'off' }]]),
        [`${pfx}_BypassOn`]: btn(cat, 'Bypass On', `${gp}Bypass\\nOn`, white, red, 'auto', [['oscGroupBypass', { group: G, bypass: 'on' }]]),

        // 6. Master
        [`${pfx}_Master0`]: btn(cat, 'Master 0%', `${gp}Master\\n0%`, white, red, 'auto', [['oscGroupSetMaster', { group: G, value: '0.0' }]]),
        [`${pfx}_Master100`]: btn(cat, 'Master 100%', `${gp}Master\\n100%`, white, green, 'auto', [['oscGroupSetMaster', { group: G, value: '1.0' }]]),

    }
}

function getCompositionPresets(): CompanionPresetDefinitions {
    const cat = 'OSC Transport / Composition'

    return {
        // 1. Trigger
        oscComp_TriggerCol: btn(cat, 'Trigger Column', 'Trigger\\nColumn', white, green, 'auto', [['oscTriggerColumn', { column: '1' }]]),

        // 2. Navigation
        oscComp_PrevCol: btn(cat, 'Previous Column', 'Previous\\nColumn', white, darkGray, 'auto', [['oscPrevColumn', {}]]),
        oscComp_NextCol: btn(cat, 'Next Column', 'Next\\nColumn', white, darkGray, 'auto', [['oscNextColumn', {}]]),

        // 3. Clear
        oscComp_ClearAll: btn(cat, 'Clear All', 'Clear\\nAll', white, red, 'auto', [['oscClearAllLayers', {}]]),

        // 4. Transport
        oscComp_Reverse: btn(cat, 'Reverse', 'Reverse', white, blue, '18', [['oscCustomCommand', { customPath: '/composition/backwards', oscType: 'i', customValue: '1', relativeType: 'n' }]]),
        oscComp_Pause: btn(cat, 'Pause', 'Pause', white, red, '18', [['oscCustomCommand', { customPath: '/composition/paused', oscType: 'i', customValue: '1', relativeType: 'n' }]]),
        oscComp_Play: btn(cat, 'Play', 'Play', white, green, 'auto', [['oscCustomCommand', { customPath: '/composition/forwards', oscType: 'i', customValue: '1', relativeType: 'n' }]]),

        // 5. (no bypass at composition level)

        // 6. Master
        oscComp_Master0: btn(cat, 'Master 0%', 'Master\\n0%', white, red, 'auto', [['oscCustomCommand', { customPath: '/composition/master', oscType: 'f', customValue: '0.0', relativeType: 'n' }]]),
        oscComp_Master100: btn(cat, 'Master 100%', 'Master\\n100%', white, green, 'auto', [['oscCustomCommand', { customPath: '/composition/master', oscType: 'f', customValue: '1.0', relativeType: 'n' }]]),

        // 10. Deck
        oscComp_PrevDeck: btn(cat, 'Previous Deck', 'Previous\\nDeck', white, darkGray, 'auto', [['oscPrevDeck', {}]]),
        oscComp_NextDeck: btn(cat, 'Next Deck', 'Next\\nDeck', white, darkGray, 'auto', [['oscNextDeck', {}]]),

        // 11. Tempo
        oscComp_TempoTap: btn(cat, 'Tempo Tap', 'Tempo\\nTap', white, darkGray, 'auto', [['oscTempoTap', {}]]),

        // 12. Utility
        oscComp_ReQuery: btn(cat, 'Refresh Clip Data', 'Refresh\\nClip Data', white, darkGray, 'auto', [['oscReQueryClip', {}]]),

        // Info
        oscComp_ActiveColumn: {
            type: 'button',
            category: cat,
            name: 'Active Column',
            style: { size: 'auto', text: `Column\\n$(${moduleId}:osc_active_column)`, color: white, bgcolor: darkGray },
            steps: [{ down: [], up: [] }],
            feedbacks: [],
        },

        oscComp_ActiveColumnName: {
            type: 'button',
            category: cat,
            name: 'Active Column Name',
            style: { size: 'auto', text: `$(${moduleId}:osc_active_column_name)`, color: white, bgcolor: darkGray },
            steps: [{ down: [], up: [] }],
            feedbacks: [],
        },

    };
}
