lib.require( "game.Entity", "Pnt" ).onload( function() {
    game.Character = game.Entity.extend( {
        controller: null,
        update: function( evt ) {
            this.controller( evt );
        },
        init: function( controllerFn, drawFn ) {
            if ( ((!(controllerFn == null)) && typeof controllerFn !== "function") || ((!(drawFn == null)) && typeof drawFn !== "function") ) {
                throw new TypeError( "Supplied controller and draw arguments are not functions." );
            }
            this.controller = controllerFn || null;
            this.draw = drawFn || null;
        }
    }, "Character" );

    lib.loaded( "game.Character" );
} );

