import {ArenaFetchFunction} from '../rest';
import { ColumnOptions, ColumnWriteOptions } from './column-options/ColumnOptions';
import {LayerGroupOptions, LayerGroupWriteOptions} from './layer-group-options/LayerGroupOptions';

export class ArenaLayerGroupsApi {
	private arenaFetch: ArenaFetchFunction;

	constructor(fetchFn: ArenaFetchFunction) {
		this.arenaFetch = fetchFn;
	}

	async select(layerGroup: number) {
		var url = `composition/layergroups/${layerGroup}/select`;
		await this.arenaFetch('post', url, 'bool');
	}

	async getSettings(layerGroup: number): Promise<LayerGroupOptions> {
		var url = `composition/layergroups/${layerGroup}`;
		return (await this.arenaFetch('get', url, 'json')) as LayerGroupOptions;
	}

	async updateSettings(layerGroup: number, options: LayerGroupWriteOptions) {
		var url = `composition/layergroups/${layerGroup}`;
		await this.arenaFetch('put', url, 'bool', options);
	}

	// does not exist in the resolume api (yet)
	// async clear(layerGroup: number) {
	// 	var url = `composition/layergroups/${layerGroup}/clear`;
	// 	await this.arenaFetch('post', url, 'bool');
	// }

	async connectColumn(layerGroup: number, column: number): Promise<ColumnOptions> {
		var url = `composition/layergroups/${layerGroup}/columns/${column}/connect`;
		return (await this.arenaFetch('post', url, 'json')) as ColumnOptions;
	}
	
	async getColumnSettings(layerGroup: number, column: number): Promise<ColumnOptions> {
		var url = `composition/layergroups/${layerGroup}/columns/${column}`;
		return (await this.arenaFetch('get', url, 'json')) as ColumnOptions;
	}

	async updateColumnSettings(layerGroup: number, column: number, options: ColumnWriteOptions) {
		var url = `composition/layergroups/${layerGroup}/columns/${column}`;
		await this.arenaFetch('put', url, 'bool', options);
	}
}
