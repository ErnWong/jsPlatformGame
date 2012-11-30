lib.requires( "lib.Events" ).onload( function( window ) {
    "use strict";

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

        createToString = function( value ) {
            return function toString() {
                return value;
            };
        },

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
            this.addEventListener( "tick", function onTick( evt ) {
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
            }, this);
            if ( this.autoStartStop && !this.running ) {
                this.startLoop();
            }
        },
        //TODO: removeFromQueue: function removeFromQueue( method, 
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
            var currentTime = (new Date()).getTime();
            this.dt = ( currentTime - this.prevTime ) / 1000;
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
            if ( this.mode == null || this.mode < 0 || this.mode > 2 ) this.mode = 0;
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

    lib.loaded("lib.Timer");

} );
