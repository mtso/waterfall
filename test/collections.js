// These unit tests are from Underscore.js by Jeremy Ashkenas,
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

  answers = [];
  var obj = {one: 1, two: 2, three: 3};
  obj.constructor.prototype.four = 4;
  ƒ.each(obj, function(value, key){ answers.push(key); });
  assert.deepEqual(answers, ['one', 'two', 'three'], 'iterating over objects works, and ignores the object prototype.');
  delete obj.constructor.prototype.four;

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
});

QUnit.test('forEach', function(assert) {
  assert.strictEqual(ƒ.forEach, ƒ.each, 'is an alias for each');
});

QUnit.test('lookupIterator with contexts', function(assert) {
  ƒ.each([true, false, 'yes', '', 0, 1, {}], function(context) {
    ƒ.each([1], function() {
      assert.strictEqual(typeof this, 'object', 'context is a wrapped primitive');
      assert.strictEqual(this.valueOf(), context, 'the unwrapped context is the specified primitive');
      assert.equal(this, context, 'context can be coerced to the specified primitive');
    }, context);
  });
});

QUnit.test('Iterating objects with sketchy length properties', function(assert) {
  var functions = [
    'each', 'map', 'filter', 'find',
    'some', 'every', 'max', 'min',
    'groupBy', 'countBy', 'partition', 'indexBy'
  ];
  var reducers = ['reduce', 'reduceRight'];

  var tricks = [
    {length: '5'},
    {length: {valueOf: ƒ.constant(5)}},
    {length: Math.pow(2, 53) + 1},
    {length: Math.pow(2, 53)},
    {length: null},
    {length: -2},
    {length: new Number(15)}
  ];

  assert.expect(tricks.length * (functions.length + reducers.length + 4));

  ƒ.each(tricks, function(trick) {
    var length = trick.length;
    assert.strictEqual(ƒ.size(trick), 1, 'size on obj with length: ' + length);
    assert.deepEqual(ƒ.toArray(trick), [length], 'toArray on obj with length: ' + length);
    assert.deepEqual(ƒ.shuffle(trick), [length], 'shuffle on obj with length: ' + length);
    assert.deepEqual(ƒ.sample(trick), length, 'sample on obj with length: ' + length);


    ƒ.each(functions, function(method) {
      ƒ[method](trick, function(val, key) {
        assert.strictEqual(key, 'length', method + ': ran with length = ' + val);
      });
    });

    ƒ.each(reducers, function(method) {
      assert.strictEqual(ƒ[method](trick), trick.length, method);
    });
  });
});

QUnit.test('Resistant to collection length and properties changing while iterating', function(assert) {

  var collection = [
    'each', 'map', 'filter', 'find',
    'some', 'every', 'max', 'min', 'reject',
    'groupBy', 'countBy', 'partition', 'indexBy',
    'reduce', 'reduceRight'
  ];
  var array = [
    'findIndex', 'findLastIndex'
  ];
  var object = [
    'mapObject', 'findKey', 'pick', 'omit'
  ];

  ƒ.each(collection.concat(array), function(method) {
    var sparseArray = [1, 2, 3];
    sparseArray.length = 100;
    var answers = 0;
    ƒ[method](sparseArray, function(){
      ++answers;
      return method === 'every' ? true : null;
    }, {});
    assert.strictEqual(answers, 100, method + ' enumerates [0, length)');

    var growingCollection = [1, 2, 3], count = 0;
    ƒ[method](growingCollection, function() {
      if (count < 10) growingCollection.push(count++);
      return method === 'every' ? true : null;
    }, {});
    assert.strictEqual(count, 3, method + ' is resistant to length changes');
  });

  ƒ.each(collection.concat(object), function(method) {
    var changingObject = {0: 0, 1: 1}, count = 0;
    ƒ[method](changingObject, function(val) {
      if (count < 10) changingObject[++count] = val + 1;
      return method === 'every' ? true : null;
    }, {});

    assert.strictEqual(count, 2, method + ' is resistant to property changes');
  });
});

QUnit.test('map', function(assert) {
  var doubled = ƒ.map([1, 2, 3], function(num){ return num * 2; });
  assert.deepEqual(doubled, [2, 4, 6], 'doubled numbers');

  var tripled = ƒ.map([1, 2, 3], function(num){ return num * this.multiplier; }, {multiplier: 3});
  assert.deepEqual(tripled, [3, 6, 9], 'tripled numbers with context');

  doubled = ƒ([1, 2, 3]).map(function(num){ return num * 2; });
  assert.deepEqual(doubled, [2, 4, 6], 'OO-style doubled numbers');

  var ids = ƒ.map({length: 2, 0: {id: '1'}, 1: {id: '2'}}, function(n){
    return n.id;
  });
  assert.deepEqual(ids, ['1', '2'], 'Can use collection methods on Array-likes.');

  assert.deepEqual(ƒ.map(null, ƒ.noop), [], 'handles a null properly');

  assert.deepEqual(ƒ.map([1], function() {
    return this.length;
  }, [5]), [1], 'called with context');

  // Passing a property name like ƒ.pluck.
  var people = [{name: 'moe', age: 30}, {name: 'curly', age: 50}];
  assert.deepEqual(ƒ.map(people, 'name'), ['moe', 'curly'], 'predicate string map to object properties');
});

QUnit.test('collect', function(assert) {
  assert.strictEqual(ƒ.collect, ƒ.map, 'is an alias for map');
});

