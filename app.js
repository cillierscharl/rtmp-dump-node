var rtmpDump = require('./lib/node-rtmpdump');
var twitchRTMPDump = require('./lib/node-rtmpdump-twitch');

function twitchOutputToVlc(){
	var output = new rtmpDump.VlcOutput('C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe'),
		twitchDump = new twitchRTMPDump('wtducksauce','720p',output);
}

function twitchOutputToFile(){
	var output = new rtmpDump.FileOutput('C:/testing.flv'),
		twitchDump = new twitchRTMPDump('cdewx','',output);
}

function twitchOutputToFFMpeg(){
	// Second Parameter are flags for FFMpeg. '' = DefaultSettings - c:a c:v
	var output = new rtmpDump.FfmpegOutput('ffmpeg.exe','','rtmp://localhost/oflaDemo/live live=1'),
		twitchDump = new twitchRTMPDump('cdewx','',output);
}

twitchOutputToVlc();