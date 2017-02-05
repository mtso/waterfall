// practice.js
// (c) 2017 mtso

var ƒ = {};

/* ????
// Create a safe reference to the Underscore object for use below.
var _ = function(obj) {
  if (obj instanceof _) return obj;
  if (!(this instanceof _)) return new _(obj);
  this._wrapped = obj;
};
*/

ƒ.each = function( array, callback, context ) {
  if ( context !== undefined ) {
    for ( var i = 0; i < array.length; i += 1 ) {
      callback.call( context, array[i], i );
    }
    return;
  }
  for (var i = 0; i < array.length; i+=1) {
    callback( array[i], i );
  }
};

ƒ = function() {

}