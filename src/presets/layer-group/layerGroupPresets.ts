import {CompanionPresetDefinitions} from '@companion-module/base';
import {bypassLayerGroupPreset} from './presets/bypassLayerGroupPreset.js';
import {soloLayerGroupPreset} from './presets/soloLayerGroupPreset.js';
import {clearLayerGroupPreset} from './presets/clearLayerGroupPreset.js';
import {selectLayerGroupPreset} from './presets/selectLayerGroupPreset.js';
import {selectLayerGroupColumnPreset} from './presets/selectLayerGroupColumnPreset.js';
import {selectNextLayerGroupColumnPreset} from './presets/selectNextLayerGroupColumnPreset.js';
import {selectedLayerGroupColumnNamePreset} from './presets/selectedLayerGroupColumnNamePreset.js';
import {changeTemplateSet100} from '../template/changeLayerGroupMasterSet100.js';
import {changeTemplateSet0} from '../template/changeLayerGroupMasterSet0.js';
import {changeTemplateAdd10} from '../template/changeLayerGroupMasterAdd10.js';
import {changeTemplateSubtract10} from '../template/changeLayerGroupMasterSubtract10.js';
import {connectLayerGroupColumnPreset} from './presets/connectLayerGroupColumnPreset.js';
import {selectPreviousLayerGroupColumnPreset} from './presets/selectPreviousLayerGroupColumnPreset.js';
import {connectNextLayerGroupColumnPreset} from './presets/connectNextLayerGroupColumnPreset.js';
import {connectPreviousLayerGroupColumnPreset} from './presets/connectPreviousLayerGroupColumnPreset.js';
import {connectedLayerGroupColumnNamePreset} from './presets/connectedLayerGroupColumnNamePreset.js';
import type {DomainPresetBundle, PresetSubGroup} from '../types.js';

export function getLayerGroupApiPresetBundle(category: string): DomainPresetBundle {
	const presets: CompanionPresetDefinitions = {};
	const controlIds: string[] = [];
	const masterIds: string[] = [];
	const opacityIds: string[] = [];
	const volumeIds: string[] = [];
	const columnDisplayIds: string[] = [];
	const columnConnectIds: string[] = [];
	const columnSelectIds: string[] = [];

	// Control
	presets.selectLayerGroup = selectLayerGroupPreset(category); controlIds.push('selectLayerGroup');
	presets.bypassLayerGroup = bypassLayerGroupPreset(category); controlIds.push('bypassLayerGroup');
	presets.soloLayerGroup = soloLayerGroupPreset(category);     controlIds.push('soloLayerGroup');
	presets.clearLayerGroup = clearLayerGroupPreset(category);   controlIds.push('clearLayerGroup');

	// Master
	presets.changeLayerGroupMasterSet100 = changeTemplateSet100(category, 'layerGroup', 'Master');        masterIds.push('changeLayerGroupMasterSet100');
	presets.changeLayerGroupMasterAdd10 = changeTemplateAdd10(category, 'layerGroup', 'Master');          masterIds.push('changeLayerGroupMasterAdd10');
	presets.changeLayerGroupMasterSubtract10 = changeTemplateSubtract10(category, 'layerGroup', 'Master'); masterIds.push('changeLayerGroupMasterSubtract10');
	presets.changeLayerGroupMasterSet0 = changeTemplateSet0(category, 'layerGroup', 'Master');             masterIds.push('changeLayerGroupMasterSet0');

	// Opacity
	presets.changeLayerGroupOpacitySet100 = changeTemplateSet100(category, 'layerGroup', 'Opacity');        opacityIds.push('changeLayerGroupOpacitySet100');
	presets.changeLayerGroupOpacityAdd10 = changeTemplateAdd10(category, 'layerGroup', 'Opacity');          opacityIds.push('changeLayerGroupOpacityAdd10');
	presets.changeLayerGroupOpacitySubtract10 = changeTemplateSubtract10(category, 'layerGroup', 'Opacity'); opacityIds.push('changeLayerGroupOpacitySubtract10');
	presets.changeLayerGroupOpacitySet0 = changeTemplateSet0(category, 'layerGroup', 'Opacity');             opacityIds.push('changeLayerGroupOpacitySet0');

	// Volume
	presets.changeLayerGroupVolumeSet100 = changeTemplateSet100(category, 'layerGroup', 'Volume', true);        volumeIds.push('changeLayerGroupVolumeSet100');
	presets.changeLayerGroupVolumeAdd10 = changeTemplateAdd10(category, 'layerGroup', 'Volume', true);          volumeIds.push('changeLayerGroupVolumeAdd10');
	presets.changeLayerGroupVolumeSubtract10 = changeTemplateSubtract10(category, 'layerGroup', 'Volume', true); volumeIds.push('changeLayerGroupVolumeSubtract10');
	presets.changeLayerGroupVolumeSet0 = changeTemplateSet0(category, 'layerGroup', 'Volume', true);             volumeIds.push('changeLayerGroupVolumeSet0');

	// Column displays
	presets.selectedLayerGroupColumnName = selectedLayerGroupColumnNamePreset(category);   columnDisplayIds.push('selectedLayerGroupColumnName');
	presets.connectedLayerGroupColumnName = connectedLayerGroupColumnNamePreset(category); columnDisplayIds.push('connectedLayerGroupColumnName');

	// Column connect
	presets.connectLayerGroupColumnPreset = connectLayerGroupColumnPreset(category);            columnConnectIds.push('connectLayerGroupColumnPreset');
	presets.connectPreviousLayerGroupColumn = connectPreviousLayerGroupColumnPreset(category);  columnConnectIds.push('connectPreviousLayerGroupColumn');
	presets.connectNextLayerGroupColumn = connectNextLayerGroupColumnPreset(category);          columnConnectIds.push('connectNextLayerGroupColumn');

	// Column select
	presets.selectLayerGroupColumnPreset = selectLayerGroupColumnPreset(category);           columnSelectIds.push('selectLayerGroupColumnPreset');
	presets.selectPreviousLayerGroupColumn = selectPreviousLayerGroupColumnPreset(category); columnSelectIds.push('selectPreviousLayerGroupColumn');
	presets.selectNextLayerGroupColumn = selectNextLayerGroupColumnPreset(category);         columnSelectIds.push('selectNextLayerGroupColumn');

	const groups: PresetSubGroup[] = [];
	if (controlIds.length)       groups.push({id: 'lg_control',       type: 'simple', name: 'Control',         presets: controlIds});
	if (masterIds.length)        groups.push({id: 'lg_master',        type: 'simple', name: 'Master',          presets: masterIds});
	if (opacityIds.length)       groups.push({id: 'lg_opacity',       type: 'simple', name: 'Opacity',         presets: opacityIds});
	if (volumeIds.length)        groups.push({id: 'lg_volume',        type: 'simple', name: 'Volume',          presets: volumeIds});
	if (columnDisplayIds.length) groups.push({id: 'lg_col_displays',  type: 'simple', name: 'Column Displays', presets: columnDisplayIds});
	if (columnConnectIds.length) groups.push({id: 'lg_col_connect',   type: 'simple', name: 'Column Connect',  presets: columnConnectIds});
	if (columnSelectIds.length)  groups.push({id: 'lg_col_select',    type: 'simple', name: 'Column Select',   presets: columnSelectIds});

	return {
		section: {id: 'layerGroup', name: 'Layer Group', definitions: groups},
		presets,
	};
}
