import {InstanceStatus} from '@companion-module/base';
import WebSocket from 'ws';
import {ResolumeArenaConfig} from './config-fields.js';
import {ResolumeArenaModuleInstance} from './index.js';
import {compositionState, parameterStates} from './state.js';

export interface MessageSubscriber {
	messageUpdates(data: {path: string; value: string | boolean | number}, isComposition: boolean): void;
}

export class WebsocketInstance {
	private isInitialized = false;
	private readonly wsRegex = '^wss?:\\/\\/([\\da-z\\.-]+)(:\\d{1,5})?(?:\\/(.*))?$';

	private reconnect_timer: any;
	private ws?: WebSocket;

	constructor(private readonly resolumeArenaInstance: ResolumeArenaModuleInstance, private readonly config: ResolumeArenaConfig) {
		console.log('constructed websocket');
		this.initWebSocket();
	}
	async destroy() {
		this.isInitialized = false;
		if (this.reconnect_timer) {
			clearTimeout(this.reconnect_timer);
			this.reconnect_timer = null;
		}
		if (this.ws) {
			this.ws.close(1000);
			delete this.ws;
		}
	}

	maybeReconnect() {
		if (this.isInitialized) {
			if (this.reconnect_timer) {
				clearTimeout(this.reconnect_timer);
			}
			this.reconnect_timer = setTimeout(() => {
				this.initWebSocket();
			}, 5000);
		}
	}

	initWebSocket() {
		if (this.reconnect_timer) {
			clearTimeout(this.reconnect_timer);
			this.reconnect_timer = null;
		}
		const websocketProtocol = this.config.useSSL ? 'wss://' : 'ws://';
		const url = websocketProtocol + this.config.host + ':' + this.config.webapiPort + '/api/v1';
		if (!url || url.match(new RegExp(this.wsRegex)) === null) {
			this.resolumeArenaInstance.updateStatus(InstanceStatus.BadConfig, `WS URL is not defined or invalid`);
			return;
		}

		this.resolumeArenaInstance.updateStatus(InstanceStatus.Connecting);

		if (this.ws) {
			this.ws.close(1000);
			delete this.ws;
		}
		this.ws = new WebSocket(url);
		this.isInitialized = true;

		this.ws.on('open', () => {
			this.resolumeArenaInstance.updateStatus(InstanceStatus.Ok);
			this.resolumeArenaInstance.log('debug', `Connection opened`);
		});
		this.ws.on('close', (code) => {
			this.resolumeArenaInstance.log('debug', `Connection closed with code ${code}`);
			// this.resolumeArenaInstance.updateStatus(InstanceStatus.Disconnected, `Connection closed with code ${code}`);
			this.maybeReconnect();
		});

		this.ws.onmessage = (event: WebSocket.MessageEvent): void => {
			try {
				const message = JSON.parse(event.data as string);
				// console.log('receiving message', message);
				// TODO: properly check the type, right now it's only for param updates
				if (!message.type) {
					/* check if message contains a composition, does it have columns and layers */
					if (message.columns && message.layers) {
						console.log('state update');
						// console.log('state update', message);
						compositionState.set(message);
						this.updateNeededSubscribers(message, true);
					} else {
						console.log('state does not contain a composition', message);
					}
				} else if (message.type === 'sources_update') {
					// console.log('sources update', message.value);
					// setSources(message.value);
				} else if (message.type === 'effects_update') {
					// console.log('effects update', message.value);
					// setEffects(message.value);
				} else if (message.type === 'thumbnail_update') {
					// setComposition((composition: any) => {
					// 	for (const layer of composition.layers) {
					// 		for (const clip of layer.clips) {
					// 			if (clip.id === message.value.id) {
					// 				clip.thumbnail = message.value;
					// 				return {...composition};
					// 			}
					// 		}
					// 	}
					// 	// no match found, re-use existing composition
					// 	return composition;
					// });
				} else if (message.type === 'parameter_update' || message.type === 'parameter_subscribed') {
					const parameter = message as {path: string; value: string | boolean | number};
					this.resolumeArenaInstance.log('debug', message.type + ' | ' + message.path + ' | ' + message.value);
					parameterStates.update((state) => {
						state[parameter.path] = parameter;
					});
					this.updateNeededSubscribers(message, false);
				}
			} catch (error) {
				console.error('invalid message', error);
				console.log('invalid message', event.data);
			}
		};
		this.ws.on('error', (data) => {
			this.resolumeArenaInstance.log('error', `WebSocket error: ${data}`);
		});
	}

