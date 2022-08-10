import { CompanionActions, CompanionFeedbackEvent, SomeCompanionConfigField } from "../types/instance_skel_types";
import ArenaRestApi from "./arena-api/rest";
import ArenaOscApi from "./arena-api/osc";
import { ClipStatus } from "./arena-api/child-apis/clip-options/ClipStatus";
import InstanceSkel from '../../../instance_skel';
import sleep from "./sleep";
import { LayerOptions } from "./arena-api/child-apis/layer-options/LayerOptions";
import { configFields, ResolumeArenaConfig } from "./config-fields";
import { connectClip } from './actions/connect-clip';
import { selectClip } from './actions/select-clip';
import { bypassLayer } from './actions/bypass-layer';
import { soloLayer } from './actions/solo-layer';
import { clearLayer } from './actions/clear-layer';
import { clearAllLayers } from './actions/clear-all-layers';
import { triggerColumn } from "./actions/trigger-column";
import { tempoTap } from "./actions/tempo-tap";
import { groupNextCol } from "./actions/group-next-col";
import { groupPrevCol } from "./actions/group-prev-col";

interface ClipSubscription {
  layer: number,
  column: number
}

class instance extends InstanceSkel<ResolumeArenaConfig> {
  private _restApi: ArenaRestApi | null = null;
  private _oscApi: ArenaOscApi | null = null;
  private isPolling: boolean = false;
  private connectedClips: Set<string> = new Set<string>();
  private clipStatusSubscriptions: Set<ClipSubscription> = new Set<ClipSubscription>();
  private clipThumbSubscriptions: Set<string> = new Set<string>();
  private clipConnectedSubscriptions: Set<ClipSubscription> = new Set<ClipSubscription>();
  private clipStatus: Map<string, ClipStatus> = new Map<string, ClipStatus>();
  private clipThumbs: Map<string, string> = new Map<string, string>();
  private clipNames: Map<string, string> = new Map<string, string>();
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
    return configFields(this);
  }

  getRestApi(): ArenaRestApi | null {
    return this._restApi;
  }

  getOscApi(): ArenaOscApi | null {
    return this._oscApi;
  }

  get actions(): CompanionActions {
    var restApi = this.getRestApi.bind(this);
    var oscApi = this.getOscApi.bind(this);
    var actions: CompanionActions = {
      bypassLayer: bypassLayer(restApi, oscApi),
      clearAll: clearAllLayers(restApi, oscApi),
      clearLayer: clearLayer(restApi, oscApi),
      grpNextCol: groupNextCol(restApi, oscApi),
      grpPrevCol: groupPrevCol(restApi, oscApi),
      selectClip: selectClip(restApi, oscApi),
      soloLayer: soloLayer(restApi, oscApi),
      tempoTap: tempoTap(restApi, oscApi),
      triggerClip: connectClip(restApi, oscApi),
      triggerColumn: triggerColumn(restApi, oscApi),
    }
    return actions;
  }

  setupFeedback() {
    if (this._restApi) {
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
            },
            {
              id: 'showThumb',
              type: 'checkbox',
              label: 'Thumbnail',
              default: false
            }
          ],
          callback: (feedback: CompanionFeedbackEvent): {} => {
            var layer = feedback.options.layer;
            var column = feedback.options.column;
            if (layer !== undefined && column !== undefined) {
              var key = `${layer}-${column}`;
              var name = this.clipNames.get(key);
              var result: {
                text: string | undefined,
                png64: string | undefined
              } = {
                text: name,
                png64: undefined
              };
              if (feedback.options.showThumb) {
                result.png64 = this.clipThumbs.get(key);
              }
              return result;
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
              if (feedback.options.showThumb) {
                this.addClipThumbSubscription(layer, column);
              } else {
                this.removeClipThumbSubscription(layer, column);
              }
            }
          },
          unsubscribe: (feedback: CompanionFeedbackEvent) => {
            var layer = feedback.options.layer as number;
            var column = feedback.options.column as number;
            if (layer !== undefined && column !== undefined) {
              this.removeClipStatusSubscription(layer, column);
              this.removeClipThumbSubscription(layer, column);
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
    } else {
      this.setFeedbackDefinitions({});
    }
  }

  setupPresets() {
    if (this._restApi) {
      this.setPresetDefinitions([
        {
          category: 'Commands',
          label: 'Play Clip',
          bank: {
            style: 'text',
            size: '18',
            text: 'Play Clip',
            color: this.rgb(255, 255, 255),
            bgcolor: this.rgb(0, 0, 0)
          },
          actions: [{
            action: 'triggerClip',
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
    else {
      this.setPresetDefinitions([]);
    }
  }

  addLayerBypassedSubscription(layer: number) {
    this.LayerBypassedSubscriptions.add(layer);
    this.pollStatus();
    this.checkFeedbacks('layerBypassed');
  }

  removeLayerBypassedSubscription(layer: number) {
    this.LayerBypassedSubscriptions.delete(layer);
  }

  addClipConnectedSubscription(layer: number, column: number) {
    this.clipConnectedSubscriptions.add({ layer, column });
    this.pollStatus();
    this.checkFeedbacks('connectedClip');
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
    this.checkFeedbacks('clipInfo');
  }

  removeClipStatusSubscription(layer: number, column: number) {
    for (var clip of this.clipStatusSubscriptions) {
      if (clip.layer == layer && clip.column == column) {
        this.clipStatusSubscriptions.delete(clip);
        break;
      }
    }
  }

  addClipThumbSubscription(layer: number, column: number) {
    this.clipThumbSubscriptions.add(`${layer}-${column}`);
    this.pollStatus();
    this.checkFeedbacks('clipInfo');
  }

  removeClipThumbSubscription(layer: number, column: number) {
    this.clipThumbSubscriptions.delete(`${layer}-${column}`);
  }

  /**
   * When the instance configuration is saved by the user, 
   * this update will fire with the new configuration
   * @param {BarcoClickShareConfig} config
   * @return {void}
   */
  updateConfig(config: ResolumeArenaConfig): void {
    this.config = config;
    this.restartApis();
  }

  /**
   * Main initialization function called once the module is 
   * OK to start doing things. Principally, this is when 
   * the module should establish a connection to the device.
   * @return {void}
   */
  init(): void {
    this.restartApis();
    this.subscribeFeedbacks();
  }

  private restartApis() {
    const config = this.config;
    if (config.webapiPort) {
      this._restApi = new ArenaRestApi(config.host, config.webapiPort, config.useSSL);
    } else {
      this._restApi = null;
    }
    if (config.port) {
      this._oscApi = new ArenaOscApi(config.host, config.port, this.oscSend.bind(this), this.system);
    } else {
      this._oscApi = null;
    }
    this.setupFeedback();
    this.setActions(this.actions);
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
    this._restApi = null;
    this._oscApi = null;
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
      while (this._restApi) {
        // check the status via the api
        try {
          // only poll status if there are no other subscriptions
          if (this.hasPollingSubscriptions) {
            await this._restApi?.productInfo();
          }
          await this.pollClips();
          await this.pollLayers();
          this.status(this.STATUS_OK);
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

  get hasPollingSubscriptions(): boolean {
    return this.LayerBypassedSubscriptions.size > 0 ||
      this.clipConnectedSubscriptions.size > 0 ||
      this.clipStatusSubscriptions.size > 0;
  }

  async pollLayers() {
    try {
      if (this.LayerBypassedSubscriptions.size > 0) {
        for (var layer of this.LayerBypassedSubscriptions) {
          var status = (await this._restApi?.Layers.getSettings(layer)) as LayerOptions;
          if (status.bypassed?.value) {
            this.bypassedLayers.add(layer);
          } else {
            this.bypassedLayers.delete(layer);
          }
        }
        this.checkFeedbacks('layerBypassed');
      }
    }
    catch (e) {
      console.log(e);
    }
  }

  async pollClips() {
    var clips = new Set<ClipSubscription>();
    // combine sets
    for (var clip of this.clipStatusSubscriptions) {
      clips.add(clip);
    }
    for (var clip of this.clipConnectedSubscriptions) {
      clips.add(clip);
    }
    if (clips.size > 0) {
      let connectedChanged = false;
      let nameChanged = false;
      let thumbChanged = false;
      for (var clip of clips) {
        var key = `${clip.layer}-${clip.column}`;
        var status = (await this._restApi?.Clips.getStatus(clip.layer, clip.column)) as ClipStatus;
        var name = status?.name?.value;
        this.clipStatus.set(key, status);
        if (name !== this.clipNames.get(key)) {
          this.clipNames.set(key, name);
          nameChanged = true;
        }
        var isConnected = status?.connected.value === 'Connected';
        if (isConnected) {
          if (!this.connectedClips.has(key)) {
            connectedChanged = true;
            this.connectedClips.add(key);
          }
        } else {
          if (this.connectedClips.has(key)) {
            connectedChanged = true;
            this.connectedClips.delete(key);
          }
        }
        if (nameChanged && this.clipThumbSubscriptions.has(key)) {
          this.clipThumbs.set(key, await this._restApi?.Clips.getThumb(clip.layer, clip.column) ?? '');
          thumbChanged = true;
        }
      }
      if (connectedChanged) {
        this.checkFeedbacks('connectedClip');
      }
      if (nameChanged || thumbChanged) {
        this.checkFeedbacks('clipInfo');
      }
    }

  }
}

/*
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

instance.prototype.actions = function(system) {
  var self = this;
  self.setActions({
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