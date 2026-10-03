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

export function getLayerGroupApiPresets(category: string): CompanionPresetDefinitions {
	return {
		bypassLayerGroup: bypassLayerGroupPreset(category),
		soloLayerGroup: soloLayerGroupPreset(category),
		clearLayerGroup: clearLayerGroupPreset(category),
		selectLayerGroup: selectLayerGroupPreset(category),
		selectLayerGroupColumnPreset: selectLayerGroupColumnPreset(category),
		connectLayerGroupColumnPreset: connectLayerGroupColumnPreset(category),
		selectNextLayerGroupColumn: selectNextLayerGroupColumnPreset(category),
		connectNextLayerGroupColumn: connectNextLayerGroupColumnPreset(category),
		selectPreviousLayerGroupColumn: selectPreviousLayerGroupColumnPreset(category),
		connectPreviousLayerGroupColumn: connectPreviousLayerGroupColumnPreset(category),
		selectedLayerGroupColumnName: selectedLayerGroupColumnNamePreset(category),
		connectedLayerGroupColumnName: connectedLayerGroupColumnNamePreset(category),
		changeLayerGroupMasterSet100: changeTemplateSet100(category,'layerGroup','Master'),
		changeLayerGroupMasterAdd10: changeTemplateAdd10(category,'layerGroup','Master'),
		changeLayerGroupMasterSubtract10: changeTemplateSubtract10(category,'layerGroup','Master'),
		changeLayerGroupMasterSet0: changeTemplateSet0(category,'layerGroup','Master'),
		changeLayerGroupOpacitySet100: changeTemplateSet100(category,'layerGroup','Opacity'),
		changeLayerGroupOpacityAdd10: changeTemplateAdd10(category,'layerGroup','Opacity'),
		changeLayerGroupOpacitySubtract10: changeTemplateSubtract10(category,'layerGroup','Opacity'),
		changeLayerGroupOpacitySet0: changeTemplateSet0(category,'layerGroup','Opacity'),
		changeLayerGroupVolumeSet100: changeTemplateSet100(category,'layerGroup','Volume', true),
		changeLayerGroupVolumeAdd10: changeTemplateAdd10(category,'layerGroup','Volume', true),
		changeLayerGroupVolumeSubtract10: changeTemplateSubtract10(category,'layerGroup','Volume', true),
		changeLayerGroupVolumeSet0: changeTemplateSet0(category,'layerGroup','Volume', true),
	};
}
