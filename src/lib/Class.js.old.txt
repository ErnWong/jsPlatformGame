//Based on ImpactJS and John Resig's JavaScript inheritance
//-see http://ejohn.org/blog/simple-javascript-inheritance/
//-and http://impactjs.com/documentation/class-reference/class
//    -for more information

//TODO: add (non) debug mode

(function() {

"use strict";

if ( typeof lib == null ) throw Error();//TODO

//define Class as an empty function: "base Class implementation"
/**
 * An empty class that serves as a base class for other classes to inherit from using
 * @class
 */
lib.Class = function Class () {
  //empty class: the base class, does nothing special except for its existence
};

//Just for the style of it:
lib.Class.prototype.toString = function toString() {
  return "[object Class]";
};

lib.Class.toString = function toString() {
  return "function Class() { [lib code] }";
};

if ( !window._DEBUG ) {

}
else {

//init: called automatically. This is the acutal constructor. Use this instead by overwriting it for your own class.
/**
 * A flag to indicate that it's initializing. Used to determine whether to call the init function of the class.
 * @private
 */
lib.Class.initializing = false;

//add a function "extend" that creates a new class that inherits this class.
// - Object def: an object containing the new properties and/or methods for the new class.
/**
 * Extends the class to allow inheritance. New properties can be defined in the parameter <code>def</code>
 * @param {Object} def An object containing additional properties added to the new class. When overriding a method, the old method can be called using <code>this._parent</code> in the new method.
 * @param {string} [name="Class"] An optional string for the desired name for the class (beta). This needs to be a valid variable name.
 * @param {string} [dontModify=false] Whether you don't want the "toString" function to be modified.
 * @returns {lib.Class} A new class that inherits the previous class with new definitions in <code>def</code>
 * @example
 * var myAwsomeClass = lib.Class.extend({
 *   myAwsomeMethod: function() {
 *     //do something awsome
 *   }
 * });
 * var myMoreAwsomeClass = myAwsomeClass.extend({
 *   myAwsomeMethod: function() {
 *     //do something better
 *     this._parent() //call the old myAwsomeMethod method
 * });
 */
lib.Class.extend = function extend( def, name, dontModifyToString ) {

  //define parent as this class
  var _parent = this.prototype;

  //=========================

  //set initializing to true
  this.initializing = true;

  //and create the instance, without running the init function
  var prototype = new this();

  //and now set it back after completion
  this.initializing = false;

  //==========================

  if ( name && !dontModifyToString && window.DEBUG ) {
    prototype.toString = function() {
      return "[object "+name+"]";
    };
  }

  var testForParentUse = ( /abc/.test( function(){abc;} ) )? /\b_parent\b/ : /.*/;

  //loop through all propertie/method "id"s (name) in the "def" object and copy it into the new prototype
  for (var id in def) {

    prototype[id] = ( (typeof def[id] === "function") &&
                      (typeof _parent[id] === "function") &&
                      testForParentUse.test( def[id] ) )?
      //copied from http://ejohn.org/blog/simple-javascript-inheritance/ and edited a bit...
        (function(name, fn){
          return function() {
            var tmp = this._parent;
            
            // Add a new ._parent() method that is the same method
            // but on the parent-class
            this._parent = _parent[name];
            
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._parent = tmp;
            
            return ret;
          };
        })(id, def[id]) :
        def[id];
      //Thanks John Resig!!

  } //(end of for loop)

  //now create the new class to return.
  /*previous "old":
  var Class = function() {
     //if not initializing and init is present, call it
     if (!this.initializing && this.init) this.init.apply(this, arguments);
  }*///beta:
  var Class = name? Function(   "return function "+name+" () {\n"
                              + "  //throw TypeError if the constructor is called with the 'this' value different.\n"
                              + "  if ( !(this instanceof arguments.callee) ) throw new TypeError('Class constructor cannot be called as a function.');\n"
                              + "  //if not initializing and init is present, call it\n"
                              + "  if (!this.initializing && this.init) this.init.apply(this, arguments);\n"
                              + "};"  )() :
                    function Class() {
                      //throw TypeError if the constructor is called with the 'this' value different.\n
                      if ( !(this instanceof arguments.callee) ) throw new TypeError('Class constructor cannot be called as a function.');
                      //if not initializing and init is present, call it
                      if (!this.initializing && this.init) this.init.apply(this, arguments);
                    };

  //copy the "prototype": the classical method for inheritance
  Class.prototype = prototype;

  //enforce the constructor
  Class.prototype.constructor = Class;

  //loop through all properties the new class have (not in the prototype, but the function itself)...
  //  ... and copy it there
  for ( var id in this ) {
    Class[id] = this[id];
  }

  //above is used instead of the following:
  // Class.initializing = false;
  // Class.extend = arguments.callee;
  // Class.inject = this.inject;

  //now return it!
  return Class;
};
lib.Class.extend.toString = function toString() {
  return "function extend() { [lib code] }";
};

//method name inspired by ImpactJS, but code is my own
/**
 * Adds new properties to existing class. Instances will automatically update(?).
 * @param {Object} def An object containing the new properties to be added
 */
lib.Class.inject = function inject( def ) {

  for ( var id in def ) {
    this.prototype[id] = def[id];
  }

  //as simple as that! (I hope??)

};
lib.Class.inject.toString = function toString() {
  return "function inject() { [lib code] }";
};

lib._loaded("lib.Class");

})();