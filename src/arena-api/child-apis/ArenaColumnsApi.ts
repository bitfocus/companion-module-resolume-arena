import {ArenaFetchFunction} from '../rest';
import { ColumnOptions, ColumnWriteOptions } from './column-options/ColumnOptions';

export class ArenaColumnsApi {
	private arenaFetch: ArenaFetchFunction;

	constructor(fetchFn: ArenaFetchFunction) {
		this.arenaFetch = fetchFn;
	}

	async getSettings(column: number): Promise<ColumnOptions> {
		var url = `composition/columns/${column}`;
		return (await this.arenaFetch('get', url, 'json')) as ColumnOptions;
	}

	async updateSettings(column: number, options: ColumnWriteOptions) {
		var url = `composition/columns/${column}`;
		await this.arenaFetch('put', url, 'bool', options);
	}

	async connectColumn(column: number): Promise<ColumnOptions> {
		var url = `composition/columns/${column}/connect`;
		return (await this.arenaFetch('post', url, 'json')) as ColumnOptions;
	}
}
