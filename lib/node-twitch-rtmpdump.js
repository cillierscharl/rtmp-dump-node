var http = require('http');
var xml = require('xml2js');

var RTMPDumpUtility = RTMPDumpUtility || {};

RTMPDumpUtility.config = {	
	// RTMPDump specific 
	rtmpdumpCommand : 'rtmpdump.exe ',

	// File Output
	rtmpdumpFileOutput : ' -o {0}',

	// Custom Output
	rtmpdumpCustomOutput : '| {0}',

	// VLC Output
	rtmpdumpVLCOutput : '| "{0}" -',
	// Default path if none is specified
	vlcDefaultPath : '"C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe"',

	//FFMpeg Output 
	rtmpdumpFFMpegOutput : '| ffmpeg -i pipe:0 {0} -f flv "{1}"',
	rtmpdumpFFMpegDefault : '-c:a copy -c:v copy'
}

RTMPDumpUtility.twitchConfig = {
	// Base URLs
	twitchFlashObjectURL : 'http://justin.tv/widgets/live_embed_player.swf',
	twitchCurrentFlashObjectURL : 'http://www-cdn.jtvnw.net/widgets/live_embed_player.rd8826b4f6f9c3448d9f8425065c67ca15be8371f.swf',
	twitchInfoURL : 'http://usher.twitch.tv/find/{0}.xml?type=any&p={1}&b_id=true&group=&private_code',
	twitchRtmpDumpCommand : '-r "{0}" -W "{1}" -j "{2}" -v -y "{3}"'
}


RTMPDumpUtility.RTMPDump = function(){
	this.output = _output;
}

RTMPDumpUtility.RTMPDump.prototype = {
	startRTMPDump : function(_command){
		var exec = require('child_process').exec;
		var child = exec(_command ,function (err,stdout,stderr){
		 	if ( err ) {
				console.log(stderr);
			}
		});
	},
	outputs : {
		// Pipe RTMPDump output to FFMpeg
		ffmpeg : function(){ 

		},
		// Pipe RTMPDump output to VLC
		vlc : function(_pathToVlc){
			var path;
			if(_pathToVlc){
				path = _pathToVlc;
			}else{
				path = RTMPDumpUtility.config.vlcDefaultPath;
			}
		},
		// Pipe RTMPDump output to a flat file
		file : function(){
			
		}
	},
	configure : function(){

	}

}

RTMPDumpUtility.TwitchStream = function(user){
	this.user = user;
	this.twitchMetaDataURL = RTMPDumpUtility.twitchConfig.twitchInfoURL.format(user,RTMPDumpUtility.util.randomStreamNumber());
}

RTMPDumpUtility.TwitchStream.prototype = {
	getStreamMetaData : function(callback){
		var _this = this,
			resultContainer = "";
		console.log('Getting Stream MetaData' + '\n') ;
		var req = http.request(this.twitchMetaDataURL, function(res){
			res.setEncoding('utf8');
			res.on('data',function(data){
				resultContainer += data;
			});
			res.on('end',function(){
				console.log('Parsing Stream MetaData' + '\n');
				_this.parseStreamMetaData(resultContainer);
				if(callback){
					callback();
				}
			});
		});

		req.on('error',function(e){
			console.log('Error Loading Stream MetaData : ' + e.message);
		});
		req.end();
	},
	parseStreamMetaData : function(_data){
		var _this = this;
		//Twitch Responds with some invalid XML - fix it up. >_>
		_data = _data.replace(/<(\d+)/g,'<_$1');
		_data = _data.replace(/<\/(\d+)/g,'</_$1');

		var parser = new xml.Parser();
		parser.parseString(_data,function(err,result){
			if(err){
				console.log(err);
				console.log('Error Parsing XML MetaData');
				return;
			}
			console.log('Parsing Stream MetaData Complete' + '\n');
			_this.rtmpDumpCommand = RTMPDumpUtility.util.buildRTMPDumpCommand(result.nodes);
		});
	},	
	buildRTMPDumpCommand : function(nodes){
		var broadcastNode = nodes['live'][0];
		var commandString = RTMPDumpUtility.config.rtmpdumpRestreamCommand.format(
			broadcastNode.connect[0],
			RTMPDumpUtility.twitchConfig.twitchCurrentFlashObjectURL,
			RTMPDumpUtility.util.escapseQuotes( broadcastNode.token[0] ),
			broadcastNode.play[0]
		);
		return commandString;
	},
}

RTMPDumpUtility.util = {
	randomStreamNumber : function(){
		var ran = Math.floor(Math.random() * 10000);
		return ran;
	}
}

String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};

module.exports = RTMPDumpUtility;