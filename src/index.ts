import { CompanionActions, SomeCompanionConfigField } from "../types/instance_skel_types";
import ArenaApi from "./arena-api/arena";
import InstanceSkel from '../../../instance_skel';
import sleep from "./sleep";

interface ResolumeArenaConfig {
  host: string;
  port: number;
  webapiPort: number;
  useSSL: boolean;
}

class instance extends InstanceSkel<ResolumeArenaConfig> {
  private _api: ArenaApi | null = null;
  private isPolling: boolean = false;

  constructor(system: any, id: any, config: any) {
    super(system, id, config);
    this.setupFeedback();
    this.setActions(this.actions);
  }

  /**
   * Provide a simple return 
   * of the necessary fields for the 
   * instance configuration screen.
   * @return {object[]}
   */
  config_fields(): SomeCompanionConfigField[] {
    return [
      {
        type: 'textinput',
        id: 'host',
        label: 'Resolume Host IP',
        width: 8,
        regex: this.REGEX_IP
      },
      {
        type: 'number',
        id: 'port',
        label: 'Resolume OSC Port',
        width: 6,
        min: 1,
        max: 65536,
        default: 7000
      },
      {
        type: 'checkbox',
        id: 'useSSL',
        label: 'Use SSL for web api calls',
        width: 6,
        default: false
      },
      {
        type: 'number',
        id: 'webapiPort',
        label: 'Resolume WebAPI Port',
        width: 6,
        min: 1,
        max: 65536,
        default: 8080
      },
    ];
  }

  get actions(): CompanionActions {
    return {
      connectClip: {
        label: 'Connect Clip',
        options: [
          {
            id: 'layer',
            type: 'number',
            label: 'Layer number',
            default: 1,
            min: 1,
            max: 65535
          },
          {
            id: 'column',
            type: 'number',
            label: 'Column number',
            default: 1,
            min: 1,
            max: 65535
          },
          {
            id: 'connect',
            type: 'checkbox',
            label: 'Connect',
            default: true
          }
        ],
        callback: async ({ options }: { options: any }) =>
          await this._api?.Clips.connect(options.layer, options.column, options.connect)
      },
      selectClip: {
        label: 'Select Clip',
        options: [
          {
            id: 'layer',
            type: 'number',
            label: 'Layer number',
            default: 1,
            min: 1,
            max: 65535
          },
          {
            id: 'column',
            type: 'number',
            label: 'Column number',
            default: 1,
            min: 1,
            max: 65535
          }
        ],
        callback: async ({ options }: { options: any }) =>
          await this._api?.Clips.select(options.layer, options.column)
      },
      bypassLayer: {
        label: 'Bypass Layer',
        options: [
          {
            id: 'layer',
            type: 'number',
            label: 'Layer number',
            default: 1,
            min: 1,
            max: 65535
          },
          {
            id: 'bypass',
            type: 'checkbox',
            label: 'Bypass',
            default: true
          }
        ],
        callback: async ({ options }: { options: any }) =>
          await this._api?.Layers.updateSettings(options.layer, {
            bypassed: options.bypass
          })
      }
    }
  }

  setupFeedback() {

  }

  /**
   * When the instance configuration is saved by the user, 
   * this update will fire with the new configuration
   * @param {BarcoClickShareConfig} config
   * @return {void}
   */
  updateConfig(config: ResolumeArenaConfig): void {
    this.config = config;
    this.restartApi();
  }

  /**
   * Main initialization function called once the module is 
   * OK to start doing things. Principally, this is when 
   * the module should establish a connection to the device.
   * @return {void}
   */
  init(): void {
    this.restartApi();
    this.subscribeFeedbacks();
  }

  private restartApi() {
    const config = this.config;
    this._api = new ArenaApi(config.host, config.webapiPort, config.useSSL);
    this.pollStatus();
  }
  /**
   * Clean up the instance before it is destroyed. 
   * This is called both on shutdown and when an instance 
   * is disabled or deleted. Destroy any timers and socket
   * connections here.
   * @return {void}
   */
  destroy(): void {
    this._api = null;
  }

