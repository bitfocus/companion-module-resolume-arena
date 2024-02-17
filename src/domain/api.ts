/**
 * An audioeffect represents a single effect in a chain of effects to be applied to a source. Properties on the audioeffect control how and what is rendered in the effect.
 * @export
 * @interface AudioEffect
 */
export interface AudioEffect {
    /**
     * The unique id of the audio effect instance
     * @type {number}
     * @memberof AudioEffect
     */
    id?: number;
    /**
     * The name of the effect
     * @type {string}
     * @memberof AudioEffect
     */
    name?: string;
    /**
     * 
     * @type {BooleanParameter}
     * @memberof AudioEffect
     */
    bypassed?: BooleanParameter;
    /**
     * 
     * @type {ParameterCollection}
     * @memberof AudioEffect
     */
    params?: ParameterCollection;
}
/**
 * Meta information for an audio file
 * @export
 * @interface AudioFileInfo
 */
export interface AudioFileInfo {
    /**
     * The location of the file on disk
     * @type {string}
     * @memberof AudioFileInfo
     */
    path?: string;
    /**
     * Whether file is actully present on disk at the given location
     * @type {boolean}
     * @memberof AudioFileInfo
     */
    exists?: boolean;
    /**
     * Duration of file expressed as hours:seconds:minutes:milliseconds
     * @type {string}
     * @memberof AudioFileInfo
     */
    duration?: string;
    /**
     * Duration of file expressed as milliseconds
     * @type {number}
     * @memberof AudioFileInfo
     */
    durationMs?: number;
    /**
     * Sample rate expressed in Hertz
     * @type {number}
     * @memberof AudioFileInfo
     */
    sampleRate?: number;
    /**
     * Number of audio channels
     * @type {number}
     * @memberof AudioFileInfo
     */
    numChannels?: number;
    /**
     * Bpm rate expressed in beats
     * @type {number}
     * @memberof AudioFileInfo
     */
    bpm?: number;
}
/**
 * An audio track, as part of a clip,layer,group or a composition
 * @export
 * @interface AudioTrack
 */
export interface AudioTrack {
    /**
     * 
     * @type {RangeParameter}
     * @memberof AudioTrack
     */
    volume?: RangeParameter;
    /**
     * 
     * @type {RangeParameter}
     * @memberof AudioTrack
     */
    pan?: RangeParameter;
    /**
     * All the effects that may be applied when the audio track is played
     * @type {Array<AudioEffect>}
     * @memberof AudioTrack
     */
    effects?: Array<AudioEffect>;
}
/**
 * 
 * @export
 * @interface AudioTrackClip
 */
export interface AudioTrackClip extends AudioTrack {
    /**
     * The description of the source belonging to this audio track
     * @type {string}
     * @memberof AudioTrackClip
     */
    description?: string;
    /**
     * 
     * @type {AudioFileInfo}
     * @memberof AudioTrackClip
     */
    fileinfo?: AudioFileInfo;
}
/**
 * AutoPilot options to control automatic clip transitions
 * @export
 * @interface AutoPilot
 */
export interface AutoPilot {
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof AutoPilot
     */
    target?: ChoiceParameter;
}
/**
 * A parameter containing a true or false value
 * @export
 * @interface BooleanParameter
 */
export interface BooleanParameter {
    /**
     * The unique identifier of the parameter
     * @type {number}
     * @memberof BooleanParameter
     */
    id?: number;
    /**
     * The parameter type. This is \"ParamBoolean\" for this type
     * @type {string}
     * @memberof BooleanParameter
     */
    valuetype?: string;
    /**
     * The value for the parameter
     * @type {boolean}
     * @memberof BooleanParameter
     */
    value?: boolean;
    /**
     * 
     * @type {ParameterView}
     * @memberof BooleanParameter
     */
    view?: ParameterView;
}
/**
 * 
 * @export
 * @interface ByidEffectidBody
 */
export interface ByidEffectidBody {
}
/**
 * A multiple-choice parameter
 * @export
 * @interface ChoiceParameter
 */
