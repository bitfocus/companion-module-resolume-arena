import {combineRgb, CompanionAdvancedFeedbackResult, CompanionFeedbackInfo} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {compositionState, parameterStates} from '../../state';
import {MessageSubscriber} from '../../websocket';
import {CompanionCommonCallbackContext} from '@companion-module/base/dist/module-api/common';

export class ColumnUtils implements MessageSubscriber {
	private resolumeArenaInstance: ResolumeArenaModuleInstance;

	private initalLoadDone = false;
	private selectedColumn?: number;
	private connectedColumn?: number;
	private lastColumn?: number;

	constructor(resolumeArenaInstance: ResolumeArenaModuleInstance) {
		this.resolumeArenaInstance = resolumeArenaInstance;
		this.resolumeArenaInstance.log('debug', 'ColumnUtils constructor called');
	}

	messageUpdates(data: {path: any, value: boolean}, isComposition: boolean) {
		if (isComposition || !this.initalLoadDone) {
			if (compositionState.get() !== undefined) {
				this.initConnectedFromComposition();
				this.initalLoadDone = true;
			}
		}
		if (data.path) {
			if (!!data.path.match(/\/composition\/columns\/\d+\/name/)) {
				this.resolumeArenaInstance.checkFeedbacks('columnName');
			}
			if (!!data.path.match(/\/composition\/columns\/\d+\/connect/)) {
				if (data.value) {
					let match = data.path.match(/\/composition\/columns\/(\d+)\/connect/)[1];
					if (!match) {
						this.connectedColumn = match;
					}else {
						this.connectedColumn = this.selectedColumn;
					}
						this.resolumeArenaInstance.setVariableValues({connectedColumn: this.connectedColumn});
				}

				this.resolumeArenaInstance.checkFeedbacks('columnConnected');
				this.resolumeArenaInstance.checkFeedbacks('connectedColumnName');
				this.resolumeArenaInstance.checkFeedbacks('nextConnectedColumnName');
				this.resolumeArenaInstance.checkFeedbacks('previousConnectedColumnName');
			}

			if (!!data.path.match(/\/composition\/columns\/\d+\/select/)) {
				if (data.value) {
					this.selectedColumn = data.path.match(/\/composition\/columns\/(\d+)\/select/)[1];
					this.resolumeArenaInstance.setVariableValues({selectedColumn: this.selectedColumn});
				}

				this.resolumeArenaInstance.checkFeedbacks('columnSelected');
				this.resolumeArenaInstance.checkFeedbacks('selectedColumnName');
				this.resolumeArenaInstance.checkFeedbacks('nextSelectedColumnName');
				this.resolumeArenaInstance.checkFeedbacks('previousSelectedColumnName');
			}
		}
	}

	initConnectedFromComposition() {
		const columns = compositionState.get()?.columns;
		if (columns) {
			this.selectedColumn = undefined;
			for (const [columnIndex, columnObject] of columns.entries()) {
				const column = columnIndex + 1;
				this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/columns/' + column + '/select');
				this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/columns/' + column + '/connect');
				this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/columns/' + column + '/name');

				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/columns/' + column + '/select');
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/columns/' + column + '/connect');
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/columns/' + column + '/name');
				if (columnObject.selected?.value) {
					this.selectedColumn = column;
				}
				if (columnObject.connected?.value === 'Connected') {
					this.connectedColumn = column;
				}
				this.lastColumn = column;
			}
		}
		this.resolumeArenaInstance.checkFeedbacks('columnConnected');
		this.resolumeArenaInstance.checkFeedbacks('columnSelected');
		this.resolumeArenaInstance.checkFeedbacks('columnName');
		this.resolumeArenaInstance.checkFeedbacks('selectedColumnName');
		this.resolumeArenaInstance.checkFeedbacks('connectedColumnName');
		this.resolumeArenaInstance.checkFeedbacks('nextSelectedColumnName');
		this.resolumeArenaInstance.checkFeedbacks('nextConnectedColumnName');
		this.resolumeArenaInstance.checkFeedbacks('previousSelectedColumnName');
		this.resolumeArenaInstance.checkFeedbacks('previousConnectedColumnName');
	}

	/////////////////////////////////////////////////
	// NAME
	/////////////////////////////////////////////////

	async columnNameFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<CompanionAdvancedFeedbackResult> {
		const column = +await context.parseVariablesInString(feedback.options.column as string);
		if (column !== undefined) {
			let text = parameterStates.get()['/composition/columns/' + column + '/name']?.value as string | undefined;
			return {text: text?.replace('#', column.toString())};
		}
		return {};
	}

	/////////////////////////////////////////////////
	// SELECTED
	/////////////////////////////////////////////////

