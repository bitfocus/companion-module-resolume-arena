import { CompanionSystem, OSCSomeArguments } from "../../../../instance_skel_types";

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

export class ArenaOscApi {
  private _host: string;
  private _port: number;
  private _oscSend: OscSendFunc;
//  private _system: CompanionSystem;

  constructor(host: string, port: number, oscSend: OscSendFunc, _system: CompanionSystem) {
    this._host = host;
    this._port = port;
    this._oscSend = oscSend;
//    this._system = system;
  }

  public send(path: string, args: OSCSomeArguments) {
    console.log(this._host, this._port, path, args);
    this._oscSend(this._host, this._port, path, args);
  }

  public connectClip(layer: number, column: number/*, value: string */) {
    // this._system.emit('variable_parse', value, (evaluatedValue: string) => {
    //   var args = [
    //     integerArg(parseInt(evaluatedValue))
    //   ];
      this.send(`/composition/layers/${layer}/clips/${column}/connect`, OscArgs.One);
  //  });
  }

  public triggerColumn(column: number) {
    this.send(`/composition/columns/${column}/connect`, OscArgs.One);
  }
}