export interface ChoiceParameter {
    /**
     * The unique identifier of the parameter
     * @type {number}
     * @memberof ChoiceParameter
     */
    id?: number;
    /**
     * The parameter type. This is \"ParamChoice\" or \"ParamState\" for this type
     * @type {string}
     * @memberof ChoiceParameter
     */
    valuetype?: string;
    /**
     * The value of the selected option
     * @type {string}
     * @memberof ChoiceParameter
     */
    value?: string;
    /**
     * The index of the selected option within the options
     * @type {number}
     * @memberof ChoiceParameter
     */
    index?: number;
    /**
     * The list of available options for the parameter
     * @type {Array<string>}
     * @memberof ChoiceParameter
     */
    options?: Array<string>;
    /**
     * 
     * @type {ParameterView}
     * @memberof ChoiceParameter
     */
    view?: ParameterView;
}
/**
 * A single clip in the composition, which may contain a video and/or audio track
 * @export
 * @interface Clip
 */
export interface Clip {
    /**
     * The unique id of the clip
     * @type {number}
     * @memberof Clip
     */
    id?: number;
    /**
     * 
     * @type {StringParameter}
     * @memberof Clip
     */
    name?: StringParameter;
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof Clip
     */
    colorid?: ChoiceParameter;
    /**
     * Get whether the clip is currently selected. If a clip is selected the properties will show up in Arena or Avenue and in the example react application.
     * @type {BooleanParameter}
     * @memberof Clip
     */
    selected?: BooleanParameter;
    /**
     * Get whether the clip is currently connected.
     * @type {ChoiceParameter}
     * @memberof Clip
     */
    connected?: ChoiceParameter;
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof Clip
     */
    target?: ChoiceParameter;
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof Clip
     */
    triggerstyle?: ChoiceParameter;
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof Clip
     */
    ignorecolumntrigger?: ChoiceParameter;
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof Clip
     */
    faderstart?: ChoiceParameter;
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof Clip
     */
    beatsnap?: ChoiceParameter;
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof Clip
     */
    transporttype?: ChoiceParameter;
    /**
     * Only Timeline and BPM Sync transport types are supported at the moment
     * @type {TransportTimeline | TransportBPMSync}
     * @memberof Clip
     */
    transport?: TransportTimeline | TransportBPMSync;
    /**
     * 
     * @type {ParameterCollection}
     * @memberof Clip
     */
    dashboard?: ParameterCollection;
    /**
     * 
     * @type {AudioTrackClip}
     * @memberof Clip
     */
    audio?: AudioTrackClip;
    /**
     * 
     * @type {VideoTrackClip}
     * @memberof Clip
     */
    video?: VideoTrackClip;
    /**
     * 
     * @type {ClipThumbnail}
     * @memberof Clip
     */
    thumbnail?: ClipThumbnail;
}
/**
 * The thumbnail properties contain information with the latest update to the thumbnail, the size (in bytes) and whether it contains the 'default' thumbnail, meaning it doesn't contain a video or audio track
 * @export
 * @interface ClipThumbnail
 */
export interface ClipThumbnail {
    /**
     * The number of bytes of data in the thumbnail
     * @type {number}
     * @memberof ClipThumbnail
     */
    size?: number;
    /**
     * The timestamp of the last update, in milliseconds. Given as a string to prevent lesser languages from truncating the value
     * @type {string}
     * @memberof ClipThumbnail
     */
    lastUpdate?: string;
    //todo featureRequest
    path?: string;
    /**
     * Get whether this is a default thumbnail, shared between all clips that don't have any video or audio tracks
     * @type {boolean}
     * @memberof ClipThumbnail
     */
    isDefault?: boolean;
}
/**
 * A parameter containing color data
 * @export
 * @interface ColorParameter
 */
export interface ColorParameter {
    /**
     * The unique identifier of the parameter
     * @type {number}
     * @memberof ColorParameter
     */
    id?: number;
    /**
     * The parameter type. This is \"ParamColor\" for this type
     * @type {string}
     * @memberof ColorParameter
     */
    valuetype?: string;
    /**
     * The color value. This always starts with a '#', followed by a number of hexadecimal values representing rgb and - optionally - the alpha channel. Each channel may be either represented by a single character - in which case the values are from 0 to 15 - or by two characters - allowing a range from 0 to 255 per channel.
     * @type {string}
     * @memberof ColorParameter
     */
    value?: string;
    /**
     * Array of colors
     * @type {Array<string>}
     * @memberof ColorParameter
     */
    palette?: Array<string>;
    /**
     * 
     * @type {ParameterView}
     * @memberof ColorParameter
     */
    view?: ParameterView;
}
/**
 * A column within a deck
 * @export
 * @interface Column
 */
