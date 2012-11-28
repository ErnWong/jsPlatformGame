lib.requires( "lib.Events" ).onload( function() {
  "use strict";

  // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

  // requestAnimationFrame polyfill by Erik M�ller
  // fixes from Paul Irish and Tino Zijdel

  (function() {
      var lastTime = 0;
      var vendors = ['ms', 'moz', 'webkit', 'o'];
      for( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x ) {
          window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
          window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
      }
   
      if ( !window.requestAnimationFrame )
          window.requestAnimationFrame = function(callback, element) {
              var currTime = new Date().getTime();
              var timeToCall = Math.max(0, 16 - (currTime - lastTime));
              var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
                timeToCall);
              lastTime = currTime + timeToCall;
              return id;
          };
   
      if ( !window.cancelAnimationFrame )
          window.cancelAnimationFrame = function( id ) {
              clearTimeout( id );
          };
  }());

  var notATimerException = new TypeError( "Must pass a timer as an argument to initialize TimerEvent" );

  lib.Timer = lib.Events.EventTarget.extend( {

    AS_FAST_AS_POSSIBLE: 0,
    STEADY: 1,
    ANIMATION: 2,

    TimerEvent: lib.createEventType( "TimerEvent", {

      FPS: 0,
      targetFPS: 0,
      delta: 0,
      //NOTE: add more if necessary

      initEvent: function( type, timer ) {

        //duck typing:
        if ( timer.getFPS == null || timer.targetFPS == null || timer.delta == null ) throw notATimerException;

        this.FPS = timer.getFPS();
        this.targetFPS = timer.targetFPS;
        this.delta = timer.dt;

        this.type = type;

      }

    } ),

    //TODO: finish this timer (see old Timer.js)

  }, "" );

  lib.Timer.AS_FAST_AS_POSSIBLE = 0;
  lib.Timer.STEADY = 1;
  lib.Timer.Animation = 2;

} );
