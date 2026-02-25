# companion-module-resolume-arena

See [HELP](companion/HELP.md) and [LICENSE](LICENSE)

> WARNING! Do not edit the [README.md](README.md), this file is generated from the [README.tpl](README.tpl), edit that one instead. (git [pre-commit](./.h) hook should generate the [README.md](README.md))

## Resolume Arena
This module is for controlling Resolume Arena.

### Configuration
* Type in the IP address of the device.
* Type in the OSC port of the device (default is 7000).
* Type in the Rest API port of the device (default is 8080).
* Select whether you're using SSL (https://...) for the Rest API (default is no)

In Resolume, enable both REST API (Webserver in Resolume Preferences) and OSC .
Some functions are only available
on the OSC interface and some are only available in the Rest API. If your version
of Resolume only has the OSC interface, leave the Rest API port blank. Note that
the feedback functions require the Rest API. Most other functions will fall back 
to using OSC if the Rest API port is not specified.

The module status will show an error if the Rest API port is not responding (e.g.
you've misconfigured Resolume). There is no way to tell if the OSC port is connected
so the module will always show an OK status if you only specify the OSC port.

#### OSC Listener (Optional)
Enable the OSC Listener to receive real-time feedback from Resolume over OSC. This provides transport variables (elapsed time, remaining time, duration, clip name), progress bar feedback with countdown color warnings, and active column tracking — without requiring the REST API.

To set up:
1. In the module config, enable **Enable OSC Listener** and set the **OSC Receive Port** (default 7001).
2. In Resolume Preferences > OSC, enable **OSC Output**, set the destination to your Companion machine's IP, and set the port to match the Receive Port above.

The OSC listener works alongside or independently of the REST API. OSC transport actions (play, pause, trigger, etc.) are always available when the OSC send port is configured, even without the listener enabled.

---
### Available Actions

#### Composition
* Change Composition Opacity
* Change Composition Speed
* Tap Tempo
* Resync Tempo

#### Clips
* Trigger Clip
* Select Clip

#### Columns
* Trigger Column
* Layer Next Column
* Layer Previous Column
* Layer Group Next Column
* Layer Group Previous Column
* Composition Next Column
* Composition Previous Column

#### Layers 
* Bypass Layer
* Solo Layer
* Select Layer
* Clear Layer
* Clear All Layers
* Change Layer Opacity

#### Layer Groups
* Bypass Layer Group
* Solo Layer Group
* Select Layer Group
* Clear Layer Group
* Trigger Layer Group Column
* Change Layer Group Opacity

#### Custom
* Custom OSC Command

#### OSC Transport
These actions use OSC only and do not require the REST API.

**Composition / Columns**
* Trigger Column
* Next / Previous Column
* Clear All Layers (Stop All)
* Select Column
* Set Composition Opacity / Volume / Master / Speed / Tempo
* Tempo Tap / Resync
* Next / Previous / Select Deck

**Clips**
* Connect Clip (Play)
* Select Clip
* Clip Pause / Resume (with Play/Pause toggle)
* Set Clip Speed / Opacity / Volume
* Go to Position (Normalized) / Time (Seconds)
* Jog Time (±Seconds)
* Go to Seconds from End
* Restart Clip on Layer

**Layers**
* Clear Layer (Stop)
* Layer Next / Previous Clip
* Set Layer Opacity / Volume / Master / Speed
* Bypass Layer / Solo Layer / Select Layer
* Layer Transition Duration

**Groups**
* Group Trigger / Next / Previous Column
* Group Clear (Disconnect Layers)
* Group Bypass / Solo / Select
* Group Set Master / Opacity / Volume / Speed
* Select Group Column

**Utility**
* Custom OSC Command
* Re-Query Active Clip Info (manual refresh)

---

### Available Feedbacks

#### Composition
* Composition Opacity (0-100%)
* Composition Speed (0-1000%)
* Tempo (BPM)

#### Clips
* Clip Info (name + thumbnail)
* Connected Clip
* Selected Clip

#### Columns
* Column Selected
* Selected Column Name
* Next Column Name
* Previous Column Name

#### Layers 
* Layer Bypassed
* Layer Solo
* Layer Active
* Layer Selected
* Layer Opacity
* Layer Selected Column Name
* Layer Next Column Name
* Layer Previous Column Name

#### Layer Groups
* Layer Group Bypassed
* Layer Group Solo
* Layer Group Active
* Layer Group Selected
* Layer Group Opacity
* Layer Group Column Selected
* Layer Group Selected Column Name
* Layer Group Next Column Name
* Layer Group Previous Column Name

#### OSC Transport
These feedbacks require the OSC Listener to be enabled.
* Progress Bar — displays a horizontal progress bar that fills left-to-right as a clip plays, with configurable color changes for countdown warnings (green → orange → red)
* Active Column — highlights when a specific column is the active composition column

---

### Available Variables (OSC Listener)
When the OSC Listener is enabled, the following variables are available for each layer (1–10 by default, auto-expands for additional layers):
* `osc_layer_N_elapsed` — elapsed time (MM:SS or HH:MM:SS)
* `osc_layer_N_duration` — total duration
* `osc_layer_N_remaining` — remaining time
* `osc_layer_N_remaining_seconds` — remaining time in whole seconds
* `osc_layer_N_progress` — playback progress (0–100%)
* `osc_layer_N_clip_name` — name of the active clip

Composition-level variables:
* `osc_active_column` — currently active column number
* `osc_active_column_name` — active column name (rename columns in Resolume for custom names)

---

### Available Presets

#### Clips
* Trigger Clip
* Selected Clip

#### Columns
* Trigger Column
* Selected Column Name
* Trigger Next Column
* Trigger Previous Column

#### Layers 
* Bypass Layer
* Solo Layer
* Clear Layer
* Select Layer

#### Layer Groups
* Bypass Layer Group
* Solo Layer Group
* Clear Layer Group
* Select Layer Group
* Trigger Layer Group Column
* Layer Group Selected Column
* Layer Group Next Column
* Layer Group Previous Column

#### Tempo
* Tap
* Resync

#### OSC Transport / Layer (per layer 1–10)
* Trigger Clip
* Previous / Next Clip
* Clear
* Reverse / Pause / Play / Restart
* Bypass Off / On
* Opacity 0% / 100%
* Jog -10s / +10s
* Last 60s / 30s / 15s / 10s (countdown jumps)
* TRT (duration + remaining with countdown progress bar)
* Clip Name + Remaining
* Progress Bar (remaining time with color-changing progress bar)

#### OSC Transport / Group (per group 1–3)
* Trigger / Previous / Next Column
* Clear
* Reverse / Pause / Play
* Bypass Off / On
* Master 0% / 100%

#### OSC Transport / Composition
* Trigger / Previous / Next Column
* Clear All
* Reverse / Pause / Play
* Master 0% / 100%
* Previous / Next Deck
* Tempo Tap
* Refresh Clip Data
* Active Column / Active Column Name

---
### Some Examples

![image](https://github.com/bitfocus/companion-module-resolume-arena/assets/10220112/a3cbebd2-d4c8-4bcc-a139-ae3c41d7cee0)
![image](https://github.com/bitfocus/companion-module-resolume-arena/assets/10220112/7e43e648-1816-43d2-ad3c-3a5ac43f8c57)
![image](https://github.com/bitfocus/companion-module-resolume-arena/assets/10220112/575fecb8-2d26-4a46-ac35-d26cd272d3dc)
