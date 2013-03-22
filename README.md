Node-RTMPDump
=============

Flexible RTMPDump utility for Node.js built with a few output and option helper functions so you don't have to remember flag order, quote wrapping, escaping or syntax.

RTMPDump Output helper functions for the following:
---
 - File 
 - VLC
 - FFMpeg
 - Custom

Example - File Output
---

Full list of options for the options array : [node-rtmpdump.js#L135](https://github.com/f0xy/Node-RTMPDump/blob/master/lib/node-rtmpdump.js#L135)

```javascript
var rtmpDump = require('./lib/node-rtmpdump');

// Specify the output type and destination:
// File Output only requires the path of the file.
var output = new rtmpDump.FileOutput('newFile.flv');

// Specify the flags to use as well as their parameter, for parameter-less flags omit the value.
// Order is not important as the parameters will be sorted correctly.
var rtmpDumpOptions = [
    new rtmpDump.Option( rtmpDump.options.url , 'rtmp://url' )
];

// Create the command.
// Pass the path to rtmpdump.exe, the options array and the output object.
var rtmpDumpCommand = new RTMPDump.RTMPDumpCommand('rtmpdump.exe',rtmpDumpOptions,output);
// Build the command
rtmpDumpCommand.buildRMTPCommand();
// Go Time! Execute the RTMPDump command
rtmpDumpCommand.launch();
```

Example - VLC Output
---
```javascript
// Specify the output type and destination:
// VLC Output only requires the path of the VLC executable.
var output = new rtmpDump.VlcOutput('C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe');
```

Example - FFMpeg Output
---
```javascript
// Specify the output type and destination:
// Second Parameter set for FFMpeg flags.
// Empty quotes invoke the default settings = DefaultSettings - c:a c:v -f flv
// Copy audio and video from source output to flv
var output = new rtmpDump.FfmpegOutput('ffmpeg.exe','','rtmp://url');
// Verbose example:
var output = new rtmpDump.FfmpegOutput('ffmpeg.exe','c:a c:v -f flv','rtmp://url');
```

Example - Custom Output
---
```javascript
// Specify the output type and destination:
// Custom pipes out your parameter
// Output : rtmpdump ... | Parameter Input
var output = new new rtmpDump.CustomOutput('ffmpeg.exe c:a c:v -f flv rtmp://url');
```
----------------------------------------

Node-RTMPDump-Twitch
====================

Twitch extension to show how you can abstract away certain complexity setting up RTMPDump for a specific provider.

Example - RTMPDump Twitch to VLC
---

```javascript
// VLC Output only requires the path of the VLC executable.
var output = new rtmpDump.VlcOutput('C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe');
// Pass in the name of a Twitch Stream Channel : ex. http://twitch.tv/reckful
// It will then get all the parameters it requires from meta data sites and start RTMPDump with the output specified.
// Parameters : Channel Name, Quality Setting, output object.
var twitchDump = new twitchRTMPDump('reckful','live',output);
```

Example - RTMPDump Twitch to File
---

```javascript
// Create output to FFMpeg pointing to a RTMP Server
var output = new rtmpDump.FileOutput('newFile.flv');
// Pass in the name of a Twitch Stream Channel : ex. http://twitch.tv/reckful
// It will then get all the parameters it requires from meta data sites and start RTMPDump with the output specified.
// Parameters : Channel Name, Quality Setting, output object.
var twitchDump = new twitchRTMPDump('reckful','live',output);
```

Example - RTMPDump Twitch to FFMpeg
---

```javascript
// Create output to FFMpeg pointing to a RTMP Server
var output = new rtmpDump.FfmpegOutput('ffmpeg.exe','','rtmp://url');
// Pass in the name of a Twitch Stream Channel : ex. http://twitch.tv/reckful
// It will then get all the parameters it requires from meta data sites and start RTMPDump with the output specified.
// Parameters : Channel Name, Quality Setting, output object.
var twitchDump = new twitchRTMPDump('reckful','live',output);
```

Example - RTMPDump Twitch - > FFMpeg - > IIS Smooth Streaming
---

```javascript
// Create output to FFMpeg pointing to an IIS Server with Media Services Server
// Pass in some parameters - Update the audio and video bitrate accordingly. (Required by IIS to be verbose about the rates)
var output = new rtmpDump.FfmpegOutput('ffmpeg.exe','-vcodec libx264 -b:v 444k -acodec libvo_aacenc -ab 128k -ar 48000 -movflags isml+frag_keyframe -f ismv','http://localhost/livestream.isml/Streams(Encoder1)');
// Pass in the name of a Twitch Stream Channel : ex. http://twitch.tv/reckful
// It will then get all the parameters it requires from meta data sites and start RTMPDump with the output specified.
// Parameters : Channel Name, Quality Setting, output object.
var twitchDump = new twitchRTMPDump('reckful','live',output);
```

----------------------------------------

Links:
---

RTMPDump Utility Home Page : http://rtmpdump.mplayerhq.hu/


