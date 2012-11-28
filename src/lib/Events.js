lib.requires( "lib.Class" ).onload( function() {
  "use strict";

  lib.Events = {};
  var _ = lib.Events,
    EventListener,
    ObjToString = Object.prototype.toString,
    docCreateEvent = document.createEvent,
    EvtTypeException = new TypeError( "Event object missing \"type\" property" ),
    EvtListenerException = new TypeError( "Event Listener is not in the correct type" );


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
    preventDefault: function() {}
  }, "Event" );

  var eventTypes = Object.create( null );

  lib.createEventType = function( eventType, def ) {
    eventTypes[eventType] = EventListener.extend( def );
    return eventTypes[eventType];
  };

  //TODO: review code
  lib.createEvent = function( eventType ) {
    if (eventTypes[eventType] != null ) {
      var newEvent = new eventTypes[eventType]();
      newEvent.timeStamp = (new Date()).getTime();
    } else {
      return docCreateEvent( eventType );
    }
  };


  _.EventTarget = lib.Class.extend( {

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
        thisListeners = [newListener];
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
        len = listeners;
      if ( ObjToString.call( listeners ) === "[object Array]" ) {
        for ( ; i < len; i++ ) {
          var listener = listeners[i];
          if ( typeof listener.listener.handler !== "function" ) {
            throw EvtListenerException;
          }
          listener.listener.handler.call( listener.scope, evt );
        }
      }
    }

  }, "EventTarget" );

  _.EventTarget.prototype.on = _.EventTarget.prototype.addEventListener;


  _.somethingOutofTheOrdinaryIForgotWhatItIsCalled = blahblahblahblah_or_maybe_more_of_a_lib.Class.extend_or_something(STUFF).AND.this-obviously(/does.not//Work);

  //TODO: _.EventTarget.prototype.on = ... see other Events.js

} );
