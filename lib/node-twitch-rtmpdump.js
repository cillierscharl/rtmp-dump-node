var http = require('http');
var xml = require('xml2js');

var TwitchRTMPDump = TwitchRTMPDump || {};

var xyz = '<nodes><live><node>l3</node><needed_info /><play>stream_live_user_sodapoppin</play><meta_game>World of Warcraft: Mists of Pandaria</meta_game><video_height>1080</video_height><bitrate>0</bitrate><broadcast_part>5</broadcast_part><persistent>true</persistent><cluster>l3</cluster><token>7746b42f5fb727c911cb1c09256a1915d3a4edc3:{"swfDomains": ["justin.tv", "jtvx.com", "xarth.com", "twitchtv.com", "twitch.tv", "newjtv.com", "jtvnw.net", "wdtinc.com", "imapweather.com", "facebook.com", "starcrafting.com"], "streamName": "stream_live_user_sodapoppin", "expiration": 1363643090.7545781, "server": "l3"}</token><connect>rtmp://justintvlivefs.fplive.net/justintv4live-live</connect><broadcast_id>5145486192</broadcast_id><display>1080p+</display></live><360p><node>l3</node><needed_info /><play>stream_360p_user_sodapoppin</play><meta_game>World of Warcraft: Mists of Pandaria</meta_game><video_height>360</video_height><bitrate>512</bitrate><broadcast_part>1</broadcast_part><persistent>true</persistent><cluster>l3</cluster><token>e0a0a949d7d2184c770ec81bf7d83eba12647843:{"swfDomains": ["justin.tv", "jtvx.com", "xarth.com", "twitchtv.com", "twitch.tv", "newjtv.com", "jtvnw.net", "wdtinc.com", "imapweather.com", "facebook.com", "starcrafting.com"], "streamName": "stream_360p_user_sodapoppin", "expiration": 1363643090.7545781, "server": "l3"}</token><connect>rtmp://justintvlivefs.fplive.net/justintv6live-live</connect><broadcast_id>5145487504</broadcast_id><display>360p</display></360p><480p><node>l3</node><needed_info /><play>stream_480p_user_sodapoppin</play><meta_game>World of Warcraft: Mists of Pandaria</meta_game><video_height>480</video_height><bitrate>768</bitrate><broadcast_part>1</broadcast_part><persistent>true</persistent><cluster>l3</cluster><token>d62d200e3aeb8fe11b471c1baf6e19f252102042:{"swfDomains": ["justin.tv", "jtvx.com", "xarth.com", "twitchtv.com", "twitch.tv", "newjtv.com", "jtvnw.net", "wdtinc.com", "imapweather.com", "facebook.com", "starcrafting.com"], "streamName": "stream_480p_user_sodapoppin", "expiration": 1363643090.7545781, "server": "l3"}</token><connect>rtmp://justintvlivefs.fplive.net/justintv5live-live</connect><broadcast_id>5145487520</broadcast_id><display>480p</display></480p><iphonehigh><node>video19-2.ord01</node><needed_info /><play>jtv_19xYVMwEC8_oquZ2</play><meta_game>World of Warcraft: Mists of Pandaria</meta_game><video_height>226</video_height><bitrate>100</bitrate><broadcast_part>1</broadcast_part><persistent>true</persistent><cluster>ord01</cluster><token>4e57943c4c3737dd415de53f75ad6360dd408c00:{"streamName": "jtv_19xYVMwEC8_oquZ2", "expiration": 1363643090.7545781, "server": "video19-2.ord01"}</token><connect>rtmp://199.9.254.111/app</connect><broadcast_id>5145570240</broadcast_id><display>iphonehigh</display></iphonehigh><iphonelow><node>video82-1</node><needed_info /><play>jtv_ZiGr8R3M3QD3aHeg</play><meta_game>World of Warcraft: Mists of Pandaria</meta_game><video_height>226</video_height><bitrate>25</bitrate><broadcast_part>1</broadcast_part><persistent>true</persistent><cluster>sfo01</cluster><token>6daa3d95c9b2e26bebe90bfcfed7cfad00ad356d:{"streamName": "jtv_ZiGr8R3M3QD3aHeg", "expiration": 1363643090.7545781, "server": "video82-1"}</token><connect>rtmp://199.9.252.16/app</connect><broadcast_id>5145570224</broadcast_id><display>iphonelow</display></iphonelow></nodes>';


TwitchRTMPDump.config = {
	twitchUsherURL : 'usher.justin.tv',
	twitchFlashObjectURL : 'justin.tv/widgets/live_embed_player.swf',
	twitchInfoURL : 'http://usher.twitch.tv/find/{0}.xml?type=any&p={1}&b_id=true&group=&private_code'
}

TwitchRTMPDump.Parser = function(user){
	this.user = user;
	this.twitchMetaDataURL = TwitchRTMPDump.config.twitchInfoURL.format(user,TwitchRTMPDump.util.randomStreamNumber());
}

TwitchRTMPDump.Parser.prototype = {

	getStreamMetaDatax : function(){
		var lol = this.parseStreamMetaData(xyz);

	},
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