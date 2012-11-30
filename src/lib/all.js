//out of date
(function ( window, /*triedJSON,*/ undefined ) {

    "use strict";

    window._DEBUG = true;

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

        createToString = function( value ) {
            return function toString() {
                return value;
            };
        };


    // if the head element is still not defined
    if ( !head ) {

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
        lib.require.toString = createToString( "function require() { [lib code] }" );

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

        window.lib = lib;

        for ( var i = 0, libInitCallbacksLength = libInitCallbacks.length; i < libInitCallbacksLength; i++ ) {
            libInitCallbacks[i].call( window );
        }
        libInitCallbacked = true;

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

        //Based on ImpactJS and John Resig's JavaScript inheritance
        //-see http://ejohn.org/blog/simple-javascript-inheritance/
        //-and http://impactjs.com/documentation/class-reference/class
        //    -for more information
        var initialising = false,
        testFor_super = ( /abc/.test( function(){abc;} ) )? /\b_parent\b/ : /.*/,
        ConstructorCallException = new TypeError("Class constructor cannot be called as a function."),
        modFn = function( name, fn, _super ) { //do this or anonymous function inside extend()? TODO: test for speed
            return function() {
                var tmp = this._super;
                this._super = _super[name];
                var ret = fn.apply( this, arguments );
                this._super = tmp;
                return ret;
            };
        };

        lib.Class = function Class() {

        };

        lib.Class.prototype.toString = createToString( "[object Class]" );
        lib.Class.toString = createToString( "function Class() { [lib code] }" );

        if ( !window._DEBUG ) { //TODO: remove window._debug for final lib.js (?)
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

                var _super = this.prototype;

                this.initialising = true;
                var prototype = new this();
                this.initialising = false;

                if ( name && !leaveToString ) {
                    prototype.toString = createToString( "[object " + name + "]" );
                }

                for ( var id in def ) {

                    prototype[id] = typeof def[id] === "function" && typeof _super[id] === "function" && testFor_super.test( def[id] ) ?
                        modFn( id, def[id], _super ) :
                        def[id];

                }

                var Class = name?
                    new Function( "return function " + name + "() {\n" +
                                  "    if ( !(this instanceof lib.Class) ) {\n        throw new TypeError(\"Class constructor cannot be called as a function.\");\n    }\n" +
                                  "    if ( !this.initialising && this.init ) {\n        this.init.apply( this, arguments );\n    }\n" +
                                  "};" )() :
                    function Class() {
                        if ( !(this instanceof Class) ) {
                            throw ConstructorCallException;
                        }
                        if ( !this.initialising && this.init ) {
                            this.init.apply( this, arguments );
                        }
                    };

                Class.prototype = prototype;
                Class.prototype.constructor = Class;
                Class.extend = extend;

                return Class;

            };
        }

        lib.Class.extend.toString = createToString( "function extend() { [lib code] }" );

        if (lib.loaded) {
            lib.loaded( "lib.Class" );
        }





        lib.Events = {};
        var libEvents = lib.Events,
        EventListener, LEvent,
        ObjToString = Object.prototype.toString,
        docCreateEvent = document.createEvent,
        EvtTypeException = new TypeError( "Event object missing \"type\" property" ),
        EvtListenerException = new TypeError( "Event Listener is not in the correct type" );

        libEvents.EventListener = lib.Class.extend( {

            handleEvent: function() {},

            init: function( handler ) {
                this.handleEvent = handler;
            }

        }, "EventListener" );
        EventListener = libEvents.EventListener;

        //TODO: is this okay?...
        libEvents.Event = lib.Class.extend( {
            timeStamp: 0,
            type: "",
            target: null,
            cancelable: false,
            preventDefault: function() {},
            initEvent: function( type, target ) {
                this.type = type;
                this.target = target;
            }
        }, "Event" );
        LEvent = libEvents.Event;

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
                newEvent.timeStamp = (new Date()).getTime();
                return newEvent;
            } else {
                return docCreateEvent( eventType );
            }
        };

        lib.createEvent.toString = createToString( "function createEvent() { [lib code] }" );


        libEvents.EventTarget = lib.Class.extend( {

            _listeners: {},

            addEventListener: function addEventListener( type, listener, scope ) {

                var thisListeners = this._listeners[type];
                if ( (!(thisListeners == null)) && ( function() {
                    var thisArg = typeof scope === "object"? scope : null;
                    for ( var i = 0, len = thisListeners.length; i < len; i++ ) {
                        if ( (thisListeners[i].listener === listener || thisListeners[i].listener.handleEvent === listener) && thisListeners[i].scope === thisArg ) {
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
                        if ( (thisListeners[i].listener === listener || thisListeners[i].listener.handleEvent === listener) && thisListeners[i].scope === thisArg ) {
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
                    len = listeners.length;
                if ( ObjToString.call( listeners ) === "[object Array]" ) {
                    for ( ; i < len; i++ ) {
                        var listener = listeners[i];
                        if ( typeof listener.listener.handleEvent !== "function" ) {
                            throw EvtListenerException;
                        }
                        listener.listener.handleEvent.call( listener.scope, evt );
                    }
                }
            }

        }, "EventTarget" );

        libEvents.EventTarget.prototype.addEventListener.toString = createToString( "function addEventListener() { [lib code] }" );
        libEvents.EventTarget.prototype.removeEventListener.toString = createToString( "function addEventListener() { [lib code] }" );
        libEvents.EventTarget.prototype.dispatchEvent.toString = createToString( "function addEventListener() { [lib code] }" );

        libEvents.EventTarget.prototype.on = libEvents.EventTarget.prototype.addEventListener;






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
                    var currTime = new Date().getTime();
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
                    if ( timer.getFPS == null || timer.targetFPS == null || timer.dt == null ) throw notATimerException;

                    this.FPS = timer.getFPS();
                    this.targetFPS = timer.targetFPS;
                    this.delta = timer.dt;

                    this.type = type;
                    this.target = timer;

                }

            } ),

            _clearIntervalFlag: false,
            _recursionCounter: 0,

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
            maxDelta: 50,

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
                this.addEventListener( "tick", function onTick( evt ) {
                    if ( newFunctionToCall.sleepTimer > 0 ) {
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
                }, this);
                if ( this.autoStartStop && !this.running ) {
                    this.startLoop();
                }
            },
            getQueue: function getQueue() {
                return this.queue.slice(0);
            },

            getCurrentTime: function getCurrentTime() {
                return (new Date()).getTime();
            },

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
                this.prevTime = (new Date()).getTime();
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
                if ( this._clearIntervalFlag && this.sysTimer != -1 ) {
                    clearInterval( this.sysTimerId );
                    this.sysTimerId = -1;
                    this._clearIntervalFlag = false;
                    //TODO: should we...
                    return;//? (because it's not in the original Timer.js)
                }
                if ( this.paused ) {
                    return;
                }
                var currentTimer = (new Date()).getTime();
                this.dt = ( currentTimer - this.prevTime ) / 1000;
                if ( this.dt > this.maxDelta ) this.dt = this.maxDelta;
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
                this.prevTimer = currentTimer;

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
                if ( this.mode == null || this.mode < 0 || this.mode > 2 ) this.mode = 0;
            }

            //TODO: check for errors, fix errors, fix TODOs, and add any necessary things

        }, "Timer" );

        lib.Timer.ANIMATION = 0;
        lib.Timer.STEADY = 1;
        lib.Timer.AS_FAST_AS_POSSIBLE = 2;

        lib.Timer.FunctionToCall = FunctionToCall;

        lib.Timer.prototype.tick.toString = createToString( "function tick() { [lib code] }" );
        lib.Timer.prototype.pause.toString = createToString( "function pause() { [lib code] }" );
        lib.Timer.prototype.resume.toString = createToString( "function resume() { [lib code] }" );
        lib.Timer.prototype.addToQueue.toString = createToString( "function addToQueue() { [lib code] }" );

    } );

})( window );