export interface Column {
    /**
     * The unique identifier of the column
     * @type {number}
     * @memberof Column
     */
    id?: number;
    /**
     * 
     * @type {StringParameter}
     * @memberof Column
     */
    name?: StringParameter;
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof Column
     */
    colorid?: ChoiceParameter;
    /**
     * Get whether the column is currently connected
     * @type {ChoiceParameter}
     * @memberof Column
     */
    connected?: ChoiceParameter;
}
/**
 * The complete composition, containing all the decks, layers, clips and their effects
 * @export
 * @interface Composition
 */
export interface Composition {
    /**
     * 
     * @type {StringParameter}
     * @memberof Composition
     */
    name?: StringParameter;
    /**
     * 
     * @type {BooleanParameter & any}
     * @memberof Composition
     */
    selected?: BooleanParameter & any;
    /**
     * 
     * @type {BooleanParameter}
     * @memberof Composition
     */
    bypassed?: BooleanParameter;
    /**
     * 
     * @type {RangeParameter}
     * @memberof Composition
     */
    master?: RangeParameter;
    /**
     * 
     * @type {RangeParameter}
     * @memberof Composition
     */
    speed?: RangeParameter;
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof Composition
     */
    cliptarget?: ChoiceParameter;
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof Composition
     */
    cliptriggerstyle?: ChoiceParameter;
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof Composition
     */
    clipbeatsnap?: ChoiceParameter;
    /**
     * 
     * @type {ParameterCollection}
     * @memberof Composition
     */
    dashboard?: ParameterCollection;
    /**
     * 
     * @type {AudioTrack}
     * @memberof Composition
     */
    audio?: AudioTrack;
    /**
     * 
     * @type {VideoTrack}
     * @memberof Composition
     */
    video?: VideoTrack;
    /**
     * 
     * @type {CrossFader}
     * @memberof Composition
     */
    crossfader?: CrossFader;
    /**
     * All decks in the composition
     * @type {Array<Deck>}
     * @memberof Composition
     */
    decks?: Array<Deck>;
    /**
     * All layers in the composition
     * @type {Array<Layer>}
     * @memberof Composition
     */
    layers?: Array<Layer>;
    /**
     * All columns in the composition
     * @type {Array<Column>}
     * @memberof Composition
     */
    columns?: Array<Column>;
    /**
     * All layergroups in the composition
     * @type {Array<LayerGroup>}
     * @memberof Composition
     */
    layergroups?: Array<LayerGroup>;
    /**
     * 
     * @type {TempoController}
     * @memberof Composition
     */
    tempoController?: TempoController;
}
/**
 * Cross fade between two clips
 * @export
 * @interface CrossFader
 */
export interface CrossFader {
    /**
     * The unique identifier of the cross fader
     * @type {number}
     * @memberof CrossFader
     */
    id?: number;
    /**
     * 
     * @type {RangeParameter}
     * @memberof CrossFader
     */
    phase?: RangeParameter;
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof CrossFader
     */
    behaviour?: ChoiceParameter;
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof CrossFader
     */
    curve?: ChoiceParameter;
    /**
     * 
     * @type {EventParameter}
     * @memberof CrossFader
     */
    sidea?: EventParameter;
    /**
     * 
     * @type {EventParameter}
     * @memberof CrossFader
     */
    sideb?: EventParameter;
    /**
     * 
     * @type {ParameterCollection}
     * @memberof CrossFader
     */
    mixer?: ParameterCollection;
}
/**
 * A deck contains a full set of layers and clips. Only the layers and clips of the active deck can be retrieved and updated.
 * @export
 * @interface Deck
 */