QUnit.test('reduce', function(assert) {
  var sum = ƒ.reduce([1, 2, 3], function(memo, num){ return memo + num; }, 0);
  assert.strictEqual(sum, 6, 'can sum up an array');

  var context = {multiplier: 3};
  sum = ƒ.reduce([1, 2, 3], function(memo, num){ return memo + num * this.multiplier; }, 0, context);
  assert.strictEqual(sum, 18, 'can reduce with a context object');

  sum = ƒ([1, 2, 3]).reduce(function(memo, num){ return memo + num; }, 0);
  assert.strictEqual(sum, 6, 'OO-style reduce');

  sum = ƒ.reduce([1, 2, 3], function(memo, num){ return memo + num; });
  assert.strictEqual(sum, 6, 'default initial value');

  var prod = ƒ.reduce([1, 2, 3, 4], function(memo, num){ return memo * num; });
  assert.strictEqual(prod, 24, 'can reduce via multiplication');

  assert.strictEqual(ƒ.reduce(null, ƒ.noop, 138), 138, 'handles a null (with initial value) properly');
  assert.strictEqual(ƒ.reduce([], ƒ.noop, void 0), void 0, 'undefined can be passed as a special case');
  assert.strictEqual(ƒ.reduce([ƒ], ƒ.noop), ƒ, 'collection of length one with no initial value returns the first item');
  assert.strictEqual(ƒ.reduce([], ƒ.noop), void 0, 'returns undefined when collection is empty and no initial value');
});

QUnit.test('foldl', function(assert) {
  assert.strictEqual(ƒ.foldl, ƒ.reduce, 'is an alias for reduce');
});

QUnit.test('inject', function(assert) {
  assert.strictEqual(ƒ.inject, ƒ.reduce, 'is an alias for reduce');
});

QUnit.test('reduceRight', function(assert) {
  var list = ƒ.reduceRight(['foo', 'bar', 'baz'], function(memo, str){ return memo + str; }, '');
  assert.strictEqual(list, 'bazbarfoo', 'can perform right folds');

  list = ƒ.reduceRight(['foo', 'bar', 'baz'], function(memo, str){ return memo + str; });
  assert.strictEqual(list, 'bazbarfoo', 'default initial value');

  var sum = ƒ.reduceRight({a: 1, b: 2, c: 3}, function(memo, num){ return memo + num; });
  assert.strictEqual(sum, 6, 'default initial value on object');

  assert.strictEqual(ƒ.reduceRight(null, ƒ.noop, 138), 138, 'handles a null (with initial value) properly');
  assert.strictEqual(ƒ.reduceRight([ƒ], ƒ.noop), ƒ, 'collection of length one with no initial value returns the first item');

  assert.strictEqual(ƒ.reduceRight([], ƒ.noop, void 0), void 0, 'undefined can be passed as a special case');
  assert.strictEqual(ƒ.reduceRight([], ƒ.noop), void 0, 'returns undefined when collection is empty and no initial value');

  // Assert that the correct arguments are being passed.

  var args,
      init = {},
      object = {a: 1, b: 2},
      lastKey = ƒ.keys(object).pop();

  var expected = lastKey === 'a'
    ? [init, 1, 'a', object]
    : [init, 2, 'b', object];

  ƒ.reduceRight(object, function() {
    if (!args) args = ƒ.toArray(arguments);
  }, init);

  assert.deepEqual(args, expected);

  // And again, with numeric keys.

  object = {2: 'a', 1: 'b'};
  lastKey = ƒ.keys(object).pop();
  args = null;

  expected = lastKey === '2'
    ? [init, 'a', '2', object]
    : [init, 'b', '1', object];

  ƒ.reduceRight(object, function() {
    if (!args) args = ƒ.toArray(arguments);
  }, init);

  assert.deepEqual(args, expected);
});

QUnit.test('foldr', function(assert) {
  assert.strictEqual(ƒ.foldr, ƒ.reduceRight, 'is an alias for reduceRight');
});

QUnit.test('find', function(assert) {
  var array = [1, 2, 3, 4];
  assert.strictEqual(ƒ.find(array, function(n) { return n > 2; }), 3, 'should return first found `value`');
  assert.strictEqual(ƒ.find(array, function() { return false; }), void 0, 'should return `undefined` if `value` is not found');

  array.dontmatch = 55;
  assert.strictEqual(ƒ.find(array, function(x) { return x === 55; }), void 0, 'iterates array-likes correctly');

  // Matching an object like ƒ.findWhere.
  var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}, {a: 2, b: 4}];
  assert.deepEqual(ƒ.find(list, {a: 1}), {a: 1, b: 2}, 'can be used as findWhere');
  assert.deepEqual(ƒ.find(list, {b: 4}), {a: 1, b: 4});
  assert.notOk(ƒ.find(list, {c: 1}), 'undefined when not found');
  assert.notOk(ƒ.find([], {c: 1}), 'undefined when searching empty list');

  var result = ƒ.find([1, 2, 3], function(num){ return num * 2 === 4; });
  assert.strictEqual(result, 2, 'found the first "2" and broke the loop');

  var obj = {
    a: {x: 1, z: 3},
    b: {x: 2, z: 2},
    c: {x: 3, z: 4},
    d: {x: 4, z: 1}
  };

  assert.deepEqual(ƒ.find(obj, {x: 2}), {x: 2, z: 2}, 'works on objects');
  assert.deepEqual(ƒ.find(obj, {x: 2, z: 1}), void 0);
  assert.deepEqual(ƒ.find(obj, function(x) {
    return x.x === 4;
  }), {x: 4, z: 1});

  ƒ.findIndex([{a: 1}], function(a, key, o) {
    assert.strictEqual(key, 0);
    assert.deepEqual(o, [{a: 1}]);
    assert.strictEqual(this, ƒ, 'called with context');
  }, ƒ);
});

QUnit.test('detect', function(assert) {
  assert.strictEqual(ƒ.detect, ƒ.find, 'is an alias for find');
});

