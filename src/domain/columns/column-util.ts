import {CompanionAdvancedFeedbackResult, CompanionFeedbackInfo, combineRgb} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {compositionState, parameterStates} from '../../state';
import {MessageSubscriber} from '../../websocket';
import {CompanionCommonCallbackContext} from '@companion-module/base/dist/module-api/common';

export class ColumnUtils implements MessageSubscriber {
	private resolumeArenaInstance: ResolumeArenaModuleInstance;

	private initalLoadDone = false;
	private selectedColumn?: number;
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
					this.selectedColumn = data.path.match(/\/composition\/columns\/(\d+)\/connect/)[1];
				}

				this.resolumeArenaInstance.checkFeedbacks('columnSelected');
				this.resolumeArenaInstance.checkFeedbacks('selectedColumnName');
				this.resolumeArenaInstance.checkFeedbacks('nextColumnName');
				this.resolumeArenaInstance.checkFeedbacks('previousColumnName');
			}
		}
	}

	initConnectedFromComposition() {
		const columns = compositionState.get()?.columns;
		if (columns) {
			this.selectedColumn = undefined;
			for (const [columnIndex, columnObject] of columns.entries()) {
				const column = columnIndex + 1;
				this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/columns/' + column + '/connect');
				this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/columns/' + column + '/name');

				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/columns/' + column + '/connect');
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/columns/' + column + '/name');
				if (columnObject.connected?.value) {
					this.selectedColumn = column;
				}
				this.lastColumn = column;
			}
		}
		this.resolumeArenaInstance.checkFeedbacks('columnSelected');
		this.resolumeArenaInstance.checkFeedbacks('columnName');
		this.resolumeArenaInstance.checkFeedbacks('selectedColumnName');
		this.resolumeArenaInstance.checkFeedbacks('nextColumnName');
		this.resolumeArenaInstance.checkFeedbacks('previousColumnName');
	}

	/////////////////////////////////////////////////
	// SELECTED
	/////////////////////////////////////////////////

	async columnSelectedFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<boolean> {
		const column = +await context.parseVariablesInString(feedback.options.column as string);
		if (column !== undefined) {
			return parameterStates.get()['/composition/columns/' + column + '/connect']?.value;
		}
		return false;
	}

	/////////////////////////////////////////////////
	// NAME
	/////////////////////////////////////////////////

	async columnNameFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<CompanionAdvancedFeedbackResult> {
		const column = +await context.parseVariablesInString(feedback.options.column as string);
		if (column !== undefined) {
			let text = parameterStates.get()['/composition/columns/' + column + '/name']?.value as string;
			return {text: text.replace('#', column.toString())};
		}
		return {};
	}

	/////////////////////////////////////////////////
	// SELECTED NAME
	/////////////////////////////////////////////////

	columnSelectedNameFeedbackCallback(_feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		if (this.selectedColumn !== undefined) {
			return {
				text: parameterStates.get()['/composition/columns/' + this.selectedColumn + '/name']?.value.replace('#', this.selectedColumn.toString()),
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(0, 0, 0)
			};
		}
		return {};
	}

	/////////////////////////////////////////////////
	// NEXT NAME
	/////////////////////////////////////////////////

	columnNextNameFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		var add = feedback.options.next as number;
		if (this.selectedColumn !== undefined && this.lastColumn != undefined) {
			let column = this.calculateNextColumn(add);
			let text = parameterStates.get()['/composition/columns/' + column + '/name']?.value as string;
			if (text) {
				return {text: text.replace('#', column.toString())};
			} else {
				return {};
			}
		}
		return {};
	}

	calculateNextColumn(add: number): number {
		let column = +this.selectedColumn!;
		if (column + add > +this.lastColumn!) {
			column = column + add - +this.lastColumn!;
		} else {
			column += add;
		}
		return column;
	}

	/////////////////////////////////////////////////
	// PREVIOUS NAME
	/////////////////////////////////////////////////

	columnPreviousNameFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		var subtract = feedback.options.previous as number;
		if (this.selectedColumn !== undefined && this.lastColumn !== undefined) {
			let column = this.calculatePreviousColumn(subtract);
			let text = parameterStates.get()['/composition/columns/' + column + '/name']?.value as string;
			if (text) {
				return {text: text.replace('#', column.toString())};
			} else {
				return {};
			}		}
		return {};
	}

	calculatePreviousColumn(subtract: number): number {
		let column = +this.selectedColumn!;
		if (column - subtract < 1) {
			column = +this.lastColumn! + column - subtract;
		} else {
			column = column - subtract;
		}
		return column;
	}
}
