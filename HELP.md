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

### Available Actions
* Start Clip
* Start Column
* Bypass Layer
* Solo Layer
* Select Layer
* Clear Layer
* Clear All Layers
* Group Next Column
* Group Previous Column
* Composition Next Column
* Composition Previous Column
* Layer Next Column
* Layer Previous Column
* Custom OSC Command