import type {CompanionPresetDefinitions} from '@companion-module/base';

// Per-domain preset files return this bundle. The aggregator walks an array
// of bundles into the two-arg `setPresetDefinitions(structure, presets)` call.
// Sub-groups inside a section render in array order, so the order in which we
// push groups IS the order users see in the UI.
export interface PresetSubGroup {
	id: string;
	type: 'simple';
	name: string;
	presets: string[];
}

export interface PresetSection {
	id: string;
	name: string;
	definitions: PresetSubGroup[];
}

export interface DomainPresetBundle {
	section: PresetSection;
	presets: CompanionPresetDefinitions;
}
