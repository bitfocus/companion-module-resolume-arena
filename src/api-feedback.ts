import {CompanionFeedbackDefinitions} from "@companion-module/base";
import {ResolumeArenaModuleInstance} from ".";
import {getColumnOption, getDeckOption, getDefaultStyleBlue, getDefaultStyleGreen, getDefaultStyleRed, getLayerGroupOption, getLayerOption} from "./defaults";

export function getApiFeedbacks(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinitions {
    return {
        connectedClip: {
            type: 'advanced',
            name: 'Connected Clip',
            options: [...getLayerOption(), ...getColumnOption()],
            callback: resolumeArenaInstance.getClipUtils()!.clipConnectedFeedbackCallback.bind(resolumeArenaInstance.getClipUtils()!),
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
                    default: false,
                },
                {
                    id: 'showName',
                    type: 'checkbox',
                    label: 'Show Name',
                    default: true,
                },
                {
                    id: 'show_topbar',
                    type: 'checkbox',
                    label: 'Show Companion Topbar',
                    default: true,
                },
            ],
            callback: resolumeArenaInstance.getClipUtils()!.clipDetailsFeedbackCallback.bind(resolumeArenaInstance.getClipUtils()!),
            subscribe: resolumeArenaInstance.getClipUtils()!.clipDetailsFeedbackSubscribe.bind(resolumeArenaInstance.getClipUtils()!),
            unsubscribe: resolumeArenaInstance.getClipUtils()!.clipDetailsFeedbackUnsubscribe.bind(resolumeArenaInstance.getClipUtils()!),
        },
        clipSpeed: {
            type: 'advanced',
            name: 'Clip Speed',
            options: [...getLayerOption(), ...getColumnOption()],
            callback: resolumeArenaInstance.getClipUtils()!.clipSpeedFeedbackCallback.bind(resolumeArenaInstance.getClipUtils()!),
            subscribe: resolumeArenaInstance.getClipUtils()!.clipSpeedFeedbackSubscribe.bind(resolumeArenaInstance.getClipUtils()!),
            unsubscribe: resolumeArenaInstance.getClipUtils()!.clipSpeedFeedbackUnsubscribe.bind(resolumeArenaInstance.getClipUtils()!),
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
                        label: 'hh:mm:ss',
                    },
                    {
                        id: 'timestampFrame',
                        label: 'hh:mm:ss:ff - including frames',
                    },
                    {
                        id: 'fullSeconds',
                        label: '10000s',
                    },
                    {
                        id: 'frames',
                        label: 'ff - frames',
                    },
                    {
                        id: 'seconds',
                        label: 'ss - seconds',
                    },
                    {
                        id: 'minutes',
                        label: 'mm - minutes',
                    },
                    {
                        id: 'hours',
                        label: 'hh - hours',
                    },
                    {
                        id: 'direction',
                        label: '-/+ - timeRemaining or clipTime',
                    },
                ],
                default: 'timestamp',
                label: 'Visualisation',
            }, {
                id: 'timeRemaining',
                type: 'checkbox',
                default: false,
                label: 'Remaining Time',
            },],
            callback: resolumeArenaInstance.getClipUtils()!.clipTransportPositionFeedbackCallback.bind(resolumeArenaInstance.getClipUtils()!),
        },
        compositionOpacity: {
            type: 'advanced',
            name: 'Composition Opacity',
            options: [],
            callback: resolumeArenaInstance.getCompositionUtils()!.compositionOpacityFeedbackCallback.bind(resolumeArenaInstance.getCompositionUtils()!),
            subscribe: resolumeArenaInstance.getCompositionUtils()!.compositionOpacityFeedbackSubscribe.bind(resolumeArenaInstance.getCompositionUtils()!),
            unsubscribe: resolumeArenaInstance.getCompositionUtils()!.compositionOpacityFeedbackUnsubscribe.bind(resolumeArenaInstance.getCompositionUtils()!),
        },
        compositionSpeed: {
            type: 'advanced',
            name: 'Composition Speed',
            options: [],
            callback: resolumeArenaInstance.getCompositionUtils()!.compositionSpeedFeedbackCallback.bind(resolumeArenaInstance.getCompositionUtils()!),
            subscribe: resolumeArenaInstance.getCompositionUtils()!.compositionSpeedFeedbackSubscribe.bind(resolumeArenaInstance.getCompositionUtils()!),
            unsubscribe: resolumeArenaInstance.getCompositionUtils()!.compositionSpeedFeedbackUnsubscribe.bind(resolumeArenaInstance.getCompositionUtils()!),
        },
        layerBypassed: {
            type: 'boolean',
            name: 'Layer Bypassed',
            defaultStyle: getDefaultStyleRed(),
            options: [...getLayerOption()],
            callback: resolumeArenaInstance.getLayerUtils()!.layerBypassedFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!),
            subscribe: resolumeArenaInstance.getLayerUtils()!.layerBypassedFeedbackSubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
            unsubscribe: resolumeArenaInstance.getLayerUtils()!.layerBypassedFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
        },
        layerSolo: {
            type: 'boolean',
            name: 'Layer Solo',
            defaultStyle: getDefaultStyleGreen(),
            options: [...getLayerOption()],
            callback: resolumeArenaInstance.getLayerUtils()!.layerSoloFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!),
            subscribe: resolumeArenaInstance.getLayerUtils()!.layerSoloFeedbackSubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
            unsubscribe: resolumeArenaInstance.getLayerUtils()!.layerSoloFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
        },
        layerActive: {
            type: 'boolean',
            name: 'Layer Active',
            defaultStyle: getDefaultStyleBlue(),
            options: [...getLayerOption()],
            callback: resolumeArenaInstance.getLayerUtils()!.layerActiveFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!),
        },
        layerSelected: {
            type: 'boolean',
            name: 'Layer Selected',
            defaultStyle: getDefaultStyleGreen(),
            options: [...getLayerOption()],
            callback: resolumeArenaInstance.getLayerUtils()!.layerSelectedFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!),
            subscribe: resolumeArenaInstance.getLayerUtils()!.layerSelectedFeedbackSubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
            unsubscribe: resolumeArenaInstance.getLayerUtils()!.layerSelectedFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
        },
        layerOpacity: {
            type: 'advanced',
            name: 'Layer Opacity',
            options: [...getLayerOption()],
            callback: resolumeArenaInstance.getLayerUtils()!.layerOpacityFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!),
            subscribe: resolumeArenaInstance.getLayerUtils()!.layerOpacityFeedbackSubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
            unsubscribe: resolumeArenaInstance.getLayerUtils()!.layerOpacityFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
        },
        layerTransitionDuration: {
            type: 'advanced',
            name: 'Layer Transition Duration',
            options: [...getLayerOption()],
            callback: resolumeArenaInstance.getLayerUtils()!.layerTransitionDurationFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!),
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
                        label: 'hh:mm:ss',
                    },
                    {
                        id: 'timestampFrame',
                        label: 'hh:mm:ss:ff - including frames',
                    },
                    {
                        id: 'fullSeconds',
                        label: '10000s',
                    },
                    {
                        id: 'frames',
                        label: 'ff - frames',
                    },
                    {
                        id: 'seconds',
                        label: 'ss - seconds',
                    },
                    {
                        id: 'minutes',
                        label: 'mm - minutes',
                    },
                    {
                        id: 'hours',
                        label: 'hh - hours',
                    },
                    {
                        id: 'direction',
                        label: '-/+ - timeRemaining or clipTime',
                    },
                ],
                default: 'timestamp',
                label: 'Visualisation',
            }, {
                id: 'timeRemaining',
                type: 'checkbox',
                default: false,
                label: 'Remaining Time',
            },],
            callback: resolumeArenaInstance.getLayerUtils()!.layerTransportPositionFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!),
        },
        layerGroupBypassed: {
            type: 'boolean',
            name: 'Layer Group Bypassed',
            defaultStyle: getDefaultStyleRed(),
            options: [...getLayerGroupOption()],
            callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupBypassedFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!),
            subscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupBypassedFeedbackSubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
            unsubscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupBypassedFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
        },
        layerGroupSolo: {
            type: 'boolean',
            name: 'Layer Group Solo',
            defaultStyle: getDefaultStyleGreen(),
            options: [...getLayerGroupOption()],
            callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSoloFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!),
            subscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSoloFeedbackSubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
            unsubscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSoloFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
        },
        layerGroupActive: {
            type: 'boolean',
            name: 'Layer Group Active',
            defaultStyle: getDefaultStyleBlue(),
            options: [...getLayerGroupOption()],
            callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupActiveFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!),
        },
        layerGroupSelected: {
            type: 'boolean',
            name: 'Layer Group Selected',
            defaultStyle: getDefaultStyleGreen(),
            options: [...getLayerGroupOption()],
            callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSelectedFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!),
            subscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSelectedFeedbackSubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
            unsubscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSelectedFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
        },
        layerGroupOpacity: {
            type: 'advanced',
            name: 'Layer Group Opacity',
            options: [...getLayerGroupOption()],
            callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupOpacityFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!),
            subscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupOpacityFeedbackSubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
            unsubscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupOpacityFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
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
            callback: resolumeArenaInstance.getColumnUtils()!.columnSelectedFeedbackCallback.bind(resolumeArenaInstance.getColumnUtils()!),
            subscribe: resolumeArenaInstance.getColumnUtils()!.columnSelectedFeedbackSubscribe.bind(resolumeArenaInstance.getColumnUtils()!),
            unsubscribe: resolumeArenaInstance.getColumnUtils()!.columnSelectedFeedbackUnsubscribe.bind(resolumeArenaInstance.getColumnUtils()!),
        },
        layerGroupColumnsSelected: {
            type: 'boolean',
            name: 'Layer Group Column Selected',
            defaultStyle: getDefaultStyleGreen(),
            options: [...getLayerGroupOption(), ...getColumnOption()],
            callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupColumnsSelectedFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!),
            subscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupColumnsSelectedFeedbackSubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
            unsubscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupColumnsSelectedFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
        },
        deckSelected: {
            type: 'boolean',
            name: 'Deck Selected',
            defaultStyle: getDefaultStyleGreen(),
            options: [...getDeckOption()],
            callback: resolumeArenaInstance.getDeckUtils()!.deckSelectedFeedbackCallback.bind(resolumeArenaInstance.getDeckUtils()!),
        },
        deckName: {
            type: 'advanced',
            name: 'Deck Name',
            options: [...getDeckOption()],
            callback: resolumeArenaInstance.getDeckUtils()!.deckNameFeedbackCallback.bind(resolumeArenaInstance.getDeckUtils()!),
        },
        selectedDeckName: {
            type: 'advanced',
            name: 'Selected Deck Name',
            options: [],
            callback: resolumeArenaInstance.getDeckUtils()!.deckSelectedNameFeedbackCallback.bind(resolumeArenaInstance.getDeckUtils()!),
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
                max: 65535,
            },],
            callback: resolumeArenaInstance.getDeckUtils()!.deckNextNameFeedbackCallback.bind(resolumeArenaInstance.getDeckUtils()!),
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
                max: 65535,
            },],
            callback: resolumeArenaInstance.getDeckUtils()!.deckPreviousNameFeedbackCallback.bind(resolumeArenaInstance.getDeckUtils()!),
        },
    };
}