  /**
 * Poll for in use status continuously until there are 
 * no more subscriptions or until the module is destroyed
 * @return {void}
 */
  private async pollStatus() {
    if (this.isPolling) {
      return;
    }
    this.isPolling = true;
    try {
      // loop until we don't need to poll any more
      console.log('polling for status');
      while (this._api) {
        // check the status via the api
        try {
          /*let status =*/ await this._api.productInfo();
          //          console.log(status)
          this.status(this.STATUS_OK);
          // if (this.isInUse !== status.inUse) {
          //   // status changed
          //   this.isInUse = status.inUse;
          //   this.checkFeedbacks('available', 'inUse', 'idle');
          // }
          // if (this.isSharing !== status.sharing) {
          //   // status changed
          //   this.isSharing = status.sharing;
          //   this.checkFeedbacks('available', 'sharing');
          // }
        }
        catch (e: any) {
          this.status(this.STATUS_ERROR, e.message);
        }
        await sleep(750);
      }
    }
    finally {
      this.isPolling = false;
    }
  }

}

/*
function instance(system, id, config) {
  var self = this;

  // super-constructor
  instance_skel.apply(this, arguments);

  self.actions(); // export actions

  return self;
}

instance.GetUpgradeScripts = function() {
  return [
    function (context, config, actions, feedbacks) {
      let changed = false
	
      let checkUpgrade = (action, changed) => {
        if (action.action == 'custom') {
          if (action.options.customCmd !== undefined) {
            action.options.customPath = action.options.customCmd
            delete action.options.customCmd
            changed = true
          }
        }
	
        return changed
      }
	
      for (let k in actions) {
        changed = checkUpgrade(actions[k], changed)
      }
  	
      return changed
    }
  ]
}

instance.prototype.updateConfig = function(config) {
  var self = this;

  self.config = config;
};

instance.prototype.init = function() {
  var self = this;

  self.status(self.STATE_OK);

  debug = self.debug;
  log = self.log;
};

// Return config fields for web config
instance.prototype.config_fields = function () {
  var self = this;
  return [
    {
      type: 'textinput',
      id: 'host',
      label: 'Resolume Host IP',
      width: 8,
      regex: self.REGEX_IP
    },
    {
      type: 'textinput',
      id: 'port',
      label: 'Resolume Port',
      width: 4,
      regex: self.REGEX_PORT,
      default: '7000'
    }
  ]
};

// When module gets deleted
instance.prototype.destroy = function() {
  var self = this;
  debug("destroy");
};

instance.prototype.actions = function(system) {
  var self = this;
  self.setActions({
    'triggerClip': {
      label: 'Start Clip',
      options: [
        {
          type: 'number',
          label: 'Layer',
          id: 'layer',
          min: 1,
          max: 100,
          default: 1,
          required: true
        },
        {
          type: 'number',
          label: 'Column',
          id: 'column',
          min: 1,
          max: 100,
          default: 1,
          required: true
        }
      ]
    },
    'triggerColumn': {
      label: 'Start Column',
      options: [
        {
          type: 'number',
          label: 'Column',
          id: 'column',
          min: 1,
          max: 100,
          default: 1,
          required: true
        }
      ]
    },
    'clearLayer': {
      label: 'Clear Layer',
      options: [
        {
          type: 'textinput',
          label: 'Layer',
          id: 'layer',
          default: '1',
        }
      ]
    },
    'clearAll': {
      label: 'Clear All Layers',
    },
    'tempoTap': {
      label: 'Tap Tempo',
    },
    'grpNextCol': {
      label: 'Group Next Column',
      options: [
        {
          type: 'number',
          label: 'Group Number',
          id: 'groupNext',
          min: 1,
          max: 100,
          default: 1,
          required: true
        },
        {
          type: 'number',
          label: 'Last Column',
          id: 'colMaxGroupNext',
          min: 1,
          max: 100,
          default: 4,
          required: true
        }
      ]
    },
    'grpPrvCol': {
      label: 'Group Previous Column',
      options: [
        {
          type: 'number',
          label: 'Group Number',
          id: 'groupPrev',
          min: 1,
          max: 100,
          default: '1',
          required: true
        },
        {
          type: 'number',
          label: 'Last Column',
          id: 'colMaxGroupPrev',
          min: 1,
          max: 100,
          default: '4',
          required: true
        }
      ]
    },
    'compNextCol': {
      label: 'Composition Next Column',
      options: [
        {
          type: 'number',
          label: 'Last (max) Column',
          id: 'colMaxCompNext',
          min: 1,
          max: 100,
          default: '4',
          required: true
        }
      ]
    },
    'compPrvCol': {
      label: 'Composition Previous Column',
      options: [
        {
          type: 'number',
          label: 'Last (max) Column',
          id: 'colMaxCompPrev',
          min: 1,
          max: 100,
          default: '4',
          required: true
        }
      ]
    },
    'layNextCol': {
      label: 'Layer Next Column',
      options: [
        {
          type: 'number',
          label: 'Layer Number',
          id: 'layerN',
          min: 1,
          max: 100,
          default: '1',
          required: true
        },
        {
          type: 'number',
          label: 'Last (max) Column',
          id: 'colMaxLayerN',
          min: 1,
          max: 100,
          default: '4',
          required: true
        }
      ]
    },
    'layPrvCol': {
      label: 'Layer Previous Column',
      options: [
        {
          type: 'number',
          label: 'Layer Number',
          id: 'layerP',
          min: 1,
          max: 100,
          default: '1',
          required: true
        },
        {
          type: 'number',
          label: 'Last (max) Column',
          id: 'colMaxLayerP',
          min: 1,
          max: 100,
          default: '4',
          required: true
        }
      ]
    },
    'custom': {
      label: 'Custom OSC Command',
      options: [
        {
          type:  'textinput',
          label: 'Custom OSC Path',
          id:    'customPath',
        },
        {
          type:  'dropdown',
          label: 'OSC Type Flag',
          id:    'oscType',
          tooltip: 'select the type of the value data',
          choices: [
            { id: 'i', label: 'integer' },
            { id: 'f', label: 'float' },
            { id: 's', label: 'string' }
          ]
        },
        {
          type:  'textinput',
          label: 'Value',
          id:    'customValue'
        }
      ]
    }

  });
}

instance.prototype.action = function(action) {
  var self = this;


  debug('action: ', action);

  if (action.action == 'triggerClip') {
    var bol = {
      type: "i",
      value: parseInt(1)
    };
    debug('sending',self.config.host, self.config.port, '/composition/layers/' + action.options.layer + '/clips/' + action.options.column + '/connect', [ bol ]);
    self.oscSend(self.config.host, self.config.port, '/composition/layers/' + action.options.layer + '/clips/' + action.options.column + '/connect', [ bol ])
  }

  if (action.action == 'triggerColumn') {
    var bol = {
        type: "i",
        value: parseInt(1)
    };
    currentCompCol = action.options.column;

    debug('sending',self.config.host, self.config.port, '/composition/columns/' + action.options.column + '/connect', [ bol ]);
    self.oscSend(self.config.host, self.config.port, '/composition/columns/' + action.options.column + '/connect', [ bol ])
  }


  if (action.action == 'clearLayer') {
    var bol = {
      type: "i",
      value: parseInt(1)
    };
    debug('sending',self.config.host, self.config.port, '/composition/layers/' + action.options.layer + '/clear', [ bol ]);
    self.oscSend(self.config.host, self.config.port, '/composition/layers/' + action.options.layer + '/clear', [ bol ]);
    //sending second command with value 0 to reset the layer, else this command only works one time
    var bol = {
      type: "i",
      value: parseInt(0)
    };
    debug('sending',self.config.host, self.config.port, '/composition/layers/' + action.options.layer + '/clear', [ bol ]);
    self.oscSend(self.config.host, self.config.port, '/composition/layers/' + action.options.layer + '/clear', [ bol ])
  }

  if (action.action == 'clearAll') {
    var bol = {
      type: "i",
      value: parseInt(1)
    };
    debug('sending',self.config.host, self.config.port, '/composition/disconnectall', [ bol ]);
    self.oscSend(self.config.host, self.config.port, '/composition/disconnectall', [ bol ])
  }

  if (action.action == 'tempoTap') {
    var bol = {
      type: "i",
      value: parseInt(1)
    };
    debug('sending',self.config.host, self.config.port, '/composition/tempocontroller/tempotap', [ bol ]);
    self.oscSend(self.config.host, self.config.port, '/composition/tempocontroller/tempotap', [ bol ])
  }

  if (action.action == 'custom') { 
    var args = [];
    if(action.options.oscType == 'i') {
      args = [{
        type: 'i',
        value: parseInt(action.options.customValue)
      }];
    } else if(action.options.oscType == 'f') {
      args = [{
        type: 'f',
        value: parseFloat(action.options.customValue)
      }];
    } else if(action.options.oscType == 's') {
      args = [{
        type: 's',
        value: '' + action.options.customValue
      }];
    }
    debug('sending',self.config.host, self.config.port, action.options.customPath );
    self.oscSend(self.config.host, self.config.port, action.options.customPath, args)
  }
  if (action.action == 'grpNextCol') {
    var bol = {
      type: 'i',
      value: '1'
    };
    if (groupPos[action.options.groupNext] == undefined) {
      groupPos[action.options.groupNext] = 1;
    } else {
      groupPos[action.options.groupNext] ++;
    }
    if (groupPos[action.options.groupNext] > action.options.colMaxGroupNext) {
      groupPos[action.options.groupNext] = 1;
    }

    debug('sending', self.config.host, self.config.port, '/composition/groups/' + action.options.groupNext + '//composition/columns/' + groupPos[action.options.groupNext] + '/connect');
    self.oscSend(self.config.host, self.config.port, '/composition/groups/' + action.options.groupNext + '//composition/columns/' + groupPos[action.options.groupNext] + '/connect', [ bol ])
  }
  if (action.action == 'grpPrvCol') {
    var bol = {
      type: 'i',
      value: '1'
    };

    if (groupPos[action.options.groupPrev] == undefined) {
      groupPos[action.options.groupPrev] = 1;
    } else {
      groupPos[action.options.groupPrev] --;
    }
    if (groupPos[action.options.groupPrev] < 1) {
      groupPos[action.options.groupPrev] = action.options.colMaxGroupPrev;
    }

    debug('sending', self.config.host, self.config.port, '/composition/groups/' + action.options.groupPrev + '//composition/columns/' + groupPos[action.options.groupPrev] + '/connect');
    self.oscSend(self.config.host, self.config.port, '/composition/groups/' + action.options.groupPrev + '//composition/columns/' + groupPos[action.options.groupPrev] + '/connect', [ bol ])
  }
  if (action.action == 'compNextCol') {
    var bol = {
      type: 'i',
      value: '1'
    };
    currentCompCol ++;
    if ( currentCompCol > action.options.colMaxCompNext ) {
      currentCompCol = 1;
    }

    debug('sending', self.config.host, self.config.port, '/composition/columns/' + currentCompCol + '/connect');
    self.oscSend(self.config.host, self.config.port, '/composition/columns/' + currentCompCol + '/connect', [ bol ])
  }
  if (action.action == 'compPrvCol') {
    var bol = {
      type: 'i',
      value: '1'
    };
    currentCompCol --;
    if ( currentCompCol < 1 ) {
      currentCompCol = action.options.colMaxCompPrev;
    }

    debug('sending', self.config.host, self.config.port, '/composition/columns/' + currentCompCol + '/connect');
    self.oscSend(self.config.host, self.config.port, '/composition/columns/' + currentCompCol + '/connect', [ bol ])
  }
  if (action.action == 'layNextCol') {
    var bol = {
      type: 'i',
      value: '1'
    };
    if (layerPos[action.options.layerN] == undefined) {
      layerPos[action.options.layerN] = 1;
    } else {
      layerPos[action.options.layerN] ++;
    }
    if (layerPos[action.options.layerN] > action.options.colMaxLayerN) {
      layerPos[action.options.layerN] = 1;
    }
    debug('sending', self.config.host, self.config.port, '/composition/layers/' + action.options.layerN + '/clips/' + layerPos[action.options.layerN] + '/connect');
    self.oscSend(self.config.host, self.config.port, '/composition/layers/' + action.options.layerN + '/clips/' + layerPos[action.options.layerN] + '/connect', [ bol ])
  }
  if (action.action == 'layPrvCol') {
    var bol = {
      type: 'i',
      value: '1'
    };
    if (layerPos[action.options.layerP] == undefined) {
      layerPos[action.options.layerP] = 1;
    } else {
      layerPos[action.options.layerP] --;
    }
    if (layerPos[action.options.layerP] < 1) {
      layerPos[action.options.layerP] = action.options.colMaxLayerP;
    }
    debug('sending', self.config.host, self.config.port, '/composition/layers/' + action.options.layerP + '/clips/' + layerPos[action.options.layerP] + '/connect');
    self.oscSend(self.config.host, self.config.port, '/composition/layers/' + action.options.layerP + '/clips/' + layerPos[action.options.layerP] + '/connect', [ bol ])
  }
};

*/

exports = module.exports = instance;