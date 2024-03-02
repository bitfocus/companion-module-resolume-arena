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

---
### Some Examples

![image](https://github.com/bitfocus/companion-module-resolume-arena/assets/10220112/a3cbebd2-d4c8-4bcc-a139-ae3c41d7cee0)
![image](https://github.com/bitfocus/companion-module-resolume-arena/assets/10220112/7e43e648-1816-43d2-ad3c-3a5ac43f8c57)
![image](https://github.com/bitfocus/companion-module-resolume-arena/assets/10220112/575fecb8-2d26-4a46-ac35-d26cd272d3dc)