export interface Deck {
    /**
     * The unique identifier of the deck
     * @type {number}
     * @memberof Deck
     */
    id?: number;
    /**
     * 
     * @type {StringParameter}
     * @memberof Deck
     */
    name?: StringParameter;
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof Deck
     */
    colorid?: ChoiceParameter;
    /**
     * Get whether the deck is currently selected
     * @type {BooleanParameter}
     * @memberof Deck
     */
    selected?: BooleanParameter;
    /**
     * 
     * @type {IntegerParameter}
     * @memberof Deck
     */
    scrollx?: IntegerParameter;
}
/**
 * A parameter that handles events, but does not contain a value
 * @export
 * @interface EventParameter
 */
export interface EventParameter {
    /**
     * The unique identifier of the parameter
     * @type {number}
     * @memberof EventParameter
     */
    id?: number;
    /**
     * The parameter type. This is \"ParamEvent\" for this type
     * @type {string}
     * @memberof EventParameter
     */
    valuetype?: string;
    /**
     * 
     * @type {ParameterView}
     * @memberof EventParameter
     */
    view?: ParameterView;
}
/**
 * Frame rate expressed as ratio
 * @export
 * @interface FrameRate
 */
export interface FrameRate {
    /**
     * Numerator
     * @type {number}
     * @memberof FrameRate
     */
    num?: number;
    /**
     * Denominator
     * @type {number}
     * @memberof FrameRate
     */
    denom?: number;
}
/**
 * 
 * @export
 * @interface InlineResponse200
 */
export interface InlineResponse200 {
}
/**
 * A parameter containing numeric data
 * @export
 * @interface IntegerParameter
 */
export interface IntegerParameter {
    /**
     * The unique identifier of the parameter
     * @type {number}
     * @memberof IntegerParameter
     */
    id?: number;
    /**
     * The parameter type. This is \"ParamNumber\" for this type
     * @type {string}
     * @memberof IntegerParameter
     */
    valuetype?: string;
    /**
     * The value for the parameter
     * @type {number}
     * @memberof IntegerParameter
     */
    value?: number;
    /**
     * 
     * @type {ParameterView}
     * @memberof IntegerParameter
     */
    view?: ParameterView;
}
/**
 * A layer is a container for clips that has its own dashboard and can be selected
 * @export
 * @interface Layer
 */
export interface Layer {
    /**
     * The unique id for the layer
     * @type {number}
     * @memberof Layer
     */
    id?: number;
    /**
     * 
     * @type {StringParameter}
     * @memberof Layer
     */
    name?: StringParameter;
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof Layer
     */
    colorid?: ChoiceParameter;
    /**
     * Get whether the layer is currently selected
     * @type {BooleanParameter}
     * @memberof Layer
     */
    selected?: BooleanParameter;
    /**
     * 
     * @type {BooleanParameter}
     * @memberof Layer
     */
    bypassed?: BooleanParameter;
    /**
     * 
     * @type {BooleanParameter}
     * @memberof Layer
     */
    solo?: BooleanParameter;
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof Layer
     */
    crossfadergroup?: ChoiceParameter;
    /**
     * 
     * @type {RangeParameter}
     * @memberof Layer
     */
    master?: RangeParameter;
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof Layer
     */
    maskmode?: ChoiceParameter;
    /**
     * 
     * @type {BooleanParameter}
     * @memberof Layer
     */
    ignorecolumntrigger?: BooleanParameter;
    /**
     * 
     * @type {BooleanParameter}
     * @memberof Layer
     */
    faderstart?: BooleanParameter;
    /**
     * 
     * @type {ParameterCollection}
     * @memberof Layer
     */
    dashboard?: ParameterCollection;
    /**
     * 
     * @type {AudioTrack}
     * @memberof Layer
     */
    audio?: AudioTrack;
    /**
     * 
     * @type {VideoTrackLayer}
     * @memberof Layer
     */
    video?: VideoTrackLayer;
    /**
     * 
     * @type {LayerTransition}
     * @memberof Layer
     */
    transition?: LayerTransition;
    /**
     * All clips belonging to this layer
     * @type {Array<Clip>}
     * @memberof Layer
     */
    clips?: Array<Clip>;
    /**
     * 
     * @type {AutoPilot}
     * @memberof Layer
     */
    autopilot?: AutoPilot;
}
/**
 * A collection of layers, allowing controlling of a group of layers as a single object
 * @export
 * @interface LayerGroup
 */
