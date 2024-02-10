import {ClipId} from '../../domain/clip/clip-id';
import {ArenaFetchFunction} from '../rest';

export class ArenaClipsApi {
	private arenaFetch: ArenaFetchFunction;

	constructor(fetchFn: ArenaFetchFunction) {
		this.arenaFetch = fetchFn;
	}

	async getStatus(clipId: ClipId): Promise<{}> {
		var url = `composition/layers/${clipId.getLayer()}/clips/${clipId.getColumn()}`;
		return await this.arenaFetch('get', url, 'json');
	}

	async getThumb(clipId: ClipId): Promise<string> {
		var url = `composition/layers/${clipId.getLayer()}/clips/${clipId.getColumn()}/thumbnail`;
		return await this.arenaFetch('get', url, 'base64');
	}

	async select(clipId: ClipId) {
		var url = `composition/layers/${clipId.getLayer()}/clips/${clipId.getColumn()}/select`;
		await this.arenaFetch('post', url, 'bool');
	}

	async connect(clipId: ClipId, connect?: boolean) {
		var url = `composition/layers/${clipId.getLayer()}/clips/${clipId.getColumn()}/connect`;
		await this.arenaFetch('post', url, 'ok', connect);
	}

	async clear(clipId: ClipId) {
		var url = `composition/layers/${clipId.getLayer()}/clips/${clipId.getColumn()}/clear`;
		await this.arenaFetch('post', url, 'bool');
	}

	async loadFile(clipId: ClipId, filename: string) {
		var url = `composition/layers/${clipId.getLayer()}/clips/${clipId.getColumn()}/open`;
		filename = filename.replace(/\\/g, '/'); // backslashes to forward slashes
		var fileUri = `file:///${filename}`;
		await this.arenaFetch('post', url, 'bool', fileUri);
	}
}
