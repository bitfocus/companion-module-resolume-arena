import { CompanionActions, CompanionFeedbackEvent, SomeCompanionConfigField } from "../types/instance_skel_types";
import ArenaApi from "./arena-api/arena";
import { ClipStatus } from "./arena-api/child-apis/clip-options/ClipStatus";
import InstanceSkel from '../../../instance_skel';
import sleep from "./sleep";
import { LayerOptions } from "./arena-api/child-apis/layer-options/LayerOptions";

interface ResolumeArenaConfig {
  host: string;
  port: number;
  webapiPort: number;
  useSSL: boolean;
}

interface ClipSubscription {
  layer: number,
  column: number
}

class instance extends InstanceSkel<ResolumeArenaConfig> {
  private _api: ArenaApi | null = null;
  private isPolling: boolean = false;
  private connectedClips: Set<string> = new Set<string>();
  private clipStatusSubscriptions: Set<ClipSubscription> = new Set<ClipSubscription>();
  private clipConnectedSubscriptions: Set<ClipSubscription> = new Set<ClipSubscription>();
  private clipStatus: Map<string, LayerOptions> = new Map<string, LayerOptions>();
  private bypassedLayers: Set<number> = new Set<number>();
  private LayerBypassedSubscriptions: Set<number> = new Set<number>();

