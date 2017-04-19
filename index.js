var es = require('event-stream');
var gutil = require('gulp-util');
var iconv = require('iconv-lite');

module.exports = function(arr, encoding){
  var doReplace = function(file, callback) {
    var isStream = file.contents && typeof file.contents.on === 'function' && typeof file.contents.pipe === 'function';
    var isBuffer = file.contents instanceof Buffer;
    encoding = encoding !== undefined ? encoding : 'utf8';

    if (isStream){
      file.contents = file.contents.pipe(es.map(function(chunk,cb){
        for( var i=0, max = arr.length; i<max; i++ ){
          var search  = arr[i][0],
              replace = arr[i][1];

          var isRegExp = search instanceof RegExp;

          var result = isRegExp
              ? String(chunk).replace(search, replace)
              : String(chunk).split(search).join(replace);
          chunk = new Buffer(result);
        }
        cb(null,chunk);
      }));
    }else if(isBuffer) {
      var bufferAsString = file.contents.toString('binary');
      for( var i=0, max = arr.length; i<max; i++ ){
        var search  = arr[i][0],
            replace = arr[i][1];

        if(search instanceof RegExp){
          bufferAsString = bufferAsString.replace(search, replace);
        }else{
          file.contents = new Buffer( String( file.contents ).split( search ).join( replace ) );
        }
      }
	  if(search instanceof RegExp){
		file.contents = iconv.encode(bufferAsString, encoding);
      }
    }

    callback(null,file);
  };

  return es.map(doReplace);

};