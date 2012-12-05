lib.require( "lib.Events.EventTarget", "Pnt" ).onload( function() {
    game.Entity = lib.Events.EventTarget.extend( {
        pos: new Pnt( 0, 0 ),
        vel: new Pnt( 0, 0 ),
        draw: null,
        update: null
    }, "Entity" );
    lib.loaded( "game.Entity" );
} );
