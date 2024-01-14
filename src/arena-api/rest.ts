import { Agent as httpAgent } from 'http';
import { Agent as httpsAgent } from 'https';
import fetch, { HeadersInit, Response } from 'node-fetch';
import { ArenaClipsApi } from './child-apis/ArenaClipsApi';
import { ArenaLayersApi } from './child-apis/ArenaLayersApi';

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

type ArenaFetchJsonFunction = (method: HttpMethod, relativeUrl: string, returnType: 'json', body?: any) => Promise<object>;
type ArenaFetchBase64Function = (method: HttpMethod, relativeUrl: string, returnType: 'base64', body?: any) => Promise<string>;
type ArenaFetchBoolFunction = (method: HttpMethod, relativeUrl: string, returnType: 'bool', body?: any) => Promise<boolean>;
type ArenaFetchOkFunction = (method: HttpMethod, relativeUrl: string, returnType: 'ok', body?: any) => Promise<boolean>;
export type ArenaFetchFunction =
  ArenaFetchJsonFunction
  & ArenaFetchBase64Function
  & ArenaFetchBoolFunction
  & ArenaFetchOkFunction;

interface FetchOptions {
  method: string,
  headers: HeadersInit,
  agent: httpAgent | httpsAgent,
  body: any
}
export default class ArenaRestApi {
  private _host: string;
  private _port: number;
  private _defaultHeaders: HeadersInit;
  private _agent: httpAgent | httpsAgent;
  private _apiVersion: string;

  constructor(host: string, port: number, useSSL: boolean = false) {
    this._host = host;
    this._port = port;
    this._apiVersion = 'v1';
    var protocol = 'http';
    if (useSSL) {
      protocol += 's';
    }
    this.apiUrl = `${protocol}://${this._host}:${this._port}/api/${this._apiVersion}`;
    this._defaultHeaders = {
      Accept: 'application/json',
    };
    if (useSSL) {
      this._agent = new httpsAgent({
        keepAlive: true,
        rejectUnauthorized: false
      });
    } else {
      this._agent = new httpAgent({
        keepAlive: true
      });
    }
  }

  private checkStatus(response: Response) {
    if (response.ok) {
      // response.status >= 200 && response.status < 300
      return response;
    } else {
      if(response.status===404){
        console.log("404 on", response.url)
        return response;
      }else{

        throw new HTTPResponseError(response);
      }
    }
  }

  //@ts-ignore
  private authenticate(headers: Headers) {
    // don't need to authenticate 
    // but leave this as a placeholder for when we do
  }

  private apiUrl: string;

  private async arenaFetch(method: HttpMethod, relativeUrl: string, returnType: 'ok', body?: any): Promise<boolean>;
  private async arenaFetch(method: HttpMethod, relativeUrl: string, returnType: 'bool', body?: any): Promise<boolean>;
  private async arenaFetch(method: HttpMethod, relativeUrl: string, returnType: 'json', body?: any): Promise<object>;
  private async arenaFetch(method: HttpMethod, relativeUrl: string, returnType: 'base64', body?: any): Promise<string>;
  private async arenaFetch(method: HttpMethod, relativeUrl: string, returnType: string, body?: any): Promise<any> {
    var url = `${this.apiUrl}/${relativeUrl}`;
    var options: FetchOptions = {
      method,
      headers: this._defaultHeaders,
      agent: this._agent,
      body: null
    };
    if (body != undefined && body != null) {
      if (typeof(body) == 'object') {
        options.body = JSON.stringify(body);
      } else {
        options.body = body.toString();
      }
    }
    const response = await fetch(
      url,
      options
    );
    this.checkStatus(response);
    switch (returnType) {
      case 'ok':
        return response.ok;
      case 'json':
        return await response.json();
      case 'base64':
        var buffer = await response.buffer();
        return buffer.toString('base64');
      case 'bool':
        return await (await response.text()).toLowerCase() == 'true';
    }
  }

  public async productInfo(): Promise<ArenaProductResponse> {
    const response = await this.arenaFetch('get', 'product', 'json');
    return response as ArenaProductResponse;
  }

  public readonly Clips: ArenaClipsApi = new ArenaClipsApi(this.arenaFetch.bind(this));
  public readonly Layers: ArenaLayersApi = new ArenaLayersApi(this.arenaFetch.bind(this));
} 
