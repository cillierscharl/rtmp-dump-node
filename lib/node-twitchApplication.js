var http = require('http');
var Table = require('cli-table');
var _ = require('underscore');
var open = require('open');

var rtmpDump = require('./node-rtmpdump');
var twitchRTMPDump = require('./node-rtmpdump-twitch');

var TwitchApplication = TwitchApplication || {};

TwitchApplication.config = {
	twitchGameCatalog : 'http://api.twitch.tv/kraken/games/top?limit=32&offset=0&on_site=1',
	twitchStreamByGame : 'http://api.twitch.tv/kraken/streams?limit=20&offset=0&game=World+of+Warcraft%3A+Mists+of+Pandaria&on_site=1'
}

TwitchApplication.Implementation = function(){
	this.init();
}

TwitchApplication.Implementation.prototype = {
	init : function(){

		var _this = this;
		var sys = require("sys");

		var stdin = process.openStdin();
		stdin.setEncoding('utf8');

		stdin.addListener("data", function(data) {
		    _this.launchStream(data.replace(/(\n|\r|\r\n)$/, ''));
	  	});
	},
	getGameCategories : function(){

	},

	getStreamsByGame : function(_game){
		var _this = this;
		var request = http.request(TwitchApplication.config.twitchStreamByGame,function(res){
			res.setEncoding('utf8');
			var completeResponse = '';
			res.on('data',function(data){
				completeResponse += data;
			});

			res.on('end',function(){
				var table = new Table();
				var outputResponse = '';
				var streamerObject = JSON.parse(completeResponse);
				_this.streamerObject = streamerObject;
				_.each(streamerObject.streams,function(value){
					var channel = value.channel.name;
					var viewers = value.viewers;
					table.push([channel , viewers]);
				});
				console.log(table.toString());
			});

			res.on('error',function(data){
				console.log(data);
			});

		});

		request.end();
	},

	launchStream : function(_name,_quality){
		open('http://www.twitch.tv/chat/embed?channel={0}&popout_chat=true'.format(_name));

		var output = new rtmpDump.VlcOutput('C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe'),
			twitchDump = new twitchRTMPDump(_name,'live',output);
	}

}

module.exports = TwitchApplication.Implementation;