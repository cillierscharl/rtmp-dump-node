// rtmpdump −r url [−n hostname] [−c port] [−l protocol] [−S host:port] [−a app] [−t tcUrl] [−p pageUrl] 
// [−s swfUrl] [−f flashVer] [−u auth] [−C conndata] [−y playpath] [−Y] [−v] [−d subscription] [−e] [−k skip] 
// [−A start] [−B stop] [−b buffer] [−m timeout] [−T key] [−j JSON] [−w swfHash] [−x swfSize] [−W swfUrl] 
// [−X swfAge] [−o output] [−#] [−q] [−V] [−z] 
var exec = require('child_process').exec;
var colors = require('colors');

var RTMPDump = RTMPDump || {};

RTMPDump.config = {
	RTMPDumpCommandString : '{0} {1} {2}'
}

RTMPDump.RTMPDumpCommand = function(_rtmpDumpPath,_params,output){
	this.rtmpDumpPath = RTMPDump.util.wrapQuotes(_rtmpDumpPath);
	this.params = _params;
	this.output = output;
}

RTMPDump.RTMPDumpCommand.prototype = {
	buildRMTPCommand : function(){
		if(!this.params.length){
			console.log('[error]'.red + ' No RTMPDump parameters specified.');
			return;
		}
		// Sort the parameters in the correct order as described above.
		this.params = this.params.sort(function(a,b){ return (a.option.order - b.option.order); });

		var commandString = '';
		for(var i = 0 ; i < this.params.length ; i++){
			if(!this.params[i].option){
				console.log('[warning]'.yellow + ' Unmapped parameter found, your mileage may vary.');
				continue;
			}
			commandString += this.params[i].option.flag;
			commandString += ' ';
			if(this.params[i].value){
				var paramValue = this.params[i].value;
				if(this.params[i].option.escape){
					paramValue = RTMPDump.util.escapeQuotes(paramValue);
				}
				if(this.params[i].option.quoteWrap){
					paramValue = RTMPDump.util.wrapQuotes(paramValue);
				}
				commandString += paramValue;
				commandString += ' ';
			}else {
				if(this.params[i].option.parameter){
					console.log('[warning]'.yellow + ' Flag without parameter specified.');
				}
			}
		}

		this.command = RTMPDump.config.RTMPDumpCommandString.format(this.rtmpDumpPath,commandString,this.output.command);	

	},
	launch : function(){
		var child = exec(this.command ,function (err,stdout,stderr){
		 	if ( err ) {
				console.log(stderr);
			}
		});

		child.stdout.on('data',function(data){
			console.log(data);
		});

		child.stderr.on('data',function(data){
			//console.log(data);
		});
	}

}

RTMPDump.FileOutput = function(_outputFile){
	if(RTMPDump.outputs.file.quoteWrap){
		_outputFile = RTMPDump.util.wrapQuotes(_outputFile);
	}
	this.command = RTMPDump.outputs.file.command.format(_outputFile);
}

RTMPDump.VlcOutput = function(_pathToVlc){
	if(RTMPDump.outputs.vlc.quoteWrap){
		_pathToVlc = RTMPDump.util.wrapQuotes(_pathToVlc);
	}
	this.command = RTMPDump.outputs.vlc.command.format(_pathToVlc);
}

RTMPDump.FfmpegOutput = function(_pathToFfmpeg,_options,output){
	if(RTMPDump.outputs.ffmpeg.pathToFFMpegQuoteWrap){
		_pathToFfmpeg = RTMPDump.util.wrapQuotes(_pathToFfmpeg);
	}
	if(RTMPDump.outputs.ffmpeg.outputPathQuoteWrap){
		output = RTMPDump.util.wrapQuotes(output);
	}
	if( (!_options) || (_options == '') ){
		_options = RTMPDump.outputs.ffmpeg.defaultSettings;
	}
	this.command = RTMPDump.outputs.ffmpeg.command.format(_pathToFfmpeg,_options,output);
}

RTMPDump.CustomOutput = function(_customOutput){
	if(RTMPDump.outputs.custom.quoteWrap){
		_customOutput = RTMPDump.util.wrapQuotes(_customOutput);
	}
	this.command = RTMPDump.outputs.custom.command.format(_customOutput);
}

RTMPDump.outputs = {
	file : {
		command : '-o {0}',
		quoteWrap : true
	},
	vlc : {
		command : '| {0} -',
		quoteWrap : true
	},
	ffmpeg : {
		command : '| {0} -i pipe:0 {1} {2}',
		defaultSettings : '-c:a copy -c:v copy -f flv',
		pathToFFMpegQuoteWrap : true,
		outputPathQuoteWrap : true,
	},
	custom : {
		command : '| {0}',
		quoteWrap : true
	}
}

RTMPDump.Option = function(option,value){
	this.option = option;
	this.value = value;
}

