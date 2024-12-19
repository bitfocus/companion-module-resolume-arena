import {CompanionPresetDefinitions} from '@companion-module/base';
import {bypassLayerGroupPreset} from './presets/bypassLayerGroupPreset';
import {soloLayerGroupPreset} from './presets/soloLayerGroupPreset';
import {clearLayerGroupPreset} from './presets/clearLayerGroupPreset';
import {selectLayerGroupPreset} from './presets/selectLayerGroupPreset';
import {selectLayerGroupColumnPreset} from './presets/selectLayerGroupColumnPreset';
import {selectNextLayerGroupColumnPreset} from './presets/selectNextLayerGroupColumnPreset';
import {selectedLayerGroupColumnNamePreset} from './presets/selectedLayerGroupColumnNamePreset';
import {changeTemplateSet100} from '../template/changeLayerGroupMasterSet100';
import {changeTemplateSet0} from '../template/changeLayerGroupMasterSet0';
import {changeTemplateAdd10} from '../template/changeLayerGroupMasterAdd10';
import {changeTemplateSubtract10} from '../template/changeLayerGroupMasterSubtract10';
import {connectLayerGroupColumnPreset} from './presets/connectLayerGroupColumnPreset';
import {selectPreviousLayerGroupColumnPreset} from './presets/selectPreviousLayerGroupColumnPreset';
import {connectNextLayerGroupColumnPreset} from './presets/connectNextLayerGroupColumnPreset';
import {connectPreviousLayerGroupColumnPreset} from './presets/connectPreviousLayerGroupColumnPreset';
import {connectedLayerGroupColumnNamePreset} from './presets/coonnectedLayerGroupColumnNamePreset';

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
