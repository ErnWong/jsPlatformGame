//Based on ImpactJS and John Resig's JavaScript inheritance
//-see http://ejohn.org/blog/simple-javascript-inheritance/
//-and http://impactjs.com/documentation/class-reference/class
//    -for more information

(function( window ) {

  "use strict";

  if ( window.lib == null ) {
    window.lib = {};
  }

  var initialising = false,
    testFor_super = ( /abc/.test( function(){abc;} ) )? /\b_parent\b/ : /.*/,
    ConstructorCallException = new TypeError("Class constructor cannot be called as a function."),
    createToString = function( value ) {
      return function toString() {
        return value;
      };
    },
    modFn = function( name, fn, _super ) { //do this or anonymous function inside extend()? TODO: test for speed
      return function() {
        var tmp = this._super;
        this._super = _super[name];
        var ret = fn.apply( this, arguments );
        this._super = tmp;
        return ret;
      };
    };

  lib.Class = function Class() {

  };

  lib.Class.prototype.toString = createToString( "[object Class]" );
  lib.Class.toString = createToString( "function Class() { [lib code] }" );

  if ( !window._DEBUG ) {
    lib.Class.extend = function extend( def, name, leaveToString ) {

      var _super = this.prototype;

      initialising = true;
      var prototype = new this();
      initialising = false;

      if ( name && !leaveToString ) {
        prototype.toString = createToString( "[object " + name + "]" );
      }

      for ( var id in def ) {

        prototype[id] = typeof def[id] === "function" &&
          typeof _super[id] === "function" && testFor_super.test( def[id] ) ?
            modFn( id, def[id], _super ) :
            def[id];

      }

      var Class = function Class() {
        if ( !(this instanceof Class) ) {
          throw ConstructorCallException;
        }
        if ( !initialising && this.init ) {
          this.init.apply( this, arguments );
        }
      };
      Class.prototype = prototype;
      Class.prototype.constructor = Class;
      Class.extend = extend;

      return Class;

    };
  } else {
    lib.Class.extend = function extend( def, name, leaveToString ) {

      var _super = this.prototype;

      this.initialising = true;
      var prototype = new this();
      this.initialising = false;

      if ( name && !leaveToString ) {
        prototype.toString = createToString( "[object " + name + "]" );
      }

      for ( var id in def ) {

        prototype[id] = typeof def[id] === "function" &&
          typeof _super[id] === "function" && testFor_super.test( def[id] ) ?
             modFn( id, def[id], _super ) :
             def[id];

      }

      var Class = name?
        new Function( "return function " + name + "() {\n" +
                      "  if ( !(this intanceof Class) ) {\n    throw new TypeError(\"Class constructor cannot be called as a function.\");\n  }\n" +
                      "  if ( !this.initialising && this.init ) {\n    this.init.apply( this, arguments );\n  }\n" +
                      "};" )() :
        function Class() {
          if ( !(this instanceof Class) ) {
            throw ConstructorCallException;
          }
          if ( !this.initialising && this.init ) {
            this.init.apply( this, arguments );
          }
        };

      Class.prototype = prototype;
      Class.prototype.constructor = Class;
      Class.extend = extend;

      return Class;

    };
  }

  lib.Class.extend.toString = createToString( "function extend() { [lib code] }" );

  if (lib.loaded) {
    lib.loaded( "lib.Class" );
  }

})(window);