	private updateNeededSubscribers(message: {path: string; value: string | number | boolean}, isComposition: boolean) {
		for (const websocketSubscriber of this.resolumeArenaInstance.getWebSocketSubscrivers()) {
			websocketSubscriber.messageUpdates(message, isComposition);
		}
	}

	async sendMessage(data: any) {
		if (this.ws?.readyState !== this.ws?.OPEN) {
			try {
				await this.waitForOpenConnection(this.ws);
				this.sendMessageIfOpen(data);
			} catch (err) {
				console.error(err);
			}
		} else {
			this.sendMessageIfOpen(data);
		}
	}

	public async waitForWebsocketReady() {
		await this.waitForOpenConnection(this.ws);
	}

	waitForOpenConnection(socket?: WebSocket) {
		return new Promise<void>((resolve, reject) => {
			const maxNumberOfAttempts = 10;
			const intervalTime = 200; //ms

			let currentAttempt = 0;
			const interval = setInterval(() => {
				if (currentAttempt > maxNumberOfAttempts - 1) {
					clearInterval(interval);
					reject(new Error('Maximum number of attempts exceeded'));
				} else if (socket?.readyState === socket?.OPEN) {
					clearInterval(interval);
					resolve();
				}
				currentAttempt++;
			}, intervalTime);
		});
	}

	sendMessageIfOpen(data: any) {
		this.resolumeArenaInstance.log('debug','websocket: send '+ JSON.stringify(data));
		this.ws?.send(JSON.stringify(data));
	}

	getPath(path: string) {
		const data = {
			action: 'get',
			parameter: path,
		};
		this.sendMessage(data);
	}

	getParam(paramId: string) {
		const data = {
			action: 'get',
			parameter: '/parameter/by-id/' + paramId,
		};
		this.sendMessage(data);
	}

	setPath(path: string, value: any) {
		const data = {
			action: 'set',
			parameter: path,
			value: value,
		};
		this.sendMessage(data);
	}

	setParam(paramId: string, value: any) {
		const data = {
			action: 'set',
			parameter: '/parameter/by-id/' + paramId,
			value: value,
		};
		this.sendMessage(data);
	}

	resetPath(path: string) {
		const data = {
			action: 'reset',
			parameter: path,
		};
		this.sendMessage(data);
	}

	resetParam(paramId: string) {
		const data = {
			action: 'reset',
			parameter: '/parameter/by-id/' + paramId,
		};
		this.sendMessage(data);
	}

	triggerPath(path: string) {
		const data = {
			action: 'trigger',
			parameter: path,
		};
		this.sendMessage(data);
	}

	triggerParam(paramId: string) {
		const data = {
			action: 'trigger',
			parameter: '/parameter/by-id/' + paramId,
		};
		this.sendMessage(data);
	}

	subscribePath(path: string) {
		const data = {
			action: 'subscribe',
			parameter: path,
		};
		this.sendMessage(data);
	}

	subscribeParam(paramId: number, subPath?: string) {
		const data = {
			action: 'subscribe',
			parameter: '/parameter/by-id/' + paramId,
		};
		if (subPath) {
			data.parameter += subPath;
		}
		this.sendMessage(data);
	}

	unsubscribePath(path: string) {
		const data = {
			action: 'unsubscribe',
			parameter: path,
		};
		this.sendMessage(data);
	}

	unsubscribeParam(paramId: number) {
		const data = {
			action: 'unsubscribe',
			parameter: '/parameter/by-id/' + paramId,
		};
		this.sendMessage(data);
	}
}