QUnit.test('filter', function(assert) {
  var evenArray = [1, 2, 3, 4, 5, 6];
  var evenObject = {one: 1, two: 2, three: 3};
  var isEven = function(num){ return num % 2 === 0; };

  assert.deepEqual(ƒ.filter(evenArray, isEven), [2, 4, 6]);
  assert.deepEqual(ƒ.filter(evenObject, isEven), [2], 'can filter objects');
  assert.deepEqual(ƒ.filter([{}, evenObject, []], 'two'), [evenObject], 'predicate string map to object properties');

  ƒ.filter([1], function() {
    assert.strictEqual(this, evenObject, 'given context');
  }, evenObject);

  // Can be used like ƒ.where.
  var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}];
  assert.deepEqual(ƒ.filter(list, {a: 1}), [{a: 1, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}]);
  assert.deepEqual(ƒ.filter(list, {b: 2}), [{a: 1, b: 2}, {a: 2, b: 2}]);
  assert.deepEqual(ƒ.filter(list, {}), list, 'Empty object accepts all items');
  assert.deepEqual(ƒ(list).filter({}), list, 'OO-filter');
});

QUnit.test('select', function(assert) {
  assert.strictEqual(ƒ.select, ƒ.filter, 'is an alias for filter');
});

QUnit.test('reject', function(assert) {
  var odds = ƒ.reject([1, 2, 3, 4, 5, 6], function(num){ return num % 2 === 0; });
  assert.deepEqual(odds, [1, 3, 5], 'rejected each even number');

  var context = 'obj';

  var evens = ƒ.reject([1, 2, 3, 4, 5, 6], function(num){
    assert.strictEqual(context, 'obj');
    return num % 2 !== 0;
  }, context);
  assert.deepEqual(evens, [2, 4, 6], 'rejected each odd number');

  assert.deepEqual(ƒ.reject([odds, {one: 1, two: 2, three: 3}], 'two'), [odds], 'predicate string map to object properties');

  // Can be used like ƒ.where.
  var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}];
  assert.deepEqual(ƒ.reject(list, {a: 1}), [{a: 2, b: 2}]);
  assert.deepEqual(ƒ.reject(list, {b: 2}), [{a: 1, b: 3}, {a: 1, b: 4}]);
  assert.deepEqual(ƒ.reject(list, {}), [], 'Returns empty list given empty object');
});

QUnit.test('every', function(assert) {
  assert.ok(ƒ.every([], ƒ.identity), 'the empty set');
  assert.ok(ƒ.every([true, true, true], ƒ.identity), 'every true values');
  assert.notOk(ƒ.every([true, false, true], ƒ.identity), 'one false value');
  assert.ok(ƒ.every([0, 10, 28], function(num){ return num % 2 === 0; }), 'even numbers');
  assert.notOk(ƒ.every([0, 11, 28], function(num){ return num % 2 === 0; }), 'an odd number');
  assert.strictEqual(ƒ.every([1], ƒ.identity), true, 'cast to boolean - true');
  assert.strictEqual(ƒ.every([0], ƒ.identity), false, 'cast to boolean - false');
  assert.notOk(ƒ.every([void 0, void 0, void 0], ƒ.identity), 'works with arrays of undefined');

  var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}];
  assert.notOk(ƒ.every(list, {a: 1, b: 2}), 'Can be called with object');
  assert.ok(ƒ.every(list, 'a'), 'String mapped to object property');

  list = [{a: 1, b: 2}, {a: 2, b: 2, c: true}];
  assert.ok(ƒ.every(list, {b: 2}), 'Can be called with object');
  assert.notOk(ƒ.every(list, 'c'), 'String mapped to object property');

  assert.ok(ƒ.every({a: 1, b: 2, c: 3, d: 4}, ƒ.isNumber), 'takes objects');
  assert.notOk(ƒ.every({a: 1, b: 2, c: 3, d: 4}, ƒ.isObject), 'takes objects');
  assert.ok(ƒ.every(['a', 'b', 'c', 'd'], ƒ.hasOwnProperty, {a: 1, b: 2, c: 3, d: 4}), 'context works');
  assert.notOk(ƒ.every(['a', 'b', 'c', 'd', 'f'], ƒ.hasOwnProperty, {a: 1, b: 2, c: 3, d: 4}), 'context works');
});

QUnit.test('all', function(assert) {
  assert.strictEqual(ƒ.all, ƒ.every, 'is an alias for every');
});

QUnit.test('some', function(assert) {
  assert.notOk(ƒ.some([]), 'the empty set');
  assert.notOk(ƒ.some([false, false, false]), 'all false values');
  assert.ok(ƒ.some([false, false, true]), 'one true value');
  assert.ok(ƒ.some([null, 0, 'yes', false]), 'a string');
  assert.notOk(ƒ.some([null, 0, '', false]), 'falsy values');
  assert.notOk(ƒ.some([1, 11, 29], function(num){ return num % 2 === 0; }), 'all odd numbers');
  assert.ok(ƒ.some([1, 10, 29], function(num){ return num % 2 === 0; }), 'an even number');
  assert.strictEqual(ƒ.some([1], ƒ.identity), true, 'cast to boolean - true');
  assert.strictEqual(ƒ.some([0], ƒ.identity), false, 'cast to boolean - false');
  assert.ok(ƒ.some([false, false, true]));

  var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}];
  assert.notOk(ƒ.some(list, {a: 5, b: 2}), 'Can be called with object');
  assert.ok(ƒ.some(list, 'a'), 'String mapped to object property');

  list = [{a: 1, b: 2}, {a: 2, b: 2, c: true}];
  assert.ok(ƒ.some(list, {b: 2}), 'Can be called with object');
  assert.notOk(ƒ.some(list, 'd'), 'String mapped to object property');

  assert.ok(ƒ.some({a: '1', b: '2', c: '3', d: '4', e: 6}, ƒ.isNumber), 'takes objects');
  assert.notOk(ƒ.some({a: 1, b: 2, c: 3, d: 4}, ƒ.isObject), 'takes objects');
  assert.ok(ƒ.some(['a', 'b', 'c', 'd'], ƒ.hasOwnProperty, {a: 1, b: 2, c: 3, d: 4}), 'context works');
  assert.notOk(ƒ.some(['x', 'y', 'z'], ƒ.hasOwnProperty, {a: 1, b: 2, c: 3, d: 4}), 'context works');
});

