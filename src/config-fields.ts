import { Regex, SomeCompanionConfigField } from '@companion-module/base'

export interface ResolumeArenaConfig {
	host: string
	port: number
	webapiPort: number
	useSSL: boolean
	useRest: boolean
	useCroppedThumbs: boolean
	useOscListener: boolean
	oscRxPort: number
}

export function configFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Resolume Host IP / hostname',
			width: 8,
			regex: Regex.HOSTNAME,
			default: '127.0.0.1',
		},
		{
			type: 'static-text',
			id: 'restHeader',
			label: '',
			value: '── REST / WebSocket API ──',
			width: 12,
		},
		{
			type: 'checkbox',
			id: 'useRest',
			label: 'Use REST / WebSocket API',
			width: 6,
			default: true,
		},
		{
			type: 'number',
			id: 'webapiPort',
			label: 'Resolume WebAPI Port',
			width: 6,
			min: 1,
			max: 65536,
			default: 8080,
			isVisible: (config) => !!config.useRest,
		},
		{
			type: 'checkbox',
			id: 'useSSL',
			label: 'Use SSL for web api calls',
			width: 6,
			default: false,
			isVisible: (config) => !!config.useRest,
		},
		{
			type: 'checkbox',
			id: 'useCroppedThumbs',
			label: 'Hide black banners on thumbnails (might be slower)',
			width: 6,
			default: false,
			isVisible: (config) => !!config.useRest,
		},
		{
			type: 'static-text',
			id: 'oscHeader',
			label: '',
			value: '── OSC ──',
			width: 12,
		},
		{
			type: 'number',
			id: 'port',
			label: 'OSC Send Port (Resolume listens on this port)',
			width: 6,
			min: 1,
			max: 65536,
			default: 7000,
		},
		{
			type: 'checkbox',
			id: 'useOscListener',
			label: 'Enable OSC Listener (receive Resolume OSC output)',
			width: 6,
			default: false,
		},
		{
			type: 'number',
			id: 'oscRxPort',
			label: 'OSC Receive Port (Resolume sends to this port)',
			width: 6,
			min: 1,
			max: 65536,
			default: 7001,
			isVisible: (config) => !!config.useOscListener,
		},
		{
			type: 'static-text',
			id: 'oscListenerHelp',
			label: '',
			value:
				'Configure Resolume Preferences > OSC: Enable OSC Output, set output destination to this machine IP, and set port to match the Receive Port above.',
			width: 12,
			isVisible: (config) => !!config.useOscListener,
		},
	]
}
