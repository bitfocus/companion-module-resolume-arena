// No @types/osc package exists; minimal typings for the parts this module uses.
declare module 'osc' {
	export interface OscArg {
		type: string
		value: number | string
	}

	export interface OscMessage {
		address: string
		args: Array<{type: string; value: number | string}>
	}

	export interface OscUDPPort {
		on(event: 'message', callback: (msg: OscMessage, timeTag: unknown, info: unknown) => void): void
		on(event: 'error', callback: (err: {code?: string; message: string}) => void): void
		on(event: 'ready', callback: () => void): void
		open(): void
		close(): void
		send(msg: {address: string; args: OscArg[]}, host: string, port: number): void
	}

	const osc: {
		UDPPort: new (options: {localAddress: string; localPort: number; metadata: boolean}) => OscUDPPort
	}
	export default osc
}
