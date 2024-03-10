import {CompanionAdvancedFeedbackResult, CompanionFeedbackInfo, combineRgb} from '@companion-module/base';
import {drawPercentage, drawVolume} from '../../image-utils';
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

	private layerGroupMasterSubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();
	private layerGroupVolumeSubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();
	private layerGroupOpacitySubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();

	// TODO: #46, resolume feature request private layerGroupSpeedSubscriptions:  Map<number, Set<string>> = new Map<number, Set<string>>();

	private selectedLayerGroupColumns: Map<number, number> = new Map<number, number>();
	private lastLayerGroupColumns: Map<number, number> = new Map<number, number>();

	private layerGroupVolumeIds: Set<number> = new Set<number>();
	private layerGroupOpacityIds: Set<number> = new Set<number>();

	constructor(resolumeArenaInstance: ResolumeArenaModuleInstance) {
		this.resolumeArenaInstance = resolumeArenaInstance;
		this.resolumeArenaInstance.log('debug', 'LayerGroupUtils constructor called');
	}

	messageUpdates(data: {path: any; value: boolean}, isComposition: boolean) {
		if (isComposition) {
			this.updateActiveLayerGroups();
			this.initConnectedFromComposition();
			this.updateLayerOpacities();
			this.updateLayerVolumes();
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
				this.resolumeArenaInstance.checkFeedbacks('layerGroupMaster');
			}
			// TODO: #46, resolume feature request if (!!data.path.match(/\/composition\/groups\/\d+\/speed/)) {
			// 	this.resolumeArenaInstance.checkFeedbacks('layerGroupSpeed');
			// }
			if (!!data.path.match(/\/composition\/groups\/\d+\/columns\/\d+\/connect/)) {
				if (data.value) {
					const matches = data.path.match(/\/composition\/groups\/(\d+)\/columns\/(\d+)\/connect/);
					this.selectedLayerGroupColumns.set(+matches[1], +matches[2]);
				}
				this.resolumeArenaInstance.checkFeedbacks('layerGroupColumnsSelected');
				this.resolumeArenaInstance.checkFeedbacks('layerGroupColumnName');
				this.resolumeArenaInstance.checkFeedbacks('selectedLayerGroupColumnName');
				this.resolumeArenaInstance.checkFeedbacks('nextLayerGroupColumnName');
				this.resolumeArenaInstance.checkFeedbacks('previousLayerGroupColumnName');
			}
			if (!!data.path.match(/\/composition\/layers\/\d+\/clips\/\d+\/connect/)) {
				this.updateActiveLayerGroups();
			}
		}
	}

	public getLayerGroupsFromCompositionState(): LayerGroup[] | undefined {
		return compositionState.get()?.layergroups;
	}

	public getLayerGroupFromCompositionState(layerGroup: number): LayerGroup | undefined {
		return compositionState.get()?.layergroups?.at(layerGroup-1);
	}

	initConnectedFromComposition() {
		const layerGroupsObject = this.getLayerGroupsFromCompositionState();
		if (layerGroupsObject) {
			for (const [layerGroupIndex, _layerGroupObject] of layerGroupsObject.entries()) {
				const layerGroup = layerGroupIndex + 1;
				const columns = compositionState.get()?.columns;
				if (columns) {
					this.selectedLayerGroupColumns.delete(layerGroup);
					for (const [columnIndex, columnObject] of columns.entries()) {
						const column = columnIndex + 1;
						this.resolumeArenaInstance
							.getWebsocketApi()
							?.unsubscribePath('/composition/layergroups/' + layerGroup + '/columns/' + column + '/connect');
						this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/layergroups/' + layerGroup + '/columns/' + column + '/name');

						this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layergroups/' + layerGroup + '/columns/' + column + '/connect');
						this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layergroups/' + layerGroup + '/columns/' + column + '/name');
						if (columnObject.connected?.value) {
							this.selectedLayerGroupColumns.set(layerGroup, column);
						}
						this.lastLayerGroupColumns.set(layerGroup, column);
					}
				}
			}
		}
		this.resolumeArenaInstance.checkFeedbacks('layerGroupColumnsSelected');
		this.resolumeArenaInstance.checkFeedbacks('layerGroupColumnName');
		this.resolumeArenaInstance.checkFeedbacks('selectedLayerGroupColumnName');
		this.resolumeArenaInstance.checkFeedbacks('nextLayerGroupColumnName');
		this.resolumeArenaInstance.checkFeedbacks('previousLayerGroupColumnName');
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

	updateLayerVolumes() {
		const layersObject = this.getLayerGroupsFromCompositionState();
		if (layersObject) {
			for (const layerGroupVolumeId of this.layerGroupVolumeIds) {
				this.layerGroupVolumeWebsocketUnsubscribe(layerGroupVolumeId);
			}
			for (const [layer, _subscriptionId] of this.layerGroupVolumeSubscriptions.entries()) {
				this.layerWebsocketFeedbackSubscribe(layer)
			}
			this.resolumeArenaInstance.checkFeedbacks('layerGroupVolume');
		}
	}

	updateLayerOpacities() {
		const layersObject = this.getLayerGroupsFromCompositionState();
		if (layersObject) {
			for (const layerGroupOpacityId of this.layerGroupOpacityIds) {
				this.layerGroupOpacityWebsocketUnsubscribe(layerGroupOpacityId);
			}
			for (const [layer, _subscriptionId] of this.layerGroupOpacitySubscriptions.entries()) {
				this.layerGroupOpacityWebsocketSubscribe(layer)
			}
			this.resolumeArenaInstance.checkFeedbacks('layerGroupOpacity');
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

	/////////////////////////////////////////////////
	// COLUMN NAME
	/////////////////////////////////////////////////

	layerGroupColumnNameFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		var column = feedback.options.column;
		var layerGroup = feedback.options.layerGroup as number;
		if (column !== undefined) {
			return {text: parameterStates.get()['/composition/groups/' + layerGroup + '/columns/' + column + '/name']?.value};
		}
		return {};
	}

	/////////////////////////////////////////////////
	// SELECTED COLUMN NAME
	/////////////////////////////////////////////////

	layerGroupColumnSelectedNameFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		var layerGroup = +feedback.options.layerGroup! as number;
			if (this.selectedLayerGroupColumns.get(layerGroup) !== undefined) {
				return {
					text: parameterStates.get()['/composition/groups/' + layerGroup + '/columns/' + this.selectedLayerGroupColumns.get(layerGroup) + '/name']
						?.value,
					bgcolor: combineRgb(0, 255, 0),
					color: combineRgb(0, 0, 0),
				};
			}
		return {};
	}

	/////////////////////////////////////////////////
	// NEXT COLUMN NAME
	/////////////////////////////////////////////////

	layerGroupColumnNextNameFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		var add = feedback.options.next as number;
		var layerGroup = +feedback.options.layerGroup! as number;
		if (this.selectedLayerGroupColumns.get(layerGroup) !== undefined && this.lastLayerGroupColumns.get(layerGroup) != undefined) {
			let column = this.calculateNextLayerGroupColumn(layerGroup, add);
			return {text: parameterStates.get()['/composition/groups/' + layerGroup + '/columns/' + column + '/name']?.value};
		}
		return {};
	}

	calculateNextLayerGroupColumn(layerGroup: number, add: number): number {
		let column = +this.selectedLayerGroupColumns.get(+layerGroup)!;
		const lastColumn = +this.lastLayerGroupColumns.get(+layerGroup)!;
		if (column + add > lastColumn) {
			column = +column + add - lastColumn;
		} else {
			column += add;
		}
		return column;
	}

	/////////////////////////////////////////////////
	// PREVIOUS COLUMN NAME
	/////////////////////////////////////////////////

	layerGroupColumnPreviousNameFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		var subtract = feedback.options.previous as number;
		var layerGroup = +feedback.options.layerGroup! as number;
		if (this.selectedLayerGroupColumns.get(layerGroup) !== undefined && this.lastLayerGroupColumns.get(layerGroup) != undefined) {
			let column = this.calculatePreviousLayerGroupColumn(layerGroup, subtract);
			return {text: parameterStates.get()['/composition/groups/' + layerGroup + '/columns/' + column + '/name']?.value};
		}
		return {};
	}

	calculatePreviousLayerGroupColumn(layerGroup: number, subtract: number): number {
		let column = +this.selectedLayerGroupColumns.get(+layerGroup)!;
		const lastColumn = +this.lastLayerGroupColumns.get(+layerGroup)!;
		if (column - subtract < 1) {
			column = +lastColumn + column - subtract;
		} else {
			column = column - subtract;
		}
		return column;
	}

	/////////////////////////////////////////////////
	// Master
	/////////////////////////////////////////////////

	layerGroupMasterFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		var layerGroup = feedback.options.layerGroup;
		const master = parameterStates.get()['/composition/groups/' + layerGroup + '/master']?.value;
		if (layerGroup !== undefined && master !== undefined) {
			return {
				text: Math.round(master * 100) + '%',
				show_topbar: false,
				png64: drawPercentage(master),
			};
		}
		return {text: '?'};
	}

	layerGroupMasterFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var layerGroup = feedback.options.layerGroup as number;
		if (layerGroup !== undefined) {
			if (!this.layerGroupMasterSubscriptions.get(layerGroup)) {
				this.layerGroupMasterSubscriptions.set(layerGroup, new Set());
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layergroups/' + layerGroup + '/master');
			}
			this.layerGroupMasterSubscriptions.get(layerGroup)?.add(feedback.id);
		}
	}

	layerGroupMasterFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layerGroup = feedback.options.layerGroup as number;
		const layerGroupMasterSubscription = this.layerGroupMasterSubscriptions.get(layerGroup);
		if (layerGroup !== undefined && layerGroupMasterSubscription) {
			layerGroupMasterSubscription.delete(feedback.id);
			if (layerGroupMasterSubscription.size === 0) {
				this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/layergroups/' + layerGroup + '/master');
				this.layerGroupMasterSubscriptions.delete(layerGroup);
			}
		}
	}


	/////////////////////////////////////////////////
	// Volume
	/////////////////////////////////////////////////

	layerGroupVolumeFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		var layer = feedback.options.layer as number;
		const volume = parameterStates.get()['/composition/layers/' + layer + '/audio/volume']?.value;
		if (volume !== undefined) {
			return {
				text: Math.round(volume * 100)/100+ 'db',
				show_topbar: false,
				png64: drawVolume(volume)
			};
		}
		return {text: '?'};
	}

	layerGroupVolumeFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		if (layer !== undefined) {
			if (!this.layerGroupVolumeSubscriptions.get(layer)) {
				this.layerGroupVolumeSubscriptions.set(layer, new Set());
			}
			this.layerGroupVolumeSubscriptions.get(layer)?.add(feedback.id);
		}
	}

	layerGroupVolumeFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		const layerGroupVolumeSubscription = this.layerGroupVolumeSubscriptions.get(layer);
		if (layer !== undefined && layerGroupVolumeSubscription) {
			layerGroupVolumeSubscription.delete(feedback.id);
			if (layerGroupVolumeSubscription.size === 0) {
				this.layerGroupVolumeSubscriptions.delete(layer);
			}
		}
	}

	layerWebsocketFeedbackSubscribe(layerGroup: number) {
		const layerGroupObject = this.getLayerGroupFromCompositionState(layerGroup);
		const layerGroupVolumeId = layerGroupObject?.audio?.volume?.id;
		if (layerGroupVolumeId) {
			this.layerGroupVolumeIds.add(layerGroupVolumeId);
			this.resolumeArenaInstance.getWebsocketApi()?.subscribeParam(layerGroupVolumeId!);
		}
	}

	layerGroupVolumeWebsocketUnsubscribe(layerGroupVolumeId: number) {
		this.resolumeArenaInstance.getWebsocketApi()?.unsubscribeParam(layerGroupVolumeId!);
	}


	/////////////////////////////////////////////////
	// Opacity
	/////////////////////////////////////////////////

	layerGroupOpacityFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		var layer = feedback.options.layer as number;
		const opacity = parameterStates.get()['/composition/layers/' + layer + '/video/opacity']?.value;
		if (opacity !== undefined) {
			return {
				text: Math.round(opacity * 100) + '%',
				show_topbar: false,
				png64: drawPercentage(opacity),
			};
		}
		return {text: '?'};
	}

	layerGroupOpacityFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		if (layer !== undefined) {
			if (!this.layerGroupOpacitySubscriptions.get(layer)) {
				this.layerGroupOpacitySubscriptions.set(layer, new Set());
			}
			this.layerGroupOpacitySubscriptions.get(layer)?.add(feedback.id);
		}
	}

	layerGroupOpacityFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		const layerGroupOpacitySubscription = this.layerGroupOpacitySubscriptions.get(layer);
		if (layer !== undefined && layerGroupOpacitySubscription) {
			layerGroupOpacitySubscription.delete(feedback.id);
			if (layerGroupOpacitySubscription.size === 0) {
				this.layerGroupOpacitySubscriptions.delete(layer);
			}
		}
	}


	layerGroupOpacityWebsocketSubscribe(layerGroup: number) {
		const layerGroupObject = this.getLayerGroupFromCompositionState(layerGroup);
		const layerGroupOpacityId = layerGroupObject?.video?.opacity?.id;
		if (layerGroupOpacityId) {
			this.layerGroupOpacityIds.add(layerGroupOpacityId);
			this.resolumeArenaInstance.getWebsocketApi()?.subscribeParam(layerGroupOpacityId!);
		}
	}

	layerGroupOpacityWebsocketUnsubscribe(layerGroupOpacityId: number) {
		this.resolumeArenaInstance.getWebsocketApi()?.unsubscribeParam(layerGroupOpacityId!);
	}

	/////////////////////////////////////////////////
	// Speed ----> TODO: #46, resolume feature request
	/////////////////////////////////////////////////

	// layerGroupSpeedFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
	// 	var layerGroup = feedback.options.layerGroup as number;
	// 	const speed = parameterStates.get()['/composition/groups/' + layerGroup + '/speed']?.value;
	// 	if (layerGroup !== undefined && speed!==undefined) {
	// 		return {
	// 			text: Math.round(speed * 100) + '%',
	// 			show_topbar: false,
	// 			png64: drawPercentage(speed),
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