export interface LayerGroup {
    /**
     * The unique id for the layer group
     * @type {number}
     * @memberof LayerGroup
     */
    id?: number;
    /**
     * 
     * @type {StringParameter}
     * @memberof LayerGroup
     */
    name?: StringParameter;
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof LayerGroup
     */
    colorid?: ChoiceParameter;
    /**
     * Get whether the layer group is currently selected
     * @type {BooleanParameter}
     * @memberof LayerGroup
     */
    selected?: BooleanParameter;
    /**
     * 
     * @type {BooleanParameter}
     * @memberof LayerGroup
     */
    bypassed?: BooleanParameter;
    /**
     * 
     * @type {BooleanParameter}
     * @memberof LayerGroup
     */
    solo?: BooleanParameter;
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof LayerGroup
     */
    crossfadergroup?: ChoiceParameter;
    /**
     * 
     * @type {RangeParameter}
     * @memberof LayerGroup
     */
    master?: RangeParameter;
    /**
     * 
     * @type {BooleanParameter}
     * @memberof LayerGroup
     */
    ignorecolumntrigger?: BooleanParameter;
    /**
     * 
     * @type {ParameterCollection}
     * @memberof LayerGroup
     */
    dashboard?: ParameterCollection;
    /**
     * 
     * @type {AudioTrack}
     * @memberof LayerGroup
     */
    audio?: AudioTrack;
    /**
     * 
     * @type {VideoTrack}
     * @memberof LayerGroup
     */
    video?: VideoTrack;
    /**
     * All the layers added to the layer group
     * @type {Array<Layer>}
     * @memberof LayerGroup
     */
    layers?: Array<Layer>;
}
/**
 * A layer transition describes the transition between clips within the layer
 * @export
 * @interface LayerTransition
 */
export interface LayerTransition {
    /**
     * 
     * @type {RangeParameter}
     * @memberof LayerTransition
     */
    duration?: RangeParameter;
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof LayerTransition
     */
    blendMode?: ChoiceParameter;
}
/**
 * An unstructured collection of parameters. Parameters are presented as a map where the key is the name of the parameter and the value is the parameter itself. Parameters may be any valid parameter type.
 * @export
 * @interface ParameterCollection
 */
export interface ParameterCollection {
    [key: string]: StringParameter | TextParameter | BooleanParameter | IntegerParameter | ColorParameter | RangeParameter | ChoiceParameter;

}
/**
 * Semantic information on the parameter, contains hints about how best to display the parameter
 * @export
 * @interface ParameterView
 */
export interface ParameterView {
    /**
     * The suffix to display for the variable. May be empty
     * @type {string}
     * @memberof ParameterView
     */
    suffix?: string;
    /**
     * Value increments to be used for e.g. sliding or rotary controls
     * @type {number}
     * @memberof ParameterView
     */
    step?: number;
    /**
     * Value to multiply with when displaying value. For a parameter with a value between 0 and 1 should display as 0 to 100
     * @type {number}
     * @memberof ParameterView
     */
    multiplier?: number;
    /**
     * Which units to display.
     * @type {string}
     * @memberof ParameterView
     */
    displayUnits?: ParameterView.DisplayUnitsEnum;
    /**
     * Which control to show for the parameter
     * @type {string}
     * @memberof ParameterView
     */
    controlType?: ParameterView.ControlTypeEnum;
}

/**
 * @export
 * @namespace ParameterView
 */
