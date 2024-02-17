import {CompanionFeedbackInfo} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {parameterStates} from '../../state';
import {MessageSubscriber} from '../../websocket';

export class ColumnUtils implements MessageSubscriber {
	private resolumeArenaInstance: ResolumeArenaModuleInstance;

	private columnSelectedSubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();

	constructor(resolumeArenaInstance: ResolumeArenaModuleInstance) {
		this.resolumeArenaInstance = resolumeArenaInstance;
		this.resolumeArenaInstance.log('debug', 'ColumnUtils constructor called');
	}

	messageUpdates(data: {path: any}) {
		if(data.path){
			if (!!data.path.match(/\/composition\/columns\/\d+\/connect/)) {
				this.resolumeArenaInstance.checkFeedbacks('columnSelected');
			}
		}
	}

	messageFilter() {
		return (message: any) => !!(message.path && message.path.match(/\/composition\/columns.?/));
	}
	
	/////////////////////////////////////////////////
	// SELECTED
	/////////////////////////////////////////////////
	
	columnSelectedFeedbackCallback(feedback: CompanionFeedbackInfo): boolean {
		var column = feedback.options.column;
		if (column !== undefined) {
			return parameterStates.get()['/composition/columns/' + column + '/connect']?.value;
		}
		return false;
	}

	columnSelectedFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var column = feedback.options.column as number;
		if (column !== undefined) {
			if (!this.columnSelectedSubscriptions.get(column)) {
				this.columnSelectedSubscriptions.set(column, new Set());
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/columns/' + column + '/connect');
			}
			this.columnSelectedSubscriptions.get(column)?.add(feedback.id);
		}
	}

	columnSelectedFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var column = feedback.options.column as number;
		const columnSelectedSubscription = this.columnSelectedSubscriptions.get(column);
		if (column !== undefined && columnSelectedSubscription) {
			columnSelectedSubscription.delete(feedback.id);
			if (columnSelectedSubscription.size === 0) {
				this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/columns/' + column + '/connect');
				this.columnSelectedSubscriptions.delete(column);
			}
		}
	}
}
