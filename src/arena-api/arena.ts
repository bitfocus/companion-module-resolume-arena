import { Agent } from 'https';
import fetch, { HeadersInit, Response } from 'node-fetch';

class HTTPResponseError extends Error {
  response: any;
	constructor(response: Response) {
		super(`HTTP Error Response: ${response.status} ${response.statusText}`);
		this.response = response;
	}
}

interface ArenaProductResponse {
  name: string;
  major: number;
  minor: number;
  micro: number;
  revision: number;
}

export interface InUseStatus {
  inUse: boolean,
  sharing: boolean
}

type HttpMethod = 'get' | 'put' | 'post' | 'delete';

type ArenaFetchFunction = (method: HttpMethod, relativeUrl: string, body?: any) => Promise<object>;

export default class ArenaApi {
  private _host: string;
  private _port: number;
  private _defaultHeaders: HeadersInit;
  private _agent: Agent;
  private _apiVersion: string;

  constructor(host: string, port: number) {
    this._host = host;
    this._port = port;
    this._apiVersion = 'v1';
    this.apiUrl = `https://${this._host}:${this._port}/api/${this._apiVersion}`;
    this._defaultHeaders = {
      Accept: 'application/json',
    };
    this._agent = new Agent({  
      rejectUnauthorized: false
    });
  }

  private checkStatus (response: Response) {
    if (response.ok) {
      // response.status >= 200 && response.status < 300
      return response;
    } else {
      throw new HTTPResponseError(response);
    }
  }

  //@ts-ignore
  private authenticate(headers: Headers) {
    // don't need to authenticate 
    // but leave this as a placeholder for when we do
  }

  private apiUrl: string;

  private async arenaFetch(method: HttpMethod, relativeUrl: string, body?: any): Promise<object> {
    const response = await fetch(
      `${this.apiUrl}/${relativeUrl}`,
      {
        method,
        headers: this._defaultHeaders,
        agent: this._agent,
        body: body
      });
    this.checkStatus(response);
    return await response.json();
  }

  public async productInfo(): Promise<ArenaProductResponse> {
    const response = await this.arenaFetch('get', 'product');
    return response as ArenaProductResponse;
  }

  public readonly Clips: ArenaClipsApi = new ArenaClipsApi(this.arenaFetch);
} 

export class ArenaClipsApi {
  private arenaFetch: ArenaFetchFunction;
  
  constructor(fetchFn: ArenaFetchFunction) {
    this.arenaFetch = fetchFn;
  }

  async select(layer: number, clip: number) {
    var url = `composition/layers/${layer}/clips/${clip}/select`;
    await this.arenaFetch('post', url);
  }

  async connect(layer: number, clip: number, connect: boolean) {
    var url = `composition/layers/${layer}/clips/${clip}/select`;
    await this.arenaFetch('post', url, connect);
  }

  async clear(layer: number, clip: number) {
    var url = `composition/layers/${layer}/clips/${clip}/clear`;
    await this.arenaFetch('post', url);
  }

  async loadFile(layer: number, clip: number, filename: string) {
    var url = `composition/layers/${layer}/clips/${clip}/open`;
    filename = filename.replace(/\\/g, "/"); // backslashes to forward slashes
    var fileUri= `file:///${filename}`;
    await this.arenaFetch('post', url, fileUri);
  }
}