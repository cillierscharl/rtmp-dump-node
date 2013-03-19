var trd = require('./lib/node-twitch-rtmpdump');

var parser = new trd.Parser('bootsvii');

parser.getStreamMetaData(function(){
	parser.startRTMPDump();	
});

