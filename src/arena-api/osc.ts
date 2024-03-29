import {OSCMetaArgument, OSCSomeArguments} from '@companion-module/base';

export type OscSendFunc = (host: string, port: number, path: string, args: OSCSomeArguments) => void;

export class OscArgs {
	public static One = {
		type: 'i' as 'i',
		value: 1,
	};

	public static Zero = {
		type: 'i' as 'i',
		value: 0,
	};
}

export default class ArenaOscApi {
	private _host: string;
	private _port: number;
	private _oscSend: OscSendFunc;
	private groupPos: number[] = [];
	private layerPos: number[] = [];
	private currentCompCol: number = 0;

	constructor(host: string, port: number, oscSend: OscSendFunc) {
		this._host = host;
		this._port = port;
		this._oscSend = oscSend;
	}

	public send(path: string, args: OSCSomeArguments) {
		this._oscSend(this._host, this._port, path, args);
	}

	public selectClip(layer: number, column: number) {
		this.send(`/composition/layers/${layer}/clips/${column}/select`, OscArgs.One);
	}
	
	public connectClip(layer: number, column: number) {
		this.send(`/composition/layers/${layer}/clips/${column}/connect`, OscArgs.One);
	}

	public triggerColumn(column: number) {
		this.send(`/composition/columns/${column}/connect`, OscArgs.One);
	}

	public clearLayer(layer: number) {
		let path = `/composition/layers/${layer}/clear`;
		this.send(path, OscArgs.One);
		this.send(path, OscArgs.Zero);
	}
  
	public clearLayerGroup(layerGroup: number) {
		let path = `/composition/groups/${layerGroup}/disconnectlayers`;
		this.send(path, OscArgs.One);
		this.send(path, OscArgs.Zero);
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
		this.send('/composition/disconnectall', OscArgs.One);
	}

	public tempoTap() {
		this.send('/composition/tempocontroller/tempotap', OscArgs.One);
	}
	
	public tempoResync() {
		this.send('/composition/tempocontroller/resync', OscArgs.One);
	}

	public triggerlayerGroupColumn(layerGroup: number, column: number) {
		this.send(`/composition/groups/${layerGroup}/columns/${column}/connect`, OscArgs.One);
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

		this.send(`/composition/groups/${layerGroup}/columns/${this.groupPos[layerGroup]}/connect`, OscArgs.One);
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

		this.send(`/composition/groups/${layerGroup}/columns/${this.groupPos[layerGroup]}/connect`, OscArgs.One);
	}

	public compNextCol(colMaxCompNext: number) {
		this.currentCompCol++;
		if (this.currentCompCol > colMaxCompNext) {
			this.currentCompCol = 1;
		}

		this.send(`/composition/columns/${this.currentCompCol}/connect`, OscArgs.One);
	}

	public compPrevCol(colMaxCompPrev: number) {
		this.currentCompCol--;
		if (this.currentCompCol < 1) {
			this.currentCompCol = colMaxCompPrev;
		}

		this.send(`/composition/columns/${this.currentCompCol}/connect`, OscArgs.One);
	}

	public layerNextCol(layerN: number, colMaxLayerN: number) {
		if (this.layerPos[layerN] == undefined) {
			this.layerPos[layerN] = 1;
		} else {
			this.layerPos[layerN]++;
		}
		if (this.layerPos[layerN] > colMaxLayerN) {
			this.layerPos[layerN] = 1;
		}

		this.send(`/composition/layers/${layerN}/clips/${this.layerPos[layerN]}/connect`, OscArgs.One);
	}

	public layerPrevCol(layerP: number, colMaxLayerP: number) {
		if (this.layerPos[layerP] == undefined) {
			this.layerPos[layerP] = 1;
		} else {
			this.layerPos[layerP]--;
		}
		if (this.layerPos[layerP] < 1) {
			this.layerPos[layerP] = colMaxLayerP;
		}

		this.send(`/composition/layers/${layerP}/clips/${this.layerPos[layerP]}/connect`, OscArgs.One);
	}

	public customOsc(customPath: string, oscType: string, customValue: string, relativeType?: string) {
		var args: OSCMetaArgument[] = [];
		switch (relativeType) {
			case '+':
				args.push({
					type: 's',
					value: '' + relativeType,
				});
				break;
			case '-':
				args.push({
					type: 's',
					value: '' + relativeType,
				});
				break;
			case '*':
				args.push({
					type: 's',
					value: '' + relativeType,
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
					value: parseInt(customValue),
				});
				break;
			case 'f':
				args.push({
					type: oscType,
					value: parseFloat(customValue),
				});
				break;
			case 's':
				args.push({
					type: oscType,
					value: '' + customValue,
				});
				break;
			case 'n':
			default:
				break;
		}
		this.send(customPath, args);
	}
}
