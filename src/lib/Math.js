lib.require( "lib.Class" ).onload( function() {

    "use strict";

    //TODO: allow caching, i.e. createFunctionFromTable(table)

    lib.Math = {};

    // by borgar https://gist.github.com/3317728
    // Translated from zeroin.c in http://www.netlib.org/c/brent.shar.
    lib.Math.findRoot = function findRoot( func, lowerLimit, upperLimit, errorTol, maxIter ) {
        var a = lowerLimit,
            b = upperLimit,
            c = a,
            fa = func(a),
            fb = func(b),
            fc = fa,
            s = 0,
            fs = 0, tol_act,   // Actual tolerance
            new_step,       // Step at this iteration
            prev_step, // Distance from the last but one to the last approximation
            p,         // Interpolation step is calculated in the form p/q; division is delayed until the last moment
            q;

        errorTol = errorTol || 0;
        maxIter  = maxIter  || 1000;

        while ( maxIter-- > 0 ) {

            prev_step = b - a;

            if ( Math.abs(fc) < Math.abs(fb) ) {
                // Swap data for b to be the best approximation
                a = b, b = c, c = a;
                fa = fb, fb = fc, fc = fa;
            }

            tol_act = 1e-15 * Math.abs(b) + errorTol / 2;
            new_step = ( c - b ) / 2;

            if ( Math.abs(new_step) <= tol_act || fb === 0 ) {
                return b; // Acceptable approx. is found
            }

            // Decide if the interpolation can be tried
            if ( Math.abs(prev_step) >= tol_act && Math.abs(fa) > Math.abs(fb) ) {
                // If prev_step was large enough and was in true direction, Interpolatiom may be tried
                var t1, cb, t2;
                cb = c - b;
                if ( a === c ) { // If we have only two distinct points linear interpolation can only be applied
                    t1 = fb / fa;
                    p = cb * t1;
                    q = 1.0 - t1;
                }
                else { // Quadric inverse interpolation
                    q = fa / fc, t1 = fb / fc, t2 = fb / fa;
                    p = t2 * (cb * q * (q - t1) - (b - a) * (t1 - 1));
                    q = (q - 1) * (t1 - 1) * (t2 - 1);
                }

                if ( p > 0 ) {
                    q = -q;  // p was calculated with the opposite sign; make p positive
                }
                else {
                    p = -p;  // and assign possible minus to q
                }

                if ( p < ( 0.75 * cb * q - Math.abs( tol_act * q ) / 2 ) &&
                    p < Math.abs( prev_step * q / 2 ) ) { 
                    // If (b + p / q) falls in [b,c] and isn't too large it is accepted
                    new_step = p / q;
                }

                // If p/q is too large then the bissection procedure can reduce [b,c] range to more extent
            }

            if ( Math.abs( new_step ) < tol_act ) { // Adjust the step to be not less than tolerance
                new_step = ( new_step > 0 ) ? tol_act : -tol_act;
            }

            a = b, fa = fb;     // Save the previous approx.
            b += new_step, fb = func(b);  // Do step to a new approxim.

            if ( (fb > 0 && fc > 0) || (fb < 0 && fc < 0) ) {
                c = a, fc = fa; // Adjust c for it to have a sign opposite to that of b
            }
        }
    };
    var findRoot = lib.Math.findRoot;

    lib.Math.translateFn = function( fn, dy, dx ) {
        return function( x ) {
            return fn( x-dx ) + dy;
        };
    };
    var translateFn = lib.Math.translateFn;

    lib.Math.inverseOf = function( f, a, b, step, err ) {
        return function( x ) {
            return findRoot( translateFn( f, -x, 0 ), a, b, err, Infinity );
        };
    };
    var inverseOf = lib.Math.inverseOf;

    lib.Math.integralOf = function( f, n, a ) {
        var i, h, S;
        return function( x ) { //TODO: imporve this by allowing n to change for higher values of x (for accuracy)
            h = (x-a) / n,
            S = f(a);
            for ( i = 1; i < n; i+=2 ) {
                S += 4 * f( a + h * i );
            }
            for ( i = 2; i < n-1; i+=2 ) {
                S += 2 * f( a + h * i );
            }
            S += f( x );
            return h * S / 3;
        };
    };
    var integralOf = lib.Math.integralOf;

    lib.Math.normalize = function( f, n, a, b ) {
        var integralSize = integralOf( f, n, a )( b );
        return function( x ) {
            return f( x ) / integralSize;
        };
    };
    var normalize = lib.Math.normalize;

    Math.findRoot = findRoot;
    Math.translateFn = translateFn;
    Math.inverseOf = inverseOf;
    Math.integralOf = integralOf;
    Math.normalize = normalize;

    lib.loaded( "lib.Math" );
    
} );

