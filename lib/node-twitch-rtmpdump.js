var http = require('http');
var xml = require('xml2js');

var TwitchRTMPDump = TwitchRTMPDump || {};

TwitchRTMPDump.config = {
	twitchFlashObjectURL : 'http://justin.tv/widgets/live_embed_player.swf',
	twitchCurrentFlashObjectURL : 'http://www-cdn.jtvnw.net/widgets/live_embed_player.rd8826b4f6f9c3448d9f8425065c67ca15be8371f.swf',
	twitchInfoURL : 'http://usher.twitch.tv/find/{0}.xml?type=any&p={1}&b_id=true&group=&private_code',
	rtmpdumpCommand : 'rtmpdump.exe -r "{0}" -W "{1}" -j "{2}" -v -y "{3}" -o test.flv -',
	rtmpdumpRestreamCommand : 'rtmpdump.exe -r "{0}" -W "{1}" -j "{2}" -v -y "{3}" | ffmpeg -i pipe:0 -c:a copy -c:v copy -f flv "rtmp://localhost/oflaDemo/live live=1"'
	
}

TwitchRTMPDump.Parser = function(user){
	this.user = user;
	this.twitchMetaDataURL = TwitchRTMPDump.config.twitchInfoURL.format(user,TwitchRTMPDump.util.randomStreamNumber());
}

TwitchRTMPDump.Parser.prototype = {
	getStreamMetaData : function(callback){
		var _this = this;
		var resultContainer = "";
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
			_this.rtmpDumpCommand = TwitchRTMPDump.util.buildRTMPDumpCommand(result.nodes);

		});
	},

	startRTMPDump : function(){
		console.log('Dumping RTMP stream to FFMpeg' + '\n');
		var exec = require('child_process').exec;
		var child = exec(this.rtmpDumpCommand ,function (err,stdout,stderr){
		 	if ( err ) {
				console.log(stderr);
			}
		});
	}

}

TwitchRTMPDump.util = {
	randomStreamNumber : function(){
		var ran = Math.floor(Math.random() * 10000);
		return ran;
	},
	buildRTMPDumpCommand : function(nodes){
		var broadcastNode = nodes['live'][0];
		var commandString = TwitchRTMPDump.config.rtmpdumpRestreamCommand.format(
			broadcastNode.connect[0],
			TwitchRTMPDump.config.twitchCurrentFlashObjectURL,
			TwitchRTMPDump.util.escapseQuotes( broadcastNode.token[0] ),
			broadcastNode.play[0]
		);

		return commandString;

	},
	escapseQuotes : function(text){
		return text.replace(/"/g,"\\\"")
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

module.exports = TwitchRTMPDump;