import {combineRgb} from '@companion-module/base'
import type {CompanionAdvancedFeedbackResult, CompanionFeedbackDefinitions} from '@companion-module/base'
import type {ResolumeArenaModuleInstance} from '../../index'

/**
 * OSC Transport Feedbacks — countdown color changes.
 * These work with OSC-only (no REST required).
 */
export function getOscTransportFeedbacks(
	resolumeArenaInstance: ResolumeArenaModuleInstance
): CompanionFeedbackDefinitions {
	return {
        oscCountdownWarning: {
            type: 'advanced',
            name: 'OSC: Countdown Warning',
            description: 'Orange under 30s, red under 10s. Set the button default color to green (or whatever you like).',
            options: [
                {
                    id: 'layer',
                    type: 'textinput',
                    label: 'Layer',
                    default: '1',
                    useVariables: true,
                },
                {
                    id: 'color_30',
                    type: 'colorpicker',
                    label: 'Background: ≤30s remaining',
                    default: combineRgb(255, 140, 0),
                    returnType: 'number',
                },
                {
                    id: 'color_10',
                    type: 'colorpicker',
                    label: 'Background: ≤10s remaining',
                    default: combineRgb(255, 0, 0),
                    returnType: 'number',
                },
                {
                    id: 'text_color',
                    type: 'colorpicker',
                    label: 'Text color (when warning active)',
                    default: combineRgb(255, 255, 255),
                    returnType: 'number',
                },
            ],
            callback: async (feedback: any): Promise<CompanionAdvancedFeedbackResult> => {
                const oscState = resolumeArenaInstance.getOscState();
                if (!oscState) return {};

                const layer = +await resolumeArenaInstance.parseVariablesInString(feedback.options.layer);
                const remaining = oscState.getLayerRemainingSeconds(layer);
                const duration = oscState.getLayerDurationSeconds(layer);

                // No clip or no duration data — no override
                if (duration <= 0) return {};

                if (remaining <= 10 && remaining > 0) {
                    return { bgcolor: feedback.options.color_10, color: feedback.options.text_color };
                }
                if (remaining <= 30) {
                    return { bgcolor: feedback.options.color_30, color: feedback.options.text_color };
                }

                // Above 30s — no override, button keeps its own default color
                return {};
            },
        },
        oscActiveColumn: {
            type: 'advanced',
            name: 'OSC: Active Column',
            description: 'Highlights when the specified column is the active composition column.',
            options: [
                {
                    id: 'column',
                    type: 'textinput',
                    label: 'Column',
                    default: '1',
                    useVariables: true,
                },
                {
                    id: 'bg_active',
                    type: 'colorpicker',
                    label: 'Background: Active',
                    default: combineRgb(0, 200, 0),
                    returnType: 'number',
                },
                {
                    id: 'text_active',
                    type: 'colorpicker',
                    label: 'Text: Active',
                    default: combineRgb(255, 255, 255),
                    returnType: 'number',
                },
            ],
            callback: async (feedback: any): Promise<CompanionAdvancedFeedbackResult> => {
                const oscState = resolumeArenaInstance.getOscState();
                if (!oscState) return {};

                const column = +await resolumeArenaInstance.parseVariablesInString(feedback.options.column);
                if (oscState.activeColumn === column) {
                    return { bgcolor: feedback.options.bg_active, color: feedback.options.text_active };
                }
                return {};
            },
        },
	}
}
