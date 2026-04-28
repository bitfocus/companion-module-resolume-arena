import {CompanionPresetDefinitions} from '@companion-module/base';
import {connectPreviousColumnPreset} from './presets/connectPreviousColumnPreset.js';
import {selectedColumnNamePreset} from './presets/selectedColumnNamePreset.js';
import {connectColumnPreset} from './presets/connectColumnPreset.js';
import {selectColumnPreset} from './presets/selectColumnPreset.js';
import {connectNextColumnPreset} from './presets/connectNextColumnPreset.js';
import {selectPreviousColumnPreset} from './presets/selectPreviousColumnPreset.js';
import {selectNextColumnPreset} from './presets/selectNextColumnPreset.js';
import {connectedColumnNamePreset} from './presets/connectedColumnNamePreset.js';
import type {DomainPresetBundle, PresetSubGroup} from '../types.js';

export function getColumnApiPresetBundle(): DomainPresetBundle {
	const presets: CompanionPresetDefinitions = {};
	const displayIds: string[] = [];
	const connectIds: string[] = [];
	const selectIds: string[] = [];

	// Displays
	presets.connectedColumnName = connectedColumnNamePreset(); displayIds.push('connectedColumnName');
	presets.selectedColumnName = selectedColumnNamePreset();   displayIds.push('selectedColumnName');

	// Connect
	presets.connectColumnPreset = connectColumnPreset();                 connectIds.push('connectColumnPreset');
	presets.connectPreviousColumnPreset = connectPreviousColumnPreset(); connectIds.push('connectPreviousColumnPreset');
	presets.connectNextColumnPreset = connectNextColumnPreset();         connectIds.push('connectNextColumnPreset');

	// Select
	presets.selectColumnPreset = selectColumnPreset();                 selectIds.push('selectColumnPreset');
	presets.selectPreviousColumnPreset = selectPreviousColumnPreset(); selectIds.push('selectPreviousColumnPreset');
	presets.selectNextColumnPreset = selectNextColumnPreset();         selectIds.push('selectNextColumnPreset');

	const groups: PresetSubGroup[] = [];
	if (displayIds.length) groups.push({id: 'column_displays', type: 'simple', name: 'Displays', presets: displayIds});
	if (connectIds.length) groups.push({id: 'column_connect',  type: 'simple', name: 'Connect',  presets: connectIds});
	if (selectIds.length)  groups.push({id: 'column_select',   type: 'simple', name: 'Select',   presets: selectIds});

	return {
		section: {id: 'column', name: 'Column', definitions: groups},
		presets,
	};
}
