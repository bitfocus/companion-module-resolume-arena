import { Fields } from './setup.js'

/**
 * INTERNAL: Get the available actions.
 *
 * @access protected
 */
export function updateActions() {
	this.setActionDefinitions({
		triggerClip: {
			name: 'Start Clip',
			options: [Fields.Layer(), Fields.Column()],
			callback: ({ options }) => {
				let arg = {
					type: 'i',
					value: parseInt(1),
				}
				this.sendCommand(`/composition/layers/${options.layer}/clips/${options.column}/connect`, arg)
			},
		},
		triggerColumn: {
			name: 'Start Column',
			options: [Fields.Column()],
			callback: ({ options }) => {
				let arg = {
					type: 'i',
					value: parseInt(1),
				}
				this.currentCompCol = options.column
				this.sendCommand(`/composition/columns/${options.column}/connect`, arg)
			},
		},
		clearLayer: {
			name: 'Clear Layer',
			options: [Fields.Layer()],
			callback: ({ options }) => {
				let arg = {
					type: 'i',
					value: parseInt(1),
				}
				this.sendCommand(`/composition/layers/${options.layer}/clear`, arg)

				arg.value = parseInt(0)
				this.sendCommand(`/composition/layers/${options.layer}/clear`, arg)
			},
		},
		clearAll: {
			name: 'Clear All Layers',
			options: [],
			callback: () => {
				let arg = {
					type: 'i',
					value: parseInt(1),
				}
				this.sendCommand(`/composition/disconnectall`, arg)
			},
		},
		tempoTap: {
			name: 'Tap Tempo',
			options: [],
			callback: () => {
				let arg = {
					type: 'i',
					value: parseInt(1),
				}
				this.sendCommand(`/composition/tempocontroller/tempotap`, arg)
			},
		},
		grpNextCol: {
			name: 'Group Next Column',
			options: [Fields.Group('groupNext'), Fields.LastColumn('colMaxGroupNext')],
			callback: ({ options }) => {
				let arg = {
					type: 'i',
					value: parseInt(1),
				}
				if (this.groupPos[options.groupNext] == undefined) {
					this.groupPos[options.groupNext] = 1
				} else {
					this.groupPos[options.groupNext]++
				}
				if (this.groupPos[options.groupNext] > options.colMaxGroupNext) {
					this.groupPos[options.groupNext] = 1
				}

				this.sendCommand(
					`/composition/groups/${options.groupNext}/columns/${this.groupPos[options.groupNext]}/connect`,
					arg
				)
			},
		},
		grpPrvCol: {
			name: 'Group Previous Column',
			options: [Fields.Group('groupPrev'), Fields.LastColumn('colMaxGroupPrev')],
			callback: ({ options }) => {
				let arg = {
					type: 'i',
					value: parseInt(1),
				}
				if (this.groupPos[options.groupPrev] == undefined) {
					this.groupPos[options.groupPrev] = 1
				} else {
					this.groupPos[options.groupPrev]--
				}
				if (this.groupPos[options.groupPrev] < 1) {
					this.groupPos[options.groupPrev] = options.colMaxGroupPrev
				}

				this.sendCommand(
					`/composition/groups/${options.groupPrev}/columns/${this.groupPos[options.groupPrev]}/connect`,
					arg
				)
			},
		},
		compNextCol: {
			name: 'Composition Next Column',
			options: [Fields.LastColumn('colMaxCompNext')],
			callback: ({ options }) => {
				let arg = {
					type: 'i',
					value: parseInt(1),
				}
				this.currentCompCol++
				if (this.currentCompCol > options.colMaxCompNext) {
					this.currentCompCol = 1
				}

				this.sendCommand(`/composition/columns/${this.currentCompCol}/connect`, arg)
			},
		},
		compPrvCol: {
			name: 'Composition Previous Column',
			options: [Fields.LastColumn('colMaxCompPrev')],
			callback: ({ options }) => {
				let arg = {
					type: 'i',
					value: parseInt(1),
				}
				this.currentCompCol--
				if (this.currentCompCol < 1) {
					this.currentCompCol = options.colMaxCompPrev
				}

				this.sendCommand(`/composition/columns/${this.currentCompCol}/connect`, arg)
			},
		},
		layNextCol: {
			name: 'Layer Next Column',
			options: [Fields.Layer('layerN'), Fields.LastColumn('colMaxLayerN')],
			callback: ({ options }) => {
				let arg = {
					type: 'i',
					value: parseInt(1),
				}
				if (this.layerPos[options.layerN] == undefined) {
					this.layerPos[options.layerN] = 1
				} else {
					this.layerPos[options.layerN]++
				}
				if (this.layerPos[options.layerN] > options.colMaxLayerN) {
					this.layerPos[options.layerN] = 1
				}

				this.sendCommand(`/composition/layers/${options.layerN}/clips/${this.layerPos[options.layerN]}/connect`, arg)
			},
		},
		layPrvCol: {
			name: 'Layer Previous Column',
			options: [Fields.Layer('layerP'), Fields.LastColumn('colMaxLayerP')],
			callback: ({ options }) => {
				let arg = {
					type: 'i',
					value: parseInt(1),
				}
				if (this.layerPos[options.layerP] == undefined) {
					this.layerPos[options.layerP] = 1
				} else {
					this.layerPos[options.layerP]--
				}
				if (this.layerPos[options.layerP] < 1) {
					this.layerPos[options.layerP] = options.colMaxLayerP
				}

				this.sendCommand(`/composition/layers/${options.layerP}/clips/${this.layerPos[options.layerP]}/connect`, arg)
			},
		},
		custom: {
			name: 'Custom OSC Command',
			options: [
				{
					type: 'textinput',
					label: 'Custom OSC Path',
					id: 'customPath',
				},
				{
					type: 'dropdown',
					label: 'OSC Type Flag',
					id: 'oscType',
					tooltip: 'select the type of the value data',
					choices: [
						{ id: 'i', label: 'integer' },
						{ id: 'f', label: 'float' },
						{ id: 's', label: 'string' },
					],
					default: 'i',
				},
				{
					type: 'textinput',
					label: 'Value',
					id: 'customValue',
				},
			],
			callback: ({ options }) => {
				let arg

				switch (options.oscType) {
					case 'i':
						arg = {
							type: 'i',
							value: parseInt(options.customValue),
						}
						break
					case 'f':
						arg = {
							type: 'f',
							value: parseFloat(options.customValue),
						}
						break
					case 's':
						arg = {
							type: 's',
							value: '' + options.customValue,
						}
						break
				}
				if (arg) {
					this.sendCommand(options.customPath, arg)
				} else {
					this.log('error', 'Invalid type in custom OSC command')
				}
			},
		},
	})
}