QUnit.test('any', function(assert) {
  assert.strictEqual(ƒ.any, ƒ.some, 'is an alias for some');
});

QUnit.test('includes', function(assert) {
  ƒ.each([null, void 0, 0, 1, NaN, {}, []], function(val) {
    assert.strictEqual(ƒ.includes(val, 'hasOwnProperty'), false);
  });
  assert.strictEqual(ƒ.includes([1, 2, 3], 2), true, 'two is in the array');
  assert.notOk(ƒ.includes([1, 3, 9], 2), 'two is not in the array');

  assert.strictEqual(ƒ.includes([5, 4, 3, 2, 1], 5, true), true, 'doesn\'t delegate to binary search');

  assert.strictEqual(ƒ.includes({moe: 1, larry: 3, curly: 9}, 3), true, 'ƒ.includes on objects checks their values');
  assert.ok(ƒ([1, 2, 3]).includes(2), 'OO-style includes');

  var numbers = [1, 2, 3, 1, 2, 3, 1, 2, 3];
  assert.strictEqual(ƒ.includes(numbers, 1, 1), true, 'takes a fromIndex');
  assert.strictEqual(ƒ.includes(numbers, 1, -1), false, 'takes a fromIndex');
  assert.strictEqual(ƒ.includes(numbers, 1, -2), false, 'takes a fromIndex');
  assert.strictEqual(ƒ.includes(numbers, 1, -3), true, 'takes a fromIndex');
  assert.strictEqual(ƒ.includes(numbers, 1, 6), true, 'takes a fromIndex');
  assert.strictEqual(ƒ.includes(numbers, 1, 7), false, 'takes a fromIndex');

  assert.ok(ƒ.every([1, 2, 3], ƒ.partial(ƒ.includes, numbers)), 'fromIndex is guarded');
});

QUnit.test('include', function(assert) {
  assert.strictEqual(ƒ.include, ƒ.includes, 'is an alias for includes');
});

QUnit.test('contains', function(assert) {
  assert.strictEqual(ƒ.contains, ƒ.includes, 'is an alias for includes');

});

QUnit.test('includes with NaN', function(assert) {
  assert.strictEqual(ƒ.includes([1, 2, NaN, NaN], NaN), true, 'Expected [1, 2, NaN] to contain NaN');
  assert.strictEqual(ƒ.includes([1, 2, Infinity], NaN), false, 'Expected [1, 2, NaN] to contain NaN');
});

QUnit.test('includes with +- 0', function(assert) {
  ƒ.each([-0, +0], function(val) {
    assert.strictEqual(ƒ.includes([1, 2, val, val], val), true);
    assert.strictEqual(ƒ.includes([1, 2, val, val], -val), true);
    assert.strictEqual(ƒ.includes([-1, 1, 2], -val), false);
  });
});


QUnit.test('invoke', function(assert) {
  assert.expect(13);
  var list = [[5, 1, 7], [3, 2, 1]];
  var result = ƒ.invoke(list, 'sort');
  assert.deepEqual(result[0], [1, 5, 7], 'first array sorted');
  assert.deepEqual(result[1], [1, 2, 3], 'second array sorted');

  ƒ.invoke([{
    method: function() {
      assert.deepEqual(ƒ.toArray(arguments), [1, 2, 3], 'called with arguments');
    }
  }], 'method', 1, 2, 3);

  assert.deepEqual(ƒ.invoke([{a: null}, {}, {a: ƒ.constant(1)}], 'a'), [null, void 0, 1], 'handles null & undefined');

  assert.raises(function() {
    ƒ.invoke([{a: 1}], 'a');
  }, TypeError, 'throws for non-functions');

  var getFoo = ƒ.constant('foo');
  var getThis = function() { return this; };
  var item = {
    a: {
      b: getFoo,
      c: getThis,
      d: null
    },
    e: getFoo,
    f: getThis,
    g: function() {
      return {
        h: getFoo
      };
    }
  };
  var arr = [item];
  assert.deepEqual(ƒ.invoke(arr, ['a', 'b']), ['foo'], 'supports deep method access via an array syntax');
  assert.deepEqual(ƒ.invoke(arr, ['a', 'c']), [item.a], 'executes deep methods on their direct parent');
  assert.deepEqual(ƒ.invoke(arr, ['a', 'd', 'z']), [void 0], 'does not try to access attributes of non-objects');
  assert.deepEqual(ƒ.invoke(arr, ['a', 'd']), [null], 'handles deep null values');
  assert.deepEqual(ƒ.invoke(arr, ['e']), ['foo'], 'handles path arrays of length one');
  assert.deepEqual(ƒ.invoke(arr, ['f']), [item], 'correct uses parent context with shallow array syntax');
  assert.deepEqual(ƒ.invoke(arr, ['g', 'h']), [void 0], 'does not execute intermediate functions');

  arr = [{
    a: function() { return 'foo'; }
  }, {
    a: function() { return 'bar'; }
  }];
  assert.deepEqual(ƒ.invoke(arr, 'a'), ['foo', 'bar'], 'can handle different methods on subsequent objects');
});

