(function ( window, /*triedJSON,*/ undefined ) {

"use strict";

window._DEBUG = true;

  var lib = {},

  head = document.getElementsByTagName( "head" )[0],

  // the path (URL) to the script-id-to-path key (JSON)
  SCRIPT_ID_TO_URL_PATH = "lib/Classes.js",

  // the path (URL) to a JSON "polyfill"
  JSON_PATH = "http://cdnjs.cloudflare.com/ajax/libs/json3/3.2.4/json3.min.js",

  // a reference to an empty function
  EMPTY_FUNCTION = Function.prototype,

  libInit,


// if the head element is still not defined
if ( !head ) {

  // throw a ReferenceError.
  throw new ReferenceError( "Where's the head? Cannot find the \"head\" element in the document." );

}


// if JSON is not defined and we haven't already tried adding one,
if ( !window.JSON/*&& !triedJSON*/ ) {

  // create a new script element and assign the properties for the JSON "polyfill".
  var jsonScript = document.createElement( "script" );
  jsonScript.type = "text/javascript";
  jsonScript.src = JSON_PATH;

  // create a flag that says whether libInit had already been "re-called"
  var recalled = false;

  // add a ready-state-change handler
  jsonScript.onreadystatechange = function() { //todo: check this/these

    // if the script is loaded, and libInit have not been "re-called" yet, set the flag and call this function
    if ( (this.readyState === "loaded" || this.readyState === "complete") && !recalled ) {
      recalled = true;
      libInit();
    }

  };

  // add an onload handler (listening both events just in case)
  jsonScript.onload = function() {

    // set the flag to true and call libInit if it hadn't been called yet
    if ( !recalled ) {
      recalled = true;
      libInit();
    }
  };

  // add this element inside the head
  head.appendChild( jsonScript );

  return;

}

libInit = function libInit() {

// a Array.prototype.indexOf "polyfill"
// - based on mozilla's, which uses ECMA-262, 5th edition's algorithm
if ( ![].indexOf ) {
  Array.prototype.indexOf = function( searchEl ) {
    if ( this == null ) {
      throw new TypeError("Array.prototype.indexOf called on null or undefined");
    }
    var t = Object(this);
    var len = t.length >>> 0;
    if ( len === 0 ) {
      return -1;
    }
    var n = 0;
    if ( arguments.length > 1 ) {
      n = Number( arguments[1] );
      if (n != n) {
        n = 0;
      } else if ( n != 0 && n != Infinity && n != -Infinity ) {
        n = (n > 0 || -1) * Math.floor( Math.abs(n) );
      }
    }
    if ( n >= len ) {
      return -1;
    }
    var k = n >= 0 ? n : Math.max( len - Math.abs(n), 0 );
      for ( ; k < len; k++ ) {
        if ( k in t && t[k] === searchEl ) {
          return k;
        }
      }
    return -1;
  };
}

var requested, executed, scriptToRequest, scriptIdToURL, ScriptRequest, loadedStrict,

  createOnReadyStateChangeListener = function( scriptURL ) {
    return function() {
      if ( this.readyState === "loaded" || this.readyState === "complete" ) {
        loadedStrict( scriptURL );
      }
    };
  },

  createOnLoadListener = function( scriptURL ) {
    return function() {
      loadedStrict( scriptURL );
    };
  };


lib.requested = [];
requested = lib.requested;

lib.executed = [];
executed = lib.executed;

lib._scriptToRequest = {};
scriptToRequest = lib._scriptToRequest;

lib.scriptIdToURL = (function(path) {

  try {

    var request = window.XMLHttpRequest? new XMLHttpRequest() : new ActiveXObject( "Microsoft.XMlHTTP" );
    request.open( "GET", path, false );
    request.send();
    if ( request.status >= 200 && request.status < 400 &&  !(request.responseText === null || request.responseText === "") ) {
      if ( !JSON ) {
        return ( new Function( "return " + request.responseText ) )();
      }
      return JSON.parse( request.responseText );
    }

  }
  catch( err ) {
  }
  return {};

})( SCRIPT_ID_TO_URL_PATH );

scriptIdToURL = lib.scriptIdToURL;

lib._ScriptRequest = function( scriptCount, onload, loaded ) {
  this.scriptCount = scriptCount || 0;
  this.onload = onload || EMPTY_FUNCTION;
  this.loaded = loaded || 0;
};

lib._ScriptRequest.prototype = {
  scriptCount: 0,
  onload: EMPTY_FUNCTION,
  loaded: 0
};

ScriptRequest = lib._ScriptRequest;

lib.require = function() {

  var argumentCount = arguments.length,

    currentRequest = new ScriptRequest(argumentCount),

    returnObject = {
      onload: function( method ) {
        currentRequest.onload = method;
        if ( currentRequest.loaded === argumentCount ) {
          method.call( window );
        }
      }
    };

  for ( var i = 0; i < argumentCount; i++ ) {

    var currentArg = scriptIdToURL[arguments[i]] || arguments[i];
    if ( typeof currentArg !== "string" ) {
      throw new TypeError( "Arguments needed to be a string, but found a " + typeof currentArg );
    }

    if ( requested.indexOf( currentArg ) !== -1 ) {
      if ( executed.indexOf( currentArg ) !== -1 ) {
        currentRequest.loaded++;
      } else {
        if ( scriptToRequest[currentArg] === undefined ) {
          scriptToRequest[currentArg] = [];
        }
        scriptToRequest[currentArg].push( currentRequest );
      }
      continue;
    }

    var newScript = document.createElement( "script" );
    newScript.type = "text/javascript";
    newScript.src = currentArg;
    newScript.onreadystatechange = createOnReadyStateChangeListener( currentArg );
    newScript.onload = createOnLoadListener( currentArg );
    head.appendChild( newScript );

    if ( scriptToRequest[currentArg] === undefined ) {
      scriptToRequest[currentArg] = [];
    }
    scriptToRequest[currentArg].push( currentRequest );
    requested.push( currentArg );

  }

  return returnObject;

};

lib.loaded = function( scriptId ) {
  var scriptURL = scriptIdToURL[scriptId] || scriptId;
  if ( executed.indexOf( scriptURL ) !== -1 ) {
    return;
  }
  executed.push( scriptURL );
  var scriptRequests = scriptToRequest[scriptURL];
  if ( scriptRequests ) {
    while ( scriptRequests.length /*> 0*/ ) {
      scriptRequests[0].loaded++;
      if ( scriptRequests[0].loaded === scriptRequests[0].scriptCount ) {
        scriptRequests[0].onload.call( window );
      }
      scriptRequests.splice( 0, 1 );
    }
  }
};
loadedStrict = function( scriptURL ) {
  if ( executed.indexOf( scriptURL ) !== -1 ) {
    return;
  }
  executed.push( scriptURL );
  var scriptRequests = scriptToRequest[scriptURL];
  if ( scriptRequests ) {
    while ( scriptRequests.length /*> 0*/ ) {
      scriptRequests[0].loaded++;
      if ( scriptRequests[0].loaded === scriptRequests[0].scriptCount ) {
        scriptRequests[0].onload.call( window );
      }
      scriptRequests.splice( 0, 1 );
    }
  }
};

window.lib = lib;

}

})( window );
