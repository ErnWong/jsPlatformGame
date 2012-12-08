// BAD - outdated - buggy

(function ( window, /*triedJSON,*/ undefined ) {

    //TODO: TEST: onload only after window.onload and libInitCallbacked === true

    "use strict";

    //window._DEBUG = true;

    var lib = {},

        head = window.document.getElementsByTagName( "head" )[0],

        // the path (URL) to the script-id-to-path key (JSON)
        SCRIPT_ID_TO_URL_PATH = "lib/Classes.js",

        // the path (URL) to a JSON "polyfill"
        JSON_PATH = "http://cdnjs.cloudflare.com/ajax/libs/json3/3.2.4/json3.min.js",

        // a reference to an empty function
        //EMPTY_FUNCTION = Function.prototype,

        libInit, libInitCallbacked = false,
        libInitCallbacks = [],
        DOMLoaded = false,
        libLoaded = false,

        createToString = function( value ) {
            return function toString() {
                return value;
            };
        };


    // if the head element is still not defined
    if ( !head /*TODO: maybe head == null? which is better?*/ ) {

        // throw a ReferenceError.
        throw new ReferenceError( "Where's the head? Cannot find the \"head\" element in the document." );

    }

    lib.onload = function ( fn ) {
        libInitCallbacks.push( fn );
        if ( libInitCallbacked ) {
            fn.call( window );
        }
    };

    lib.onload.toString = createToString( "function onload() { [lib code] }" );

    var DOMOnLoad = function domOnLoad() {
        DOMLoaded = true;
        if ( libLoaded === true && libInitCallbacked === false ) {
            for ( var i = 0, libInitCallbacksLength = libInitCallbacks.length; i < libInitCallbacksLength; i++ ) {
                libInitCallbacks[i].call( window );
            }
            libInitCallbacked = true;
        }
    };

    if ( window.addEventListener ) {
        document.addEventListener( "DOMContentLoaded", DOMOnLoad, false );
        window.addEventListener( "load", DOMOnLoad, false );
    } else if ( window.attachEvent ) {
        document.attachEvent( "onDOMContentLoaded", DOMOnLoad );
        window.attachEvent( "onload", DOMOnLoad );
    } else {
        window.onload = DOMOnLoad;
    }

    // temporary
    window.lib = lib;

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
        // copied from MDN
        // TODO: should we use his (http://www.calormen.com/polyfill/polyfill.js)?
        //       or perhaps https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-browser-Polyfills??
        //       or http://code.google.com/p/ie7-js/???
        if (!Object.create) {
            Object.create = function (o) {
                if (arguments.length > 1) {
                    throw new Error('Object.create implementation only accepts the first parameter.');
                }
                function F() {}
                F.prototype = o;
                return new F();
            };
        }

        if ( !Date.now ) {
            Date.now = function now() {
                return (new Date()).getTime();
            };
        }

        var requested, executed, scriptToRequest, scriptIdToURL, ScriptRequest, loadedStrict;

            /*createOnReadyStateChangeListener = function( scriptURL ) {
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
            };*/


        lib.requested = [];
        requested = lib.requested;

        lib.executed = [];
        executed = lib.executed;

        lib._scriptToRequest = Object.create(null);
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
            return Object.create(null);

        })( SCRIPT_ID_TO_URL_PATH );

        scriptIdToURL = lib.scriptIdToURL;

        lib._ScriptRequest = function ScriptRequest( scriptCount, onload, loaded ) {
            this.scriptCount = scriptCount || 0;
            this.onload = onload || function() {};
            this.loaded = loaded || 0;
        };
        lib._ScriptRequest.toString = createToString( "function ScriptRequest() { [lib code] }" );

        lib._ScriptRequest.prototype = {
            scriptCount: 0,
            onload: function() {},
            loaded: 0
        };

        ScriptRequest = lib._ScriptRequest;

        lib.require = function require() {

            var i = 0,
                argumentCount = arguments.length,
                currentRequest = new ScriptRequest(argumentCount),
                returnObject = {
                    onload: function( method ) {
                        currentRequest.onload = method;
                        if ( currentRequest.loaded === argumentCount ) {
                            method.call( window, window );
                        }
                    }
                };

            for ( ; i < argumentCount; i++ ) {

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
                //newScript.onreadystatechange = createOnReadyStateChangeListener( currentArg );
                //newScript.onload = createOnLoadListener( currentArg );
                head.appendChild( newScript );

                if ( scriptToRequest[currentArg] === undefined ) {
                    scriptToRequest[currentArg] = [];
                }
                scriptToRequest[currentArg].push( currentRequest );
                requested.push( currentArg );

            }

            return returnObject;

        };
        lib.require.toString = createToString( "function require() { [lib code] }" );
        lib.requires = lib.require;

        lib.loaded = function loaded( scriptId ) {
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
                        scriptRequests[0].onload.call( window, window );
                    }
                    scriptRequests.splice( 0, 1 );
                }
            }
        };
        lib.loaded.toString = createToString( "function loaded() { [lib code] }" );
        loadedStrict = function loaded( scriptURL ) {
            if ( executed.indexOf( scriptURL ) !== -1 ) {
                return;
            }
            executed.push( scriptURL );
            var scriptRequests = scriptToRequest[scriptURL];
            if ( scriptRequests ) {
                while ( scriptRequests.length /*> 0*/ ) {
                    scriptRequests[0].loaded++;
                    if ( scriptRequests[0].loaded === scriptRequests[0].scriptCount ) {
                        scriptRequests[0].onload.call( window, window );
                    }
                    scriptRequests.splice( 0, 1 );
                }
            }
        };

        lib.addFileListURL = function( URL ) {

        };
        lib.addFileList = function( data ) {
            for ( var id in data ) { // who cares whether the data inherits Object not null, and contains things like toString or valueOf or constructor!!
                if ( typeof data[id] === "string" ) {
                    scriptIdToURL[id] = data[id];
                }
            }
        };

        window.lib = lib;

        libLoaded = true;

        if ( DOMLoaded ) {
            for ( var i = 0, libInitCallbacksLength = libInitCallbacks.length; i < libInitCallbacksLength; i++ ) {
                libInitCallbacks[i].call( window );
            }
            libInitCallbacked = true;
        }

    };

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

    libInit();

    lib.onload( function() {
        
        // cache it so that it doesn't change in the future even when window._DEBUG changes
        var debugMode = !!window._DEBUG;

        if ( window.lib == null ) {
            window.lib = {};
        }

        var initialising = false,
            testFor_super = ( /abc/.test( function(){abc;} ) )? /\b_parent\b/ : /.*/,
            ConstructorCallException = new TypeError("Class constructor cannot be called as a function."),
            createToString = function( value ) {
                return function toString() {
                    return value;
                };
            },
            modFn = function( name, fn, _super ) { //do this or anonymous function inside extend()? TODO: test for speed
                return function() {
                    var tmp = this._super, ret;
                    this._super = _super[name];
                    try {
                        ret = fn.apply( this, arguments );
                    } finally {
                        this._super = tmp;
                    }
                    return ret;
                };
            };

        lib.Class = function Class() {

        };

        lib.Class.prototype.toString = createToString( "[object Class]" );
        lib.Class.toString = createToString( "function Class() { [lib code] }" );

        if ( !debugMode ) {
            lib.Class.extend = function extend( def, name, toStringIcing, leaveToString ) {

                var _super = this.prototype;

                initialising = true;
                var prototype = new this();
                initialising = false;

                if ( name && !leaveToString ) {
                    prototype.toString = createToString( "[object " + name + "]" );
                }

                for ( var id in def ) {

                    prototype[id] = typeof def[id] === "function" && typeof _super[id] === "function" && testFor_super.test( def[id] ) ?
                        modFn( id, def[id], _super ) :
                        def[id];

                }

                var Class = function Class() {
                    if ( !(this instanceof Class) ) {
                        throw ConstructorCallException;
                    }
                    if ( !initialising && this.init ) {
                        this.init.apply( this, arguments );
                    }
                };
                Class.prototype = prototype;
                Class.prototype.constructor = Class;
                Class.extend = extend;

                return Class;

            };
        } else {
            lib.Class.extend = function extend( def, name, leaveToString ) {


                var _super = this.prototype,

                    Class = name?
                    new Function( "return function " + name + "() {\n" +
                                  "    if ( !(this instanceof lib.Class) ) {\n        throw new TypeError(\"Class constructor cannot be called as a function.\");\n    }\n" +
                                  "    if ( !lib.initialising && this.init ) {\n        this.init.apply( this, arguments );\n    }\n" +
                                  "};" )() :
                    function Class() {
                        if ( !(this instanceof Class) ) {
                            throw ConstructorCallException;
                        }
                        if ( !this.initialising && this.init ) {
                            this.init.apply( this, arguments );
                        }
                    };
                Class.prototype = this.prototype;
                lib.initialising = true;
                Class.prototype = new Class();
                delete lib.initialising;
                for ( var id in def ) {
                    Class.prototype[id] = typeof def[id] === "function" && typeof _super[id] === "function" && testFor_super.test( def[id] ) ?
                        modFn( id, def[id], _super ) :
                        def[id];
                }
                Class.prototype.constructor = Class;
                if ( name && !leaveToString ) {
                    Class.prototype.toString = createToString( "[object " + name + "]" );
                }
                Class.extend = extend;

                return Class;

            };
        }

        lib.Class.extend.toString = createToString( "function extend() { [lib code] }" );

        if (lib.loaded) {
            lib.loaded( "lib.Class" );
        }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////

         lib.Events = {};
        var _ = lib.Events,
            EventListener, LEvent,
            ObjToString = Object.prototype.toString,
            docCreateEvent = document.createEvent,
            EvtTypeException = new TypeError( "Event object missing \"type\" property" ),
            EvtListenerException = new TypeError( "Event Listener is not in the correct type" ),
            getTime = Date.now;


            /*createToString = function( value ) {
                return function toString() {
                    return value;
                };
            };*/


        _.EventListener = lib.Class.extend( {

            handleEvent: function() {},

            init: function( handler ) {
                this.handleEvent = handler;
            }

        }, "EventListener" );
        EventListener = _.EventListener;

        //TODO: is this okay?...
        _.Event = lib.Class.extend( {
            timeStamp: 0,
            type: "",
            target: null,
            cancelable: false,
            defaultPrevented: false,
            preventDefault: function() {
                if ( this.cancelable ) {
                    this.defaultPrevented = true;
                }
            },
            initEvent: function( type, target ) {
                this.type = type;
                this.target = target;
                this.timeStamp = getTime();
            }
        }, "Event" );
        LEvent = _.Event;

        var eventTypes = Object.create( null );

        lib.createEventType = function( eventType, def ) {
            eventTypes[eventType] = LEvent.extend( def, eventType );
            return eventTypes[eventType];
        };
        lib.createEventType.toString = createToString( "function createEventType() { [lib code] }" );

        //TODO: review code
        lib.createEvent = function( eventType ) {
            if (eventTypes[eventType] != null ) {
                var newEvent = new eventTypes[eventType]();
                newEvent.timeStamp = getTime();
                return newEvent;
            } else {
                return docCreateEvent( eventType );
            }
        };

        lib.createEvent.toString = createToString( "function createEvent() { [lib code] }" );


        _.EventTarget = lib.Class.extend( {

            _listeners: {},

            addEventListener: function addEventListener( type, listener, scope ) {

                var thisListeners = this._listeners[type];
                if ( (!(thisListeners == null)) && ( function() {
                    var thisArg = typeof scope === "object"? scope : null,
                        curListener;
                    for ( var i = 0, len = thisListeners.length; i < len; i++ ) {
                        curListener = this.listeners[i];
                        if ( /*(curListener.listener === listener || */curListener.listener.handleEvent === listener/*)*/ && curListener.scope === thisArg ) {
                            return true;
                        }
                    }
                    return false;
                } )() ) {
                    return;
                }
                var newListener = {
                    listener: typeof listener === "object" && listener.handleEvent? listener : new EventListener( listener ),
                    scope: typeof scope === "object"? scope : null
                };
                if ( ObjToString.call(thisListeners) === "[object Array]" ) {
                    thisListeners.push( newListener );
                } else {
                    this._listeners[type] = [newListener];
                }

            },

            removeEventListener: function removeEventListener( type, listener, scope ) {
                var thisListeners = this._listeners[type];
                if ( ObjToString.call(thisListeners) === "[object Array]" ) {
                    var thisArg = typeof scope === "object"? scope : null,
                        i = 0,
                        len = thisListeners.length;
                    for ( ; i < len; i++ ) {
                        if ( /*(thisListeners[i].listener === listener ||*/ thisListeners[i].listener.handleEvent === listener/*)*/ && thisListeners[i].scope === thisArg ) {
                            thisListeners.splice( i, 1 );
                            return;
                        }
                    }
                }
            },

            dispatchEvent: function dispatchEvent( evt ) {
                /* stricter these days... or lazier
                    if ( typeof evt === "string" ) {
                        var type = evt;
                        evt = docCreateEvent( "event" );
                        evt.initEvent( type, false, false );
                    }
                */
                if ( !evt.target ) {
                    evt.target = this;
                }
                if ( !evt.type ) {
                    throw EvtTypeException;
                }
                var i = 0,
                    listeners = this._listeners[evt.type],
                    len = listeners.length,
                    handler;
                if ( ObjToString.call( listeners ) === "[object Array]" ) {
                    for ( ; i < len; i++ ) {
                        handler = listeners[i].listener.handleEvent;
                        if ( typeof handler !== "function" ) {
                            throw EvtListenerException;
                        }
                        handler.call( listeners[i].scope, evt );
                    }
                }
                return evt.defaultPrevented;
            }

        }, "EventTarget" );

        _.EventTarget.prototype.addEventListener.toString = createToString( "function addEventListener() { [lib code] }" );
        _.EventTarget.prototype.removeEventListener.toString = createToString( "function addEventListener() { [lib code] }" );
        _.EventTarget.prototype.dispatchEvent.toString = createToString( "function addEventListener() { [lib code] }" );

        _.EventTarget.prototype.on = _.EventTarget.prototype.addEventListener;


        //TODO: Check, and make sure everything needed is here

        lib.loaded("lib.Events");

    ///////////////////////////////////////////////////////////////////////////////////////////////////////


        // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
        // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

        // requestAnimationFrame polyfill by Erik Moller
        // fixes from Paul Irish and Tino Zijdel

        (function() {
            var lastTime = 0;
            var vendors = ['ms', 'moz', 'webkit', 'o'];
            for( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x ) {
                window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
                window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
            }

            if ( !window.requestAnimationFrame ) {
                window.requestAnimationFrame = function(callback, element) {
                    var currTime = getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
                        timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };
            }

            if ( !window.cancelAnimationFrame ) {
                window.cancelAnimationFrame = function( id ) {
                    clearTimeout( id );
                };
            }
        }());

        var notATimerException = new TypeError( "Must pass a timer as an argument to initialize TimerEvent" ),
            clearInterval = window.clearInterval,
            setInterval = window.setInterval,

            FunctionToCall = lib.Class.extend( {
                fn: function() {},
                args: [],
                thisArg: window,
                sleepTime: 0,
                init: function( fn, thisArg, args) {
                    this.method = fn || function() {};
                    this.thisArg = thisArg || window;
                    this.args = args || [];
                }
            }, "FunctionToCall"),

            /*createToString = function( value ) {
                return function toString() {
                    return value;
                };
            },*/
            //getTime = Date.now,

            modeFromString = Object.create(null);
        modeFromString.animation = 0;
        modeFromString.steady = 1;
        modeFromString.as_fast_as_possible = 2;

        lib.Timer = lib.Events.EventTarget.extend( {

            ANIMATION: 0,
            STEADY: 1,
            AS_FAST_AS_POSSIBLE: 2,

            TimerEvent: lib.createEventType( "TimerEvent", {
       
                FPS: 0,
                targetFPS: 0,
                delta: 0,
                //NOTE: add more if necessary

                initEvent: function( type, timer ) {

                    //duck typing:
                    if ( timer.getFPS == null || timer.targetFPS == null || timer.dt == null ) {
                        throw notATimerException;
                    }

                    this.FPS = timer.getFPS();
                    this.targetFPS = timer.targetFPS;
                    this.delta = timer.dt;

                    this._super( type, timer );

                }

            } ),

            _clearIntervalFlag: false,
            _recursionCounter: 0,

            _tickHandlersFromMethod: Object.create(null),

            running: false,
            paused: false,
            mode: 0,

            autoStartStop: true,

            //TODO: do we need this?
            setAutoStartStop: function setAutoStartStop( value ) {
                this.autoStartStop = value;
            },

            prevTime: 0,
            dt: 0,
            maxDelta: 0.05,

            //TODO: do we need this?
            setMaxDelta: function setMaximumDelta( value ) {
                this.maxDelta = value;
            },

            sysTimerId: -1,
            targetFPS: 50,
            setFPS: function setFPS( fps ) {
                this.targetFPS = fps;
                if ( this.running && this.mode === this.STEADY ) {
                    clearInterval( this.sysTimerId );
                    //TODO: use the following or bind?
                    this.sysTimerId = setInterval( ( function( self ) {
                        return function() {
                            self.tick();
                        };
                    } )( this ), 1000 / fps );
                }
            },
            getFPS: function getFPS() {
                return 1 / this.dt;
            },

            queue: [],
            addToQueue: function addToQueue( method, thisArg, args ) {
                var newFunctionToCall = new FunctionToCall( method, thisArg, args ),
                    out;
                this.queue.push( newFunctionToCall );

                var tickHandler = function onTick( evt ) {
                    if ( newFunctionToCall.sleepTime > 0 ) {
                        newFunctionToCall.sleepTime -= evt.delta;
                    } else {
                        out = method.apply( thisArg, ([evt]).concat( args ) );
                        if ( typeof out === "number" && out > 0 ) {
                            newFunctionToCall.sleepTime = out;
                        } else if ( out !== true ) {
                            this.removeEventListener( "tick", onTick, this );
                            this.queue.splice( this.queue.indexOf( newFunctionToCall ), 1 );
                        }
                    }
                };
                if ( this._tickHandlersFromMethod[method] == null ) {
                    this._tickHandlersFromMethod[method] = [tickHandler];
                } else {
                    this._tickHandlersFromMethod[method].push( tickHandler );
                }
                this.addEventListener( "tick", tickHandler, this);
                if ( this.autoStartStop && !this.running ) {
                    this.startLoop();
                }
            },
            //TODO: removeFromQueue: function removeFromQueue( method, 
            removeFromQueue: function( method ) {
                var tickHandlers = this._tickHandlersFromMethod[ method ],
                    idInQueue = this.queue.indexOf( method );
                if ( idInQueue !== -1 ) {
                    var i = 0,
                        len = tickHandlers.length;
                    for ( ; i < len; i++ ) {
                        this.removeEventListener( "tick", tickHandlers[i], this );
                    }
                    return this.queue.splice( idInQueue, 1 );
                }
            },
            getQueue: function getQueue() {
                return this.queue.slice(0);
            },

            /*getCurrentTime: function getCurrentTime() {
                return (new Date()).getTime();
            },*/ //use Date.now();

            pause: function pause() {
                this.paused = true;
                this._clearIntervalFlag = true;
                this.dt = 0;
            },
            resume: function resume() {
                this.paused = false;
                this.startLoop();
            },
            startLoop: function startLoop() {
                this.prevTime = getTime();
                this.running = true;
                if ( this.mode === this.steady ) {
                    this.sysTimerId = setInterval( ( function( self ) {
                        return function() {
                            self.tick();
                        };
                    } )( this ), 1000 / this.targetFPS );
                } else {
                    this.tick();
                }
            },

            tick: function tick() {
                //maybe not if ( !( this instanceof lib.Timer) ) throw new TypeError(blahblahblah...);
                if ( this._clearIntervalFlag && this.sysTimer !== -1 ) {
                    clearInterval( this.sysTimerId );
                    this.sysTimerId = -1;
                    this._clearIntervalFlag = false;
                    //TODO: should we...
                    return;//? (because it's not in the original Timer.js)
                }
                if ( this.paused ) {
                    return;
                }
                var currentTime = getTime();
                this.dt = ( currentTime - this.prevTime ) / 1000;
                if ( this.dt > this.maxDelta ) {
                    this.dt = this.maxDelta;
                }
                if ( this.dt === 0 && this._recursionCounter < 4 ) {
                    this._recursionCounter++;
                    this.tick();
                    return;
                } else if ( this._recursionCounter > 0 ) {
                    this._recursionCounter = 0;
                }

                var tickEvent = lib.createEvent( "TimerEvent" );
                tickEvent.initEvent( "tick", this );
                this.dispatchEvent(tickEvent);
                this.prevTime = currentTime;

                var cont = !( this.autoStartStop && this.queue.length <= 0);
                if ( this.mode === this.AS_FAST_AS_POSSIBLE && cont ) {
                    setTimeout( ( function( self) {
                        return function() {
                            self.tick();
                        };
                    } )( this ), 0 );
                }
                if ( this.mode === this.ANIMATION && cont ) {
                    requestAnimationFrame( ( function( self ) {
                        return function() {
                            self.tick();
                        };
                    } )( this ) );
                }
                if ( !cont ) {
                    this.running = false;
                    if ( this.mode === this.STEADY && this.sysTimerId !== -1 ) {
                        clearInterval( this.sysTimerId );
                        this.sysTimerId = -1;
                    }
                }
            },

            init: function( mode ) {
                this.mode = typeof mode === "number"? mode : modeFromString[mode];
                if ( this.mode == null || this.mode < 0 || this.mode > 2 ) {
                    this.mode = 0;
                }
            }

            //TODO: check for errors, fix errors, fix TODOs, and add any necessary things

        }, "Timer" );

        lib.Timer.ANIMATION = 0;
        lib.Timer.STEADY = 1;
        lib.Timer.AS_FAST_AS_POSSIBLE = 2;

        lib.Timer.FunctionToCall = FunctionToCall;

        lib.Timer.toString = createToString( "function Timer() { [lib code] }" );
        lib.Timer.prototype.tick.toString = createToString( "function tick() { [lib code] }" );
        lib.Timer.prototype.pause.toString = createToString( "function pause() { [lib code] }" );
        lib.Timer.prototype.resume.toString = createToString( "function resume() { [lib code] }" );
        lib.Timer.prototype.addToQueue.toString = createToString( "function addToQueue() { [lib code] }" );
        lib.Timer.prototype.removeFromQueue.toString = createToString( "function removeFromQueue() { [lib code] }" );

        lib.loaded("lib.Timer");

    ///////////////////////////////////////////////////////////////////////////////////////////////////////


        var findRoot, translateFn, inverseOf, integralOf, normalize,

            abs = Math.abs;
            

        lib.Math = {};

        // by borgar https://gist.github.com/3317728
        // Translated from zeroin.c in http://www.netlib.org/c/brent.shar.
        findRoot = lib.Math.findRoot = function findRoot( func, lowerLimit, upperLimit, errorTol, maxIter ) {
            var a = lowerLimit,
                b = upperLimit,
                c = a,
                fa = func(a),
                fb = func(b),
                fc = fa,
                s = 0,
                fs = 0, tol_act,   // Actual tolerance
                new_step,       // Step at this iteration
                prev_step, // Distance from the last but one to the last approximation
                p,         // Interpolation step is calculated in the form p/q; division is delayed until the last moment
                q;

            errorTol = errorTol || 0;
            maxIter  = maxIter  || 1000;

            while ( maxIter-- > 0 ) {

                prev_step = b - a;

                if ( abs(fc) < abs(fb) ) {
                    // Swap data for b to be the best approximation
                    a = b, b = c, c = a;
                    fa = fb, fb = fc, fc = fa;
                }

                tol_act = 1e-15 * abs(b) + errorTol / 2;
                new_step = ( c - b ) / 2;

                if ( abs(new_step) <= tol_act || fb === 0 ) {
                    return b; // Acceptable approx. is found
                }

                // Decide if the interpolation can be tried
                if ( abs(prev_step) >= tol_act && abs(fa) > abs(fb) ) {
                    // If prev_step was large enough and was in true direction, Interpolatiom may be tried
                    var t1, cb, t2;
                    cb = c - b;
                    if ( a === c ) { // If we have only two distinct points linear interpolation can only be applied
                        t1 = fb / fa;
                        p = cb * t1;
                        q = 1.0 - t1;
                    }
                    else { // Quadric inverse interpolation
                        q = fa / fc, t1 = fb / fc, t2 = fb / fa;
                        p = t2 * (cb * q * (q - t1) - (b - a) * (t1 - 1));
                        q = (q - 1) * (t1 - 1) * (t2 - 1);
                    }

                    if ( p > 0 ) {
                        q = -q;  // p was calculated with the opposite sign; make p positive
                    }
                    else {
                        p = -p;  // and assign possible minus to q
                    }

                    if ( p < ( 0.75 * cb * q - abs( tol_act * q ) / 2 ) &&
                        p < abs( prev_step * q / 2 ) ) { 
                        // If (b + p / q) falls in [b,c] and isn't too large it is accepted
                        new_step = p / q;
                    }

                    // If p/q is too large then the bissection procedure can reduce [b,c] range to more extent
                }

                if ( abs( new_step ) < tol_act ) { // Adjust the step to be not less than tolerance
                    new_step = ( new_step > 0 ) ? tol_act : -tol_act;
                }

                a = b, fa = fb;     // Save the previous approx.
                b += new_step, fb = func(b);  // Do step to a new approxim.

                if ( (fb > 0 && fc > 0) || (fb < 0 && fc < 0) ) {
                    c = a, fc = fa; // Adjust c for it to have a sign opposite to that of b
                }
            }
        };

        translateFn = lib.Math.translateFn = function( fn, dy, dx ) {
            return function( x ) {
                return fn( x-dx ) + dy;
            };
        };

        inverseOf = lib.Math.inverseOf = function( f, a, b, step, err ) {
            return function( x ) {
                return findRoot( translateFn( f, -x, 0 ), a, b, err, Infinity );
            };
        };

        integralOf = lib.Math.integralOf = function( f, n, a ) {
            var i, h, S;
            return function( x ) { //TODO: imporve this by allowing n to change for higher values of x (for accuracy)
                h = ( x-a ) / n, 
                S = f( a );
                for ( i = 1; i < n; i += 2 ) { //TODO: optimize these loops
                    S += 4 * f( a + h * i );
                }
                for ( i = 2; i < n-1; i += 2 ) {
                    S += 2 * f( a + h * i );
                }
                S += f( x );
                return h * S / 3;
            };
        };

        // american spelling, unfortunately.
        normalize = lib.Math.normalize = function( f, n, a, b ) {
            var integralSize = integralOf( f, n, a )( b );
            return function( x ) {
                return f( x ) / integralSize;
            };
        };

        Math.findRoot = findRoot;
        Math.translateFn = translateFn;
        Math.inverseOf = inverseOf;
        Math.integralOf = integralOf;
        Math.normalize = normalize;

        lib.loaded( "lib.Math" );

    ///////////////////////////////////////////////////////////////////////////////////////////////////////

        var /*inverseOf = Math.inverseOf,
            integralOf = Math.integralOf,
            normalise = Math.normalize,*/
            pow = Math.pow,
            getRandomNumber = Math.random,
            ArraySlice = Array.prototype.slice;
            //ObjToString = Object.prototype.toString;


        lib.Probability = lib.Class.extend( {
            _value: 0,
            valueOf: function valueOf() {
                return this._value;
            },
            toString: function toString() {
                return "[" + (this._value*100) + "% Chance]";
            },
            get: function get() {
                return this._value;
            },
            set: function set( value ) {
                if ( typeof value === "object" && value._value ) {
                    this.set( value._value );
                } else if ( typeof value === "number" ) {
                    this._value = value >= 0? ( value <= 1? value : 1 ) : 0;
                }
            },
            increase: function increase( n ) {
                return new Probability( 1 - pow( 1 - this.value, n ) );
            },
            decrease: function decrease( n ) {
                return new Probability( 1 - pow( 1 - this.value, -n ) );
            },
            test: function test() {
                return getRandomNumber < this._value;
            },
            init: function init( value ) {
                this.set( value || 0 );
            }
        }, "Probability" );
        var Probability = lib.Probability;

        lib.Probability.ProbDistrib = lib.Class.extend( {
            _fn: undefined,
            _lowerLimit: undefined,
            _upperLimit: undefined,
            _samplingFn: undefined,
            setFn: function set( fn, n, a, b ) {
                if ( typeof fn !== "function" ) {
                    throw new TypeError( "Given argument to set must be a function." );
                }
                this._fn = normalize( fn, n, a, b );
                this._lowerLimit = a;
                this._upperLimit = b;
                this.generateSamplingFunction();
            },
            getFn: function get() {
                return this._fn;
            },
            getRandom: function getRandom() {
                if ( this._samplingFn == null ) {
                    this.generateSamplingFunction();
                }
                return this._samplingFn( getRandomNumber() );
            },
            getProb: function getProb( a, b ) {
                return integralOf( this._fn, a, b );
            },
            test: function test( a, b ) {
                return getRandomNumber() < integralOf( this._fn, a, b );
            },
            getSamplingFunction: function getSamplingFunction() {
                if ( !this._samplingFn ) {
                    this.generateSamplingFunction();
                }
                return this._samplingFn;
            },
            generateSamplingFunction: function generateSamplingFunction() {
                this._samplingFn = inverseOf( integralOf( this._fn, 1000, this._lowerLimit  ), this._lowerLimit, this._upperLimit, 0.001, 1E-100 );
            },
            init: function init( fn, n, a, b ) {
                this.setFn( fn, n, a, b );
                this.generateSamplingFunction();
            }
        }, "ProbabilityDistribution" );

        lib.Probability.testList = function( probabilities ) {
            var a = ArraySlice.call( probabilities ),
                probSum = 0;
            while ( a.length > 0 && getRandomNumber() >= a[0] / ( 1 - probSum ) ) {
                probSum += a[0];
                a.shift();
            }
            return probabilities.length - a.length;
        };

        lib.loaded( "lib.Probability" );

    ///////////////////////////////////////////////////////////////////////////////////////////////////////


        var Channel, Sound, AudioManager,
            noPass = [ "toString", "valueOf", "constructor", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString" ],
            ObjCreate = Object.create;

        lib.Audio = {};

        lib.Audio.AudioEvent = lib.createEventType( "AudioEvent", {

            sound: null,
            //src: undefined,
            //noOfChannels: undefined,
            soundId: null,
            //autoResize: undefined,
            //time: undefined,
            channel: null,
            newChannelAdded: false,
            //audio: null,

            initEvent: function( type, target, properties ) {
                for ( var id in properties ) {
                    if ( noPass.indexOf( id ) === -1 ) {
                        this[id] = properties[id];
                    }
                }
                this._super( type, target );
            }

        } );

        Channel = lib.Audio.Channel = lib.Events.EventTarget.extend( {
            audio : new Audio(),
            playing: false,
            play: function( volume ) {
                var audio = this.audio,
                    vol = typeof volume === "number"? volume : 1,
                    playEvent = lib.createEvent( "AudioEvent" ),
                    restarted = false,
                    restartEvent;
                if ( this.playing === true ) {
                    restartEvent = lib.createEvent( "AudioEvent" );
                    restartEvent.initEvent( "beforeRestart", this, {
                        channel: this,
                        cancelable: true
                    } );
                    if ( this.dispatchEvent( restartEvent ) === true ) {
                        return;
                    }
                    audio.pause();
                    audio.currentTime = 0;
                    restarted = true;
                }
                this.playing = true;
                audio.volume = vol > 1? 1 : vol < 0? 0 : vol;
                playEvent.initEvent( "beforePlay", this, {
                    channel: this,
                    cancelable: true
                } );
                if ( this.dispatchEvent( playEvent ) ) {
                    return;
                }
                audio.play();
                restartEvent = lib.createEvent( "AudioEvent" );
                restartEvent.initEvent( "restart", this, {
                    channel: this,
                    cancelable: false
                } );
                playEvent = lib.createEvent( "AudioEvent" );
                playEvent.initEvent( "play", this, {
                    channel: this,
                    cancelable: false
                } );
                this.dispatchEvent( restartEvent );
                this.dispatchEvent( playEvent );
            },
            init: function( audio ) {
                this.audio = audio.cloneNode( true );
                var self = this;
                this.audio.addEventListener( "ended", function() {
                    self.playing = false;
                    var endedEvent = lib.createEvent( "AudioEvent" );
                    endedEvent.initEvent( "ended", self, {
                        channel: self,
                        cancelable: false
                    } );
                    self.dispatchEvent( endedEvent );
                } );
            }
        }, "Channel" );

        Sound = lib.Audio.Sound = lib.Events.EventTarget.extend( {
            src: "",
            audio: new Audio(),
            channels: [],
            autoResize: false,
            play: function( volume ) {
                var i = 0,
                    channels = this.channels,
                    len = channels.length,
                    playEvent = lib.createEvent( "AudioEvent" ),
                    newChannelAdded = false;
                for ( ; i < len; i++ ) {
                    if ( !channels[i].playing ) {
                        break;
                    }
                }
                if ( i >= len ) {
                    if ( this.autoResize ) {
                        channels[len] = new Channel( this.audio );
                        newChannelAdded = true;
                        i = len;
                    } else {
                        i = 0;
                    }
                }
                playEvent.initEvent( "beforePlay", this, {
                    sound: this,
                    channel: channels[i],
                    newChannelAdded: newChannelAdded,
                    cancelable: true
                } );
                if ( this.dispatchEvent( playEvent ) === true ) {
                    if ( newChannelAdded ) {
                        channels.splice( len, 1 );
                    }
                    return;
                }
                channels[i].play( volume );
                this.dispatchEvent( playEvent );
                playEvent = lib.createEvent( "AudioEvent" );
                playEvent.initEvent( "play", this, {
                    sound: this,
                    channel: channels[i],
                    newChannelAdded: newChannelAdded,
                    cancelable: false
                } );
            },
            init: function( src, noOfChannels, autoResize ) {
                this.audio = src != null? new Audio( src ) : new Audio();
                this.src = src != null? "" + src : "";
                this.channels = [];
                this.autoResize = !!autoResize;
                var i = 0, len = typeof noOfChannels === "number"? noOfChannels >= 0? noOfChannels : 0 : 3;
                for ( ; i < len; i++ ) {
                    this.channels[i] = new Channel( this.audio );
                }
            }
        } );

        AudioManager = lib.Audio.AudioManager = lib.Events.EventTarget.extend( {
            _sounds: [],
            _soundFromId: ObjCreate(null),
            _soundFromSrc: ObjCreate(null),
            addSound: function( src, noOfChannels, id, autoResize ) {
                var sound = new Sound( src, noOfChannels, autoResize );
                var addSoundEvt = lib.createEvent( "AudioEvent" );
                addSoundEvt.initEvent( "beforeAdd", this, {
                    sound: sound,
                    soundId: id!= null? id : undefined,
                    cancelable: true
                } );
                if ( this.dispatchEvent( addSoundEvt ) === true ) {
                    return;
                }
                this._sounds.push( sound );
                this._soundFromSrc[src] = sound;
                if ( id != null ) {
                    this._soundFromId[id] = sound;
                }
                addSoundEvt = lib.createEvent( "AudioEvent" );
                addSoundEvt.initEvent( "add", this, {
                    sound: sound,
                    soundId: id!= null? id : undefined,
                    cancelable: true
                } );
                this.dispatchEvent( addSoundEvt );
            },
            removeSound: function( id ) {
                var sound = this.getSound( id ),
                    sndId = this._sounds.indexOf( sound ),
                    soundFromSrc = this._soundFromSrc,
                    soundFromId = this._soundFromId,
                    i;

                var removeSoundEvt = lib.createEvent( "AudioEvent" );
                removeSoundEvt.initEvent( "beforeRemove", this, {
                    sound: sound,
                    cancelable: true
                } );
                if ( this.dispatchEvent( removeSoundEvt ) === true ) {
                    return;
                }

                if ( sndId > -1 ) {
                    this._sounds.splice( sndId, -1 );
                }
                if ( soundFromSrc[id] != null && sound === soundFromSrc[id] ) {
                    delete soundFromSrc[id];
                } else if ( sound.src !== "" && sound === soundFromSrc[sound.src] ) {
                    delete soundFromSrc[sound.src];
                } else {
                    for ( i in soundFromSrc ) {
                        if ( sound === soundFromSrc[i] ) {
                            delete soundFromSrc[i];
                            break;
                        }
                    }
                }
                if ( soundFromId[id] != null && sound === soundFromId[id] ) {
                    delete soundFromId[id];
                } else {
                    for ( i in soundFromId ) {
                        if ( sound === soundFromId[i] ) {
                            delete soundFromId[i];
                            break;
                        }
                    }
                }
                removeSoundEvt = lib.createEvent( "AudioEvent" );
                removeSoundEvt.initEvent( "remove", this, {
                    sound: sound,
                    cancelable: false
                } );
                this.dispatchEvent( removeSoundEvt );
            },
            getSound: function( id ) {
                if ( this._soundFromSrc[id] != null ) {
                    return this._soundFromSrc[id];
                }
                if ( this._soundFromId[id] != null ) {
                    return this._soundFromId[id];
                }
            },
            playSound: function( id, volume ) {
                var playEvent = lib.createEvent( "AudioEvent" ),
                    sound = this.getSound( id );
                playEvent.initEvent( "beforePlay", this, {
                    sound: sound,
                    cancelable: true
                } );
                if ( this.dispatchEvent( playEvent ) === true ) {
                    return;
                }
                this.getSound( id ).play( volume );
                playEvent = lib.createEvent( "AudioEvent" );
                playEvent.initEvent( "play", this, {
                    sound: sound,
                    cancelable: false
                } );
                this.dispatchEvent( playEvent );
            }
        } );
        lib.loaded( "lib.Audio" );

    } );

})( window );

