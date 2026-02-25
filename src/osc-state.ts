import {OSC_DEFAULT_LAYERS} from './variables/osc-variables'
import type {ResolumeArenaModuleInstance} from './index'
import type {ArenaOscListener} from './osc-listener'

interface ClipState {
	activeClip: number
	connected: number
	position: number
	duration: number
	durationEstimated: boolean
	queried: boolean
	speed: number
	name: string
}

interface EstimationState {
	prevPos: number
	prevTime: number
	samples: number[]
	estimatedDurationSec: number
	settled: boolean
}

interface LayerState {
	master: number
	opacity: number
	volume: number
	bypassed: boolean
	direction: number
	layerPosition: number | undefined
	clip: ClipState
	estimation: EstimationState
}
/**
 * Manages all state received from Resolume's OSC output.
 *
 * Design follows Millumin's approach:
 * - Variables are per-layer, not per-clip
 * - When a new clip triggers on a layer, the same variables update to the new clip
 * - No throttling — variables update on every OSC message for smooth countdown
 *
 * Resolume sends normalized floats (0.0-1.0) for transport position.
 * The range is 0.0 to maxRange (604800 seconds = 7 days).
 *
 * Key conversion:
 *   seconds = normalizedValue × maxRange
 *   normalizedValue = seconds / maxRange
 */
export class OscState {
	private instance: ResolumeArenaModuleInstance
	private layers: Map<number, LayerState> = new Map()
	/** Track which layers have had their variables registered */
	private registeredLayers: Set<number> = new Set()
	/** Periodic refresh interval handle */
	private refreshInterval: ReturnType<typeof setInterval> | null = null
	private _quickRefreshTimer: ReturnType<typeof setTimeout> | null = null
	private _lastRemainingInt: Map<number, number> = new Map()
	private _lastQueryTime: Map<number, number> = new Map()
	/** Currently active composition column */
	public activeColumn: number = 0
	/** Column names cache */
	private columnNames: Map<number, string> = new Map()
	/**
	 * Resolume's max range for transport position in seconds.
	 * Default is 604800 (7 days).
	 */
	private maxRange: number = 604800
	/** Composition-level state */
	private compositionMaster: number = 1
	private compositionOpacity: number = 1
	private compositionVolume: number = 1
	private compositionTempo: number = 120
	private oscListener: ArenaOscListener | null = null

