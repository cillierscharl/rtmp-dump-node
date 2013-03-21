var http = require('http');
var xml = require('xml2js');
var RTMPDump = require('./node-rtmpdump');

RTMPDump.ApplicationWrappers = RTMPDump.ApplicationWrappers || {};
RTMPDump.ApplicationWrappers.Twitch = {};

RTMPDump.ApplicationWrappers.Twitch.config = {
	// Base URLs
	twitchFlashObjectURL : 'http://justin.tv/widgets/live_embed_player.swf',
	twitchCurrentFlashObjectURL : 'http://www-cdn.jtvnw.net/widgets/live_embed_player.rd8826b4f6f9c3448d9f8425065c67ca15be8371f.swf',
	twitchInfoURL : 'http://usher.twitch.tv/find/{0}.xml?type=any&p={1}&b_id=true&group=&private_code',
	twitchRTMPDumpCommand : '-r "{0}" -W "{1}" -j "{2}" -v -y "{3}"'
}

RTMPDump.ApplicationWrappers.TwitchInstance = function(_user,quality,output){
	this.user = _user;
	this.quality = quality;
	this.output = output;
	this.metaDataURL = RTMPDump.ApplicationWrappers.Twitch.config.twitchInfoURL.format(
		_user,RTMPDump.ApplicationWrappers.Twitch.util.randomStreamNumber()
	);

	// Twitch RTMP Dump parameters
	this.url = '';
	this.swfUrl = '';
	this.jsonToken = '';
	this.playPath = '';

	// Init the object
	this.init();
}

RTMPDump.ApplicationWrappers.TwitchInstance.prototype = {
	init : function(){
		this.getStreamMetaData();
	},
	getStreamMetaData : function(){
		var _this = this,
			resultContainer = "";
		console.log('Getting Stream MetaData' + '\n') ;
		var req = http.request(this.metaDataURL, function(res){
			res.setEncoding('utf8');
			res.on('data',function(data){
				resultContainer += data;
			});
			res.on('end',function(){
				console.log('Parsing Stream MetaData' + '\n');
				_this.parseStreamMetaData(resultContainer);
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

			// If no quality is specified, use the first one (Highest Quality)
			if(_this.quality == ''){
				var broadcastNode = result.nodes['live'][0];
				_this.url = broadcastNode.connect[0];
				_this.swfUrl = RTMPDump.ApplicationWrappers.Twitch.config.twitchCurrentFlashObjectURL;
				_this.jsonToken = broadcastNode.token[0];
				_this.playPath = broadcastNode.play[0];
			}
			_this.buildRTMPDumpCommand();

		});
	},
	buildRTMPDumpCommand : function(){
		var rtmpDumpOptions = [
			new RTMPDump.Option( RTMPDump.options.url , this.url ),
			new RTMPDump.Option( RTMPDump.options.live ),
			new RTMPDump.Option( RTMPDump.options.swfVfy , this.swfUrl ),
			new RTMPDump.Option( RTMPDump.options.playpath , this.playPath ),
			new RTMPDump.Option( RTMPDump.options.jsonToken , this.jsonToken ),
			new RTMPDump.Option( RTMPDump.options.quiet )
		]
		var rtmpDumpCommand = new RTMPDump.RTMPDumpCommand('rtmpdump.exe',rtmpDumpOptions,this.output);
		rtmpDumpCommand.buildRMTPCommand();
		rtmpDumpCommand.launch();
	}
}

RTMPDump.ApplicationWrappers.Twitch.util = {
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

module.exports = RTMPDump.ApplicationWrappers.TwitchInstance;