export namespace ParameterView {
    /**
     * @export
     * @enum {string}
     */
    export enum DisplayUnitsEnum {
        Real = <any> 'real',
        Integer = <any> 'integer',
        Percent = <any> 'percent',
        Degrees = <any> 'degrees',
        Decibels = <any> 'decibels',
        FramesPerSecond = <any> 'frames_per_second',
        Milliseconds = <any> 'milliseconds',
        Seconds = <any> 'seconds',
        Beats = <any> 'beats',
        Fractions = <any> 'fractions'
    }
    /**
     * @export
     * @enum {string}
     */
    export enum ControlTypeEnum {
        BasedOnParam = <any> 'based_on_param',
        ChoiceButtons = <any> 'choice_buttons',
        ChoiceCombobox = <any> 'choice_combobox',
        Spinner = <any> 'spinner',
        DurationSpinner = <any> 'duration_spinner',
        Slider = <any> 'slider',
        SliderColorRed = <any> 'slider_color_red',
        SliderColorGreen = <any> 'slider_color_green',
        SliderColorBlue = <any> 'slider_color_blue',
        SliderColorHue = <any> 'slider_color_hue',
        SliderColorSaturation = <any> 'slider_color_saturation',
        SliderColorBrightness = <any> 'slider_color_brightness',
        SliderColorAlpha = <any> 'slider_color_alpha',
        SliderColorOpacity = <any> 'slider_color_opacity',
        ColorPallette = <any> 'color_pallette',
        ColorPicker = <any> 'color_picker',
        Rotary = <any> 'rotary',
        Text = <any> 'text',
        TextMultiline = <any> 'text_multiline'
    }
}
/**
 * Generic information about the product serving the api
 * @export
 * @interface ProductInfo
 */
export interface ProductInfo {
    /**
     * The product name. This is either 'Arena' or 'Avenue'
     * @type {string}
     * @memberof ProductInfo
     */
    name?: string;
    /**
     * The major version number of the Arena or Avenue instance handling the request.
     * @type {number}
     * @memberof ProductInfo
     */
    major?: number;
    /**
     * The minor version number of the Arena or Avenue instance handling the request.
     * @type {number}
     * @memberof ProductInfo
     */
    minor?: number;
    /**
     * The micro version number of the Arena or Avenue instance handling the request.
     * @type {number}
     * @memberof ProductInfo
     */
    micro?: number;
    /**
     * The revision of the Arena or Avenue instance handling the request.
     * @type {number}
     * @memberof ProductInfo
     */
    revision?: number;
}
/**
 * A parameter containing a floating-point value with a minimum and maximum allowed value.
 * @export
 * @interface RangeParameter
 */
export interface RangeParameter {
    /**
     * The unique identifier of the parameter
     * @type {number}
     * @memberof RangeParameter
     */
    id?: number;
    /**
     * The parameter type. This is \"ParamRange\" for this type
     * @type {string}
     * @memberof RangeParameter
     */
    valuetype?: string;
    /**
     * The lowest allowed value for the parameter, inclusive
     * @type {number}
     * @memberof RangeParameter
     */
    min?: number;
    /**
     * The highest allowed value for the parameter, inclusive
     * @type {number}
     * @memberof RangeParameter
     */
    max?: number;
    /**
     * The value for the parameter
     * @type {number}
     * @memberof RangeParameter
     */
    value?: number;
    /**
     * 
     * @type {ParameterView}
     * @memberof RangeParameter
     */
    view?: ParameterView;
}
/**
 * Options for resetting a parameter, should only the value be reset, or should animations also be reset
 * @export
 * @interface ResetParameter
 */
export interface ResetParameter {
    /**
     * If set to true, animations are also reset
     * @type {boolean}
     * @memberof ResetParameter
     */
    resetanimation?: boolean;
}
/**
 * A source to be used in a clip
 * @export
 * @interface Source
 */
export interface Source {
    /**
     * The unique identifier for the source
     * @type {string}
     * @memberof Source
     */
    idstring?: string;
    /**
     * The desriptive name of the source
     * @type {string}
     * @memberof Source
     */
    name?: string;
    /**
     * All the presets for this source
     * @type {Array<string>}
     * @memberof Source
     */
    presets?: Array<string>;
}
/**
 * The available sources for clips
 * @export
 * @interface Sources
 */
export interface Sources {
    /**
     * The available video sources
     * @type {Array<Source>}
     * @memberof Sources
     */
    video?: Array<Source>;
}
/**
 * A parameter containing string data
 * @export
 * @interface StringParameter
 */
export interface StringParameter {
    /**
     * The unique identifier of the parameter
     * @type {number}
     * @memberof StringParameter
     */
    id?: number;
    /**
     * The parameter type. This is \"ParamString\" for this type
     * @type {string}
     * @memberof StringParameter
     */
    valuetype?: string;
    /**
     * The value for the parameter
     * @type {string}
     * @memberof StringParameter
     */
    value?: string;
    /**
     * 
     * @type {ParameterView}
     * @memberof StringParameter
     */
    view?: ParameterView;
}
/**
 * The controller for various tempo-related aspects of the composition
 * @export
 * @interface TempoController
 */
