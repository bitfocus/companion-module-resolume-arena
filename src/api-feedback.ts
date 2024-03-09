import {CompanionFeedbackDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '.';
import {
	getColumnOption,
	getDeckOption,
	getDefaultStyleBlue,
	getDefaultStyleGreen,
	getDefaultStyleRed,
	getLayerGroupOption,
	getLayerOption
} from './defaults';

export function getApiFeedbacks(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinitions {
	return {
		tempo: {
			type: 'advanced',
			name: 'Tempo',
			options: [],
			callback: resolumeArenaInstance.getCompositionUtils()!.compositionTempoFeedbackCallback.bind(resolumeArenaInstance.getCompositionUtils()!)
		},
		connectedClip: {
			type: 'advanced',
			name: 'Connected Clip',
			options: [...getLayerOption(), ...getColumnOption()],
			callback: resolumeArenaInstance.getClipUtils()!.clipConnectedFeedbackCallback.bind(resolumeArenaInstance.getClipUtils()!)
		},
		selectedClip: {
			type: 'boolean',
			name: 'Selected Clip',
			options: [...getLayerOption(), ...getColumnOption()],
			defaultStyle: getDefaultStyleBlue(),
			callback: resolumeArenaInstance.getClipUtils()!.clipSelectedFeedbackCallback.bind(resolumeArenaInstance.getClipUtils()!)
		},
		clipInfo: {
			type: 'advanced',
			name: 'Clip Info',
			options: [
				...getLayerOption(),
				...getColumnOption(),
				{
					id: 'showThumb',
					type: 'checkbox',
					label: 'Show Thumbnail',
					default: false
				},
				{
					id: 'showName',
					type: 'checkbox',
					label: 'Show Name',
					default: true
				}
			],
			callback: resolumeArenaInstance.getClipUtils()!.clipDetailsFeedbackCallback.bind(resolumeArenaInstance.getClipUtils()!),
			subscribe: resolumeArenaInstance.getClipUtils()!.clipDetailsFeedbackSubscribe.bind(resolumeArenaInstance.getClipUtils()!),
			unsubscribe: resolumeArenaInstance.getClipUtils()!.clipDetailsFeedbackUnsubscribe.bind(resolumeArenaInstance.getClipUtils()!)
		},
		clipSpeed: {
			type: 'advanced',
			name: 'Clip Speed',
			options: [...getLayerOption(), ...getColumnOption()],
			callback: resolumeArenaInstance.getClipUtils()!.clipSpeedFeedbackCallback.bind(resolumeArenaInstance.getClipUtils()!),
			subscribe: resolumeArenaInstance.getClipUtils()!.clipSpeedFeedbackSubscribe.bind(resolumeArenaInstance.getClipUtils()!),
			unsubscribe: resolumeArenaInstance.getClipUtils()!.clipSpeedFeedbackUnsubscribe.bind(resolumeArenaInstance.getClipUtils()!)
		},
		clipTransportPosition: {
			type: 'advanced',
			name: 'Clip Transport Position',
			options: [...getLayerOption(), ...getColumnOption(),
				{
					id: 'view',
					type: 'dropdown',
					choices: [
						{
							id: 'timestamp',
							label: 'hh:mm:ss'
						},
						{
							id: 'timestampFrame',
							label: 'hh:mm:ss:ff - including frames'
						},
						{
							id: 'fullSeconds',
							label: '10000s'
						},
						{
							id: 'frames',
							label: 'ff - frames'
						},
						{
							id: 'seconds',
							label: 'ss - seconds'
						},
						{
							id: 'minutes',
							label: 'mm - minutes'
						},
						{
							id: 'hours',
							label: 'hh - hours'
						},
						{
							id: 'direction',
							label: '-/+ - timeRemaining or clipTime'
						}
					],
					default: 'timestamp',
					label: 'Visualisation'
				}, {
					id: 'timeRemaining',
					type: 'checkbox',
					default: false,
					label: 'Remaining Time'
				}],
			callback: resolumeArenaInstance.getClipUtils()!.clipTransportPositionFeedbackCallback.bind(resolumeArenaInstance.getClipUtils()!)
		},
		compositionOpacity: {
			type: 'advanced',
			name: 'Composition Opacity',
			options: [],
			callback: resolumeArenaInstance.getCompositionUtils()!.compositionOpacityFeedbackCallback.bind(resolumeArenaInstance.getCompositionUtils()!)
		},
		compositionVolume: {
			type: 'advanced',
			name: 'Composition Volume',
			options: [],
			callback: resolumeArenaInstance.getCompositionUtils()!.compositionVolumeFeedbackCallback.bind(resolumeArenaInstance.getCompositionUtils()!)
		},
		compositionMaster: {
			type: 'advanced',
			name: 'Composition Master',
			options: [],
			callback: resolumeArenaInstance.getCompositionUtils()!.compositionMasterFeedbackCallback.bind(resolumeArenaInstance.getCompositionUtils()!),
			subscribe: resolumeArenaInstance.getCompositionUtils()!.compositionMasterFeedbackSubscribe.bind(resolumeArenaInstance.getCompositionUtils()!),
			unsubscribe: resolumeArenaInstance.getCompositionUtils()!.compositionMasterFeedbackUnsubscribe.bind(resolumeArenaInstance.getCompositionUtils()!)
		},
		compositionSpeed: {
			type: 'advanced',
			name: 'Composition Speed',
			options: [],
			callback: resolumeArenaInstance.getCompositionUtils()!.compositionSpeedFeedbackCallback.bind(resolumeArenaInstance.getCompositionUtils()!),
			subscribe: resolumeArenaInstance.getCompositionUtils()!.compositionSpeedFeedbackSubscribe.bind(resolumeArenaInstance.getCompositionUtils()!),
			unsubscribe: resolumeArenaInstance.getCompositionUtils()!.compositionSpeedFeedbackUnsubscribe.bind(resolumeArenaInstance.getCompositionUtils()!)
		},
		layerBypassed: {
			type: 'boolean',
			name: 'Layer Bypassed',
			defaultStyle: getDefaultStyleRed(),
			options: [...getLayerOption()],
			callback: resolumeArenaInstance.getLayerUtils()!.layerBypassedFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!),
			subscribe: resolumeArenaInstance.getLayerUtils()!.layerBypassedFeedbackSubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
			unsubscribe: resolumeArenaInstance.getLayerUtils()!.layerBypassedFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerUtils()!)
		},
		layerSolo: {
			type: 'boolean',
			name: 'Layer Solo',
			defaultStyle: getDefaultStyleGreen(),
			options: [...getLayerOption()],
			callback: resolumeArenaInstance.getLayerUtils()!.layerSoloFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!),
			subscribe: resolumeArenaInstance.getLayerUtils()!.layerSoloFeedbackSubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
			unsubscribe: resolumeArenaInstance.getLayerUtils()!.layerSoloFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerUtils()!)
		},
		layerActive: {
			type: 'boolean',
			name: 'Layer Active',
			defaultStyle: getDefaultStyleBlue(),
			options: [...getLayerOption()],
			callback: resolumeArenaInstance.getLayerUtils()!.layerActiveFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!)
		},
		layerSelected: {
			type: 'boolean',
			name: 'Layer Selected',
			defaultStyle: getDefaultStyleGreen(),
			options: [...getLayerOption()],
			callback: resolumeArenaInstance.getLayerUtils()!.layerSelectedFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!),
			subscribe: resolumeArenaInstance.getLayerUtils()!.layerSelectedFeedbackSubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
			unsubscribe: resolumeArenaInstance.getLayerUtils()!.layerSelectedFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerUtils()!)
		},
		layerMaster: {
			type: 'advanced',
			name: 'Layer Master',
			options: [...getLayerOption()],
			callback: resolumeArenaInstance.getLayerUtils()!.layerMasterFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!),
			subscribe: resolumeArenaInstance.getLayerUtils()!.layerMasterFeedbackSubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
			unsubscribe: resolumeArenaInstance.getLayerUtils()!.layerMasterFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerUtils()!)
		},
		layerOpacity: {
			type: 'advanced',
			name: 'Layer Opacity',
			options: [...getLayerOption()],
			callback: resolumeArenaInstance.getLayerUtils()!.layerOpacityFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!),
			subscribe: resolumeArenaInstance.getLayerUtils()!.layerOpacityFeedbackSubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
			unsubscribe: resolumeArenaInstance.getLayerUtils()!.layerOpacityFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerUtils()!)
		},
		layerVolume: {
			type: 'advanced',
			name: 'Layer Volume',
			options: [...getLayerOption()],
			callback: resolumeArenaInstance.getLayerUtils()!.layerVolumeFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!),
			subscribe: resolumeArenaInstance.getLayerUtils()!.layerVolumeFeedbackSubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
			unsubscribe: resolumeArenaInstance.getLayerUtils()!.layerVolumeFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerUtils()!)
		},
		layerTransitionDuration: {
			type: 'advanced',
			name: 'Layer Transition Duration',
			options: [...getLayerOption()],
			callback: resolumeArenaInstance.getLayerUtils()!.layerTransitionDurationFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!)
		},
		layerTransportPosition: {
			type: 'advanced',
			name: 'Layer Active Clip Transport Position',
			options: [...getLayerOption(),
				{
					id: 'view',
					type: 'dropdown',
					choices: [
						{
							id: 'timestamp',
							label: 'hh:mm:ss'
						},
						{
							id: 'timestampFrame',
							label: 'hh:mm:ss:ff - including frames'
						},
						{
							id: 'fullSeconds',
							label: '10000s'
						},
						{
							id: 'frames',
							label: 'ff - frames'
						},
						{
							id: 'seconds',
							label: 'ss - seconds'
						},
						{
							id: 'minutes',
							label: 'mm - minutes'
						},
						{
							id: 'hours',
							label: 'hh - hours'
						},
						{
							id: 'direction',
							label: '-/+ - timeRemaining or clipTime'
						}
					],
					default: 'timestamp',
					label: 'Visualisation'
				}, {
					id: 'timeRemaining',
					type: 'checkbox',
					default: false,
					label: 'Remaining Time'
				}],
			callback: resolumeArenaInstance.getLayerUtils()!.layerTransportPositionFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!)
		},
		layerGroupBypassed: {
			type: 'boolean',
			name: 'Layer Group Bypassed',
			defaultStyle: getDefaultStyleRed(),
			options: [...getLayerGroupOption()],
			callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupBypassedFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!),
			subscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupBypassedFeedbackSubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
			unsubscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupBypassedFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!)
		},
		layerGroupSolo: {
			type: 'boolean',
			name: 'Layer Group Solo',
			defaultStyle: getDefaultStyleGreen(),
			options: [...getLayerGroupOption()],
			callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSoloFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!),
			subscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSoloFeedbackSubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
			unsubscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSoloFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!)
		},
		layerGroupActive: {
			type: 'boolean',
			name: 'Layer Group Active',
			defaultStyle: getDefaultStyleBlue(),
			options: [...getLayerGroupOption()],
			callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupActiveFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!)
		},
		layerGroupSelected: {
			type: 'boolean',
			name: 'Layer Group Selected',
			defaultStyle: getDefaultStyleGreen(),
			options: [...getLayerGroupOption()],
			callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSelectedFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!),
			subscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSelectedFeedbackSubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
			unsubscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSelectedFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!)
		},
		layerGroupOpacity: {
			type: 'advanced',
			name: 'Layer Group Opacity',
			options: [...getLayerGroupOption()],
			callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupOpacityFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!),
			subscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupOpacityFeedbackSubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
			unsubscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupOpacityFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!)
		},
		// TODO #46, resolume feature request
		// layerGroupSpeed: {
		// 	type: 'advanced',
		// 	name: 'Layer Group Speed',
		// 	options: [...getLayerGroupOption()],
		// 	callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSpeedFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!),
		// 	subscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSpeedFeedbackSubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
		// 	unsubscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSpeedFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
		// },
		columnSelected: {
			type: 'boolean',
			name: 'Column Selected',
			defaultStyle: getDefaultStyleGreen(),
			options: [...getColumnOption()],
			callback: resolumeArenaInstance.getColumnUtils()!.columnSelectedFeedbackCallback.bind(resolumeArenaInstance.getColumnUtils()!)
		},
		columnName: {
			type: 'advanced',
			name: 'Column Name',
			options: [...getColumnOption()],
			callback: resolumeArenaInstance.getColumnUtils()!.columnNameFeedbackCallback.bind(resolumeArenaInstance.getColumnUtils()!)
		},
		selectedColumnName: {
			type: 'advanced',
			name: 'Selected Column Name',
			options: [],
			callback: resolumeArenaInstance.getColumnUtils()!.columnSelectedNameFeedbackCallback.bind(resolumeArenaInstance.getColumnUtils()!)
		},
		nextColumnName: {
			type: 'advanced',
			name: 'Next Column Name',
			options: [{
				id: 'next',
				type: 'number',
				label: 'Next',
				default: 1,
				min: 1,
				max: 65535
			}],
			callback: resolumeArenaInstance.getColumnUtils()!.columnNextNameFeedbackCallback.bind(resolumeArenaInstance.getColumnUtils()!)
		},
		previousColumnName: {
			type: 'advanced',
			name: 'Previous Column Name',
			options: [{
				id: 'previous',
				type: 'number',
				label: 'Previous',
				default: 1,
				min: 1,
				max: 65535
			}],
			callback: resolumeArenaInstance.getColumnUtils()!.columnPreviousNameFeedbackCallback.bind(resolumeArenaInstance.getColumnUtils()!)
		},
		layerGroupColumnsSelected: {
			type: 'boolean',
			name: 'Layer Group Column Selected',
			defaultStyle: getDefaultStyleGreen(),
			options: [...getLayerGroupOption(), ...getColumnOption()],
			callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupColumnsSelectedFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!)
		},
		layerGroupColumnName: {
			type: 'advanced',
			name: 'Layer Group Column Name',
			options: [...getLayerGroupOption(), ...getColumnOption()],
			callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupColumnNameFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!)
		},
		selectedLayerGroupColumnName: {
			type: 'advanced',
			name: 'Selected Layer Group Column Name',
			options: [...getLayerGroupOption()],
			callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupColumnSelectedNameFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!)
		},
		nextLayerGroupColumnName: {
			type: 'advanced',
			name: 'Next Layer Group Column Name',
			options: [...getLayerGroupOption(), {
				id: 'next',
				type: 'number',
				label: 'Next',
				default: 1,
				min: 1,
				max: 65535
			}],
			callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupColumnNextNameFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!)
		},
		previousLayerGroupColumnName: {
			type: 'advanced',
			name: 'Previous Layer Group Column Name',
			options: [...getLayerGroupOption(), {
				id: 'previous',
				type: 'number',
				label: 'Previous',
				default: 1,
				min: 1,
				max: 65535
			}],
			callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupColumnPreviousNameFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!)
		},
		deckSelected: {
			type: 'boolean',
			name: 'Deck Selected',
			defaultStyle: getDefaultStyleGreen(),
			options: [...getDeckOption()],
			callback: resolumeArenaInstance.getDeckUtils()!.deckSelectedFeedbackCallback.bind(resolumeArenaInstance.getDeckUtils()!)
		},
		deckName: {
			type: 'advanced',
			name: 'Deck Name',
			options: [...getDeckOption()],
			callback: resolumeArenaInstance.getDeckUtils()!.deckNameFeedbackCallback.bind(resolumeArenaInstance.getDeckUtils()!)
		},
		selectedDeckName: {
			type: 'advanced',
			name: 'Selected Deck Name',
			options: [],
			callback: resolumeArenaInstance.getDeckUtils()!.deckSelectedNameFeedbackCallback.bind(resolumeArenaInstance.getDeckUtils()!)
		},
		nextDeckName: {
			type: 'advanced',
			name: 'Next Deck Name',
			options: [{
				id: 'next',
				type: 'number',
				label: 'Next',
				default: 1,
				min: 1,
				max: 65535
			}],
			callback: resolumeArenaInstance.getDeckUtils()!.deckNextNameFeedbackCallback.bind(resolumeArenaInstance.getDeckUtils()!)
		},
		previousDeckName: {
			type: 'advanced',
			name: 'Previous Deck Name',
			options: [{
				id: 'previous',
				type: 'number',
				label: 'Previous',
				default: 1,
				min: 1,
				max: 65535
			}],
			callback: resolumeArenaInstance.getDeckUtils()!.deckPreviousNameFeedbackCallback.bind(resolumeArenaInstance.getDeckUtils()!)
		}
	};
}
