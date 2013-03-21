var http = require('http');
var xml = require('xml2js');
var colors = require('colors');
var RTMPDump = require('./node-rtmpdump');

RTMPDump.ApplicationWrappers = RTMPDump.ApplicationWrappers || {};
RTMPDump.ApplicationWrappers.Twitch = {};

RTMPDump.ApplicationWrappers.Twitch.config = {
	// Base URLs
	twitchFlashObjectURL : 'http://justin.tv/widgets/live_embed_player.swf',
	twitchCurrentFlashObjectURL : 'http://www-cdn.jtvnw.net/widgets/live_embed_player.rd8826b4f6f9c3448d9f8425065c67ca15be8371f.swf',
	twitchInfoURL : 'http://usher.twitch.tv/find/{0}.xml?type=any&p={1}&b_id=true&group=&private_code',
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
		this.getStreamSWFUrl();
	},
	getStreamMetaData : function(){
		var _this = this,
			resultContainer = "";
		console.log('[info]'.cyan + ' Getting Stream MetaData') ;
		var req = http.request(this.metaDataURL, function(res){
			res.setEncoding('utf8');
			res.on('data',function(data){
				resultContainer += data;
			});
			res.on('end',function(){
				console.log('[info]'.cyan + ' Parsing Stream MetaData');
				_this.parseStreamMetaData(resultContainer);
			});
		});

		req.on('error',function(e){
			console.log('[error]'.red + ' Error Loading Stream MetaData : ' + e.message);
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
				console.log('[error]'.red + ' Error Parsing XML MetaData');
				return;
			}
			console.log('[info]'.cyan + ' Parsing Stream MetaData Complete');

			if(Object.keys(result.nodes).length === 0){
				console.log('[error]'.red + ' Streamer Not Currently Active');
				return;
			}
			// If no quality is specified, use the first one (Highest Quality)
			var broadcastNode;
			if(_this.quality == ''){
				 broadcastNode = result.nodes['live'][0];
			}else{
				if(result.nodes[_this.quality]){
					broadcastNode = result.nodes[_this.quality][0];
				}else {
					if(result.nodes['_' + _this.quality]){
						broadcastNode = result.nodes['_' + _this.quality][0];
					}else {
						console.log('[error]'.red + ' Invalid Stream Quality Specified.');
						return;
					}
				}
			}
			_this.url = broadcastNode.connect[0];
			_this.jsonToken = broadcastNode.token[0];
			_this.playPath = broadcastNode.play[0];

			_this.buildRTMPDumpCommand();

		});
	},
	getStreamSWFUrl : function(){
		console.log('[info]'.cyan + ' Fetching SWF Url');
		var _this = this,
			resultContainer = "";
		var req = http.request(RTMPDump.ApplicationWrappers.Twitch.config.twitchFlashObjectURL, function(res){
			res.setEncoding('utf8');
			// Get the swf link from the redirect request.
			if(res.statusCode == 302){
				_this.swfUrl = res.headers.location.split('?')[0];
			}else {
				console.log('[error]'.red + ' Getting Twitch SWF.')
			}
		});

		req.on('error',function(e){
			console.log('[error]'.red + ' Error Loading Stream MetaData  : ' + e.message);
		});
		req.end();
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
		console.log('[info]'.green + ' Ready! Launching command');
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