import {combineRgb, CompanionPresetDefinitions} from '@companion-module/base';
import {bypassLayerPreset} from './presets/bypassLayerPreset.js';
import {soloLayerPreset} from './presets/soloLayerPreset.js';
import {clearLayerPreset} from './presets/clearLayerPreset.js';
import {selectLayerPreset} from './presets/selectLayerPreset.js';
import {changeTemplateSet100} from '../template/changeLayerGroupMasterSet100.js';
import {changeTemplateAdd10} from '../template/changeLayerGroupMasterAdd10.js';
import {changeTemplateSubtract10} from '../template/changeLayerGroupMasterSubtract10.js';
import {changeTemplateSet0} from '../template/changeLayerGroupMasterSet0.js';

const white = combineRgb(255, 255, 255);
const black = combineRgb(0, 0, 0);
const green = combineRgb(0, 200, 0);
const orange = combineRgb(255, 140, 0);
const yellow = combineRgb(204, 204, 0);
const red = combineRgb(255, 0, 0);

export function getLayerApiPresets(category: string, instanceLabel: string): CompanionPresetDefinitions {
	const m = instanceLabel || 'resolume-arena';
	return {
		bypassLayer: bypassLayerPreset(category),
		soloLayer: soloLayerPreset(category),
		clearLayer: clearLayerPreset(category),
		selectLayer: selectLayerPreset(category),
		changeLayerMasterSet100: changeTemplateSet100(category,'layer','Master'),
		changeLayerMasterAdd10: changeTemplateAdd10(category,'layer','Master'),
		changeLayerMasterSubtract10: changeTemplateSubtract10(category,'layer','Master'),
		changeLayerMasterSet0: changeTemplateSet0(category,'layer','Master'),
		changeLayerOpacitySet100: changeTemplateSet100(category,'layer','Opacity'),
		changeLayerOpacityAdd10: changeTemplateAdd10(category,'layer','Opacity'),
		changeLayerOpacitySubtract10: changeTemplateSubtract10(category,'layer','Opacity'),
		changeLayerOpacitySet0: changeTemplateSet0(category,'layer','Opacity'),
		changeLayerVolumeSet100: changeTemplateSet100(category,'layer','Volume', true),
		changeLayerVolumeAdd10: changeTemplateAdd10(category,'layer','Volume', true),
		changeLayerVolumeSubtract10: changeTemplateSubtract10(category,'layer','Volume', true),
		changeLayerVolumeSet0: changeTemplateSet0(category,'layer','Volume', true),
		layerTimerElapsed: {
			type: 'button',
			category,
			name: 'Layer Timer — Elapsed',
			style: { size: '18', text: '$('+m+':ws_layer_1_elapsed)', color: white, bgcolor: black },
			steps: [{ down: [], up: [] }],
			feedbacks: [
				{ feedbackId: 'layerTransportPosition', options: { layer: '1', view: 'timestamp_noHours', timeRemaining: false } },
				{ feedbackId: 'wsProgressBar', options: { layer: '1', hideWhenNotRunning: true, orangeSeconds: '30', redSeconds: '10', runningColor: green, warningColor: orange, criticalColor: red } },
			],
		},
		layerTimerRemaining: {
			type: 'button',
			category,
			name: 'Layer Timer — Remaining',
			style: { size: '18', text: '$('+m+':ws_layer_1_remaining)', color: white, bgcolor: black },
			steps: [{ down: [], up: [] }],
			feedbacks: [
				{ feedbackId: 'layerTransportPosition', options: { layer: '1', view: 'timestamp_noHours', timeRemaining: true } },
				{ feedbackId: 'wsProgressBar', options: { layer: '1', hideWhenNotRunning: true, orangeSeconds: '30', redSeconds: '10', runningColor: green, warningColor: yellow, criticalColor: red } },
			],
		},
		layerTimerTRT: {
			type: 'button',
			category,
			name: 'Layer Timer — TRT (Duration + Remaining)',
			style: { size: '14', text: 'TRT\\n$('+m+':ws_layer_1_duration)\\n$('+m+':ws_layer_1_remaining)', color: white, bgcolor: black },
			steps: [{ down: [], up: [] }],
			feedbacks: [
				{ feedbackId: 'wsProgressBar', options: { layer: '1', hideWhenNotRunning: true, orangeSeconds: '15', redSeconds: '10', runningColor: green, warningColor: yellow, criticalColor: red } },
			],
		},
		layerTimerProgressBar: {
			type: 'button',
			category,
			name: 'Layer Timer — Progress Bar',
			style: { size: '18', text: '$('+m+':ws_layer_1_remaining)', color: white, bgcolor: black },
			steps: [{ down: [], up: [] }],
			feedbacks: [
				{ feedbackId: 'wsProgressBar', options: { layer: '1', hideWhenNotRunning: true, orangeSeconds: '30', redSeconds: '10', runningColor: green, warningColor: orange, criticalColor: red } },
			],
		},
	};
}