QUnit.test('invoke w/ function reference', function(assert) {
  var list = [[5, 1, 7], [3, 2, 1]];
  var result = ƒ.invoke(list, Array.prototype.sort);
  assert.deepEqual(result[0], [1, 5, 7], 'first array sorted');
  assert.deepEqual(result[1], [1, 2, 3], 'second array sorted');

  assert.deepEqual(ƒ.invoke([1, 2, 3], function(a) {
    return a + this;
  }, 5), [6, 7, 8], 'receives params from invoke');
});

// Relevant when using ClojureScript
QUnit.test('invoke when strings have a call method', function(assert) {
  String.prototype.call = function() {
    return 42;
  };
  var list = [[5, 1, 7], [3, 2, 1]];
  var s = 'foo';
  assert.strictEqual(s.call(), 42, 'call function exists');
  var result = ƒ.invoke(list, 'sort');
  assert.deepEqual(result[0], [1, 5, 7], 'first array sorted');
  assert.deepEqual(result[1], [1, 2, 3], 'second array sorted');
  delete String.prototype.call;
  assert.strictEqual(s.call, void 0, 'call function removed');
});

QUnit.test('pluck', function(assert) {
  var people = [{name: 'moe', age: 30}, {name: 'curly', age: 50}];
  assert.deepEqual(ƒ.pluck(people, 'name'), ['moe', 'curly'], 'pulls names out of objects');
  assert.deepEqual(ƒ.pluck(people, 'address'), [void 0, void 0], 'missing properties are returned as undefined');
  //compat: most flexible handling of edge cases
  assert.deepEqual(ƒ.pluck([{'[object Object]': 1}], {}), [1]);
});

QUnit.test('where', function(assert) {
  var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}];
  var result = ƒ.where(list, {a: 1});
  assert.strictEqual(result.length, 3);
  assert.strictEqual(result[result.length - 1].b, 4);
  result = ƒ.where(list, {b: 2});
  assert.strictEqual(result.length, 2);
  assert.strictEqual(result[0].a, 1);
  result = ƒ.where(list, {});
  assert.strictEqual(result.length, list.length);

  function test() {}
  test.map = ƒ.map;
  assert.deepEqual(ƒ.where([ƒ, {a: 1, b: 2}, ƒ], test), [ƒ, ƒ], 'checks properties given function');
});

QUnit.test('findWhere', function(assert) {
  var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}, {a: 2, b: 4}];
  var result = ƒ.findWhere(list, {a: 1});
  assert.deepEqual(result, {a: 1, b: 2});
  result = ƒ.findWhere(list, {b: 4});
  assert.deepEqual(result, {a: 1, b: 4});

  result = ƒ.findWhere(list, {c: 1});
  assert.ok(ƒ.isUndefined(result), 'undefined when not found');

  result = ƒ.findWhere([], {c: 1});
  assert.ok(ƒ.isUndefined(result), 'undefined when searching empty list');

  function test() {}
  test.map = ƒ.map;
  assert.strictEqual(ƒ.findWhere([ƒ, {a: 1, b: 2}, ƒ], test), ƒ, 'checks properties given function');

  function TestClass() {
    this.y = 5;
    this.x = 'foo';
  }
  var expect = {c: 1, x: 'foo', y: 5};
  assert.deepEqual(ƒ.findWhere([{y: 5, b: 6}, expect], new TestClass()), expect, 'uses class instance properties');
});

QUnit.test('max', function(assert) {
  assert.strictEqual(-Infinity, ƒ.max(null), 'can handle null/undefined');
  assert.strictEqual(-Infinity, ƒ.max(void 0), 'can handle null/undefined');
  assert.strictEqual(-Infinity, ƒ.max(null, ƒ.identity), 'can handle null/undefined');

  assert.strictEqual(ƒ.max([1, 2, 3]), 3, 'can perform a regular Math.max');

  var neg = ƒ.max([1, 2, 3], function(num){ return -num; });
  assert.strictEqual(neg, 1, 'can perform a computation-based max');

  assert.strictEqual(-Infinity, ƒ.max({}), 'Maximum value of an empty object');
  assert.strictEqual(-Infinity, ƒ.max([]), 'Maximum value of an empty array');
  assert.strictEqual(ƒ.max({a: 'a'}), -Infinity, 'Maximum value of a non-numeric collection');

  assert.strictEqual(ƒ.max(ƒ.range(1, 300000)), 299999, 'Maximum value of a too-big array');

  assert.strictEqual(ƒ.max([1, 2, 3, 'test']), 3, 'Finds correct max in array starting with num and containing a NaN');
  assert.strictEqual(ƒ.max(['test', 1, 2, 3]), 3, 'Finds correct max in array starting with NaN');

  assert.strictEqual(ƒ.max([1, 2, 3, null]), 3, 'Finds correct max in array starting with num and containing a `null`');
  assert.strictEqual(ƒ.max([null, 1, 2, 3]), 3, 'Finds correct max in array starting with a `null`');

  assert.strictEqual(ƒ.max([1, 2, 3, '']), 3, 'Finds correct max in array starting with num and containing an empty string');
  assert.strictEqual(ƒ.max(['', 1, 2, 3]), 3, 'Finds correct max in array starting with an empty string');

  assert.strictEqual(ƒ.max([1, 2, 3, false]), 3, 'Finds correct max in array starting with num and containing a false');
  assert.strictEqual(ƒ.max([false, 1, 2, 3]), 3, 'Finds correct max in array starting with a false');

  assert.strictEqual(ƒ.max([0, 1, 2, 3, 4]), 4, 'Finds correct max in array containing a zero');
  assert.strictEqual(ƒ.max([-3, -2, -1, 0]), 0, 'Finds correct max in array containing negative numbers');

  assert.deepEqual(ƒ.map([[1, 2, 3], [4, 5, 6]], ƒ.max), [3, 6], 'Finds correct max in array when mapping through multiple arrays');

  var a = {x: -Infinity};
  var b = {x: -Infinity};
  var iterator = function(o){ return o.x; };
  assert.strictEqual(ƒ.max([a, b], iterator), a, 'Respects iterator return value of -Infinity');

  assert.deepEqual(ƒ.max([{a: 1}, {a: 0, b: 3}, {a: 4}, {a: 2}], 'a'), {a: 4}, 'String keys use property iterator');

  assert.deepEqual(ƒ.max([0, 2], function(c){ return c * this.x; }, {x: 1}), 2, 'Iterator context');
  assert.deepEqual(ƒ.max([[1], [2, 3], [-1, 4], [5]], 0), [5], 'Lookup falsy iterator');
  assert.deepEqual(ƒ.max([{0: 1}, {0: 2}, {0: -1}, {a: 1}], 0), {0: 2}, 'Lookup falsy iterator');
});