RTMPDump.options = {
	url : {
		order : 1,
		flag : '-r',
		parameter : true,
		escape : false,
		quoteWrap : true
	},
	hostname : {
		order : 2,
		flag : '-n',
		parameter : true,
		escape : false,
		quoteWrap : true
	},
	port : {
		order : 3,
		flag : '-c',
		parameter : true,
		escape : false,
		quoteWrap : false
	},
	protocol : {
		order : 4,
		flag: '-l',
		parameter : true,
		escape : false,
		quoteWrap : false
	},
	hostPort : {
		order : 5,
		flag : '-s',
		parameter : true,
		escape : false,
		quoteWrap : false
	},
	app : {
		order : 6,
		flag : '-a',
		parameter : true,
		escape : false,
		quoteWrap : true
	},
	tcUrl : {
		order : 7,
		flag : '-t',
		parameter : true,
		escape : false,
		quoteWrap : true
	},
	pageUrl : {
		order : 8,
		flag : '-p',
		parameter : true,
		escape : false,
		quoteWrap : true
	},
	swfUrl : {
		order : 9,
		flag : '-s',
		parameter : true,
		escape : false,
		quoteWrap : true
	},
	flashVer : {
		order : 10,
		flag : '-f',
		parameter : true,
		escape : false,
		quoteWrap : true
	},
	auth : {
		order : 11,
		flag : '-u',
		parameter : true,
		escape : false,
		quoteWrap : true
	},
	conndata : {
		order : 12,
		flag : '-C',
		parameter : true,
		escape : false,
		quoteWrap : false
	},
	playpath : {
		order : 13,
		flag : '-y',
		parameter : false,
		escape : false,
		quoteWrap : true,
		description : 'Overrides the playpath parsed from the RTMP URL. Sometimes the rtmpdump URL parser cannot determine the correct playpath automatically, so it must be given explicitly using this option.'
	},
	playlist : {
		order : 14,
		flag : '-Y',
		parameter : false,
		escape : false,
		quoteWrap : false,
		description : 'Issue a set_playlist command before sending the play command.'
	},
	live : {
		order : 15,
		flag : '-v',
		parameter : false,
		escape : false,
		quoteWrap : false,
		description : 'Specify that the media is a live stream. No resuming or seeking in live streams is possible.'
	},
	subscribe : {
		order : 16,
		flag : '-d',
		parameter : true,
		escape : false,
		quoteWrap : true,
		description : 'Name of live stream to subscribe to. Defaults to playpath.'
	},
	resume : {
		order : 17,
		flag : '-e',
		parameter : false,
		escape : false,
		quoteWrap : false,
		description : 'Resume an incomplete RTMP download.'
	},
	skip : {
		order : 18,
		flag : '-k',
		parameter : true,
		escape : false,
		quoteWrap : false,
		description : 'Skip num keyframes when looking for the last keyframe from which to resume. This may be useful if a regular attempt to resume fails. The default is 0.'
	},
	start : {
		order : 19,
		flag : '-A',
		parameter : true,
		escape : false,
		quoteWrap : false,
		description : 'Start at num seconds into the stream. Not valid for live streams.'
	},
	stop : {
		order : 20,
		flag : '-B',
		parameter : true,
		escape : false,
		quoteWrap : false,
		description : 'Stop at num seconds into the stream.'
	},
	buffer : {
		order : 21,
		flag : '-b',
		parameter : true,
		escape : false,
		quoteWrap : false,
		description : 'Set buffer time to num milliseconds. The default is 36000000.'
	},
	timeout : {
		order : 22,
		flag : '-m',
		parameter : true,
		escape : false,
		quoteWrap : false,
		description : 'Timeout the session after num seconds without receiving any data from the server. The default is 120.'
	},
	key : {
		order : 23,
		flag : '-T',
		parameter : true,
		escape : false,
		quoteWrap : true,
		description : 'Key for SecureToken response, used if the server requires SecureToken authentication.'
	},
	jsonToken : {
		order : 24,
		flag : '-j',
		parameter : true,
		escape : true,
		quoteWrap : true,
		description : 'JSON token used by legacy Justin.tv servers. Invokes NetStream.Authenticate.UsherToken'
	},
	swfHash : {
		order : 25,
		flag : '-w',
		parameter : true,
		escape : false,
		quoteWrap : false,
		description: 'SHA256 hash of the decompressed SWF file. This option may be needed if the server uses SWF Verification, but see the −−swfVfy option below. The hash is 32 bytes, and must be given in hexadecimal. The −−swfsize option must always be used with this option.'
	},
	swfSize : {
		order : 26,
		flag : '-x',
		parameter : true,
		escape : false,
		quoteWrap : false,
		description : 'Size of the decompressed SWF file. This option may be needed if the server uses SWF Verification, but see the −−swfVfy option below. The −−swfhash option must always be used with this option.'
	},
	swfVfy : {
		order : 27,
		flag : '-W',
		parameter : true,
		escape : false,
		quoteWrap : true,
		description : 'URL of the SWF player for this media. This option replaces all three of the −−swfUrl, −−swfhash, and −−swfsize options.'
	},
	swfAge : {
		order : 28,
		flag : '-X',
		parameter : true,
		escape : false,
		quoteWrap : false,
		description : 'Specify how many days to use the cached SWF info before re-checking.'
	},
	output : {
		order : 29,
		flag : '-o',
		parameter : true,
		escape : false,
		quoteWrap : true,
		description : 'Specify the output file name. If the name is − or is omitted, the stream is written to stdout.'
	},
	hashes : {
		order : 30,
		flag : '-#',
		parameter : false,
		escape : false,
		quoteWrap : false,
		description : 'Display streaming progress with a hash mark for each 1% of progress, instead of a byte counter.'
	},
	quiet : {
		order : 31,
		flag : '-q',
		parameter : false,
		escape : false,
		quoteWrap : false,
		description : 'Suppress all command output.'
	},
	verbose : {
		order : 32,
		flag : '-V',
		parameter : false,
		escape : false,
		quoteWrap : false,
		description : 'Verbose command output.'
	},
	debug : {
		order : 33,
		flag : '-z',
		parameter : false,
		escape : false,
		quoteWrap : false,
		description : 'Debugging command output.'
	},	
	pipe : {
		order : 34,
		flag : '|',
		parameter : false,
		escape : false,
		quoteWrap : false,
		description : 'Pipe output to process'
	}
}

RTMPDump.util = {
	escapeQuotes : function(text){
		return text.replace(/"/g,"\\\"")
	},
	wrapQuotes : function(text){
		return '"' + text + '"';
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


module.exports = RTMPDump;