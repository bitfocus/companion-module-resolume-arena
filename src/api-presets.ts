import {CompanionPresetDefinitions, combineRgb} from "@companion-module/base"
import {getDefaultLayerColumnOptions, getDefaultStyleGreen, getDefaultStyleRed, getDefaultStyleBlue, getDefaultDeckOptions} from "./defaults"

export function getApiPresets(): CompanionPresetDefinitions {return {
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
        category: 'Commands',
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
        name: 'Trigger Column',
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
                        options: {
                            column: '1',
                        },
                    },
                ],
                up: [],
            },
        ],
        feedbacks: [
            {
                feedbackId: 'columnSelected',
                options: {
                    column: '1',
                },
                style: getDefaultStyleGreen(),
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
                            column: '1',
                            layerGroup: '1',
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
        ],
    },
    selectDeck: {
        type: 'button',
        category: 'Deck',
        name: 'Select Deck',
        style: {
            size: '18',
            text: 'Select Deck',
            color: combineRgb(255, 255, 255),
            bgcolor: combineRgb(0, 0, 0),
        },
        steps: [
            {
                down: [
                    {
                        actionId: 'selectDeck',
                        options: getDefaultDeckOptions(),
                    },
                ],
                up: [],
            },
        ],
        feedbacks: [
            {
                feedbackId: 'deckName',
                options: getDefaultDeckOptions(),
            },
            {
                feedbackId: 'deckSelected',
                options: {...getDefaultDeckOptions()},
                style: getDefaultStyleGreen(),
            },
        ],
    },
}
}