// These unit tests are from Underscore.js by Jeremy Ashkenas,
// DocumentCloud, and Investigative Reporters & Editors (http://underscorejs.org).

QUnit.module('Utility');

QUnit.test('identity', function(assert) {
  var stooge = {name: 'moe'};
  assert.strictEqual(ƒ.identity(stooge), stooge, 'stooge is the same as his identity');
});

QUnit.test('now', function(assert) {
  var diff = ƒ.now() - new Date().getTime();
  assert.ok(diff <= 0 && diff > -5, 'Produces the correct time in milliseconds');//within 5ms
});