	async columnSelectedFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<boolean> {
		const column = +await context.parseVariablesInString(feedback.options.column as string);
		if (column !== undefined) {
			return parameterStates.get()['/composition/columns/' + column + '/select']?.value;
		}
		return false;
	}

	/////////////////////////////////////////////////
	// SELECTED NAME
	/////////////////////////////////////////////////

	columnSelectedNameFeedbackCallback(_feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		if (this.selectedColumn !== undefined) {
			return {
				text: parameterStates.get()['/composition/columns/' + this.selectedColumn + '/name']?.value.replace('#', this.selectedColumn.toString()),
				bgcolor: combineRgb(0, 255, 255),
				color: combineRgb(0, 0, 0)
			};
		}
		return {};
	}

	/////////////////////////////////////////////////
	// NEXT SELECTED NAME
	/////////////////////////////////////////////////

	columnSelectedNextNameFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		var add = feedback.options.next as number;
		if (this.selectedColumn !== undefined && this.lastColumn != undefined) {
			let column = this.calculateSelectedNextColumn(add);
			let text = parameterStates.get()['/composition/columns/' + column + '/name']?.value as string;
			if (text) {
				return {text: text.replace('#', column.toString())};
			} else {
				return {};
			}
		}
		return {};
	}

	calculateSelectedNextColumn(add: number): number {
		let column = +this.selectedColumn!;
		if (column + add > +this.lastColumn!) {
			column = column + add - +this.lastColumn!;
		} else {
			column += add;
		}
		return column;
	}

	/////////////////////////////////////////////////
	// PREVIOUS SELECTED NAME
	/////////////////////////////////////////////////

	columnSelectedPreviousNameFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		var subtract = feedback.options.previous as number;
		if (this.selectedColumn !== undefined && this.lastColumn !== undefined) {
			let column = this.calculateSelectedPreviousColumn(subtract);
			let text = parameterStates.get()['/composition/columns/' + column + '/name']?.value as string;
			if (text) {
				return {text: text.replace('#', column.toString())};
			} else {
				return {};
			}
		}
		return {};
	}

	calculateSelectedPreviousColumn(subtract: number): number {
		let column = +this.selectedColumn!;
		if (column - subtract < 1) {
			column = +this.lastColumn! + column - subtract;
		} else {
			column = column - subtract;
		}
		return column;
	}

	/////////////////////////////////////////////////
	// CONNECTED
	/////////////////////////////////////////////////

	async columnConnectedFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<boolean> {
		const column = +await context.parseVariablesInString(feedback.options.column as string);
		if (column !== undefined) {
			return parameterStates.get()['/composition/columns/' + column + '/connect']?.value === 'Connected';
		}
		return false;
	}


	/////////////////////////////////////////////////
	// CONNECTED NAME
	/////////////////////////////////////////////////

	columnConnectedNameFeedbackCallback(_feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		if (this.connectedColumn !== undefined) {
			return {
				text: parameterStates.get()['/composition/columns/' + this.connectedColumn + '/name']?.value.replace('#', this.connectedColumn.toString()),
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(0, 0, 0)
			};
		}
		return {};
	}

	/////////////////////////////////////////////////
	// NEXT CONNECTED NAME
	/////////////////////////////////////////////////

	columnConnectedNextNameFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		var add = feedback.options.next as number;
		if (this.connectedColumn !== undefined && this.lastColumn != undefined) {
			let column = this.calculateConnectedNextColumn(add);
			let text = parameterStates.get()['/composition/columns/' + column + '/name']?.value as string;
			if (text) {
				return {text: text.replace('#', column.toString())};
			} else {
				return {};
			}
		}
		return {};
	}

	calculateConnectedNextColumn(add: number): number {
		let column = +this.connectedColumn!;
		if (column + add > +this.lastColumn!) {
			column = column + add - +this.lastColumn!;
		} else {
			column += add;
		}
		return column;
	}

	/////////////////////////////////////////////////
	// PREVIOUS CONNECTED NAME
	/////////////////////////////////////////////////

	columnConnectedPreviousNameFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		var subtract = feedback.options.previous as number;
		if (this.connectedColumn !== undefined && this.lastColumn !== undefined) {
			let column = this.calculateConnectedPreviousColumn(subtract);
			let text = parameterStates.get()['/composition/columns/' + column + '/name']?.value as string;
			if (text) {
				return {text: text.replace('#', column.toString())};
			} else {
				return {};
			}
		}
		return {};
	}

	calculateConnectedPreviousColumn(subtract: number): number {
		let column = +this.connectedColumn!;
		if (column - subtract < 1) {
			column = +this.lastColumn! + column - subtract;
		} else {
			column = column - subtract;
		}
		return column;
	}
}
