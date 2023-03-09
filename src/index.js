import { InstanceBase, Regex, runEntrypoint } from '@companion-module/base'
import { updateActions } from './actions.js'
import { upgrade_v1_0_4 } from './upgrades.js'

/**
 * Companion instance class for Resolume Arena.
 *
 * @extends InstanceBase
 * @author Oliver Herman <oliver@monoxane.com>
 * @author Keith Rocheck <keith.rocheck@gmail.com>
 */
class ResolumeArenaInstance extends InstanceBase {
	/**
	 * Create an instance of a Resolume Arena module.
	 *
	 * @param {Object} internal - Companion internals
	 */
	constructor(internal) {
		super(internal)

		this.updateActions = updateActions.bind(this)
	}

	/**
	 * Process an updated configuration array.
	 *
	 * @param {Object} config - the new configuration
	 * @access public
	 */
	async configUpdated(config) {
		this.config = config
	}

	/**
	 * Clean up the instance before it is destroyed.
	 *
	 * @access public
	 */
	async destroy() {
		this.log('debug', 'destroy', this.id)
	}

	/**
	 * Creates the configuration fields for web config.
	 *
	 * @returns {Array} the config fields
	 * @access public
	 */
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				tooltip: 'The IP of Resolume',
				width: 6,
				regex: Regex.IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port',
				width: 4,
				default: '7000',
				regex: Regex.PORT,
			},
		]
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 *
	 * @param {Object} config - the configuration
	 * @access public
	 */
	async init(config) {
		this.config = config
		this.groupPos = []
		this.currentCompCol = 0
		this.layerPos = []

		this.updateActions()

		this.updateStatus('ok')
	}

	/**
	 * Send an OSC command
	 *
	 * @param {string} cmd - the command
	 * @param {Object} arg - extra arguments
	 * @access protected
	 */
	sendCommand(cmd, arg) {
		if (cmd && this.config.host !== undefined && this.config.port !== undefined) {
			this.log('debug', `Sending command: ${cmd} ${arg?.value}`)
			this.oscSend(this.config.host, this.config.port, cmd, [arg])
		} else {
			this.log('debug', `Host, port, or command not defined: ${cmd}`)
		}
	}
}

runEntrypoint(ResolumeArenaInstance, [upgrade_v1_0_4])
