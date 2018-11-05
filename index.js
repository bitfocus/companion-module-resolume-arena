var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
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
			regex: self.REGEX_PORT
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
	self.system.emit('instance_actions', self.id, {
		'triggerClip': {
			label: 'Start Clip',
			options: [
				{
					 type: 'textinput',
					 label: 'Layer',
					 id: 'layer',
					 default: '1'
				},
        {
           type: 'textinput',
           label: 'Column',
           id: 'column',
           default: '1'
        }
			]
		},
    'triggerColumn': {
      label: 'Start Column',
      options: [
        {
           type: 'textinput',
           label: 'Column',
           id: 'column',
           default: '1'
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
    'temptoTap': {
      label: 'Tap Tempo',
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
		self.system.emit('osc_send', self.config.host, self.config.port, '/composition/layers/' + action.options.layer + '/clips/' + action.options.column + '/connect', [ bol ])
	}

  if (action.action == 'triggerColumn') {
    var bol = {
        type: "i",
        value: parseInt(1)
    };
    debug('sending',self.config.host, self.config.port, '/composition/columns/' + action.options.column + '/connect', [ bol ]);
    self.system.emit('osc_send', self.config.host, self.config.port, '/composition/columns/' + action.options.column + '/connect', [ bol ])
  }


  if (action.action == 'clearLayer') {
    var bol = {
        type: "i",
        value: parseInt(1)
    };
		debug('sending',self.config.host, self.config.port, '/composition/layers/' + action.options.layer + '/clear', [ bol ]);
		self.system.emit('osc_send', self.config.host, self.config.port, '/composition/layers/' + action.options.layer + '/clear', [ bol ])
	}

  if (action.action == 'clearAll') {
    var bol = {
        type: "i",
        value: parseInt(1)
    };
    debug('sending',self.config.host, self.config.port, '/composition/disconnectall', [ bol ]);
    self.system.emit('osc_send', self.config.host, self.config.port, '/composition/disconnectall', [ bol ])
  }

  if (action.action == 'tempoTap') {
    var bol = {
        type: "i",
        value: parseInt(1)
    };
    debug('sending',self.config.host, self.config.port, '/composition/tempocontroller/tempotap', [ bol ]);
    self.system.emit('osc_send', self.config.host, self.config.port, '/composition/tempocontroller/tempotap', [ bol ])
  }
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
