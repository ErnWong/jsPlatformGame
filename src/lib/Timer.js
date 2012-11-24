lib.requires( "lib.Events" ).onload( function() {
  "use strict";

  lib.Timer = lib.Event.EventTarget.extend( {

    TimerEvent: lib.createEventType( "TimerEvent", {
      //write stuff here
    } ),

    //TODO: finish this timer (see old Timer.js)

  }, "" );

} );
