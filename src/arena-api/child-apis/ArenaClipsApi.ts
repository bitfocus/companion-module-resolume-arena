import { ArenaFetchFunction } from '../rest';

export class ArenaClipsApi {
  private arenaFetch: ArenaFetchFunction;

  constructor(fetchFn: ArenaFetchFunction) {
    this.arenaFetch = fetchFn;
  }

  async getStatus(layer: number, clip: number): Promise<{}> {
    var url = `composition/layers/${layer}/clips/${clip}`;
    return await this.arenaFetch('get', url, 'json');
  }

  async getThumb(layer: number, clip: number): Promise<string> {
    var url = `composition/layers/${layer}/clips/${clip}/thumbnail`;
    return await this.arenaFetch('get', url, 'base64');
  }

  async select(layer: number, clip: number) {
    var url = `composition/layers/${layer}/clips/${clip}/select`;
    await this.arenaFetch('post', url, 'bool');
  }

  async connect(layer: number, clip: number, connect?: boolean) {
    var url = `composition/layers/${layer}/clips/${clip}/connect`;
    await this.arenaFetch('post', url, 'ok', connect);
  }

  async clear(layer: number, clip: number) {
    var url = `composition/layers/${layer}/clips/${clip}/clear`;
    await this.arenaFetch('post', url, 'bool');
  }

  async loadFile(layer: number, clip: number, filename: string) {
    var url = `composition/layers/${layer}/clips/${clip}/open`;
    filename = filename.replace(/\\/g, "/"); // backslashes to forward slashes
    var fileUri = `file:///${filename}`;
    await this.arenaFetch('post', url, 'bool', fileUri);
  }
}
