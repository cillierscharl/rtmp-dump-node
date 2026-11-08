Node-RTMPDump
=============

> [!WARNING]
> **Archived in November 2026. This no longer works and isn't maintained.**
>
> It was written in March–April 2013, when Twitch still served streams over RTMP from its Justin.tv infrastructure. The idea was to skip the Flash player: pick a channel from the top *World of Warcraft: Mists of Pandaria* streams in a little CLI, then watch it in VLC, save it to a file, or restream it through FFmpeg.
>
> Everything it talked to is gone:
>
> - **The Kraken API** (`api.twitch.tv/kraken`), which listed live streams, was shut down in 2022.
> - **`usher.twitch.tv/find`**, which handed out the RTMP URL and token, and the **justin.tv** player SWF no longer respond.
> - **Flash** reached end of life in 2020, which took SWF verification with it. Twitch moved playback to HLS long before that.
> - **rtmpdump** itself hasn't had a proper release since 2010.
>
> For the same job today:
>
> - [Streamlink](https://streamlink.github.io/) or [yt-dlp](https://github.com/yt-dlp/yt-dlp) to watch or record Twitch streams.
> - [FFmpeg](https://ffmpeg.org/), which reads `rtmp://` URLs natively: `ffmpeg -i rtmp://host/app/stream -c copy out.flv`.
>
> The code is left exactly as it was, for posterity.

Flexible RTMPDump utility for Node.js built with a few output and option helper functions so you don't have to remember flag order, quote wrapping, escaping or syntax.

RTMPDump Output helper functions for the following:
---
 - File 
 - VLC
 - FFMpeg
 - Custom

Example - File Output
---

Full list of options for the options array : [node-rtmpdump.js#L132](https://github.com/cillierscharl/rtmp-dump-node/blob/master/lib/node-rtmpdump.js#L132)

```javascript
var rtmpDump = require('./lib/node-rtmpdump');

// Specify the output type and destination:
// File Output only requires the path of the file.
var output = new rtmpDump.FileOutput('newFile.flv');

// Specify the flags to use as well as their parameter, for parameter-less flags omit the value.
// Order is not important as the parameters will be sorted correctly.
var rtmpDumpOptions = [
    new rtmpDump.Option( rtmpDump.options.url , 'rtmp://url' ),
    new rtmpDump.Option( rtmpDump.options.live )
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
var twitchDump = new TwitchRTMPDump('reckful','live',output);
```

Example - RTMPDump Twitch to File
---

```javascript
// Create output to FFMpeg pointing to a RTMP Server
var output = new rtmpDump.FileOutput('newFile.flv');
// Pass in the name of a Twitch Stream Channel : ex. http://twitch.tv/reckful
// It will then get all the parameters it requires from meta data sites and start RTMPDump with the output specified.
// Parameters : Channel Name, Quality Setting, output object.
var twitchDump = new TwitchRTMPDump('reckful','live',output);
```

Example - RTMPDump Twitch to FFMpeg
---

```javascript
// Create output to FFMpeg pointing to a RTMP Server
var output = new rtmpDump.FfmpegOutput('ffmpeg.exe','','rtmp://url');
// Pass in the name of a Twitch Stream Channel : ex. http://twitch.tv/reckful
// It will then get all the parameters it requires from meta data sites and start RTMPDump with the output specified.
// Parameters : Channel Name, Quality Setting, output object.
var twitchDump = new TwitchRTMPDump('reckful','live',output);
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
var twitchDump = new TwitchRTMPDump('reckful','live',output);
```

----------------------------------------

Links:
---

RTMPDump Utility Home Page : https://rtmpdump.mplayerhq.hu/


