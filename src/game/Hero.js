lib.requires( "game.Character", "KeyboardJS" ).onload( function() {

    var onGround = true, jumpTime = 0, maxJumpTime = 0.5, gravityConstant = 80, jumpConstant = 25, jump = false, jumped = false, released = false,
        left = false, right = false;

    KeyboardJS.on( "up", function() {
        jump = true;
    }, function() {
        jump = false;
    } );

    KeyboardJS.on( "left", function() {
        left = true;
    }, function() {
        left = false;
    } );
    KeyboardJS.on( "right", function() {
        right = true;
    }, function() {
        right = false;
    } );
    
    game.hero = new game.Character( function( evt ) {

        var A = false, B = false;

        if ( onGround && jump && !jumped ) {
            jumpTime = maxJumpTime;
            onGround = false;
            jumped = true;
            this.vel.y = jumpTime * jumpConstant;
            A = true;
        } else if ( !onGround && jump && jumpTime > 0 && !released ) {
            jumpTime -= evt.delta;
            this.vel.y = jumpTime * jumpConstant;
            B = true;
        } else if ( !onGround && ( !jump || jumpTime <= 0 ) ) {
            this.vel.y -= gravityConstant * evt.delta;
            jumpTime = 0
            released = true;
        }
        this.pos.x += this.vel.x * evt.delta;
        this.pos.y += this.vel.y * evt.delta; if ( this.pos.y < 0 && !A && !B ) {
            onGround = true;
            released = false;
            this.pos.y = 0;
            this.vel.y = 0;
        }
        if ( !jump && onGround ) jumped = false;

    }, function( ctx ) {
        ctx.fillStyle = "#03A";
        ctx.fillRect( this.pos.x*100, 600-this.pos.y*100 - 200, 50, 100 );

    } );

    lib.loaded( "game.hero" );
    
} );
