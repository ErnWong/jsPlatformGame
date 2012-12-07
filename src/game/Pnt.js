lib.require( "lib.Class" ).onload( function() {
    window.Pnt = lib.Class.extend( {
        x: 0,
        y: 0,
        init: function( x, y ) {
            this.x = x || 0;
            this.y = y || 0;
        }
    }, "Point" );

    window.Vec = lib.Class.extend( {
        '1': 0,
        '2': 0,
        length: 2,
        addDimension: function( value ) {
            this.length++;
            this[this.length] = typeof value === "number" && value? value : 0;
        },
        init: function () {
            var i=0, len = arguments.length, value;
            for ( this.length = len; i < len; i++ ) {
                value = arguments[i];
                this[i+1] = typeof value === "number" && value? value : 0;
            }
        }
    }, "Vector" );
    lib.loaded( "Pnt" );
 } );

