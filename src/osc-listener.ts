import {InstanceStatus} from '@companion-module/base'
import type {ResolumeArenaModuleInstance} from './index'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const osc = require('osc') as {
	UDPPort: new (options: {localAddress: string; localPort: number; metadata: boolean}) => OscUDPPort
}

interface OscUDPPort {
	on(event: 'message', callback: (msg: OscMessage, timeTag: unknown, info: unknown) => void): void
	on(event: 'error', callback: (err: {code?: string; message: string}) => void): void
	on(event: 'ready', callback: () => void): void
	open(): void
	close(): void
	send(msg: {address: string; args: OscArg[]}, host: string, port: number): void
}

interface OscMessage {
	address: string
	args: Array<{type: string; value: number | string}>
}

interface OscArg {
	type: string
	value: number | string
}
/**
 * UDP OSC Listener for receiving Resolume's OSC output.
 *
 * Resolume must be configured in Preferences > OSC to:
 * 1. Enable OSC Output
 * 2. Set the output destination to the Companion machine's IP
 * 3. Set the output port to match oscRxPort in this module's config
 * 4. Select an appropriate output preset (e.g. "Output All OSC Messages")
 */
export class ArenaOscListener {
	private udpPort: OscUDPPort | null = null
	private instance: ResolumeArenaModuleInstance
	private port: number
	private isOpen: boolean = false

	constructor(port: number, instance: ResolumeArenaModuleInstance) {
		this.port = port
		this.instance = instance
	}
	start(): void {
		if (this.isOpen) {
			this.destroy()
		}
		try {
			this.udpPort = new osc.UDPPort({
				localAddress: '0.0.0.0',
				localPort: this.port,
				metadata: true,
			})
			this.udpPort.on('message', (msg, _timeTag, _info) => {
				this.processMessage(msg)
			})
			this.udpPort.on('error', (err: {code?: string; message: string}) => {
				if (err.code === 'EADDRINUSE') {
					this.instance.log('error', `OSC Listener: Port ${this.port} is already in use`)
				} else {
					this.instance.log('error', `OSC Listener error: ${err.message}`)
				}
			})
			this.udpPort.on('ready', () => {
				this.isOpen = true
				this.instance.log('info', `OSC Listener active on port ${this.port}`)
				// If no REST API is configured, OSC listener being ready means we're good
				if (!this.instance.getRestApi()) {
					this.instance.updateStatus(InstanceStatus.Ok)
				}
			})
			this.udpPort.open()
		} catch (err: unknown) {
			this.instance.log('error', `OSC Listener failed to start: ${(err as Error).message}`)
		}
	}
	processMessage(msg: OscMessage): void {
		if (!msg.address || !msg.args || msg.args.length === 0) return
		const value = msg.args[0].value
		if (value === undefined || value === null) return
		this.instance.handleOscInput(msg.address, value, msg.args)
	}
	destroy(): void {
		if (this.udpPort) {
			try {
				this.udpPort.close()
			} catch (_e) {
				// ignore errors on close
			}
			this.udpPort = null
		}
		this.isOpen = false
	}
	isActive(): boolean {
		return this.isOpen
	}
    /**
     * Send an OSC message FROM this listener's port.
     * This is critical for ? queries — Resolume responds to the sender's port,
     * so we must send from the same port we're listening on.
     */
	send(address: string, args: OscArg[], host: string, port: number): void {
		if (!this.udpPort || !this.isOpen) {
			this.instance.log('warn', 'OSC Listener: Cannot send, port not open')
			return
		}
		try {
			this.udpPort.send({ address, args }, host, port)
			this.instance.log('debug', `OSC Listener: Sent to ${host}:${port} → ${address}`)
		} catch (err: unknown) {
			this.instance.log('error', `OSC Listener send error: ${(err as Error).message}`)
		}
	}
}
