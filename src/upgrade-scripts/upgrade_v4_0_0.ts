import {
	combineRgb,
	CompanionMigrationOptionValues,
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionUpgradeContext
} from '@companion-module/base';
import {ResolumeArenaConfig} from '../config-fields.js';

const CONNECTED_CLIP_COLOR_OPTIONS = ['color_connected', 'color_connected_selected', 'color_connected_preview', 'color_preview'];

/** Reads the CSS colour notations the colour picker used to store: rgb(), rgba() and hex. */
function parseCssColor(color: string): number | undefined {
	const text = color.trim();

	const rgb = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(text);
	if (rgb) {
		return combineRgb(+rgb[1], +rgb[2], +rgb[3], rgb[4] === undefined ? undefined : +rgb[4]);
	}

	const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);
	if (hex) {
		const digits = hex[1].length === 3 ? [...hex[1]].map((digit) => digit + digit).join('') : hex[1];
		return parseInt(digits, 16);
	}

	if (text !== '' && !isNaN(Number(text))) {
		return Number(text);
	}
	return undefined;
}

/**
 * The Connected Clip colours are number colour pickers, but their defaults (and the Trigger Clip preset)
 * stored CSS strings such as 'rgb(0, 255, 0)'. Companion 5 validates option values and skips a feedback
 * with an invalid one, which removed the coloured border that marks the active clip.
 */
function fixConnectedClipColors(options: CompanionMigrationOptionValues): boolean {
	let changed = false;
	for (const key of CONNECTED_CLIP_COLOR_OPTIONS) {
		const option = options[key];
		if (!option || option.isExpression || typeof option.value !== 'string') continue;
		const color = parseCssColor(option.value);
		if (color === undefined) continue;
		options[key] = {isExpression: false, value: color};
		changed = true;
	}
	return changed;
}

/**
 * Restores plain option values that hold the text `parseVariables("...")`. That text is only meaningful
 * as an expression; as a plain value it never matches the number check of e.g. the layer and column
 * fields, so Companion 5 would skip the action or feedback.
 */
function unwrapParseVariablesText(options: CompanionMigrationOptionValues): boolean {
	let changed = false;
	for (const [key, option] of Object.entries(options)) {
		if (!option || option.isExpression || typeof option.value !== 'string') continue;
		const match = /^parseVariables\("((?:[^"\\]|\\.)*)"\)$/.exec(option.value.trim());
		if (!match) continue;
		options[key] = {isExpression: false, value: match[1].replace(/\\(["\\])/g, '$1')};
		changed = true;
	}
	return changed;
}

export function upgrade_v4_0_0(
	_context: CompanionUpgradeContext<ResolumeArenaConfig>,
	props: CompanionStaticUpgradeProps<ResolumeArenaConfig, undefined>
): CompanionStaticUpgradeResult<ResolumeArenaConfig, undefined> {
	const updatedActions = [];
	const updatedFeedbacks = [];

	for (const action of props.actions) {
		const unwrapped = unwrapParseVariablesText(action.options);
		// The Resync Tempo preset used an action id that never existed; the action is `resyncTap`
		const renamed = action.actionId === 'tempoResync';
		if (renamed) {
			action.actionId = 'resyncTap';
		}
		if (unwrapped || renamed) {
			updatedActions.push(action);
		}
	}

	for (const feedback of props.feedbacks) {
		const unwrapped = unwrapParseVariablesText(feedback.options);
		const recolored = feedback.feedbackId === 'connectedClip' && fixConnectedClipColors(feedback.options);
		if (unwrapped || recolored) {
			updatedFeedbacks.push(feedback);
		}
	}

	return {
		updatedConfig: null,
		updatedSecrets: null,
		updatedActions,
		updatedFeedbacks,
	};
}
