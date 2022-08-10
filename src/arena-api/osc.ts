import { OSCMetaArgument, OSCSomeArguments } from "../../../../instance_skel_types";

export type OscSendFunc = (host: string, port: number, path: string, args: OSCSomeArguments) => void;

export class OscArgs {
  public static One = {
    type: 'i' as 'i',
    value: 1
  }

  public static Zero = {
    type: 'i' as 'i',
    value: 0
  }
}
/*
function integerArg(value: number): OSCMetaArgument {
  return {
    type: 'i',
    value
  }
}
*/

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
    console.log(this._host, this._port, path, args);
    this._oscSend(this._host, this._port, path, args);
  }

  public connectClip(layer: number, column: number) {
    this.send(`/composition/layers/${layer}/clips/${column}/connect`, OscArgs.One);
  }

  public triggerColumn(column: number) {
    this.send(`/composition/columns/${column}/connect`, OscArgs.One);
  }

  public clearLayer(layer: number) {
    let path = `/composition/layers/${layer}/clear`
    this.send(path, OscArgs.One);
    this.send(path, OscArgs.Zero)
  }

  public clearAllLayers() {
    this.send('/composition/disconnectall', OscArgs.One);
  }

  public tempoTap() {
    this.send('/composition/tempocontroller/tempotap', OscArgs.One);
  }

  public groupNextCol(groupNext: number, colMaxGroupNext: number) {
    if (this.groupPos[groupNext] == undefined) {
      this.groupPos[groupNext] = 1;
    } else {
      this.groupPos[groupNext]++;
    }
    if (this.groupPos[groupNext] > colMaxGroupNext) {
      this.groupPos[groupNext] = 1;
    }

    this.send(`/composition/groups/${groupNext}//composition/columns/${this.groupPos[groupNext]}/connect`, OscArgs.One);
  }

  public groupPrevCol(groupPrev: number, colMaxGroupPrev: number) {
    if (this.groupPos[groupPrev] == undefined) {
      this.groupPos[groupPrev] = 1;
    } else {
      this.groupPos[groupPrev]--;
    }
    if (this.groupPos[groupPrev] < 1) {
      this.groupPos[groupPrev] = colMaxGroupPrev;
    }

    this.send(`/composition/groups/${groupPrev}//composition/columns/${this.groupPos[groupPrev]}/connect`, OscArgs.One);
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
      this.layerPos[layerN] ++;
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
      this.layerPos[layerP] --;
    }
    if (this.layerPos[layerP] < 1) {
      this.layerPos[layerP] = colMaxLayerP;
    }

    this.send(`/composition/layers/${layerP}/clips/${this.layerPos[layerP]}/connect`, OscArgs.One);
  }

  public customOsc(customPath: string, oscType: string, customValue: string) {
    var args: OSCMetaArgument[] = [];
    switch (oscType) {
      case 'i':
        args.push({
          type: 'i',
          value: parseInt(customValue)
        });
        break;
      case 'f':
        args.push({
          type: 'f',
          value: parseFloat(customValue)
        });
        break;
      case 's':
        args.push({
          type: 's',
          value: '' + customValue
        });
        break;
    }
    this.send(customPath, args);
  }

}