import {CompanionAdvancedFeedbackResult, CompanionFeedbackInfo} from '@companion-module/base';
import {drawPercentage} from '../../defaults';
import {ResolumeArenaModuleInstance} from '../../index';
import {compositionState, parameterStates} from '../../state';
import {MessageSubscriber} from '../../websocket';
import {LayerGroup} from '../api';
import {LayerGroupColumnId} from './layer-group-column-id';

export class LayerGroupUtils implements MessageSubscriber {
	private resolumeArenaInstance: ResolumeArenaModuleInstance;
	private layerGroupBypassedSubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();

	private layerGroupSoloSubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();

	private activeLayerGroups: Set<number> = new Set<number>();

	private layerGroupSelectedSubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();

	private layerGroupOpacitySubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();

	// TODO: #46, resolume feature request private layerGroupSpeedSubscriptions:  Map<number, Set<string>> = new Map<number, Set<string>>();

	private layerGroupColumnsSelectedSubscriptions: Map<string, Set<string>> = new Map<string, Set<string>>();

	constructor(resolumeArenaInstance: ResolumeArenaModuleInstance) {
		this.resolumeArenaInstance = resolumeArenaInstance;
		this.resolumeArenaInstance.log('debug', 'LayerGroupUtils constructor called');
	}

	messageUpdates(data: {path: any}, isComposition: boolean) {
		if (isComposition) {
			this.updateActiveLayerGroups();
		}
		if (data.path) {
			if (!!data.path.match(/\/composition\/groups\/\d+\/bypassed/)) {
				this.resolumeArenaInstance.checkFeedbacks('layerGroupBypassed');
			}
			if (!!data.path.match(/\/composition\/groups\/\d+\/solo/)) {
				this.resolumeArenaInstance.checkFeedbacks('layerGroupSolo');
			}
			if (!!data.path.match(/\/composition\/groups\/\d+\/select/)) {
				this.resolumeArenaInstance.checkFeedbacks('layerGroupSelected');
			}
			if (!!data.path.match(/\/composition\/groups\/\d+\/master/)) {
				this.resolumeArenaInstance.checkFeedbacks('layerGroupOpacity');
			}
			// TODO: #46, resolume feature request if (!!data.path.match(/\/composition\/groups\/\d+\/speed/)) {
			// 	this.resolumeArenaInstance.checkFeedbacks('layerGroupSpeed');
			// }
			if (!!data.path.match(/\/composition\/groups\/\d+\/columns\/\d+\/connect/)) {
				this.resolumeArenaInstance.checkFeedbacks('layerGroupColumnsSelected');
			}
			if (!!data.path.match(/\/composition\/layers\/\d+\/clips\/\d+\/connect/)) {
				this.updateActiveLayerGroups();
			}
		}
	}

	public getLayerGroupsFromCompositionState(): LayerGroup[] | undefined {
		return compositionState.get()?.layergroups;
	}

	updateActiveLayerGroups() {
		const layerGroupsObject = this.getLayerGroupsFromCompositionState();
		if (layerGroupsObject) {
			for (const [layerGroupIndex, layerGroupObject] of layerGroupsObject.entries()) {
				const layerGroup = layerGroupIndex + 1;
				this.activeLayerGroups.delete(+layerGroup);
				const layersObject = layerGroupObject.layers;
				if (layersObject) {
					let layerInComposition;
					for (const [_layerIndex, layerObject] of layersObject.entries()) {
						const compositionLayersObject = compositionState.get()?.layers;
						if (compositionLayersObject) {
							for (const [compositionLayerIndex, compositionLayerObject] of compositionLayersObject.entries()) {
								const compositionLayer = compositionLayerIndex + 1;
								if (compositionLayerObject.id === layerObject.id) {
									layerInComposition = compositionLayer;
								}
							}
						}
						const clipsObject = layerObject.clips;
						if (clipsObject && layerInComposition) {
							for (const [columnIndex, _clipObject] of clipsObject.entries()) {
								const column = columnIndex + 1;
								const connectedState = parameterStates.get()['/composition/layers/' + layerInComposition + '/clips/' + column + '/connect']?.value;
								if (connectedState === 'Connected' || connectedState === 'Connected & previewing') {
									this.activeLayerGroups.add(+layerGroup);
								}
							}
						}
					}
				}
			}
			this.resolumeArenaInstance.checkFeedbacks('layerGroupActive');
		}
	}

	/////////////////////////////////////////////////
	// BYPASSED
	/////////////////////////////////////////////////

	layerGroupBypassedFeedbackCallback(feedback: CompanionFeedbackInfo): boolean {
		var layerGroup = feedback.options.layerGroup as number;
		if (layerGroup !== undefined) {
			return parameterStates.get()['/composition/groups/' + layerGroup + '/bypassed']?.value;
		}
		return false;
	}

	layerGroupBypassedFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var layerGroup = feedback.options.layerGroup as number;
		if (layerGroup !== undefined) {
			if (!this.layerGroupBypassedSubscriptions.get(layerGroup)) {
				this.layerGroupBypassedSubscriptions.set(layerGroup, new Set());
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layergroups/' + layerGroup + '/bypassed');
			}
			this.layerGroupBypassedSubscriptions.get(layerGroup)?.add(feedback.id);
		}
	}

	layerGroupBypassedFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layerGroup = feedback.options.layerGroup as number;
		const layerByPassedSubscription = this.layerGroupBypassedSubscriptions.get(layerGroup);
		if (layerGroup !== undefined && layerByPassedSubscription) {
			layerByPassedSubscription.delete(feedback.id);
			if (layerByPassedSubscription.size === 0) {
				this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/layergroups/' + layerGroup + '/bypassed');
				this.layerGroupBypassedSubscriptions.delete(layerGroup);
			}
		}
	}

	/////////////////////////////////////////////////
	// SOLO
	/////////////////////////////////////////////////

	layerGroupSoloFeedbackCallback(feedback: CompanionFeedbackInfo): boolean {
		var layerGroup = feedback.options.layerGroup as number;
		if (layerGroup !== undefined) {
			return parameterStates.get()['/composition/groups/' + layerGroup + '/solo']?.value;
		}
		return false;
	}

	layerGroupSoloFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var layerGroup = feedback.options.layerGroup as number;
		if (layerGroup !== undefined) {
			if (!this.layerGroupSoloSubscriptions.get(layerGroup)) {
				this.layerGroupSoloSubscriptions.set(layerGroup, new Set());
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layergroups/' + layerGroup + '/solo');
			}
			this.layerGroupSoloSubscriptions.get(layerGroup)?.add(feedback.id);
		}
	}

	layerGroupSoloFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layerGroup = feedback.options.layerGroup as number;
		const layerSoloSubscription = this.layerGroupSoloSubscriptions.get(layerGroup);
		if (layerGroup !== undefined && layerSoloSubscription) {
			layerSoloSubscription.delete(feedback.id);
			if (layerSoloSubscription.size === 0) {
				this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/layergroups/' + layerGroup + '/solo');
				this.layerGroupSoloSubscriptions.delete(layerGroup);
			}
		}
	}

	/////////////////////////////////////////////////
	// ACTIVE
	/////////////////////////////////////////////////

	layerGroupActiveFeedbackCallback(feedback: CompanionFeedbackInfo): boolean {
		var layerGroup = feedback.options.layerGroup as number;
		if (layerGroup !== undefined) {
			return this.activeLayerGroups.has(+layerGroup as number);
		}
		return false;
	}

	/////////////////////////////////////////////////
	// SELECTED
	/////////////////////////////////////////////////

	layerGroupSelectedFeedbackCallback(feedback: CompanionFeedbackInfo): boolean {
		var layerGroup = feedback.options.layerGroup as number;
		if (layerGroup !== undefined) {
			return parameterStates.get()['/composition/groups/' + layerGroup + '/select']?.value;
		}
		return false;
	}

	layerGroupSelectedFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var layerGroup = feedback.options.layerGroup as number;
		if (layerGroup !== undefined) {
			if (!this.layerGroupSelectedSubscriptions.get(layerGroup)) {
				this.layerGroupSelectedSubscriptions.set(layerGroup, new Set());
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layergroups/' + layerGroup + '/selected');
			}
			this.layerGroupSelectedSubscriptions.get(layerGroup)?.add(feedback.id);
		}
	}

	layerGroupSelectedFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layerGroup = feedback.options.layerGroup as number;
		const layerGroupSelectedSubscriptions = this.layerGroupSelectedSubscriptions.get(layerGroup);
		if (layerGroup !== undefined && layerGroupSelectedSubscriptions) {
			layerGroupSelectedSubscriptions.delete(feedback.id);
			if (layerGroupSelectedSubscriptions.size === 0) {
				this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/layergroups/' + layerGroup + '/selected');
				this.layerGroupSelectedSubscriptions.delete(layerGroup);
			}
		}
	}

	/////////////////////////////////////////////////
	// SELECTED COLUMN
	/////////////////////////////////////////////////

	layerGroupColumnsSelectedFeedbackCallback(feedback: CompanionFeedbackInfo): boolean {
		var layerGroup = feedback.options.layerGroup as number;
		var column = feedback.options.column as number;
		if (LayerGroupColumnId.isValid(layerGroup, column)) {
			return parameterStates.get()['/composition/groups/' + layerGroup + '/columns/' + column + '/connect']?.value;
		}
		return false;
	}

	layerGroupColumnsSelectedFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var layerGroup = feedback.options.layerGroup as number;
		var column = feedback.options.column as number;
		if (LayerGroupColumnId.isValid(layerGroup, column)) {
			const idString = new LayerGroupColumnId(layerGroup, column).getIdString();
			if (!this.layerGroupColumnsSelectedSubscriptions.get(idString)) {
				this.layerGroupColumnsSelectedSubscriptions.set(idString, new Set());
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layergroups/' + layerGroup + '/columns/' + column + '/connect');
			}
			this.layerGroupColumnsSelectedSubscriptions.get(idString)?.add(feedback.id);
		}
	}

	layerGroupColumnsSelectedFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layerGroup = feedback.options.layerGroup as number;
		var column = feedback.options.column as number;
		const layerGroupColumnsSelectedSubscriptions = this.layerGroupColumnsSelectedSubscriptions.get(
			new LayerGroupColumnId(layerGroup, column).getIdString()
		);
		if (LayerGroupColumnId.isValid(layerGroup, column) && layerGroupColumnsSelectedSubscriptions) {
			layerGroupColumnsSelectedSubscriptions.delete(feedback.id);
			if (layerGroupColumnsSelectedSubscriptions.size === 0) {
				this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/layergroups/' + layerGroup + '/columns/' + column + '/connect');
				this.layerGroupColumnsSelectedSubscriptions.delete(new LayerGroupColumnId(layerGroup, column).getIdString());
			}
		}
	}

	/////////////////////////////////////////////////
	// Opacity
	/////////////////////////////////////////////////

	layerGroupOpacityFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		var layerGroup = feedback.options.layerGroup;
		const opacity = parameterStates.get()['/composition/groups/' + layerGroup + '/master']?.value;
		if (layerGroup !== undefined && opacity !== undefined) {
			return {
				text: Math.round(opacity * 100) + '%',
				show_topbar: false,
				png64: drawPercentage(opacity),
			};
		}
		return {text: '?'};
	}

	layerGroupOpacityFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var layerGroup = feedback.options.layerGroup as number;
		if (layerGroup !== undefined) {
			if (!this.layerGroupOpacitySubscriptions.get(layerGroup)) {
				this.layerGroupOpacitySubscriptions.set(layerGroup, new Set());
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layergroups/' + layerGroup + '/master');
			}
			this.layerGroupOpacitySubscriptions.get(layerGroup)?.add(feedback.id);
		}
	}

	layerGroupOpacityFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layerGroup = feedback.options.layerGroup as number;
		const layerGroupOpacitySubscription = this.layerGroupOpacitySubscriptions.get(layerGroup);
		if (layerGroup !== undefined && layerGroupOpacitySubscription) {
			layerGroupOpacitySubscription.delete(feedback.id);
			if (layerGroupOpacitySubscription.size === 0) {
				this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/layergroups/' + layerGroup + '/master');
				this.layerGroupOpacitySubscriptions.delete(layerGroup);
			}
		}
	}

	/////////////////////////////////////////////////
	// Speed ----> TODO: #46, resolume feature request
	/////////////////////////////////////////////////

	// layerGroupSpeedFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
	// 	var layerGroup = feedback.options.layerGroup as number;
	// 	const opacity = parameterStates.get()['/composition/groups/' + layerGroup + '/speed']?.value;
	// 	if (layerGroup !== undefined && opacity!==undefined) {
	// 		return {
	// 			text: Math.round(opacity * 100) + '%',
	// 			show_topbar: false,
	// 			png64: drawPercentage(opacity),
	// 		};
	// 	}
	// 	return {text: '?'};
	// }

	// layerGroupSpeedFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
	// 	var layerGroup = feedback.options.layerGroup as number;
	// 	if (layerGroup !== undefined) {
	// 		if (!this.layerGroupSpeedSubscriptions.get(layerGroup)) {
	// 			this.layerGroupSpeedSubscriptions.set(layerGroup, new Set());
	// 			this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layergroups/' + layerGroup + '/speed');
	// 		}
	// 		this.layerGroupSpeedSubscriptions.get(layerGroup)?.add(feedback.id);
	// 	}
	// }

	// layerGroupSpeedFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
	// 	var layerGroup = feedback.options.layerGroup as number;
	// 	const layerGroupSpeedSubscription = this.layerGroupSpeedSubscriptions.get(layerGroup);
	// 	if (layerGroup !== undefined && layerGroupSpeedSubscription) {
	// 		layerGroupSpeedSubscription.delete(feedback.id);
	// 		if (layerGroupSpeedSubscription.size === 0) {
	// 			this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/layergroups/' + layerGroup + '/speed');
	// 			this.layerGroupSpeedSubscriptions.delete(layerGroup);
	// 		}
	// 	}
	// }
}
