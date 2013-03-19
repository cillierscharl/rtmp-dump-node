var http = require('http');
var xml = require('xml2js');

var TwitchRTMPDump = TwitchRTMPDump || {};

TwitchRTMPDump.config = {
	twitchFlashObjectURL : 'http://justin.tv/widgets/live_embed_player.swf',
	twitchInfoURL : 'http://usher.twitch.tv/find/{0}.xml?type=any&p={1}&b_id=true&group=&private_code'
}

TwitchRTMPDump.Parser = function(user){
	this.user = user;
	this.twitchMetaDataURL = TwitchRTMPDump.config.twitchInfoURL.format(user,TwitchRTMPDump.util.randomStreamNumber());
}

TwitchRTMPDump.Parser.prototype = {

	getStreamMetaData : function(){
		var _this = this;
		var resultContainer = "";
		console.log('Getting Stream MetaData : ' + this.twitchMetaDataURL);
		var req = http.request(this.twitchMetaDataURL, function(res){
			res.setEncoding('utf8');
			res.on('data',function(data){
				resultContainer += data;
			});
			res.on('end',function(){
				_this.parseStreamMetaData(resultContainer);
			});
		});

		req.on('error',function(e){
			console.log('Error Loading Stream MetaData : ' + e.message);
		});

		req.end();

	},
	parseStreamMetaData : function(_data){
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

			//console.log(result);
			var live = result.nodes['live'][0];
			// testing
			console.log("rtmpdump.exe -r \"" + live.connect[0] + "\" -f \"WIN 11,0,1,152\" -W \"http://www-cdn.jtvnw.net/widgets/live_embed_player.rd8826b4f6f9c3448d9f8425065c67ca15be8371f.swf\" -j \"" + live.token[0].replace(/"/g,"\\\"") + "\" -v -y \"" + live.play[0].replace('"','\\"') + "\" -o test.flv - ");

		});
	}
}

TwitchRTMPDump.util = {
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

module.exports = TwitchRTMPDump;