  constructor(system: any, id: any, config: any) {
    super(system, id, config);
    this.setupFeedback();
    this.setActions(this.actions);
    this.setupPresets();
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
          }
        ],
        callback: async ({ options }: { options: any }) =>
          await this._api?.Clips.connect(options.layer, options.column)
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
            type: 'dropdown',
            choices: [
              {
                id: 'on',
                label: 'On'
              },
              {
                id: 'off',
                label: 'Off'
              },
              {
                id: 'toggle',
                label: 'Toggle'
              }
            ],
            default: 'toggle',
            label: 'Bypass'
          }
        ],
        callback: async ({ options }: { options: any }) => {
          if (options.bypass == 'toggle') {
            var settings = (await this._api?.Layers.getSettings(options.layer)) as LayerOptions;
            await this._api?.Layers.updateSettings(options.layer, {
              bypassed: !settings.bypassed?.value
            })
          } else {
            await this._api?.Layers.updateSettings(options.layer, {
              bypassed: options.bypass == 'on'
            })
          }
        }
      },
      soloLayer: {
        label: 'Solo Layer',
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
            id: 'solo',
            type: 'dropdown',
            choices: [
              {
                id: 'on',
                label: 'On'
              },
              {
                id: 'off',
                label: 'Off'
              },
              {
                id: 'toggle',
                label: 'Toggle'
              }
            ],
            default: 'toggle',
            label: 'Solo'
          }
        ],
        callback: async ({ options }: { options: any }) => {
          if (options.bypass == 'toggle') {
            var settings = (await this._api?.Layers.getSettings(options.layer)) as LayerOptions;
            await this._api?.Layers.updateSettings(options.layer, {
              solo: !settings.solo?.value
            })
          } else {
            await this._api?.Layers.updateSettings(options.layer, {
              solo: options.solo == 'on'
            })
          }
        }
      },
      clearLayer: {
        label: 'Clear Layer',
        options: [
          {
            id: 'layer',
            type: 'number',
            label: 'Layer number',
            default: 1,
            min: 1,
            max: 65535
          }
        ],
        callback: async ({ options }: { options: any }) =>
          await this._api?.Layers.clear(options.layer)
      }
    }
  }

  setupFeedback() {
    this.setFeedbackDefinitions({
      connectedClip: {
        type: 'boolean',
        label: 'Connected Clip',
        style: {
          color: this.rgb(0, 0, 0),
          bgcolor: this.rgb(0, 255, 0),
        },
        options: [
          {
            id: 'layer',
            type: 'number',
            label: 'Layer',
            default: 1,
            min: 1,
            max: 65535
          },
          {
            id: 'column',
            type: 'number',
            label: 'Column',
            default: 1,
            min: 1,
            max: 65535
          }
        ],
        callback: (feedback: CompanionFeedbackEvent): boolean => {
          var layer = feedback.options.layer;
          var column = feedback.options.column;
          if (layer !== undefined && column !== undefined) {
            return this.connectedClips.has(`${layer}-${column}`);
          }
          return false;
        },
        subscribe: (feedback: CompanionFeedbackEvent) => {
          var layer = feedback.options.layer as number;
          var column = feedback.options.column as number;
          if (layer !== undefined && column !== undefined) {
            this.addClipConnectedSubscription(layer, column);
          }
        },
        unsubscribe: (feedback: CompanionFeedbackEvent) => {
          var layer = feedback.options.layer as number;
          var column = feedback.options.column as number;
          if (layer !== undefined && column !== undefined) {
            this.addClipConnectedSubscription(layer, column);
          }
        }
      },
      clipInfo: {
        type: 'advanced',
        label: 'Clip Info',
        options: [
          {
            id: 'layer',
            type: 'number',
            label: 'Layer',
            default: 1,
            min: 1,
            max: 65535
          },
          {
            id: 'column',
            type: 'number',
            label: 'Column',
            default: 1,
            min: 1,
            max: 65535
          }
        ],
        callback: (feedback: CompanionFeedbackEvent): {} => {
          var layer = feedback.options.layer;
          var column = feedback.options.column;
          if (layer !== undefined && column !== undefined) {
            var status = this.clipStatus.get(`${layer}-${column}`);
            return {
              text: status?.name?.value
            };
          }
          return {
            text: 'not found'
          };
        },
        subscribe: (feedback: CompanionFeedbackEvent) => {
          var layer = feedback.options.layer as number;
          var column = feedback.options.column as number;
          if (layer !== undefined && column !== undefined) {
            this.addClipStatusSubscription(layer, column);
          }
        },
        unsubscribe: (feedback: CompanionFeedbackEvent) => {
          var layer = feedback.options.layer as number;
          var column = feedback.options.column as number;
          if (layer !== undefined && column !== undefined) {
            this.removeClipStatusSubscription(layer, column);
          }
        }
      },
      layerBypassed: {
        type: 'boolean',
        label: 'Layer Bypassed',
        style: {
          color: this.rgb(0, 0, 0),
          bgcolor: this.rgb(255, 0, 0),
        },
        options: [
          {
            id: 'layer',
            type: 'number',
            label: 'Layer',
            default: 1,
            min: 1,
            max: 65535
          }
        ],
        callback: (feedback: CompanionFeedbackEvent): boolean => {
          var layer = feedback.options.layer;
          if (layer !== undefined) {
            return this.bypassedLayers.has(layer as number);
          }
          return false;
        },
        subscribe: (feedback: CompanionFeedbackEvent) => {
          var layer = feedback.options.layer as number;
          if (layer !== undefined) {
            this.addLayerBypassedSubscription(layer);
          }
        },
        unsubscribe: (feedback: CompanionFeedbackEvent) => {
          var layer = feedback.options.layer as number;
          if (layer !== undefined) {
            this.addLayerBypassedSubscription(layer);
          }
        }
      }
    });
  }

  setupPresets() {
    this.setPresetDefinitions([
      {
        category: 'Commands',
        label: 'Stinger',
        bank: {
          style: 'text',
          size: '18',
          text: 'Stinger Clip',
          color: this.rgb(255, 255, 255),
          bgcolor: this.rgb(0, 0, 0)
        },
        actions: [{
          action: 'connectClip',
          options: {
            layer: '1',
            column: '1',
          }
        }],
        feedbacks: [
          {
            type: 'connectedClip',
            options: {
              layer: '1',
              column: '1',
            }
          },
          {
            type: 'clipInfo',
            options: {
              layer: '1',
              column: '1',
            }
          }
        ]
      }
    ]);
  }

  addLayerBypassedSubscription(layer: number) {
    this.LayerBypassedSubscriptions.add(layer);
    this.pollStatus();
    this.checkFeedbacks();
  }

  removeLayerBypassedSubscription(layer: number) {
    this.LayerBypassedSubscriptions.delete(layer);
  }

  addClipConnectedSubscription(layer: number, column: number) {
    this.clipConnectedSubscriptions.add({ layer, column });
    this.pollStatus();
    this.checkFeedbacks();
  }

  removeClipConnectedSubscription(layer: number, column: number) {
    for (var clip of this.clipConnectedSubscriptions) {
      if (clip.layer == layer && clip.column == column) {
        this.clipConnectedSubscriptions.delete(clip);
        break;
      }
    }
  }

  addClipStatusSubscription(layer: number, column: number) {
    this.clipStatusSubscriptions.add({ layer, column });
    this.pollStatus();
    this.checkFeedbacks();
  }

  removeClipStatusSubscription(layer: number, column: number) {
    for (var clip of this.clipStatusSubscriptions) {
      if (clip.layer == layer && clip.column == column) {
        this.clipStatusSubscriptions.delete(clip);
        break;
      }
    }
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
          await this.pollClips();
          await this.pollLayers();
        }
        catch (e: any) {
          this.status(this.STATUS_ERROR, e.message);
        }
        await sleep(500);
      }
    }
    finally {
      this.isPolling = false;
    }
  }

  async pollLayers() {
    try {
      for (var layer of this.LayerBypassedSubscriptions) {
        var status = (await this._api?.Layers.getSettings(layer)) as LayerOptions;
        if (status.bypassed?.value) {
          this.bypassedLayers.add(layer);
          this.checkFeedbacks();
        } else {
          this.bypassedLayers.delete(layer);
          this.checkFeedbacks();
        }
      }
    }
    catch (e) {
      console.log(e);
    }
  }

  async pollClips() {
    var clips = new Set<ClipSubscription>();

    for (var clip of this.clipStatusSubscriptions) {
      clips.add(clip);
    }
    for (var clip of this.clipConnectedSubscriptions) {
      clips.add(clip);
    }
    for (var clip of clips) {
      var status = (await this._api?.Clips.getStatus(clip.layer, clip.column)) as ClipStatus;
      var isConnected = status.connected.value === 'Connected';
      var key = `${clip.layer}-${clip.column}`;
      this.clipStatus.set(key, status as {});
      if (isConnected) {
        if (!this.connectedClips.has(key)) {
          this.connectedClips.add(key);
          this.checkFeedbacks();
        }
      } else {
        if (this.connectedClips.has(key)) {
          this.connectedClips.delete(key);
          this.checkFeedbacks();
        }
      }
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