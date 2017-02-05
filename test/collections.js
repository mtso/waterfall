// These unit tests were taken from Underscore.js by Jeremy Ashkenas,
// DocumentCloud, and Investigative Reporters & Editors (http://underscorejs.org).

QUnit.module('Collections');

QUnit.test('each', function(assert) {
  ƒ.each([1, 2, 3], function(num, i) {
    assert.strictEqual(num, i + 1, 'each iterators provide value and iteration count');
  });

  var answers = [];
  ƒ.each([1, 2, 3], function(num){ answers.push(num * this.multiplier); }, {multiplier: 5});
  assert.deepEqual(answers, [5, 10, 15], 'context object property accessed');

  answers = [];
  ƒ.each([1, 2, 3], function(num){ answers.push(num); });
  assert.deepEqual(answers, [1, 2, 3], 'can iterate a simple array');

  /* Disable until ready to handle object iteration.
  answers = [];
  var obj = {one: 1, two: 2, three: 3};
  obj.constructor.prototype.four = 4;
  ƒ.each(obj, function(value, key){ answers.push(key); });
  assert.deepEqual(answers, ['one', 'two', 'three'], 'iterating over objects works, and ignores the object prototype.');
  delete obj.constructor.prototype.four;
  */

  /* Disable until ready to handle function input.
  // ensure the each function is JITed
  ƒ(1000).times(function() { ƒ.each([], function(){}); });
  var count = 0;
  obj = {1: 'foo', 2: 'bar', 3: 'baz'};
  ƒ.each(obj, function(){ count++; });
  assert.strictEqual(count, 3, 'the fun should be called only 3 times');

  var answer = null;
  ƒ.each([1, 2, 3], function(num, index, arr){ if (ƒ.include(arr, num)) answer = true; });
  assert.ok(answer, 'can reference the original collection from inside the iterator');

  answers = 0;
  ƒ.each(null, function(){ ++answers; });
  assert.strictEqual(answers, 0, 'handles a null properly');

  ƒ.each(false, function(){});

  var a = [1, 2, 3];
  assert.strictEqual(ƒ.each(a, function(){}), a);
  assert.strictEqual(ƒ.each(null, function(){}), null);
  */
});