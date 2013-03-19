var trd = require('./lib/node-twitch-rtmpdump');

var parser = new trd.Parser('reckful');
parser.getStreamMetaData();