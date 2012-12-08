lib.requires( "lib.Class" ).onload( function() {
    "use strict";

    lib.Events = {};
    var _ = lib.Events,
        EventListener, LEvent,
        ObjToString = Object.prototype.toString,
        docCreateEvent = document.createEvent,
        EvtTypeException = new TypeError( "Event object missing \"type\" property" ),
        EvtListenerException = new TypeError( "Event Listener is not in the correct type" ),
        getTime = Date.now,


        createToString = function( value ) {
            return function toString() {
                return value;
            };
        };


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

} );

