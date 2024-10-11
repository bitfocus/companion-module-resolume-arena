import {CompanionAdvancedFeedbackResult, CompanionFeedbackInfo, combineRgb} from '@companion-module/base';
import {drawPercentage, drawVolume} from '../../image-utils';
import {ResolumeArenaModuleInstance} from '../../index';
import {compositionState, parameterStates} from '../../state';
import {MessageSubscriber} from '../../websocket';
import {LayerGroup} from '../api';
import {LayerGroupColumnId} from './layer-group-column-id';
import {CompanionCommonCallbackContext} from '@companion-module/base/dist/module-api/common';

export class LayerGroupUtils implements MessageSubscriber {
	private resolumeArenaInstance: ResolumeArenaModuleInstance;
	private layerGroupBypassedSubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();

	private layerGroupSoloSubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();

	private activeLayerGroups: Set<number> = new Set<number>();

	private layerGroupSelectedSubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();

	private layerGroupMasterSubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();
	private layerGroupVolumeSubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();
	private layerGroupOpacitySubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();

	private layerGroupSpeedSubscriptions:  Map<number, Set<string>> = new Map<number, Set<string>>();

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
			this.updateLayerGroupOpacities();
			this.updateLayerGroupVolumes();
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
			if (!!data.path.match(/\/composition\/groups\/\d+\/video\/opacity/)) {
				this.resolumeArenaInstance.checkFeedbacks('layerGroupOpacity');
			}
			if (!!data.path.match(/\/composition\/groups\/\d+\/audio\/volume/)) {
				this.resolumeArenaInstance.checkFeedbacks('layerGroupVolume');
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
		return this.getLayerGroupsFromCompositionState()?.at(layerGroup-1);
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

	updateLayerGroupVolumes() {
		const layerGroupsObject = this.getLayerGroupsFromCompositionState();
		if (layerGroupsObject) {
			for (const layerGroupVolumeId of this.layerGroupVolumeIds) {
				this.layerGroupVolumeWebsocketUnsubscribe(layerGroupVolumeId);
			}
			for (const [layerGroup, _subscriptionId] of this.layerGroupVolumeSubscriptions.entries()) {
				this.layerWebsocketFeedbackSubscribe(layerGroup);
			}
			this.resolumeArenaInstance.checkFeedbacks('layerGroupVolume');
		}
	}

	updateLayerGroupOpacities() {
		const layerGroupsObject = this.getLayerGroupsFromCompositionState();
		if (layerGroupsObject) {
			for (const layerGroupOpacityId of this.layerGroupOpacityIds) {
				this.layerGroupOpacityWebsocketUnsubscribe(layerGroupOpacityId);
			}
			for (const [layerGroup, _subscriptionId] of this.layerGroupOpacitySubscriptions.entries()) {
				this.layerGroupOpacityWebsocketSubscribe(layerGroup);
			}
			this.resolumeArenaInstance.checkFeedbacks('layerGroupOpacity');
		}
	}

	/////////////////////////////////////////////////
	// BYPASSED
	/////////////////////////////////////////////////

	async layerGroupBypassedFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<boolean> {
		const layerGroup = +await context.parseVariablesInString(feedback.options.layerGroup as string);
		if (layerGroup !== undefined) {
			return parameterStates.get()['/composition/groups/' + layerGroup + '/bypassed']?.value;
		}
		return false;
	}

	async layerGroupBypassedFeedbackSubscribe(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext) {
		const layerGroup = +await context.parseVariablesInString(feedback.options.layerGroup as string);
		if (layerGroup !== undefined) {
			if (!this.layerGroupBypassedSubscriptions.get(layerGroup)) {
				this.layerGroupBypassedSubscriptions.set(layerGroup, new Set());
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layergroups/' + layerGroup + '/bypassed');
			}
			this.layerGroupBypassedSubscriptions.get(layerGroup)?.add(feedback.id);
		}
	}

	async layerGroupBypassedFeedbackUnsubscribe(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext) {
		const layerGroup = +await context.parseVariablesInString(feedback.options.layerGroup as string);
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

	async layerGroupSoloFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<boolean> {
		const layerGroup = +await context.parseVariablesInString(feedback.options.layerGroup as string);
		if (layerGroup !== undefined) {
			return parameterStates.get()['/composition/groups/' + layerGroup + '/solo']?.value;
		}
		return false;
	}

	async layerGroupSoloFeedbackSubscribe(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext) {
		const layerGroup = +await context.parseVariablesInString(feedback.options.layerGroup as string);
		if (layerGroup !== undefined) {
			if (!this.layerGroupSoloSubscriptions.get(layerGroup)) {
				this.layerGroupSoloSubscriptions.set(layerGroup, new Set());
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layergroups/' + layerGroup + '/solo');
			}
			this.layerGroupSoloSubscriptions.get(layerGroup)?.add(feedback.id);
		}
	}

	async layerGroupSoloFeedbackUnsubscribe(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext) {
		const layerGroup = +await context.parseVariablesInString(feedback.options.layerGroup as string);
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

	async layerGroupActiveFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<boolean> {
		const layerGroup = +await context.parseVariablesInString(feedback.options.layerGroup as string);
		if (layerGroup !== undefined) {
			return this.activeLayerGroups.has(+layerGroup as number);
		}
		return false;
	}

	/////////////////////////////////////////////////
	// SELECTED
	/////////////////////////////////////////////////

	async layerGroupSelectedFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<boolean> {
		const layerGroup = +await context.parseVariablesInString(feedback.options.layerGroup as string);
		if (layerGroup !== undefined) {
			return parameterStates.get()['/composition/groups/' + layerGroup + '/select']?.value;
		}
		return false;
	}

	async layerGroupSelectedFeedbackSubscribe(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext) {
		const layerGroup = +await context.parseVariablesInString(feedback.options.layerGroup as string);
		if (layerGroup !== undefined) {
			if (!this.layerGroupSelectedSubscriptions.get(layerGroup)) {
				this.layerGroupSelectedSubscriptions.set(layerGroup, new Set());
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layergroups/' + layerGroup + '/selected');
			}
			this.layerGroupSelectedSubscriptions.get(layerGroup)?.add(feedback.id);
		}
	}

	async layerGroupSelectedFeedbackUnsubscribe(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext) {
		const layerGroup = +await context.parseVariablesInString(feedback.options.layerGroup as string);
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

	async layerGroupColumnsSelectedFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<boolean> {
		const layerGroup = +await context.parseVariablesInString(feedback.options.layerGroup as string);
		const column = +await context.parseVariablesInString(feedback.options.column as string);
		if (LayerGroupColumnId.isValid(layerGroup, column)) {
			return parameterStates.get()['/composition/groups/' + layerGroup + '/columns/' + column + '/connect']?.value;
		}
		return false;
	}

	/////////////////////////////////////////////////
	// COLUMN NAME
	/////////////////////////////////////////////////

	async layerGroupColumnNameFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<CompanionAdvancedFeedbackResult> {
		const column = +await context.parseVariablesInString(feedback.options.column as string);
		const layerGroup = +await context.parseVariablesInString(feedback.options.layerGroup as string);
		if (column !== undefined) {
			return {text: parameterStates.get()['/composition/groups/' + layerGroup + '/columns/' + column + '/name']?.value};
		}
		return {};
	}

	/////////////////////////////////////////////////
	// SELECTED COLUMN NAME
	/////////////////////////////////////////////////

	async layerGroupColumnSelectedNameFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<CompanionAdvancedFeedbackResult> {
		const layerGroup = +await context.parseVariablesInString(feedback.options.layerGroup as string);
		if (this.selectedLayerGroupColumns.get(layerGroup) !== undefined) {
			return {
				text: parameterStates.get()['/composition/groups/' + layerGroup + '/columns/' + this.selectedLayerGroupColumns.get(layerGroup) + '/name']
					?.value,
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(0, 0, 0)
			};
		}
		return {};
	}

	/////////////////////////////////////////////////
	// NEXT COLUMN NAME
	/////////////////////////////////////////////////

	async layerGroupColumnNextNameFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<CompanionAdvancedFeedbackResult> {
		const add = feedback.options.next as number;
		const layerGroup = +await context.parseVariablesInString(feedback.options.layerGroup as string);
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

	async layerGroupColumnPreviousNameFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<CompanionAdvancedFeedbackResult> {
		const subtract = feedback.options.previous as number;
		const layerGroup = +await context.parseVariablesInString(feedback.options.layerGroup as string);
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

	async layerGroupMasterFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<CompanionAdvancedFeedbackResult> {
		const layerGroup = +await context.parseVariablesInString(feedback.options.layerGroup as string);
		const master = parameterStates.get()['/composition/groups/' + layerGroup + '/master']?.value;
		if (layerGroup !== undefined && master !== undefined) {
			return {
				text: Math.round(master * 100) + '%',
				show_topbar: false,
				imageBuffer: drawPercentage(master)
			};
		}
		return {text: '?'};
	}

	async layerGroupMasterFeedbackSubscribe(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext) {
		const layerGroup = +await context.parseVariablesInString(feedback.options.layerGroup as string);
		if (layerGroup !== undefined) {
			if (!this.layerGroupMasterSubscriptions.get(layerGroup)) {
				this.layerGroupMasterSubscriptions.set(layerGroup, new Set());
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layergroups/' + layerGroup + '/master');
			}
			this.layerGroupMasterSubscriptions.get(layerGroup)?.add(feedback.id);
		}
	}

	async layerGroupMasterFeedbackUnsubscribe(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext) {
		const layerGroup = +await context.parseVariablesInString(feedback.options.layerGroup as string);
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

	async layerGroupVolumeFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<CompanionAdvancedFeedbackResult> {
		const layerGroup = +await context.parseVariablesInString(feedback.options.layerGroup as string);
		const volume = parameterStates.get()['/composition/groups/' + layerGroup + '/audio/volume']?.value;
		if (volume !== undefined) {
			return {
				text: Math.round(volume * 100) / 100 + 'db',
				show_topbar: false,
				imageBuffer: drawVolume(volume)
			};
		}
		return {text: '?'};
	}

	async layerGroupVolumeFeedbackSubscribe(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext) {
		const layerGroup = +await context.parseVariablesInString(feedback.options.layerGroup as string);
		if (layerGroup !== undefined) {
			if (!this.layerGroupVolumeSubscriptions.get(layerGroup)) {
				this.layerGroupVolumeSubscriptions.set(layerGroup, new Set());
			}
			this.layerGroupVolumeSubscriptions.get(layerGroup)?.add(feedback.id);
		}
	}

	async layerGroupVolumeFeedbackUnsubscribe(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext) {
		const layer = +await context.parseVariablesInString(feedback.options.layer as string);
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

	async layerGroupOpacityFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<CompanionAdvancedFeedbackResult> {
		const layerGroup = +await context.parseVariablesInString(feedback.options.layerGroup as string);
		const opacity = parameterStates.get()['/composition/groups/' + layerGroup + '/video/opacity']?.value;
		if (opacity !== undefined) {
			return {
				text: Math.round(opacity * 100) + '%',
				show_topbar: false,
				imageBuffer: drawPercentage(opacity)
			};
		}
		return {text: '?'};
	}

	async layerGroupOpacityFeedbackSubscribe(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext) {
		const layerGroup = +await context.parseVariablesInString(feedback.options.layerGroup as string);
		if (layerGroup !== undefined) {
			if (!this.layerGroupOpacitySubscriptions.get(layerGroup)) {
				this.layerGroupOpacitySubscriptions.set(layerGroup, new Set());
			}
			this.layerGroupOpacitySubscriptions.get(layerGroup)?.add(feedback.id);
		}
	}

	layerGroupOpacityFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		const layerGroup = feedback.options.layer as number;
		const layerGroupOpacitySubscription = this.layerGroupOpacitySubscriptions.get(layerGroup);
		if (layerGroup !== undefined && layerGroupOpacitySubscription) {
			layerGroupOpacitySubscription.delete(feedback.id);
			if (layerGroupOpacitySubscription.size === 0) {
				this.layerGroupOpacitySubscriptions.delete(layerGroup);
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
	// Speed
	/////////////////////////////////////////////////

	async layerGroupSpeedFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<CompanionAdvancedFeedbackResult> {
		const layerGroup = +await context.parseVariablesInString(feedback.options.layerGroup as string);
		const speed = parameterStates.get()['/composition/groups/' + layerGroup + '/speed']?.value;
		if (layerGroup !== undefined && speed!==undefined) {
			return {
				text: Math.round(speed * 100) + '%',
				show_topbar: false,
				imageBuffer: drawPercentage(speed),
			};
		}
		return {text: '?'};
	}

	async layerGroupSpeedFeedbackSubscribe(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext) {
		const layerGroup = +await context.parseVariablesInString(feedback.options.layerGroup as string);
		if (layerGroup !== undefined) {
			if (!this.layerGroupSpeedSubscriptions.get(layerGroup)) {
				this.layerGroupSpeedSubscriptions.set(layerGroup, new Set());
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layergroups/' + layerGroup + '/speed');
			}
			this.layerGroupSpeedSubscriptions.get(layerGroup)?.add(feedback.id);
		}
	}

	async layerGroupSpeedFeedbackUnsubscribe(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext) {
		const layerGroup = +await context.parseVariablesInString(feedback.options.layerGroup as string);
		const layerGroupSpeedSubscription = this.layerGroupSpeedSubscriptions.get(layerGroup);
		if (layerGroup !== undefined && layerGroupSpeedSubscription) {
			layerGroupSpeedSubscription.delete(feedback.id);
			if (layerGroupSpeedSubscription.size === 0) {
				this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/layergroups/' + layerGroup + '/speed');
				this.layerGroupSpeedSubscriptions.delete(layerGroup);
			}
		}
	}
}