	constructor(instance: ResolumeArenaModuleInstance) {
		this.instance = instance
		void this.compositionMaster
		void this.compositionOpacity
		void this.compositionVolume
		void this.compositionTempo
	}
    // ──────────────────────────────────────────────────────────
    // Message Routing
    // ──────────────────────────────────────────────────────────
    /**
     * Route an incoming OSC message to the appropriate handler.
     * Called by the OSC listener for every incoming message — no throttling.
     */
	handleMessage(address: string, value: number | string): void {
		if (!address.startsWith('/composition')) return
		let match: RegExpMatchArray | null
        // ── Layer Position (source of truth for which clip is outputting) ──
        match = address.match(/^\/composition\/layers\/(\d+)\/position$/);
        if (match) {
            const layer = +match[1];
            const layerState = this.getOrCreateLayer(layer);
            layerState.layerPosition = +value;
            return;
        }
        // ── Clip Transport Position (most frequent — check first) ──
        match = address.match(/^\/composition\/layers\/(\d+)\/clips\/(\d+)\/transport\/position$/);
        if (match) {
            const layer = +match[1];
            const column = +match[2];
            const layerState = this.getOrCreateLayer(layer);
            const pos = +value;
            // Use layer position to determine if THIS clip is the active output.
            // The previewing clip will have a different position than the layer.
            // Allow small floating point tolerance.
            if (layerState.layerPosition !== undefined) {
                const diff = Math.abs(pos - layerState.layerPosition);
                if (diff > 0.0001) {
                    // This clip's position doesn't match the layer — it's a preview, ignore it
                    return;
                }
            }
            // Detect clip change: different column is now the active output
            if (layerState.clip.activeClip !== 0 && layerState.clip.activeClip !== column) {
                layerState.clip.activeClip = column;
                layerState.clip.connected = 2;
                layerState.clip.position = 0;
                layerState.clip.duration = 0;
                layerState.clip.durationEstimated = false;
                layerState.clip.queried = false;
                layerState.clip.name = '';
                // Reset estimation
                layerState.estimation.prevPos = 0;
                layerState.estimation.prevTime = 0;
                layerState.estimation.samples = [];
                layerState.estimation.estimatedDurationSec = 0;
                layerState.estimation.settled = false;
                // Quick refresh to get new clip info + column state
                this.scheduleQuickRefresh();
            }
            // If this is the first clip we've seen on this layer, adopt it
            if (layerState.clip.activeClip === 0) {
                layerState.clip.activeClip = column;
                layerState.clip.connected = 2;
                layerState.clip.queried = false;
                // Reset estimation state
                layerState.estimation.prevPos = 0;
                layerState.estimation.prevTime = 0;
                layerState.estimation.samples = [];
                layerState.estimation.estimatedDurationSec = 0;
                layerState.estimation.settled = false;
            }
            // Only update if this clip is the active one on the layer
            if (layerState.clip.activeClip === column) {
                layerState.clip.position = pos;
                // Send query ONCE for this clip (if not already queried)
                if (!layerState.clip.queried) {
                    layerState.clip.queried = true;
                    this.queryClipInfo(layer, column);
                }
                // Duration estimation fallback
                if (layerState.clip.duration === 0 && !layerState.estimation.settled) {
                    this.estimateDuration(layerState, pos);
                }
                this.updateLayerVariables(layer);
            }
            return;
        }
        // ── Clip Duration ──
        match = address.match(/^\/composition\/layers\/(\d+)\/clips\/(\d+)\/transport\/position\/behaviour\/duration$/);
        if (match) {
            const layer = +match[1];
            const column = +match[2];
            const layerState = this.getOrCreateLayer(layer);
            if (layerState.clip.activeClip === column) {
                layerState.clip.duration = +value;
                layerState.clip.durationEstimated = false;
                // Stop estimation -- we have the real value
                layerState.estimation.settled = true;
                this.updateLayerVariables(layer);
            }
            return;
        }
        // ── Clip Speed ──
        match = address.match(/^\/composition\/layers\/(\d+)\/clips\/(\d+)\/transport\/position\/behaviour\/speed$/);
        if (match) {
            const layer = +match[1];
            const column = +match[2];
            const layerState = this.getOrCreateLayer(layer);
            if (layerState.clip.activeClip === 0 || layerState.clip.activeClip === column) {
                layerState.clip.speed = +value;
                this.updateLayerVariables(layer);
            }
            return;
        }
        // ── Clip Connected (state change) ──
        match = address.match(/^\/composition\/layers\/(\d+)\/clips\/(\d+)\/connected$/);
        if (match) {
            const layer = +match[1];
            const column = +match[2];
            const connectedState = +value;
            const layerState = this.getOrCreateLayer(layer);
            // Only care about the clip that is actually playing (connected >= 2)
            // connected states: 0=disconnected, 1=in deck, 2=connected, 3=connected+selected
            if (connectedState >= 2) {
                const isNewClip = layerState.clip.activeClip !== column;
                layerState.clip.activeClip = column;
                layerState.clip.connected = connectedState;
                if (isNewClip) {
                    // Reset for new clip — query will happen from position handler
                    layerState.clip.position = 0;
                    layerState.clip.duration = 0;
                    layerState.clip.durationEstimated = false;
                    layerState.clip.queried = false;
                    layerState.clip.name = '';
                    // Reset estimation
                    layerState.estimation.prevPos = 0;
                    layerState.estimation.prevTime = 0;
                    layerState.estimation.samples = [];
                    layerState.estimation.estimatedDurationSec = 0;
                    layerState.estimation.settled = false;
                }
            }
            else if (connectedState === 0 && layerState.clip.activeClip === column) {
                // The currently tracked clip was disconnected
                layerState.clip.connected = 0;
                layerState.clip.position = 0;
                layerState.clip.duration = 0;
                layerState.clip.activeClip = 0;
                layerState.clip.name = '';
            }
            this.updateLayerVariables(layer);
            this.instance.checkFeedbacks('oscConnectedClip');
            return;
        }
        // ── Clip Connect (trigger action) ──
        match = address.match(/^\/composition\/layers\/(\d+)\/clips\/(\d+)\/connect$/);
        if (match) {
            this.instance.checkFeedbacks('oscConnectedClip');
            return;
        }
        // ── Column Connected (query response) ──
        match = address.match(/^\/composition\/columns\/(\d+)\/connected$/);
        if (match) {
            const column = +match[1];
            const connectedState = +value;
            // connected >= 2 means this column is actively connected
            if (connectedState >= 2) {
                if (this.activeColumn !== column) {
                    this.activeColumn = column;
                    const colName = this.columnNames.get(column) || `Column ${column}`;
                    this.instance.setVariableValues({
                        'osc_active_column': column.toString(),
                        'osc_active_column_name': colName,
                    });
                    this.instance.checkFeedbacks('oscActiveColumn');
                    // Column changed — new clips are active, re-query everything
                    // Reset queried flags so position handler will re-query
                    for (const [_layerNum, layerState] of this.layers) {
                        layerState.clip.queried = false;
                        layerState.clip.duration = 0;
                        layerState.clip.durationEstimated = false;
                        layerState.clip.name = '';
                        layerState.estimation.prevPos = 0;
                        layerState.estimation.prevTime = 0;
                        layerState.estimation.samples = [];
                        layerState.estimation.estimatedDurationSec = 0;
                        layerState.estimation.settled = false;
                    }
                    // Immediate wildcard re-query for clip info
                    this.queryClipInfoWildcard();
                }
            }
            return;
        }
        // ── Column Name (query response) ──
        match = address.match(/^\/composition\/columns\/(\d+)\/name$/);
        if (match) {
            const column = +match[1];
            let name = String(value);
            // Resolume returns "Column #" as default — replace with "Column N"
            if (name === 'Column #') {
                name = `Column ${column}`;
            }
            this.columnNames.set(column, name);
            if (column === this.activeColumn) {
                this.instance.setVariableValues({ 'osc_active_column_name': name });
            }
            return;
        }
        // ── Clip Name ──
        match = address.match(/^\/composition\/layers\/(\d+)\/clips\/(\d+)\/name$/);
        if (match) {
            const layer = +match[1];
            const column = +match[2];
            const layerState = this.getOrCreateLayer(layer);
            if (layerState.clip.activeClip === column) {
                const newName = String(value);
                // If name changed, clip content was replaced — reset duration
                // The periodic refresh or next position message will re-query
                if (layerState.clip.name !== '' && layerState.clip.name !== newName) {
                    layerState.clip.duration = 0;
                    layerState.clip.durationEstimated = false;
                    layerState.clip.queried = false;
                    layerState.estimation.prevPos = 0;
                    layerState.estimation.prevTime = 0;
                    layerState.estimation.samples = [];
                    layerState.estimation.estimatedDurationSec = 0;
                    layerState.estimation.settled = false;
                }
                layerState.clip.name = newName;
                this.updateLayerVariables(layer);
            }
            return;
        }
        // ── Layer Direction ──
        match = address.match(/^\/composition\/layers\/(\d+)\/direction$/);
        if (match) {
            this.getOrCreateLayer(+match[1]).direction = +value;
            return;
        }
        // ── Layer Master ──
        match = address.match(/^\/composition\/layers\/(\d+)\/master$/);
        if (match) {
            this.getOrCreateLayer(+match[1]).master = +value;
            return;
        }
        // ── Layer Opacity ──
        match = address.match(/^\/composition\/layers\/(\d+)\/video\/opacity$/);
        if (match) {
            this.getOrCreateLayer(+match[1]).opacity = +value;
            return;
        }
        // ── Layer Volume ──
        match = address.match(/^\/composition\/layers\/(\d+)\/audio\/volume$/);
        if (match) {
            this.getOrCreateLayer(+match[1]).volume = +value;
            return;
        }
        // ── Layer Bypassed ──
        match = address.match(/^\/composition\/layers\/(\d+)\/bypassed$/);
        if (match) {
            this.getOrCreateLayer(+match[1]).bypassed = !!value;
            return;
        }
        // ── Composition Master ──
        if (address === '/composition/master') {
            this.compositionMaster = +value;
            return;
        }
        // ── Composition Opacity ──
        if (address === '/composition/video/opacity') {
            this.compositionOpacity = +value;
            return;
        }
        // ── Composition Volume ──
        if (address === '/composition/audio/volume') {
            this.compositionVolume = +value;
            return;
        }
        // ── Composition Tempo ──
        if (address === '/composition/tempocontroller/tempo') {
            this.compositionTempo = +value;
            return;
        }
    }
    // ──────────────────────────────────────────────────────────
    // Duration Estimation (resolume-timecode algorithm)
    // ──────────────────────────────────────────────────────────
    /**
     * Estimate clip duration from the rate of position change.
     * Based on https://github.com/chabad360/resolume-timecode
     *
     * Algorithm: measure delta-position / delta-time across multiple samples,
     * then calculate total duration = 1.0 / (avgDeltaPos / avgDeltaTime).
     * After enough consistent samples, lock in the estimate.
     */
	estimateDuration(layerState: LayerState, pos: number): void {
        const now = Date.now();
        const est = layerState.estimation;
        // Skip if position is near zero (clip just started, unstable)
        if (pos < 0.002) {
            est.prevPos = pos;
            est.prevTime = now;
            return;
        }
        // Need a previous sample to calculate delta
        if (est.prevPos === 0 || est.prevTime === 0) {
            est.prevPos = pos;
            est.prevTime = now;
            return;
        }
        const deltaPos = pos - est.prevPos;
        const deltaTime = (now - est.prevTime) / 1000; // seconds
        est.prevPos = pos;
        est.prevTime = now;
        // Skip if position went backwards (loop reset) or no movement
        if (deltaPos <= 0 || deltaTime <= 0) {
            return;
        }
        // Calculate estimated total duration from this sample:
        // If position moved deltaPos in deltaTime seconds,
        // then full 0-1 range takes (1/deltaPos) * deltaTime seconds
        const sampleDuration = deltaTime / deltaPos;
        // Ignore wildly unreasonable estimates (< 0.5s or > 24 hours)
        if (sampleDuration < 0.5 || sampleDuration > 86400) {
            return;
        }
        est.samples.push(sampleDuration);
        // Keep last 10 samples for averaging
        if (est.samples.length > 10) {
            est.samples.shift();
        }
        // Need at least 3 samples before we commit
        if (est.samples.length >= 3) {
            // Average the samples
            const avg = est.samples.reduce((a, b) => a + b, 0) / est.samples.length;
            // Check if samples are consistent (within 10% of average)
            const consistent = est.samples.every(s => Math.abs(s - avg) / avg < 0.1);
            if (consistent) {
                est.estimatedDurationSec = avg;
                // Convert to normalized value for the clip state
                layerState.clip.duration = avg / this.maxRange;
                layerState.clip.durationEstimated = true;
                if (!est.settled) {
                    est.settled = true;
                }
            }
        }
    }
    // ──────────────────────────────────────────────────────────
    // State Accessors
    // ──────────────────────────────────────────────────────────
	getOrCreateLayer(layer: number): LayerState {
        if (!this.layers.has(layer)) {
            this.layers.set(layer, {
                master: 1,
                opacity: 1,
                volume: 1,
                bypassed: false,
                direction: 2,
                layerPosition: undefined,
                clip: {
                    activeClip: 0,
                    connected: 0,
                    position: 0,
                    duration: 0,
                    durationEstimated: false,
                    queried: false,
                    speed: 0,
                    name: '',
                },
                /** Duration estimation state (resolume-timecode algorithm) */
                estimation: {
                    prevPos: 0,
                    prevTime: 0,
                    samples: [],
                    estimatedDurationSec: 0,
                    settled: false,
                },
            });
            // Only rebuild variable definitions for layers beyond the default 10
            if (!this.registeredLayers.has(layer) && layer > OSC_DEFAULT_LAYERS) {
                this.registeredLayers.add(layer);
                this.instance.registerOscVariables();
            }
            this.registeredLayers.add(layer);
        }
		return this.layers.get(layer)!
    }
	getLayer(layer: number): LayerState | undefined {
        return this.layers.get(layer);
    }
    /** Get the active clip state for a layer */
	getActiveClip(layer: number): ClipState | undefined {
        return this.layers.get(layer)?.clip;
    }
	getAllLayers(): Map<number, LayerState> {
        return this.layers;
    }
    /** Get all layer numbers that have been discovered */
	getRegisteredLayers(): Set<number> {
        return this.registeredLayers;
    }
    // ──────────────────────────────────────────────────────────
    // Time Conversion Utilities
    // ──────────────────────────────────────────────────────────
    /** Convert a normalized value (0-1) to seconds */
	normalizedToSeconds(normalized: number): number {
        return normalized * this.maxRange;
    }
    /** Convert seconds to a normalized value (0-1) */
	secondsToNormalized(seconds: number): number {
        return seconds / this.maxRange;
    }
    /** Get active clip's duration in seconds for a layer */
	getLayerDurationSeconds(layer: number): number {
        const clip = this.getActiveClip(layer);
        if (!clip || clip.duration === 0)
            return 0;
        return clip.duration * this.maxRange;
    }
    /** Get active clip's elapsed time in seconds for a layer */
	getLayerElapsedSeconds(layer: number): number {
        const clip = this.getActiveClip(layer);
        if (!clip || clip.duration === 0)
            return 0;
        return clip.position * clip.duration * this.maxRange;
    }
    /** Get active clip's remaining time in seconds for a layer */
	getLayerRemainingSeconds(layer: number): number {
        const clip = this.getActiveClip(layer);
        if (!clip || clip.duration === 0)
            return 0;
        return Math.max(0, (1 - clip.position) * clip.duration * this.maxRange);
    }
    /** Get progress as 0-1 fraction for a layer */
	getLayerProgress(layer: number): number {
        const clip = this.getActiveClip(layer);
        if (!clip)
            return 0;
        return clip.position;
    }
    /**
     * Calculate the normalized position for "X seconds from end of clip"
     * on the given layer. This is the core function for "go to last N seconds".
     *
     * @returns normalized position (0-1) to send via OSC, or undefined if no clip data
     */
	getPositionForSecondsFromEnd(layer: number, secondsFromEnd: number): number | undefined {
        const clip = this.getActiveClip(layer);
        if (!clip || clip.duration === 0)
            return undefined;
        const offsetNormalized = secondsFromEnd / this.maxRange;
        const target = clip.duration - offsetNormalized;
        return Math.max(0, Math.min(target, clip.duration));
    }
    /**
     * Get the active clip column number for a layer.
     * Needed for building the OSC address to send commands to.
     */
	getActiveClipColumn(layer: number): number | undefined {
        const clip = this.getActiveClip(layer);
        if (!clip || clip.activeClip === 0)
            return undefined;
        return clip.activeClip;
    }
    // ──────────────────────────────────────────────────────────
    // Formatting Utilities
    // ──────────────────────────────────────────────────────────
    /** Convert seconds to HH:MM:SS or MM:SS timecode string */
	secondsToTimecode(totalSeconds: number): string {
        const negative = totalSeconds < 0;
        const abs = Math.abs(totalSeconds);
        const h = Math.floor(abs / 3600);
        const m = Math.floor((abs % 3600) / 60);
        const s = Math.floor(abs % 60);
        const prefix = negative ? '-' : '';
        if (h > 0) {
            return `${prefix}${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${prefix}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    /** Convert seconds to HH:MM:SS:FF timecode string */
	secondsToTimecodeFrames(totalSeconds: number, fps: number = 30): string {
        const negative = totalSeconds < 0;
        const abs = Math.abs(totalSeconds);
        const h = Math.floor(abs / 3600);
        const m = Math.floor((abs % 3600) / 60);
        const s = Math.floor(abs % 60);
        const f = Math.floor((abs % 1) * fps);
        const prefix = negative ? '-' : '';
        if (h > 0) {
            return `${prefix}${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${f.toString().padStart(2, '0')}`;
        }
        return `${prefix}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${f.toString().padStart(2, '0')}`;
    }
    // ──────────────────────────────────────────────────────────
    // Variable Updates — Per Layer, No Throttle (like Millumin)
    // ──────────────────────────────────────────────────────────
    /**
     * Update Companion variables for a layer.
     * Called on every incoming OSC message — no throttling.
     * Millumin does the same and it results in smooth countdowns.
     */
	updateLayerVariables(layer: number): void {
        const clip = this.getActiveClip(layer);
        if (!clip)
            return;
        const prefix = `osc_layer_${layer}`;
        const durationSec = clip.duration * this.maxRange;
        // Position is 0.0-1.0 representing playhead progress through the clip
        // So elapsed = position * total duration, remaining = (1 - position) * total duration
        const elapsedSec = durationSec > 0 ? clip.position * durationSec : 0;
        const remainingSec = durationSec > 0 ? Math.max(0, (1 - clip.position) * durationSec) : 0;
        const variables: Record<string, string> = {}
        variables[`${prefix}_elapsed`] = this.secondsToTimecode(elapsedSec);
        variables[`${prefix}_duration`] = this.secondsToTimecode(durationSec);
        variables[`${prefix}_remaining`] = this.secondsToTimecode(remainingSec);
        variables[`${prefix}_remaining_seconds`] = Math.round(remainingSec).toString();
        variables[`${prefix}_progress`] = (clip.position * 100).toFixed(0);
        variables[`${prefix}_clip_name`] = clip.name;
        try {
            this.instance.setVariableValues(variables);
        }
        catch (e: unknown) {
            this.instance.log('warn', `Failed to set variable values: ${(e as Error).message}`)
        }
        // Check feedbacks only when remaining seconds integer changes (not every frame)
        const remainingInt = Math.floor(remainingSec);
        if (this._lastRemainingInt.get(layer) !== remainingInt) {
            this._lastRemainingInt.set(layer, remainingInt);
            this.instance.checkFeedbacks('oscProgressBar');
        }
    }
    // ──────────────────────────────────────────────────────────
    // OSC Queries — ask Resolume for data it doesn't broadcast
    // ──────────────────────────────────────────────────────────
    /**
     * Query clip duration and name from Resolume via OSC ? query.
     *
     * Resolume docs show two syntaxes (both mentioned by devs):
     * 1. Send string "?" as argument: /address "?"
     * 2. Send with ? prefix on address: ?/address
     *
     * Critical: we send FROM the listener port so Resolume's response
     * comes back to the port we're actually listening on.
     */
	queryClipInfo(layer: number, column: number): void {
        const listener = this.instance.getOscListener();
        const config = this.instance.getConfig();
        if (!listener) {
            return;
        }
        // Debounce: no more than one query per layer per second
        const now = Date.now();
        const lastQuery = this._lastQueryTime.get(layer) || 0;
        if (now - lastQuery < 1000) {
            return;
        }
        this._lastQueryTime.set(layer, now);

        const host = config.host;
        const port = config.port;
        const durationAddr = `/composition/layers/${layer}/clips/${column}/transport/position/behaviour/duration`;
        const nameAddr = `/composition/layers/${layer}/clips/${column}/name`;
        listener.send(durationAddr, [{ type: 's', value: '?' }], host, port);
        listener.send(nameAddr, [{ type: 's', value: '?' }], host, port);
    }
    /**
     * Public method to manually query all tracked layers.
     * Can be triggered from a Companion action for testing.
     */
	queryAllLayers(): void {
        for (const [layerNum, layerState] of this.layers) {
            const clip = layerState.clip.activeClip;
            if (clip > 0) {
                this.queryClipInfo(layerNum, clip);
            }
        }
    }
    /**
     * Start a periodic re-query interval.
     * This catches edge cases like media replacement in the same slot,
     * UI rearrangements that don't trigger connected messages, etc.
     * Runs every 5 seconds and only queries layers that have active clips.
     */
	startPeriodicRefresh(): void {
        this.stopPeriodicRefresh();
        // Fire initial queries immediately
        this.queryColumns();
        this.refreshInterval = setInterval(() => {
            const listener = this.instance.getOscListener();
            const config = this.instance.getConfig();
            if (!listener) return;

            // Wildcard queries — let Resolume tell us everything at once
            // This catches clip changes, name swaps, column changes, etc.
            listener.send('/composition/layers/*/clips/*/name', [{ type: 's', value: '?' }], config.host, config.port);
            listener.send('/composition/layers/*/clips/*/transport/position/behaviour/duration', [{ type: 's', value: '?' }], config.host, config.port);
            listener.send('/composition/columns/*/connected', [{ type: 's', value: '?' }], config.host, config.port);
            listener.send('/composition/columns/*/name', [{ type: 's', value: '?' }], config.host, config.port);
        }, 5000);
    }
    /**
     * Query column connected state using wildcard.
     */
	queryColumns(): void {
        const listener = this.instance.getOscListener();
        const config = this.instance.getConfig();
        if (!listener) return;
        listener.send('/composition/columns/*/connected', [{ type: 's', value: '?' }], config.host, config.port);
        listener.send('/composition/columns/*/name', [{ type: 's', value: '?' }], config.host, config.port);
    }
    /**
     * Query all clip info (name + duration) using wildcards.
     * Used after column changes to immediately get new clip data.
     */
	queryClipInfoWildcard(): void {
        const listener = this.instance.getOscListener();
        const config = this.instance.getConfig();
        if (!listener) return;
        listener.send('/composition/layers/*/clips/*/name', [{ type: 's', value: '?' }], config.host, config.port);
        listener.send('/composition/layers/*/clips/*/transport/position/behaviour/duration', [{ type: 's', value: '?' }], config.host, config.port);
    }
    /**
     * Full refresh — columns + clip info. Called after actions that change clips.
     */
	queryAll(): void {
        this.queryColumns();
        this.queryClipInfoWildcard();
    }
    /**
     * Quick refresh — queries everything via wildcards.
     * Used after column triggers, clip changes, auto-transitions.
     * Debounced to 200ms to prevent flood.
     */
	scheduleQuickRefresh(): void {
        if (this._quickRefreshTimer) return; // already scheduled
        this._quickRefreshTimer = setTimeout(() => {
            this._quickRefreshTimer = null;
            const listener = this.instance.getOscListener();
            const config = this.instance.getConfig();
            if (!listener) return;
            listener.send('/composition/columns/*/connected', [{ type: 's', value: '?' }], config.host, config.port);
            listener.send('/composition/columns/*/name', [{ type: 's', value: '?' }], config.host, config.port);
            listener.send('/composition/layers/*/clips/*/name', [{ type: 's', value: '?' }], config.host, config.port);
            listener.send('/composition/layers/*/clips/*/transport/position/behaviour/duration', [{ type: 's', value: '?' }], config.host, config.port);
            listener.send('/composition/layers/*/direction', [{ type: 's', value: '?' }], config.host, config.port);
        }, 200);
    }
    /**
     * Stop the periodic refresh interval.
     */
	stopPeriodicRefresh(): void {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
    // ──────────────────────────────────────────────────────────
    // Lifecycle
    // ──────────────────────────────────────────────────────────
	clear(): void {
        this.layers.clear();
        this.registeredLayers.clear();
    }
	destroy(): void {
		void this.oscListener
        this.stopPeriodicRefresh();
        if (this._quickRefreshTimer) {
            clearTimeout(this._quickRefreshTimer);
            this._quickRefreshTimer = null;
        }
        this.clear();
    }
}
