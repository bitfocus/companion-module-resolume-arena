import {combineRgb} from '@companion-module/base'
import type {CompanionAdvancedFeedbackResult, CompanionFeedbackDefinitions} from '@companion-module/base'
import type {ResolumeArenaModuleInstance} from '../../index'
import {graphics} from 'companion-module-utils'
import type {OptionsBar} from 'companion-module-utils/dist/graphics'

/**
 * OSC Transport Feedbacks — countdown color changes and progress bar.
 * These work with OSC-only (no REST required).
 */
export function getOscTransportFeedbacks(
	resolumeArenaInstance: ResolumeArenaModuleInstance
): CompanionFeedbackDefinitions {
	return {
        oscProgressBar: {
            type: 'advanced',
            name: 'OSC: Progress Bar',
            description: 'Visual progress bar for layer playback. Green → Orange (≤30s) → Red (≤10s). Left to right.',
            options: [
                {
                    id: 'layer',
                    type: 'textinput',
                    label: 'Layer',
                    default: '1',
                    useVariables: true,
                },
                {
                    id: 'hideWhenNotRunning',
                    type: 'checkbox',
                    label: 'Hide when not running',
                    default: true,
                },
                {
                    id: 'orangeSeconds',
                    type: 'textinput',
                    label: 'Change to orange at remaining seconds',
                    default: '30',
                    useVariables: true,
                },
                {
                    id: 'redSeconds',
                    type: 'textinput',
                    label: 'Change to red at remaining seconds',
                    default: '10',
                    useVariables: true,
                },
                {
                    id: 'runningColor',
                    type: 'colorpicker',
                    label: 'Running color (green)',
                    default: combineRgb(0, 200, 0),
                    returnType: 'number',
                },
                {
                    id: 'warningColor',
                    type: 'colorpicker',
                    label: 'Warning color (orange)',
                    default: combineRgb(255, 140, 0),
                    returnType: 'number',
                },
                {
                    id: 'criticalColor',
                    type: 'colorpicker',
                    label: 'Critical color (red)',
                    default: combineRgb(255, 0, 0),
                    returnType: 'number',
                },
            ],
            callback: async (feedback: any): Promise<CompanionAdvancedFeedbackResult> => {
                const oscState = resolumeArenaInstance.getOscState();
                if (!oscState) return {};

                const layer = +await resolumeArenaInstance.parseVariablesInString(feedback.options.layer);
                const remaining = oscState.getLayerRemainingSeconds(layer);
                const duration = oscState.getLayerDurationSeconds(layer);
                const progress = oscState.getLayerProgress(layer);

                if (feedback.options.hideWhenNotRunning && duration <= 0) {
                    return {};
                }

                // Determine bar color: green → orange → red
                const orangeResolved = await resolumeArenaInstance.parseVariablesInString(String(feedback.options.orangeSeconds ?? '30'))
                const redResolved = await resolumeArenaInstance.parseVariablesInString(String(feedback.options.redSeconds ?? '10'))
                const orangeThreshold = parseFloat(orangeResolved) || 30
                const redThreshold = parseFloat(redResolved) || 10

                let barColor: number
                if (remaining <= redThreshold) {
                    barColor = +feedback.options.criticalColor
                } else if (remaining <= orangeThreshold) {
                    barColor = +feedback.options.warningColor
                } else {
                    barColor = +feedback.options.runningColor
                }

                const colors = [
                    { size: 100, color: barColor, background: barColor, backgroundOpacity: 64 },
                ]

                const progressPercent = progress * 100

                const options: OptionsBar = {
                    width: feedback.image!.width,
                    height: feedback.image!.height,
                    colors: colors,
                    barLength: 62,
                    barWidth: 8,
                    value: progressPercent,
                    type: 'horizontal',
                    offsetX: 5,
                    offsetY: feedback.image!.height > 58 ? 62 : 48,
                    opacity: 255,
                }

                return {
                    imageBuffer: graphics.bar(options),
                }
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