QUnit.test('min', function(assert) {
  assert.strictEqual(ƒ.min(null), Infinity, 'can handle null/undefined');
  assert.strictEqual(ƒ.min(void 0), Infinity, 'can handle null/undefined');
  assert.strictEqual(ƒ.min(null, ƒ.identity), Infinity, 'can handle null/undefined');

  assert.strictEqual(ƒ.min([1, 2, 3]), 1, 'can perform a regular Math.min');

  var neg = ƒ.min([1, 2, 3], function(num){ return -num; });
  assert.strictEqual(neg, 3, 'can perform a computation-based min');

  assert.strictEqual(ƒ.min({}), Infinity, 'Minimum value of an empty object');
  assert.strictEqual(ƒ.min([]), Infinity, 'Minimum value of an empty array');
  assert.strictEqual(ƒ.min({a: 'a'}), Infinity, 'Minimum value of a non-numeric collection');

  assert.deepEqual(ƒ.map([[1, 2, 3], [4, 5, 6]], ƒ.min), [1, 4], 'Finds correct min in array when mapping through multiple arrays');

  var now = new Date(9999999999);
  var then = new Date(0);
  assert.strictEqual(ƒ.min([now, then]), then);

  assert.strictEqual(ƒ.min(ƒ.range(1, 300000)), 1, 'Minimum value of a too-big array');

  assert.strictEqual(ƒ.min([1, 2, 3, 'test']), 1, 'Finds correct min in array starting with num and containing a NaN');
  assert.strictEqual(ƒ.min(['test', 1, 2, 3]), 1, 'Finds correct min in array starting with NaN');

  assert.strictEqual(ƒ.min([1, 2, 3, null]), 1, 'Finds correct min in array starting with num and containing a `null`');
  assert.strictEqual(ƒ.min([null, 1, 2, 3]), 1, 'Finds correct min in array starting with a `null`');

  assert.strictEqual(ƒ.min([0, 1, 2, 3, 4]), 0, 'Finds correct min in array containing a zero');
  assert.strictEqual(ƒ.min([-3, -2, -1, 0]), -3, 'Finds correct min in array containing negative numbers');

  var a = {x: Infinity};
  var b = {x: Infinity};
  var iterator = function(o){ return o.x; };
  assert.strictEqual(ƒ.min([a, b], iterator), a, 'Respects iterator return value of Infinity');

  assert.deepEqual(ƒ.min([{a: 1}, {a: 0, b: 3}, {a: 4}, {a: 2}], 'a'), {a: 0, b: 3}, 'String keys use property iterator');

  assert.deepEqual(ƒ.min([0, 2], function(c){ return c * this.x; }, {x: -1}), 2, 'Iterator context');
  assert.deepEqual(ƒ.min([[1], [2, 3], [-1, 4], [5]], 0), [-1, 4], 'Lookup falsy iterator');
  assert.deepEqual(ƒ.min([{0: 1}, {0: 2}, {0: -1}, {a: 1}], 0), {0: -1}, 'Lookup falsy iterator');
});

QUnit.test('sortBy', function(assert) {
  var people = [{name: 'curly', age: 50}, {name: 'moe', age: 30}];
  people = ƒ.sortBy(people, function(person){ return person.age; });
  assert.deepEqual(ƒ.pluck(people, 'name'), ['moe', 'curly'], 'stooges sorted by age');

  var list = [void 0, 4, 1, void 0, 3, 2];
  assert.deepEqual(ƒ.sortBy(list, ƒ.identity), [1, 2, 3, 4, void 0, void 0], 'sortBy with undefined values');

  list = ['one', 'two', 'three', 'four', 'five'];
  var sorted = ƒ.sortBy(list, 'length');
  assert.deepEqual(sorted, ['one', 'two', 'four', 'five', 'three'], 'sorted by length');

  function Pair(x, y) {
    this.x = x;
    this.y = y;
  }

  var stableArray = [
    new Pair(1, 1), new Pair(1, 2),
    new Pair(1, 3), new Pair(1, 4),
    new Pair(1, 5), new Pair(1, 6),
    new Pair(2, 1), new Pair(2, 2),
    new Pair(2, 3), new Pair(2, 4),
    new Pair(2, 5), new Pair(2, 6),
    new Pair(void 0, 1), new Pair(void 0, 2),
    new Pair(void 0, 3), new Pair(void 0, 4),
    new Pair(void 0, 5), new Pair(void 0, 6)
  ];

  var stableObject = ƒ.object('abcdefghijklmnopqr'.split(''), stableArray);

  var actual = ƒ.sortBy(stableArray, function(pair) {
    return pair.x;
  });

  assert.deepEqual(actual, stableArray, 'sortBy should be stable for arrays');
  assert.deepEqual(ƒ.sortBy(stableArray, 'x'), stableArray, 'sortBy accepts property string');

  actual = ƒ.sortBy(stableObject, function(pair) {
    return pair.x;
  });

  assert.deepEqual(actual, stableArray, 'sortBy should be stable for objects');

  list = ['q', 'w', 'e', 'r', 't', 'y'];
  assert.deepEqual(ƒ.sortBy(list), ['e', 'q', 'r', 't', 'w', 'y'], 'uses ƒ.identity if iterator is not specified');
});

