import {CompanionFeedbackInfo} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {ColumnOptions} from '../../arena-api/child-apis/column-options/ColumnOptions';

export class ColumnUtils {
	private resolumeArenaInstance: ResolumeArenaModuleInstance;

	private selectedColumn: number | undefined = undefined;
	private columnSelectedSubscriptions: Set<number> = new Set<number>();

	constructor(resolumeArenaInstance: ResolumeArenaModuleInstance) {
		this.resolumeArenaInstance = resolumeArenaInstance;
		this.resolumeArenaInstance.log('debug', 'ColumnUtils constructor called');
	}

	async poll() {
		if (this.columnSelectedSubscriptions.size > 0) {
			var SelectedSet = false;
			for (var column of this.columnSelectedSubscriptions) {
				var status = (await this.resolumeArenaInstance.restApi?.Columns.getSettings(column)) as ColumnOptions;
				console.log('status', status);
				if (status.connected?.value) {
					this.selectedColumn = column;
					SelectedSet = true;
				}
			}
			if (!SelectedSet) {
				this.selectedColumn = undefined;
			}
			this.resolumeArenaInstance.checkFeedbacks('columnSelected');
		}
	}

	hasPollingSubscriptions(): boolean {
		return this.columnSelectedSubscriptions.size > 0;
	}

	columnSelectedFeedbackCallback(feedback: CompanionFeedbackInfo): boolean {
		var column = feedback.options.column;
		if (column !== undefined) {
			return this.selectedColumn === (column as number);
		}
		return false;
	}

	columnSelectedFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var column = feedback.options.column as number;
		if (column !== undefined) {
			this.addColumnSelectedSubscription(column);
		}
	}

	columnSelectedFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var column = feedback.options.column as number;
		if (column !== undefined) {
			this.removeColumnSelectedSubscription(column);
		}
	}

	private addColumnSelectedSubscription(column: number) {
		this.columnSelectedSubscriptions.add(column);
		this.resolumeArenaInstance.pollStatus();
		this.resolumeArenaInstance.checkFeedbacks('columnSelected');
	}

	private removeColumnSelectedSubscription(column: number) {
		this.columnSelectedSubscriptions.delete(column);
	}
}
