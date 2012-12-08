lib.require( "lib.Class", "lib.Math" ).onload( function( window, undefined ) {
    "use strict";
    //TODO: test and debug!!

    var inverseOf = Math.inverseOf,
        integralOf = Math.integralOf,
        normalise = Math.normalize,
        pow = Math.pow,
        getRandomNumber = Math.random,
        ArraySlice = Array.prototype.slice;
        //ObjToString = Object.prototype.toString;


    lib.Probability = lib.Class.extend( {
        _value: 0,
        valueOf: function valueOf() {
            return this._value;
        },
        toString: function toString() {
            return "[" + (this._value*100) + "% Chance]";
        },
        get: function get() {
            return this._value;
        },
        set: function set( value ) {
            if ( typeof value === "object" && value._value ) {
                this.set( value._value );
            } else if ( typeof value === "number" ) {
                this._value = value >= 0? ( value <= 1? value : 1 ) : 0;
            }
        },
        increase: function increase( n ) {
            return new Probability( 1 - pow( 1 - this.value, n ) );
        },
        decrease: function decrease( n ) {
            return new Probability( 1 - pow( 1 - this.value, -n ) );
        },
        test: function test() {
            return getRandomNumber() < this._value;
        },
        init: function init( value ) {
            this.set( value || 0 );
        }
    }, "Probability" );
    var Probability = lib.Probability;

    lib.Probability.ProbDistrib = lib.Class.extend( {
        _fn: undefined,
        _lowerLimit: undefined,
        _upperLimit: undefined,
        _samplingFn: undefined,
        setFn: function set( fn, n, a, b ) {
            if ( typeof fn !== "function" ) {
                throw new TypeError( "Given argument to set must be a function." );
            }
            this._fn = normalise( fn, n, a, b );
            this._lowerLimit = a;
            this._upperLimit = b;
            this.generateSamplingFunction();
        },
        getFn: function get() {
            return this._fn;
        },
        getRandom: function getRandom() {
            if ( this._samplingFn == null ) {
                this.generateSamplingFunction();
            }
            return this._samplingFn( getRandomNumber() );
        },
        getProb: function getProb( a, b ) {
            return integralOf( this._fn, a, b );
        },
        test: function test( a, b ) {
            return getRandomNumber() < integralOf( this._fn, a, b );
        },
        getSamplingFunction: function getSamplingFunction() {
            if ( !this._samplingFn ) {
                this.generateSamplingFunction();
            }
            return this._samplingFn;
        },
        generateSamplingFunction: function generateSamplingFunction() {
            this._samplingFn = inverseOf( integralOf( this._fn, 1000, this._lowerLimit  ), this._lowerLimit, this._upperLimit, 0.001, 1E-100 );
        },
        init: function init( fn, n, a, b ) {
            this.setFn( fn, n, a, b );
            this.generateSamplingFunction();
        }
    }, "ProbabilityDistribution" );

    lib.Probability.testList = function( probabilities ) {
        var a = ArraySlice.call( probabilities ),
            probSum = 0;
        while ( a.length > 0 && getRandomNumber() >= a[0] / ( 1 - probSum ) ) {
            probSum += a[0];
            a.shift();
        }
        return probabilities.length - a.length;
    };

    lib.loaded( "lib.Probability" );

} );