QUnit.test('groupBy', function(assert) {
  var parity = ƒ.groupBy([1, 2, 3, 4, 5, 6], function(num){ return num % 2; });
  assert.ok('0' in parity && '1' in parity, 'created a group for each value');
  assert.deepEqual(parity[0], [2, 4, 6], 'put each even number in the right group');

  var list = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  var grouped = ƒ.groupBy(list, 'length');
  assert.deepEqual(grouped['3'], ['one', 'two', 'six', 'ten']);
  assert.deepEqual(grouped['4'], ['four', 'five', 'nine']);
  assert.deepEqual(grouped['5'], ['three', 'seven', 'eight']);

  var context = {};
  ƒ.groupBy([{}], function(){ assert.strictEqual(this, context); }, context);

  grouped = ƒ.groupBy([4.2, 6.1, 6.4], function(num) {
    return Math.floor(num) > 4 ? 'hasOwnProperty' : 'constructor';
  });
  assert.strictEqual(grouped.constructor.length, 1);
  assert.strictEqual(grouped.hasOwnProperty.length, 2);

  var array = [{}];
  ƒ.groupBy(array, function(value, index, obj){ assert.strictEqual(obj, array); });

  array = [1, 2, 1, 2, 3];
  grouped = ƒ.groupBy(array);
  assert.strictEqual(grouped['1'].length, 2);
  assert.strictEqual(grouped['3'].length, 1);

  var matrix = [
    [1, 2],
    [1, 3],
    [2, 3]
  ];
  assert.deepEqual(ƒ.groupBy(matrix, 0), {1: [[1, 2], [1, 3]], 2: [[2, 3]]});
  assert.deepEqual(ƒ.groupBy(matrix, 1), {2: [[1, 2]], 3: [[1, 3], [2, 3]]});

  var liz = {name: 'Liz', stats: {power: 10}};
  var chelsea = {name: 'Chelsea', stats: {power: 10}};
  var jordan = {name: 'Jordan', stats: {power: 6}};
  var collection = [liz, chelsea, jordan];
  var expected = {
    10: [liz, chelsea],
    6: [jordan]
  };
  assert.deepEqual(ƒ.groupBy(collection, ['stats', 'power']), expected, 'can group by deep properties');
});

QUnit.test('indexBy', function(assert) {
  var parity = ƒ.indexBy([1, 2, 3, 4, 5], function(num){ return num % 2 === 0; });
  assert.strictEqual(parity['true'], 4);
  assert.strictEqual(parity['false'], 5);

  var list = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  var grouped = ƒ.indexBy(list, 'length');
  assert.strictEqual(grouped['3'], 'ten');
  assert.strictEqual(grouped['4'], 'nine');
  assert.strictEqual(grouped['5'], 'eight');

  var array = [1, 2, 1, 2, 3];
  grouped = ƒ.indexBy(array);
  assert.strictEqual(grouped['1'], 1);
  assert.strictEqual(grouped['2'], 2);
  assert.strictEqual(grouped['3'], 3);
});

QUnit.test('countBy', function(assert) {
  var parity = ƒ.countBy([1, 2, 3, 4, 5], function(num){ return num % 2 === 0; });
  assert.strictEqual(parity['true'], 2);
  assert.strictEqual(parity['false'], 3);

  var list = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  var grouped = ƒ.countBy(list, 'length');
  assert.strictEqual(grouped['3'], 4);
  assert.strictEqual(grouped['4'], 3);
  assert.strictEqual(grouped['5'], 3);

  var context = {};
  ƒ.countBy([{}], function(){ assert.strictEqual(this, context); }, context);

  grouped = ƒ.countBy([4.2, 6.1, 6.4], function(num) {
    return Math.floor(num) > 4 ? 'hasOwnProperty' : 'constructor';
  });
  assert.strictEqual(grouped.constructor, 1);
  assert.strictEqual(grouped.hasOwnProperty, 2);

  var array = [{}];
  ƒ.countBy(array, function(value, index, obj){ assert.strictEqual(obj, array); });

  array = [1, 2, 1, 2, 3];
  grouped = ƒ.countBy(array);
  assert.strictEqual(grouped['1'], 2);
  assert.strictEqual(grouped['3'], 1);
});

QUnit.test('shuffle', function(assert) {
  assert.deepEqual(ƒ.shuffle([1]), [1], 'behaves correctly on size 1 arrays');
  var numbers = ƒ.range(20);
  var shuffled = ƒ.shuffle(numbers);
  assert.notDeepEqual(numbers, shuffled, 'does change the order'); // Chance of false negative: 1 in ~2.4*10^18
  assert.notStrictEqual(numbers, shuffled, 'original object is unmodified');
  assert.deepEqual(numbers, ƒ.sortBy(shuffled), 'contains the same members before and after shuffle');

  shuffled = ƒ.shuffle({a: 1, b: 2, c: 3, d: 4});
  assert.strictEqual(shuffled.length, 4);
  assert.deepEqual(shuffled.sort(), [1, 2, 3, 4], 'works on objects');
});

