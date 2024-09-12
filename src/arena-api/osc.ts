import {OSCMetaArgument, OSCSomeArguments} from '@companion-module/base';

export type OscSendFunc = (host: string, port: number, path: string, args: OSCSomeArguments) => void;

export class OscArgs {
	public static One = {
		type: 'i' as 'i',
		value: 1
	};

	public static Zero = {
		type: 'i' as 'i',
		value: 0
	};
}

export default class ArenaOscApi {
	private _host: string;
	private _port: number;
	private _oscSend: OscSendFunc;
	private groupPos: number[] = [];

	constructor(host: string, port: number, oscSend: OscSendFunc) {
		this._host = host;
		this._port = port;
		this._oscSend = oscSend;
	}

	public send(path: string, args: OSCSomeArguments) {
		this._oscSend(this._host, this._port, path, args);
	}

	public sendTrigger(path: string) {
		this._oscSend(this._host, this._port, path, OscArgs.One);
		setTimeout(() => {
			this._oscSend(this._host, this._port, path, OscArgs.Zero);
		},50);
	}

	public selectClip(layer: number, column: number) {
		this.send(`/composition/layers/${layer}/clips/${column}/select`, OscArgs.One);
	}

	public connectClip(layer: number, column: number) {
		this.sendTrigger(`/composition/layers/${layer}/clips/${column}/connect`);
	}

	public triggerColumn(column: number) {
		this.sendTrigger(`/composition/columns/${column}/connect`);
	}

	public clearLayer(layer: number) {
		this.sendTrigger(`/composition/layers/${layer}/clear`);
	}

	public clearLayerGroup(layerGroup: number) {
		this.sendTrigger(`/composition/groups/${layerGroup}/disconnectlayers`);
	}

	public bypassLayer(layer: number, bypassed: OSCSomeArguments) {
		let path = `/composition/layers/${layer}/bypassed`;
		this.send(path, bypassed);
	}

	public bypassLayerGroup(layerGroup: number, bypassed: OSCSomeArguments) {
		let path = `/composition/groups/${layerGroup}/bypassed`;
		this.send(path, bypassed);
	}

	public clearAllLayers() {
		this.sendTrigger('/composition/disconnectall');
	}

	public tempoTap() {
		this.sendTrigger('/composition/tempocontroller/tempotap');
	}

	public tempoResync() {
		this.sendTrigger('/composition/tempocontroller/resync');
	}

	public triggerlayerGroupColumn(layerGroup: number, column: number) {
		this.sendTrigger(`/composition/groups/${layerGroup}/columns/${column}/connect`);
	}

	public layerGroupNextCol(layerGroup: number, lastColumn: number) {
		if (this.groupPos[layerGroup] == undefined) {
			this.groupPos[layerGroup] = 1;
		} else {
			this.groupPos[layerGroup]++;
		}
		if (this.groupPos[layerGroup] > lastColumn) {
			this.groupPos[layerGroup] = 1;
		}

		this.sendTrigger(`/composition/groups/${layerGroup}/columns/${this.groupPos[layerGroup]}/connect`);
	}

	public groupPrevCol(layerGroup: number, lastColumn: number) {
		if (this.groupPos[layerGroup] == undefined) {
			this.groupPos[layerGroup] = 1;
		} else {
			this.groupPos[layerGroup]--;
		}
		if (this.groupPos[layerGroup] < 1) {
			this.groupPos[layerGroup] = lastColumn;
		}

		this.sendTrigger(`/composition/groups/${layerGroup}/columns/${this.groupPos[layerGroup]}/connect`);
	}

	public compNextDeck() {
		this.sendTrigger(`/composition/selectnextdeck`);
	}

	public compPrevDeck() {
		this.sendTrigger(`/composition/selectprevdeck`);
	}

	public compNextCol() {
		this.sendTrigger(`/composition/connectnextcolumn`);
	}

	public compPrevCol() {
		this.sendTrigger(`/composition/connectprevcolumn`);
	}

	public layerNextCol(layer: number) {
		this.sendTrigger(`/composition/layers/${layer}/connectnextclip`);
	}

	public layerPrevCol(layer: number) {
		this.sendTrigger(`/composition/layers/${layer}/connectprevclip`);
	}

	public customOsc(customPath: string, oscType: string, customValue: string, relativeType?: string) {
		var args: OSCMetaArgument[] = [];
		switch (relativeType) {
			case '+':
				args.push({
					type: 's',
					value: '' + relativeType
				});
				break;
			case '-':
				args.push({
					type: 's',
					value: '' + relativeType
				});
				break;
			case '*':
				args.push({
					type: 's',
					value: '' + relativeType
				});
				break;
			case 'n':
			default:
				break;
		}

		switch (oscType) {
			case 'i':
				args.push({
					type: oscType,
					value: parseInt(customValue)
				});
				break;
			case 'f':
				args.push({
					type: oscType,
					value: parseFloat(customValue)
				});
				break;
			case 's':
				args.push({
					type: oscType,
					value: '' + customValue
				});
				break;
			case 'n':
			default:
				break;
		}
		this.send(customPath, args);
	}
}
