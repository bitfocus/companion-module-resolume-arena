import type {
	CompanionPresetDefinitions,
	CompanionPresetGroupSimple,
	CompanionPresetSection,
	CompanionSimplePresetDefinition,
} from '@companion-module/base';
import type {ResolumeArenaTypes} from '../index.js';

/**
 * A simple preset together with the place it is listed under in the presets panel.
 * `category` is either a section name ('Layer') or 'Section / Group' ('OSC Transport / Layer 1').
 */
export type CategorizedPreset = CompanionSimplePresetDefinition<ResolumeArenaTypes> & {category: string};
export type CategorizedPresets = Record<string, CategorizedPreset>;

const GROUP_SEPARATOR = ' / ';

function slug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

/**
 * Module API 2.0 replaced the per-preset `category` with a separate structure of sections and groups.
 * This derives that structure from the categories, keeping sections, groups and presets in order of
 * first appearance, and returns the presets without their category.
 */
export function toPresetDefinitions(categorized: CategorizedPresets): {
	structure: CompanionPresetSection<ResolumeArenaTypes>[];
	presets: CompanionPresetDefinitions<ResolumeArenaTypes>;
} {
	const presets: CompanionPresetDefinitions<ResolumeArenaTypes> = {};
	// section name -> group name ('' when ungrouped) -> preset ids
	const sections = new Map<string, Map<string, string[]>>();

	for (const [id, {category, ...preset}] of Object.entries(categorized)) {
		presets[id] = preset;

		const separator = category.indexOf(GROUP_SEPARATOR);
		const sectionName = separator === -1 ? category : category.slice(0, separator);
		const groupName = separator === -1 ? '' : category.slice(separator + GROUP_SEPARATOR.length);

		let groups = sections.get(sectionName);
		if (!groups) {
			groups = new Map();
			sections.set(sectionName, groups);
		}
		const ids = groups.get(groupName);
		if (ids) {
			ids.push(id);
		} else {
			groups.set(groupName, [id]);
		}
	}

	const structure = [...sections].map(([name, groups]): CompanionPresetSection<ResolumeArenaTypes> => {
		const id = slug(name);
		const ungrouped = groups.get('');
		if (ungrouped && groups.size === 1) {
			return {id, name, definitions: ungrouped};
		}
		return {
			id,
			name,
			definitions: [...groups].map(
				([groupName, ids]): CompanionPresetGroupSimple => ({
					id: `${id}-${slug(groupName) || 'general'}`,
					type: 'simple',
					name: groupName,
					presets: ids,
				})
			),
		};
	});

	return {structure, presets};
}
