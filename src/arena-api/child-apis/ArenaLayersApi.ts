import {ArenaFetchFunction} from '../rest';
import {LayerOptions, LayerWriteOptions} from './layer-options/LayerOptions';

export class ArenaLayersApi {
	private arenaFetch: ArenaFetchFunction;

	constructor(fetchFn: ArenaFetchFunction) {
		this.arenaFetch = fetchFn;
	}

  async select(layer: number) {
		var url = `composition/layers/${layer}/select`;
		await this.arenaFetch('post', url, 'bool');
	}

	async getSettings(layer: number): Promise<LayerOptions> {
		var url = `composition/layers/${layer}`;
		return (await this.arenaFetch('get', url, 'json')) as LayerOptions;
	}

	async updateSettings(layer: number, options: LayerWriteOptions) {
		var url = `composition/layers/${layer}`;
		await this.arenaFetch('put', url, 'bool', options);
	}

	async clear(layer: number) {
		var url = `composition/layers/${layer}/clear`;
		await this.arenaFetch('post', url, 'bool');
	}
}
