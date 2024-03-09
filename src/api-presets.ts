import {CompanionPresetDefinitions, combineRgb} from '@companion-module/base';
import {
	getDefaultLayerColumnOptions,
	getDefaultStyleGreen,
	getDefaultStyleRed,
	getDefaultStyleBlue,
	getDefaultDeckOptions,
	getDefaultColumnOptions,
} from './defaults';

export function getApiPresets(): CompanionPresetDefinitions {
	return {
		tapTempo: {
			type: 'button',
			category: 'Tempo',
			name: 'Tap Tempo',
			style: {
				size: '18',
				text: 'Tap Tempo',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'tempoTap',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'tempo',
					options: {},
				},
			],
		},
		resyncTempo: {
			type: 'button',
			category: 'Tempo',
			name: 'Resync Tempo',
			style: {
				size: '18',
				text: 'Resync Tempo',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'tempoResync',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},
		triggerClip: {
			type: 'button',
			category: 'Clip',
			name: 'Trigger Clip',
			style: {
				size: '18',
				text: 'Play Clip',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'triggerClip',
							options: getDefaultLayerColumnOptions(),
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'connectedClip',
					options: getDefaultLayerColumnOptions(),
					style: getDefaultStyleGreen(),
				},
				{
					feedbackId: 'clipInfo',
					options: {...getDefaultLayerColumnOptions(), showThumb: true, showName: true},
				},
			],
		},
		selectClip: {
			type: 'button',
			category: 'Clip',
			name: 'Select Clip',
			style: {
				size: '18',
				text: 'Select Clip',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'selectClip',
							options: getDefaultLayerColumnOptions(),
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'selectedClip',
					options: getDefaultLayerColumnOptions(),
					style: getDefaultStyleBlue(),
				},
				{
					feedbackId: 'clipInfo',
					options: {...getDefaultLayerColumnOptions(), showThumb: true, showName: true},
				},
			],
		},
		bypassLayer: {
			type: 'button',
			category: 'Layer',
			name: 'Bypass Layer',
			style: {
				size: '14',
				text: 'Bypass Layer',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'bypassLayer',
							options: {
								layer: '1',
								bypass: 'toggle',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'layerBypassed',
					options: {
						layer: '1',
					},
					style: getDefaultStyleRed(),
				},
			],
		},
		soloLayer: {
			type: 'button',
			category: 'Layer',
			name: 'Solo Layer',
			style: {
				size: '14',
				text: 'Solo Layer',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'soloLayer',
							options: {
								layer: '1',
								solo: 'toggle',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'layerSolo',
					options: {
						layer: '1',
					},
					style: getDefaultStyleGreen(),
				},
			],
		},
		clearLayer: {
			type: 'button',
			category: 'Layer',
			name: 'Clear Layer',
			style: {
				size: '14',
				text: 'Clear Layer',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'clearLayer',
							options: {
								layer: '1',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'layerActive',
					options: {
						layer: '1',
					},
					style: getDefaultStyleBlue(),
				},
			],
		},
		selectLayer: {
			type: 'button',
			category: 'Layer',
			name: 'Select Layer',
			style: {
				size: '14',
				text: 'Select Layer',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'selectLayer',
							options: {
								layer: '1',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'layerSelected',
					options: {
						layer: '1',
					},
					style: getDefaultStyleGreen(),
				},
			],
		},
		bypassLayerGroup: {
			type: 'button',
			category: 'Layer Group',
			name: 'Bypass Layer Group',
			style: {
				size: '14',
				text: 'Bypass Layer Group',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'bypassLayerGroup',
							options: {
								layerGroup: '1',
								bypass: 'toggle',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'layerGroupBypassed',
					options: {
						layerGroup: '1',
					},
					style: getDefaultStyleRed(),
				},
			],
		},
		soloLayerGroup: {
			type: 'button',
			category: 'Layer Group',
			name: 'Solo Layer Group',
			style: {
				size: '14',
				text: 'Solo Layer Group',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'soloLayerGroup',
							options: {
								layerGroup: '1',
								solo: 'toggle',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'layerGroupSolo',
					options: {
						layerGroup: '1',
					},
					style: getDefaultStyleGreen(),
				},
			],
		},
		clearLayerGroup: {
			type: 'button',
			category: 'Layer Group',
			name: 'Clear Layer Group',
			style: {
				size: '14',
				text: 'Clear Layer Group',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'clearLayerGroup',
							options: {
								layerGroup: '1',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'layerGroupActive',
					options: {
						layerGroup: '1',
					},
					style: getDefaultStyleBlue(),
				},
			],
		},
		selectLayerGroup: {
			type: 'button',
			category: 'Layer Group',
			name: 'Select Layer Group',
			style: {
				size: '14',
				text: 'Select Layer Group',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'selectLayerGroup',
							options: {
								layerGroup: '1',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'layerGroupSelected',
					options: {
						layerGroup: '1',
					},
					style: getDefaultStyleGreen(),
				},
			],
		},
		triggerColumn: {
			type: 'button',
			category: 'Column',
			name: 'Trigger Column By Index',
			style: {
				size: '14',
				text: 'Trigger Column',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'triggerColumn',
							options: {action: 'set', value: 1},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'columnName',
					options: {...getDefaultColumnOptions()},
				},
				{
					feedbackId: 'columnSelected',
					options: {...getDefaultColumnOptions()},
					style: getDefaultStyleGreen(),
				},
			],
		},
		triggerNextColumn: {
			type: 'button',
			category: 'Column',
			name: 'Trigger Next Column',
			style: {
				size: '14',
				text: 'Trigger Next Column',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'triggerColumn',
							options: {
								action: 'add',
								value: 1,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'nextColumnName',
					options: {
						next: 1,
					},
				},
			],
		},
		triggerPreviousColumn: {
			type: 'button',
			category: 'Column',
			name: 'Trigger Previous Column',
			style: {
				size: '14',
				text: 'Trigger Previous Column',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'triggerColumn',
							options: {
								action: 'subtract',
								value: 1,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'previousColumnName',
					options: {
						previous: 1,
					},
				},
			],
		},
		selectedColumnName: {
			type: 'button',
			category: 'Column',
			name: 'Selected Column Name',
			style: {
				size: '14',
				text: 'Selected Column Name',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [],
			feedbacks: [
				{
					feedbackId: 'selectedColumnName',
					options: {},
				},
			],
		},
		triggerLayerGroupColumn: {
			type: 'button',
			category: 'Layer Group',
			name: 'Trigger Layer Group Column',
			style: {
				size: '14',
				text: 'Trigger Layer Group Column',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'triggerLayerGroupColumn',
							options: {
								layerGroup: '1',
								action: 'set',
								value: 1,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'layerGroupColumnsSelected',
					options: {
						column: '1',
						layerGroup: '1',
					},
					style: getDefaultStyleGreen(),
				},
				{
					feedbackId: 'layerGroupColumnName',
					options: {
						layerGroup: '1',
						column: '1',
					},
				},
				
			],
		},
		triggerNextLayerGroupColumn: {
			type: 'button',
			category: 'Layer Group',
			name: 'Trigger Next Layer Group Column',
			style: {
				size: '14',
				text: 'Trigger Next Layer Group Column',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'triggerLayerGroupColumn',
							options: {
								layerGroup: '1',
								action: 'add',
								value: 1,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'nextLayerGroupColumnName',
					options: {
						layerGroup: '1',
						next: 1,
					},
				},
			],
		},
		triggerPreviousLayerGroupColumn: {
			type: 'button',
			category: 'Layer Group',
			name: 'Trigger Previous Layer Group Column',
			style: {
				size: '14',
				text: 'Trigger Previous Layer Group Column',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'triggerLayerGroupColumn',
							options: {
								layerGroup: '1',
								action: 'subtract',
								value: 1,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'previousLayerGroupColumnName',
					options: {
						layerGroup: '1',
						previous: 1,
					},
				},
			],
		},
		selectedLayerGroupColumnName: {
			type: 'button',
			category: 'Layer Group',
			name: 'Selected Layer Group Column Name',
			style: {
				size: '14',
				text: 'Selected Layer Group Column Name',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [],
			feedbacks: [
				{
					feedbackId: 'selectedLayerGroupColumnName',
					options: {
						layerGroup: '1'
					},
				},
			],
		},
		selectDeck: {
			type: 'button',
			category: 'Deck',
			name: 'Select Deck By Index',
			style: {
				size: '14',
				text: 'Select Deck',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'selectDeck',
							options: {action: 'set', value: 1},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'deckName',
					options: {...getDefaultDeckOptions()},
				},
				{
					feedbackId: 'deckSelected',
					options: {...getDefaultDeckOptions()},
					style: getDefaultStyleGreen(),
				},
			],
		},
		selectNextDeck: {
			type: 'button',
			category: 'Deck',
			name: 'Select Next Deck',
			style: {
				size: '14',
				text: 'Select Next Deck',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'selectDeck',
							options: {
								action: 'add',
								value: 1,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'nextDeckName',
					options: {
						next: 1,
					},
				},
			],
		},
		selectPreviousDeck: {
			type: 'button',
			category: 'Deck',
			name: 'Select Previous Deck',
			style: {
				size: '14',
				text: 'Select Previous Deck',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'selectDeck',
							options: {
								action: 'subtract',
								value: 1,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'previousDeckName',
					options: {
						previous: 1,
					},
				},
			],
		},
		selectedDeckName: {
			type: 'button',
			category: 'Deck',
			name: 'Selected Deck Name',
			style: {
				size: '14',
				text: 'Selected Deck Name',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [],
			feedbacks: [
				{
					feedbackId: 'selectedDeckName',
					options: {},
				},
			],
		},
	};
}
