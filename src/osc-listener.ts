// @ts-nocheck
const base_1 = require('@companion-module/base')
const osc = require('osc');
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
    udpPort;
    instance;
    port;
    isOpen = false;
    constructor(port, instance) {
        this.port = port;
        this.instance = instance;
    }
    start() {
        if (this.isOpen) {
            this.destroy();
        }
        try {
            this.udpPort = new osc.UDPPort({
                localAddress: '0.0.0.0',
                localPort: this.port,
                metadata: true,
            });
            this.udpPort.on('message', (msg, _timeTag, _info) => {
                this.processMessage(msg);
            });
            this.udpPort.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    this.instance.log('error', `OSC Listener: Port ${this.port} is already in use`);
                }
                else {
                    this.instance.log('error', `OSC Listener error: ${err.message}`);
                }
            });
            this.udpPort.on('ready', () => {
                this.isOpen = true;
                this.instance.log('info', `OSC Listener active on port ${this.port}`);
                // If no REST API is configured, OSC listener being ready means we're good
                if (!this.instance.getRestApi()) {
                    this.instance.updateStatus(base_1.InstanceStatus.Ok);
                }
            });
            this.udpPort.open();
        }
        catch (err) {
            this.instance.log('error', `OSC Listener failed to start: ${err.message}`);
        }
    }
    processMessage(msg) {
        if (!msg.address || !msg.args || msg.args.length === 0)
            return;
        const value = msg.args[0].value;
        if (value === undefined || value === null)
            return;
        this.instance.handleOscInput(msg.address, value, msg.args);
    }
    destroy() {
        if (this.udpPort) {
            try {
                this.udpPort.close();
            }
            catch (_e) {
                // ignore errors on close
            }
            this.udpPort = null;
        }
        this.isOpen = false;
    }
    isActive() {
        return this.isOpen;
    }
    /**
     * Send an OSC message FROM this listener's port.
     * This is critical for ? queries — Resolume responds to the sender's port,
     * so we must send from the same port we're listening on.
     */
    send(address, args, host, port) {
        if (!this.udpPort || !this.isOpen) {
            this.instance.log('warn', 'OSC Listener: Cannot send, port not open');
            return;
        }
        try {
            this.udpPort.send({ address, args }, host, port);
            this.instance.log('debug', `OSC Listener: Sent to ${host}:${port} → ${address}`);
        }
        catch (err) {
            this.instance.log('error', `OSC Listener send error: ${err.message}`);
        }
    }
}
