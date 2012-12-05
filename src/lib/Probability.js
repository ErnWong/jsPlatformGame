lib.require( "lib.Class", "lib.Math" ).onload( function( window, undefined ) {
    "use strict";

    var inverseOf = Math.inverseOf,
        integralOf = Math.integralOf,
        normalise = Math.normalize,
        getRandomNumber = Math.random;
    lib.Probability = lib.Class.extend( {
        _value: 0,
        valueOf: function valueOf() {
            return this._value;
        },
        toString: function toString() {
            return "["+(this._value*100)+"% Chance]";
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
            return new Probability( 1 - Math.pow( 1 - this.value, n ) );
        },
        decrease: function decrease( n ) {
            return new Probability( 1 - Math.pow( 1 - this.value, -n ) );
        },
        test: function test() {
            return getRandomNumber < this._value;
        },
        init: function init( value ) {
            this.set( value || 0 );
        }
    }, "Probability" );
    var Probability = lib.Probability;

    lib.ProbDistrib = lib.Class.extend( {
        _fn: undefined,
        _samplingFn: undefined,
        setFn: function set( fn ) {
            if ( typeof fn !== "function" ) {
                throw new TypeError( "Given argument to set must be a function." );
            }
            this._fn = normalise( fn );
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
            this._samplingFn = inverseOf( integralOf( this._fn ) );
        },
        init: function init( fn ) {
            this.setFn( fn );
            this.generateSamplingFunction();
        }
    }, "ProbabilityDistribution" );

    lib.loaded( "lib.Probability" );

} );