export interface TempoController {
    /**
     * 
     * @type {RangeParameter}
     * @memberof TempoController
     */
    tempo?: RangeParameter;
    /**
     * 
     * @type {EventParameter}
     * @memberof TempoController
     */
    tempoPull?: EventParameter;
    /**
     * 
     * @type {EventParameter}
     * @memberof TempoController
     */
    tempoPush?: EventParameter;
    /**
     * 
     * @type {EventParameter}
     * @memberof TempoController
     */
    tempoTap?: EventParameter;
    /**
     * 
     * @type {EventParameter}
     * @memberof TempoController
     */
    resync?: EventParameter;
}
/**
 * A parameter containing string data, possibly multiline
 * @export
 * @interface TextParameter
 */
export interface TextParameter {
    /**
     * The unique identifier of the parameter
     * @type {number}
     * @memberof TextParameter
     */
    id?: number;
    /**
     * The parameter type. This is \"ParamText\" for this type
     * @type {string}
     * @memberof TextParameter
     */
    valuetype?: string;
    /**
     * The value for the parameter
     * @type {any}
     * @memberof TextParameter
     */
    value?: any;
    /**
     * 
     * @type {ParameterView}
     * @memberof TextParameter
     */
    view?: ParameterView;
}
/**
 * The timeline transport controls
 * @export
 * @interface TransportBPMSync
 */
export interface TransportBPMSync {
    /**
     * 
     * @type {RangeParameter}
     * @memberof TransportBPMSync
     */
    position?: RangeParameter;
    /**
     * 
     * @type {TransportBPMSyncControls}
     * @memberof TransportBPMSync
     */
    controls?: TransportBPMSyncControls;
}
/**
 * BPM Sync controls
 * @export
 * @interface TransportBPMSyncControls
 */
export interface TransportBPMSyncControls {
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof TransportBPMSyncControls
     */
    playdirection?: ChoiceParameter;
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof TransportBPMSyncControls
     */
    playmode?: ChoiceParameter;
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof TransportBPMSyncControls
     */
    playmodeaway?: ChoiceParameter;
    /**
     * 
     * @type {RangeParameter}
     * @memberof TransportBPMSyncControls
     */
    duration?: RangeParameter;
    /**
     * 
     * @type {RangeParameter}
     * @memberof TransportBPMSyncControls
     */
    speed?: RangeParameter;
    /**
     * 
     * @type {RangeParameter}
     * @memberof TransportBPMSyncControls
     */
    bpm?: RangeParameter;
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof TransportBPMSyncControls
     */
    syncmode?: ChoiceParameter;
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof TransportBPMSyncControls
     */
    beatloop?: ChoiceParameter;
}
/**
 * The timeline transport controls
 * @export
 * @interface TransportTimeline
 */
export interface TransportTimeline {
    /**
     * 
     * @type {RangeParameter}
     * @memberof TransportTimeline
     */
    position?: RangeParameter;
    /**
     * 
     * @type {TransportTimelineControls}
     * @memberof TransportTimeline
     */
    controls?: TransportTimelineControls;
}
/**
 * Timeline controls
 * @export
 * @interface TransportTimelineControls
 */
export interface TransportTimelineControls {
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof TransportTimelineControls
     */
    playdirection?: ChoiceParameter;
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof TransportTimelineControls
     */
    playmode?: ChoiceParameter;
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof TransportTimelineControls
     */
    playmodeaway?: ChoiceParameter;
    /**
     * 
     * @type {RangeParameter}
     * @memberof TransportTimelineControls
     */
    duration?: RangeParameter;
    /**
     * 
     * @type {RangeParameter}
     * @memberof TransportTimelineControls
     */
    speed?: RangeParameter;
}
/**
 * A videoeffect represents a single effect in a chain of effects to be applied to a source. Properties on the videoeffect control how and what is rendered in the effect.
 * @export
 * @interface VideoEffect
 */