QUnit.test('sample', function(assert) {
  assert.strictEqual(ƒ.sample([1]), 1, 'behaves correctly when no second parameter is given');
  assert.deepEqual(ƒ.sample([1, 2, 3], -2), [], 'behaves correctly on negative n');
  var numbers = ƒ.range(10);
  var allSampled = ƒ.sample(numbers, 10).sort();
  assert.deepEqual(allSampled, numbers, 'contains the same members before and after sample');
  allSampled = ƒ.sample(numbers, 20).sort();
  assert.deepEqual(allSampled, numbers, 'also works when sampling more objects than are present');
  assert.ok(ƒ.contains(numbers, ƒ.sample(numbers)), 'sampling a single element returns something from the array');
  assert.strictEqual(ƒ.sample([]), void 0, 'sampling empty array with no number returns undefined');
  assert.notStrictEqual(ƒ.sample([], 5), [], 'sampling empty array with a number returns an empty array');
  assert.notStrictEqual(ƒ.sample([1, 2, 3], 0), [], 'sampling an array with 0 picks returns an empty array');
  assert.deepEqual(ƒ.sample([1, 2], -1), [], 'sampling a negative number of picks returns an empty array');
  assert.ok(ƒ.contains([1, 2, 3], ƒ.sample({a: 1, b: 2, c: 3})), 'sample one value from an object');
  var partialSample = ƒ.sample(ƒ.range(1000), 10);
  var partialSampleSorted = partialSample.sort();
  assert.notDeepEqual(partialSampleSorted, ƒ.range(10), 'samples from the whole array, not just the beginning');
});

QUnit.test('toArray', function(assert) {
  assert.notOk(ƒ.isArray(arguments), 'arguments object is not an array');
  assert.ok(ƒ.isArray(ƒ.toArray(arguments)), 'arguments object converted into array');
  var a = [1, 2, 3];
  assert.notStrictEqual(ƒ.toArray(a), a, 'array is cloned');
  assert.deepEqual(ƒ.toArray(a), [1, 2, 3], 'cloned array contains same elements');

  var numbers = ƒ.toArray({one: 1, two: 2, three: 3});
  assert.deepEqual(numbers, [1, 2, 3], 'object flattened into array');

  var hearts = '\uD83D\uDC95';
  var pair = hearts.split('');
  var expected = [pair[0], hearts, '&', hearts, pair[1]];
  assert.deepEqual(ƒ.toArray(expected.join('')), expected, 'maintains astral characters');
  assert.deepEqual(ƒ.toArray(''), [], 'empty string into empty array');

  if (typeof document != 'undefined') {
    // test in IE < 9
    var actual;
    try {
      actual = ƒ.toArray(document.childNodes);
    } catch (e) { /* ignored */ }
    assert.deepEqual(actual, ƒ.map(document.childNodes, ƒ.identity), 'works on NodeList');
  }
});

QUnit.test('size', function(assert) {
  assert.strictEqual(ƒ.size({one: 1, two: 2, three: 3}), 3, 'can compute the size of an object');
  assert.strictEqual(ƒ.size([1, 2, 3]), 3, 'can compute the size of an array');
  assert.strictEqual(ƒ.size({length: 3, 0: 0, 1: 0, 2: 0}), 3, 'can compute the size of Array-likes');

  var func = function() {
    return ƒ.size(arguments);
  };

  assert.strictEqual(func(1, 2, 3, 4), 4, 'can test the size of the arguments object');

  assert.strictEqual(ƒ.size('hello'), 5, 'can compute the size of a string literal');
  assert.strictEqual(ƒ.size(new String('hello')), 5, 'can compute the size of string object');

  assert.strictEqual(ƒ.size(null), 0, 'handles nulls');
  assert.strictEqual(ƒ.size(0), 0, 'handles numbers');
});

QUnit.test('partition', function(assert) {
  var list = [0, 1, 2, 3, 4, 5];
  assert.deepEqual(ƒ.partition(list, function(x) { return x < 4; }), [[0, 1, 2, 3], [4, 5]], 'handles bool return values');
  assert.deepEqual(ƒ.partition(list, function(x) { return x & 1; }), [[1, 3, 5], [0, 2, 4]], 'handles 0 and 1 return values');
  assert.deepEqual(ƒ.partition(list, function(x) { return x - 3; }), [[0, 1, 2, 4, 5], [3]], 'handles other numeric return values');
  assert.deepEqual(ƒ.partition(list, function(x) { return x > 1 ? null : true; }), [[0, 1], [2, 3, 4, 5]], 'handles null return values');
  assert.deepEqual(ƒ.partition(list, function(x) { if (x < 2) return true; }), [[0, 1], [2, 3, 4, 5]], 'handles undefined return values');
  assert.deepEqual(ƒ.partition({a: 1, b: 2, c: 3}, function(x) { return x > 1; }), [[2, 3], [1]], 'handles objects');

  assert.deepEqual(ƒ.partition(list, function(x, index) { return index % 2; }), [[1, 3, 5], [0, 2, 4]], 'can reference the array index');
  assert.deepEqual(ƒ.partition(list, function(x, index, arr) { return x === arr.length - 1; }), [[5], [0, 1, 2, 3, 4]], 'can reference the collection');

  // Default iterator
  assert.deepEqual(ƒ.partition([1, false, true, '']), [[1, true], [false, '']], 'Default iterator');
  assert.deepEqual(ƒ.partition([{x: 1}, {x: 0}, {x: 1}], 'x'), [[{x: 1}, {x: 1}], [{x: 0}]], 'Takes a string');

  // Context
  var predicate = function(x){ return x === this.x; };
  assert.deepEqual(ƒ.partition([1, 2, 3], predicate, {x: 2}), [[2], [1, 3]], 'partition takes a context argument');

  assert.deepEqual(ƒ.partition([{a: 1}, {b: 2}, {a: 1, b: 2}], {a: 1}), [[{a: 1}, {a: 1, b: 2}], [{b: 2}]], 'predicate can be object');

  var object = {a: 1};
  ƒ.partition(object, function(val, key, obj) {
    assert.strictEqual(val, 1);
    assert.strictEqual(key, 'a');
    assert.strictEqual(obj, object);
    assert.strictEqual(this, predicate);
  }, predicate);
});