import { ArenaFetchFunction } from '../arena';

export class ArenaClipsApi {
  private arenaFetch: ArenaFetchFunction;

  constructor(fetchFn: ArenaFetchFunction) {
    this.arenaFetch = fetchFn;
  }

  async select(layer: number, clip: number) {
    var url = `composition/layers/${layer}/clips/${clip}/select`;
    await this.arenaFetch('post', url, 'bool');
  }

  async connect(layer: number, clip: number, connect: boolean) {
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