export interface VideoEffect {
    /**
     * The unique id of the video effect instance
     * @type {number}
     * @memberof VideoEffect
     */
    id?: number;
    /**
     * The name of the effect
     * @type {string}
     * @memberof VideoEffect
     */
    name?: string;
    /**
     * 
     * @type {BooleanParameter & any}
     * @memberof VideoEffect
     */
    bypassed?: BooleanParameter & any;
    /**
     * 
     * @type {ParameterCollection}
     * @memberof VideoEffect
     */
    mixer?: ParameterCollection;
    /**
     * 
     * @type {ParameterCollection}
     * @memberof VideoEffect
     */
    params?: ParameterCollection;
    /**
     * 
     * @type {ParameterCollection}
     * @memberof VideoEffect
     */
    effect?: ParameterCollection;
}
/**
 * Meta information for a video file
 * @export
 * @interface VideoFileInfo
 */
export interface VideoFileInfo {
    /**
     * The location of the file on disk
     * @type {string}
     * @memberof VideoFileInfo
     */
    path?: string;
    /**
     * Whether file is actually present on disk at the given location
     * @type {boolean}
     * @memberof VideoFileInfo
     */
    exists?: boolean;
    /**
     * Duration of file expressed as hours:seconds:minutes:milliseconds
     * @type {string}
     * @memberof VideoFileInfo
     */
    duration?: string;
    /**
     * Duration of file expressed as milliseconds
     * @type {number}
     * @memberof VideoFileInfo
     */
    durationMs?: number;
    /**
     * 
     * @type {FrameRate}
     * @memberof VideoFileInfo
     */
    framerate?: FrameRate;
    /**
     * The number of pixels the video is wide
     * @type {number}
     * @memberof VideoFileInfo
     */
    width?: number;
    /**
     * The number of pixels the video is high
     * @type {number}
     * @memberof VideoFileInfo
     */
    height?: number;
}
/**
 * A video track, as part of a clip,layer,group or a composition
 * @export
 * @interface VideoTrack
 */
export interface VideoTrack {
    /**
     * The number of pixels the clip is wide
     * @type {number}
     * @memberof VideoTrack
     */
    width?: number;
    /**
     * The number of pixels the clip is high
     * @type {number}
     * @memberof VideoTrack
     */
    height?: number;
    /**
     * 
     * @type {RangeParameter}
     * @memberof VideoTrack
     */
    opacity?: RangeParameter;
    /**
     * 
     * @type {ParameterCollection}
     * @memberof VideoTrack
     */
    mixer?: ParameterCollection;
    /**
     * All the effects that may be applied when the video track is played
     * @type {Array<VideoEffect>}
     * @memberof VideoTrack
     */
    effects?: Array<VideoEffect>;
}
/**
 * 
 * @export
 * @interface VideoTrackClip
 */
export interface VideoTrackClip extends VideoTrack {
    /**
     * The description of the source belonging to this video track
     * @type {string}
     * @memberof VideoTrackClip
     */
    description?: string;
    /**
     * 
     * @type {VideoFileInfo}
     * @memberof VideoTrackClip
     */
    fileinfo?: VideoFileInfo;
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof VideoTrackClip
     */
    resize?: ChoiceParameter;
    /**
     * 
     * @type {BooleanParameter}
     * @memberof VideoTrackClip
     */
    r?: BooleanParameter;
    /**
     * 
     * @type {BooleanParameter}
     * @memberof VideoTrackClip
     */
    g?: BooleanParameter;
    /**
     * 
     * @type {BooleanParameter}
     * @memberof VideoTrackClip
     */
    b?: BooleanParameter;
    /**
     * 
     * @type {BooleanParameter}
     * @memberof VideoTrackClip
     */
    a?: BooleanParameter;
    /**
     * 
     * @type {ParameterCollection & any}
     * @memberof VideoTrackClip
     */
    sourceparams?: ParameterCollection & any;
}
/**
 * 
 * @export
 * @interface VideoTrackLayer
 */
export interface VideoTrackLayer extends VideoTrack {
    /**
     * 
     * @type {ChoiceParameter}
     * @memberof VideoTrackLayer
     */
    autosize?: ChoiceParameter;
}
