// These unit tests are from Underscore.js by Jeremy Ashkenas,
// DocumentCloud, and Investigative Reporters & Editors (http://underscorejs.org).

QUnit.module('Objects');

var testElement = typeof document === 'object' ? document.createElement('div') : void 0;

QUnit.test('keys', function(assert) {
  assert.deepEqual(ƒ.keys({one: 1, two: 2}), ['one', 'two'], 'can extract the keys from an object');
  // the test above is not safe because it relies on for-in enumeration order
  var a = []; a[1] = 0;
  assert.deepEqual(ƒ.keys(a), ['1'], 'is not fooled by sparse arrays; see issue #95');
  assert.deepEqual(ƒ.keys(null), []);
  assert.deepEqual(ƒ.keys(void 0), []);
  assert.deepEqual(ƒ.keys(1), []);
  assert.deepEqual(ƒ.keys('a'), []);
  assert.deepEqual(ƒ.keys(true), []);

  // keys that may be missed if the implementation isn't careful
  var trouble = {
    constructor: Object,
    valueOf: ƒ.noop,
    hasOwnProperty: null,
    toString: 5,
    toLocaleString: void 0,
    propertyIsEnumerable: /a/,
    isPrototypeOf: this,
    ƒƒdefineGetterƒƒ: Boolean,
    ƒƒdefineSetterƒƒ: {},
    ƒƒlookupSetterƒƒ: false,
    ƒƒlookupGetterƒƒ: []
  };
  var troubleKeys = ['constructor', 'valueOf', 'hasOwnProperty', 'toString', 'toLocaleString', 'propertyIsEnumerable',
                'isPrototypeOf', 'ƒƒdefineGetterƒƒ', 'ƒƒdefineSetterƒƒ', 'ƒƒlookupSetterƒƒ', 'ƒƒlookupGetterƒƒ'].sort();
  assert.deepEqual(ƒ.keys(trouble).sort(), troubleKeys, 'matches non-enumerable properties');
});

QUnit.test('allKeys', function(assert) {
  assert.deepEqual(ƒ.allKeys({one: 1, two: 2}), ['one', 'two'], 'can extract the allKeys from an object');
  // the test above is not safe because it relies on for-in enumeration order
  var a = []; a[1] = 0;
  assert.deepEqual(ƒ.allKeys(a), ['1'], 'is not fooled by sparse arrays; see issue #95');

  a.a = a;
  assert.deepEqual(ƒ.allKeys(a), ['1', 'a'], 'is not fooled by sparse arrays with additional properties');

  ƒ.each([null, void 0, 1, 'a', true, NaN, {}, [], new Number(5), new Date(0)], function(val) {
    assert.deepEqual(ƒ.allKeys(val), []);
  });

  // allKeys that may be missed if the implementation isn't careful
  var trouble = {
    constructor: Object,
    valueOf: ƒ.noop,
    hasOwnProperty: null,
    toString: 5,
    toLocaleString: void 0,
    propertyIsEnumerable: /a/,
    isPrototypeOf: this
  };
  var troubleKeys = ['constructor', 'valueOf', 'hasOwnProperty', 'toString', 'toLocaleString', 'propertyIsEnumerable',
                'isPrototypeOf'].sort();
  assert.deepEqual(ƒ.allKeys(trouble).sort(), troubleKeys, 'matches non-enumerable properties');

  function A() {}
  A.prototype.foo = 'foo';
  var b = new A();
  b.bar = 'bar';
  assert.deepEqual(ƒ.allKeys(b).sort(), ['bar', 'foo'], 'should include inherited keys');

  function y() {}
  y.x = 'z';
  assert.deepEqual(ƒ.allKeys(y), ['x'], 'should get keys from constructor');
});

QUnit.test('values', function(assert) {
  assert.deepEqual(ƒ.values({one: 1, two: 2}), [1, 2], 'can extract the values from an object');
  assert.deepEqual(ƒ.values({one: 1, two: 2, length: 3}), [1, 2, 3], '... even when one of them is "length"');
});

QUnit.test('pairs', function(assert) {
  assert.deepEqual(ƒ.pairs({one: 1, two: 2}), [['one', 1], ['two', 2]], 'can convert an object into pairs');
  assert.deepEqual(ƒ.pairs({one: 1, two: 2, length: 3}), [['one', 1], ['two', 2], ['length', 3]], '... even when one of them is "length"');
});

QUnit.test('invert', function(assert) {
  var obj = {first: 'Moe', second: 'Larry', third: 'Curly'};
  assert.deepEqual(ƒ.keys(ƒ.invert(obj)), ['Moe', 'Larry', 'Curly'], 'can invert an object');
  assert.deepEqual(ƒ.invert(ƒ.invert(obj)), obj, 'two inverts gets you back where you started');

  obj = {length: 3};
  assert.strictEqual(ƒ.invert(obj)['3'], 'length', 'can invert an object with "length"');
});

QUnit.test('functions', function(assert) {
  var obj = {a: 'dash', b: ƒ.map, c: /yo/, d: ƒ.reduce};
  assert.deepEqual(['b', 'd'], ƒ.functions(obj), 'can grab the function names of any passed-in object');

  var Animal = function(){};
  Animal.prototype.run = function(){};
  assert.deepEqual(ƒ.functions(new Animal), ['run'], 'also looks up functions on the prototype');
});

QUnit.test('methods', function(assert) {
  assert.strictEqual(ƒ.methods, ƒ.functions, 'is an alias for functions');
});

QUnit.test('extend', function(assert) {
  var result;
  assert.strictEqual(ƒ.extend({}, {a: 'b'}).a, 'b', 'can extend an object with the attributes of another');
  assert.strictEqual(ƒ.extend({a: 'x'}, {a: 'b'}).a, 'b', 'properties in source override destination');
  assert.strictEqual(ƒ.extend({x: 'x'}, {a: 'b'}).x, 'x', "properties not in source don't get overridden");
  result = ƒ.extend({x: 'x'}, {a: 'a'}, {b: 'b'});
  assert.deepEqual(result, {x: 'x', a: 'a', b: 'b'}, 'can extend from multiple source objects');
  result = ƒ.extend({x: 'x'}, {a: 'a', x: 2}, {a: 'b'});
  assert.deepEqual(result, {x: 2, a: 'b'}, 'extending from multiple source objects last property trumps');
  result = ƒ.extend({}, {a: void 0, b: null});
  assert.deepEqual(ƒ.keys(result), ['a', 'b'], 'extend copies undefined values');

  var F = function() {};
  F.prototype = {a: 'b'};
  var subObj = new F();
  subObj.c = 'd';
  assert.deepEqual(ƒ.extend({}, subObj), {a: 'b', c: 'd'}, 'extend copies all properties from source');
  ƒ.extend(subObj, {});
  assert.notOk(subObj.hasOwnProperty('a'), "extend does not convert destination object's 'in' properties to 'own' properties");

  try {
    result = {};
    ƒ.extend(result, null, void 0, {a: 1});
  } catch (e) { /* ignored */ }

  assert.strictEqual(result.a, 1, 'should not error on `null` or `undefined` sources');

  assert.strictEqual(ƒ.extend(null, {a: 1}), null, 'extending null results in null');
  assert.strictEqual(ƒ.extend(void 0, {a: 1}), void 0, 'extending undefined results in undefined');
});

QUnit.test('extendOwn', function(assert) {
  var result;
  assert.strictEqual(ƒ.extendOwn({}, {a: 'b'}).a, 'b', 'can extend an object with the attributes of another');
  assert.strictEqual(ƒ.extendOwn({a: 'x'}, {a: 'b'}).a, 'b', 'properties in source override destination');
  assert.strictEqual(ƒ.extendOwn({x: 'x'}, {a: 'b'}).x, 'x', "properties not in source don't get overridden");
  result = ƒ.extendOwn({x: 'x'}, {a: 'a'}, {b: 'b'});
  assert.deepEqual(result, {x: 'x', a: 'a', b: 'b'}, 'can extend from multiple source objects');
  result = ƒ.extendOwn({x: 'x'}, {a: 'a', x: 2}, {a: 'b'});
  assert.deepEqual(result, {x: 2, a: 'b'}, 'extending from multiple source objects last property trumps');
  assert.deepEqual(ƒ.extendOwn({}, {a: void 0, b: null}), {a: void 0, b: null}, 'copies undefined values');

  var F = function() {};
  F.prototype = {a: 'b'};
  var subObj = new F();
  subObj.c = 'd';
  assert.deepEqual(ƒ.extendOwn({}, subObj), {c: 'd'}, 'copies own properties from source');

  result = {};
  assert.deepEqual(ƒ.extendOwn(result, null, void 0, {a: 1}), {a: 1}, 'should not error on `null` or `undefined` sources');

  ƒ.each(['a', 5, null, false], function(val) {
    assert.strictEqual(ƒ.extendOwn(val, {a: 1}), val, 'extending non-objects results in returning the non-object value');
  });

  assert.strictEqual(ƒ.extendOwn(void 0, {a: 1}), void 0, 'extending undefined results in undefined');

  result = ƒ.extendOwn({a: 1, 0: 2, 1: '5', length: 6}, {0: 1, 1: 2, length: 2});
  assert.deepEqual(result, {a: 1, 0: 1, 1: 2, length: 2}, 'should treat array-like objects like normal objects');
});

QUnit.test('assign', function(assert) {
  assert.strictEqual(ƒ.assign, ƒ.extendOwn, 'is an alias for extendOwn');
});

QUnit.test('pick', function(assert) {
  var result;
  result = ƒ.pick({a: 1, b: 2, c: 3}, 'a', 'c');
  assert.deepEqual(result, {a: 1, c: 3}, 'can restrict properties to those named');
  result = ƒ.pick({a: 1, b: 2, c: 3}, ['b', 'c']);
  assert.deepEqual(result, {b: 2, c: 3}, 'can restrict properties to those named in an array');
  result = ƒ.pick({a: 1, b: 2, c: 3}, ['a'], 'b');
  assert.deepEqual(result, {a: 1, b: 2}, 'can restrict properties to those named in mixed args');
  result = ƒ.pick(['a', 'b'], 1);
  assert.deepEqual(result, {1: 'b'}, 'can pick numeric properties');

  ƒ.each([null, void 0], function(val) {
    assert.deepEqual(ƒ.pick(val, 'hasOwnProperty'), {}, 'Called with null/undefined');
    assert.deepEqual(ƒ.pick(val, ƒ.constant(true)), {});
  });
  assert.deepEqual(ƒ.pick(5, 'toString', 'b'), {toString: Number.prototype.toString}, 'can iterate primitives');

  var data = {a: 1, b: 2, c: 3};
  var callback = function(value, key, object) {
    assert.strictEqual(key, {1: 'a', 2: 'b', 3: 'c'}[value]);
    assert.strictEqual(object, data);
    return value !== this.value;
  };
  result = ƒ.pick(data, callback, {value: 2});
  assert.deepEqual(result, {a: 1, c: 3}, 'can accept a predicate and context');

  var Obj = function(){};
  Obj.prototype = {a: 1, b: 2, c: 3};
  var instance = new Obj();
  assert.deepEqual(ƒ.pick(instance, 'a', 'c'), {a: 1, c: 3}, 'include prototype props');

  assert.deepEqual(ƒ.pick(data, function(val, key) {
    return this[key] === 3 && this === instance;
  }, instance), {c: 3}, 'function is given context');

  assert.notOk(ƒ.has(ƒ.pick({}, 'foo'), 'foo'), 'does not set own property if property not in object');
  ƒ.pick(data, function(value, key, obj) {
    assert.strictEqual(obj, data, 'passes same object as third parameter of iteratee');
  });
});

QUnit.test('omit', function(assert) {
  var result;
  result = ƒ.omit({a: 1, b: 2, c: 3}, 'b');
  assert.deepEqual(result, {a: 1, c: 3}, 'can omit a single named property');
  result = ƒ.omit({a: 1, b: 2, c: 3}, 'a', 'c');
  assert.deepEqual(result, {b: 2}, 'can omit several named properties');
  result = ƒ.omit({a: 1, b: 2, c: 3}, ['b', 'c']);
  assert.deepEqual(result, {a: 1}, 'can omit properties named in an array');
  result = ƒ.omit(['a', 'b'], 0);
  assert.deepEqual(result, {1: 'b'}, 'can omit numeric properties');

  assert.deepEqual(ƒ.omit(null, 'a', 'b'), {}, 'non objects return empty object');
  assert.deepEqual(ƒ.omit(void 0, 'toString'), {}, 'null/undefined return empty object');
  assert.deepEqual(ƒ.omit(5, 'toString', 'b'), {}, 'returns empty object for primitives');

  var data = {a: 1, b: 2, c: 3};
  var callback = function(value, key, object) {
    assert.strictEqual(key, {1: 'a', 2: 'b', 3: 'c'}[value]);
    assert.strictEqual(object, data);
    return value !== this.value;
  };
  result = ƒ.omit(data, callback, {value: 2});
  assert.deepEqual(result, {b: 2}, 'can accept a predicate');

  var Obj = function(){};
  Obj.prototype = {a: 1, b: 2, c: 3};
  var instance = new Obj();
  assert.deepEqual(ƒ.omit(instance, 'b'), {a: 1, c: 3}, 'include prototype props');

  assert.deepEqual(ƒ.omit(data, function(val, key) {
    return this[key] === 3 && this === instance;
  }, instance), {a: 1, b: 2}, 'function is given context');
});

QUnit.test('defaults', function(assert) {
  var options = {zero: 0, one: 1, empty: '', nan: NaN, nothing: null};

  ƒ.defaults(options, {zero: 1, one: 10, twenty: 20, nothing: 'str'});
  assert.strictEqual(options.zero, 0, 'value exists');
  assert.strictEqual(options.one, 1, 'value exists');
  assert.strictEqual(options.twenty, 20, 'default applied');
  assert.strictEqual(options.nothing, null, "null isn't overridden");

  ƒ.defaults(options, {empty: 'full'}, {nan: 'nan'}, {word: 'word'}, {word: 'dog'});
  assert.strictEqual(options.empty, '', 'value exists');
  assert.ok(ƒ.isNaN(options.nan), "NaN isn't overridden");
  assert.strictEqual(options.word, 'word', 'new value is added, first one wins');

  try {
    options = {};
    ƒ.defaults(options, null, void 0, {a: 1});
  } catch (e) { /* ignored */ }

  assert.strictEqual(options.a, 1, 'should not error on `null` or `undefined` sources');

  assert.deepEqual(ƒ.defaults(null, {a: 1}), {a: 1}, 'defaults skips nulls');
  assert.deepEqual(ƒ.defaults(void 0, {a: 1}), {a: 1}, 'defaults skips undefined');
});

QUnit.test('clone', function(assert) {
  var moe = {name: 'moe', lucky: [13, 27, 34]};
  var clone = ƒ.clone(moe);
  assert.strictEqual(clone.name, 'moe', 'the clone as the attributes of the original');

  clone.name = 'curly';
  assert.ok(clone.name === 'curly' && moe.name === 'moe', 'clones can change shallow attributes without affecting the original');

  clone.lucky.push(101);
  assert.strictEqual(ƒ.last(moe.lucky), 101, 'changes to deep attributes are shared with the original');

  assert.strictEqual(ƒ.clone(void 0), void 0, 'non objects should not be changed by clone');
  assert.strictEqual(ƒ.clone(1), 1, 'non objects should not be changed by clone');
  assert.strictEqual(ƒ.clone(null), null, 'non objects should not be changed by clone');
});

QUnit.test('create', function(assert) {
  var Parent = function() {};
  Parent.prototype = {foo: function() {}, bar: 2};

  ƒ.each(['foo', null, void 0, 1], function(val) {
    assert.deepEqual(ƒ.create(val), {}, 'should return empty object when a non-object is provided');
  });

  assert.ok(ƒ.create([]) instanceof Array, 'should return new instance of array when array is provided');

  var Child = function() {};
  Child.prototype = ƒ.create(Parent.prototype);
  assert.ok(new Child instanceof Parent, 'object should inherit prototype');

  var func = function() {};
  Child.prototype = ƒ.create(Parent.prototype, {func: func});
  assert.strictEqual(Child.prototype.func, func, 'properties should be added to object');

  Child.prototype = ƒ.create(Parent.prototype, {constructor: Child});
  assert.strictEqual(Child.prototype.constructor, Child);

  Child.prototype.foo = 'foo';
  var created = ƒ.create(Child.prototype, new Child);
  assert.notOk(created.hasOwnProperty('foo'), 'should only add own properties');
});

QUnit.test('isEqual', function(assert) {
  function First() {
    this.value = 1;
  }
  First.prototype.value = 1;
  function Second() {
    this.value = 1;
  }
  Second.prototype.value = 2;

  // Basic equality and identity comparisons.
  assert.ok(ƒ.isEqual(null, null), '`null` is equal to `null`');
  assert.ok(ƒ.isEqual(), '`undefined` is equal to `undefined`');

  assert.notOk(ƒ.isEqual(0, -0), '`0` is not equal to `-0`');
  assert.notOk(ƒ.isEqual(-0, 0), 'Commutative equality is implemented for `0` and `-0`');
  assert.notOk(ƒ.isEqual(null, void 0), '`null` is not equal to `undefined`');
  assert.notOk(ƒ.isEqual(void 0, null), 'Commutative equality is implemented for `null` and `undefined`');

  // String object and primitive comparisons.
  assert.ok(ƒ.isEqual('Curly', 'Curly'), 'Identical string primitives are equal');
  assert.ok(ƒ.isEqual(new String('Curly'), new String('Curly')), 'String objects with identical primitive values are equal');
  assert.ok(ƒ.isEqual(new String('Curly'), 'Curly'), 'String primitives and their corresponding object wrappers are equal');
  assert.ok(ƒ.isEqual('Curly', new String('Curly')), 'Commutative equality is implemented for string objects and primitives');

  assert.notOk(ƒ.isEqual('Curly', 'Larry'), 'String primitives with different values are not equal');
  assert.notOk(ƒ.isEqual(new String('Curly'), new String('Larry')), 'String objects with different primitive values are not equal');
  assert.notOk(ƒ.isEqual(new String('Curly'), {toString: function(){ return 'Curly'; }}), 'String objects and objects with a custom `toString` method are not equal');

  // Number object and primitive comparisons.
  assert.ok(ƒ.isEqual(75, 75), 'Identical number primitives are equal');
  assert.ok(ƒ.isEqual(new Number(75), new Number(75)), 'Number objects with identical primitive values are equal');
  assert.ok(ƒ.isEqual(75, new Number(75)), 'Number primitives and their corresponding object wrappers are equal');
  assert.ok(ƒ.isEqual(new Number(75), 75), 'Commutative equality is implemented for number objects and primitives');
  assert.notOk(ƒ.isEqual(new Number(0), -0), '`new Number(0)` and `-0` are not equal');
  assert.notOk(ƒ.isEqual(0, new Number(-0)), 'Commutative equality is implemented for `new Number(0)` and `-0`');

  assert.notOk(ƒ.isEqual(new Number(75), new Number(63)), 'Number objects with different primitive values are not equal');
  assert.notOk(ƒ.isEqual(new Number(63), {valueOf: function(){ return 63; }}), 'Number objects and objects with a `valueOf` method are not equal');

  // Comparisons involving `NaN`.
  assert.ok(ƒ.isEqual(NaN, NaN), '`NaN` is equal to `NaN`');
  assert.ok(ƒ.isEqual(new Number(NaN), NaN), 'Object(`NaN`) is equal to `NaN`');
  assert.notOk(ƒ.isEqual(61, NaN), 'A number primitive is not equal to `NaN`');
  assert.notOk(ƒ.isEqual(new Number(79), NaN), 'A number object is not equal to `NaN`');
  assert.notOk(ƒ.isEqual(Infinity, NaN), '`Infinity` is not equal to `NaN`');

  // Boolean object and primitive comparisons.
  assert.ok(ƒ.isEqual(true, true), 'Identical boolean primitives are equal');
  assert.ok(ƒ.isEqual(new Boolean, new Boolean), 'Boolean objects with identical primitive values are equal');
  assert.ok(ƒ.isEqual(true, new Boolean(true)), 'Boolean primitives and their corresponding object wrappers are equal');
  assert.ok(ƒ.isEqual(new Boolean(true), true), 'Commutative equality is implemented for booleans');
  assert.notOk(ƒ.isEqual(new Boolean(true), new Boolean), 'Boolean objects with different primitive values are not equal');

  // Common type coercions.
  assert.notOk(ƒ.isEqual(new Boolean(false), true), '`new Boolean(false)` is not equal to `true`');
  assert.notOk(ƒ.isEqual('75', 75), 'String and number primitives with like values are not equal');
  assert.notOk(ƒ.isEqual(new Number(63), new String(63)), 'String and number objects with like values are not equal');
  assert.notOk(ƒ.isEqual(75, '75'), 'Commutative equality is implemented for like string and number values');
  assert.notOk(ƒ.isEqual(0, ''), 'Number and string primitives with like values are not equal');
  assert.notOk(ƒ.isEqual(1, true), 'Number and boolean primitives with like values are not equal');
  assert.notOk(ƒ.isEqual(new Boolean(false), new Number(0)), 'Boolean and number objects with like values are not equal');
  assert.notOk(ƒ.isEqual(false, new String('')), 'Boolean primitives and string objects with like values are not equal');
  assert.notOk(ƒ.isEqual(12564504e5, new Date(2009, 9, 25)), 'Dates and their corresponding numeric primitive values are not equal');

  // Dates.
  assert.ok(ƒ.isEqual(new Date(2009, 9, 25), new Date(2009, 9, 25)), 'Date objects referencing identical times are equal');
  assert.notOk(ƒ.isEqual(new Date(2009, 9, 25), new Date(2009, 11, 13)), 'Date objects referencing different times are not equal');
  assert.notOk(ƒ.isEqual(new Date(2009, 11, 13), {
    getTime: function(){
      return 12606876e5;
    }
  }), 'Date objects and objects with a `getTime` method are not equal');
  assert.notOk(ƒ.isEqual(new Date('Curly'), new Date('Curly')), 'Invalid dates are not equal');

  // Functions.
  assert.notOk(ƒ.isEqual(First, Second), 'Different functions with identical bodies and source code representations are not equal');

  // RegExps.
  assert.ok(ƒ.isEqual(/(?:)/gim, /(?:)/gim), 'RegExps with equivalent patterns and flags are equal');
  assert.ok(ƒ.isEqual(/(?:)/gi, /(?:)/ig), 'Flag order is not significant');
  assert.notOk(ƒ.isEqual(/(?:)/g, /(?:)/gi), 'RegExps with equivalent patterns and different flags are not equal');
  assert.notOk(ƒ.isEqual(/Moe/gim, /Curly/gim), 'RegExps with different patterns and equivalent flags are not equal');
  assert.notOk(ƒ.isEqual(/(?:)/gi, /(?:)/g), 'Commutative equality is implemented for RegExps');
  assert.notOk(ƒ.isEqual(/Curly/g, {source: 'Larry', global: true, ignoreCase: false, multiline: false}), 'RegExps and RegExp-like objects are not equal');

  // Empty arrays, array-like objects, and object literals.
  assert.ok(ƒ.isEqual({}, {}), 'Empty object literals are equal');
  assert.ok(ƒ.isEqual([], []), 'Empty array literals are equal');
  assert.ok(ƒ.isEqual([{}], [{}]), 'Empty nested arrays and objects are equal');
  assert.notOk(ƒ.isEqual({length: 0}, []), 'Array-like objects and arrays are not equal.');
  assert.notOk(ƒ.isEqual([], {length: 0}), 'Commutative equality is implemented for array-like objects');

  assert.notOk(ƒ.isEqual({}, []), 'Object literals and array literals are not equal');
  assert.notOk(ƒ.isEqual([], {}), 'Commutative equality is implemented for objects and arrays');

  // Arrays with primitive and object values.
  assert.ok(ƒ.isEqual([1, 'Larry', true], [1, 'Larry', true]), 'Arrays containing identical primitives are equal');
  assert.ok(ƒ.isEqual([/Moe/g, new Date(2009, 9, 25)], [/Moe/g, new Date(2009, 9, 25)]), 'Arrays containing equivalent elements are equal');

  // Multi-dimensional arrays.
  var a = [new Number(47), false, 'Larry', /Moe/, new Date(2009, 11, 13), ['running', 'biking', new String('programming')], {a: 47}];
  var b = [new Number(47), false, 'Larry', /Moe/, new Date(2009, 11, 13), ['running', 'biking', new String('programming')], {a: 47}];
  assert.ok(ƒ.isEqual(a, b), 'Arrays containing nested arrays and objects are recursively compared');

  // Overwrite the methods defined in ES 5.1 section 15.4.4.
  a.forEach = a.map = a.filter = a.every = a.indexOf = a.lastIndexOf = a.some = a.reduce = a.reduceRight = null;
  b.join = b.pop = b.reverse = b.shift = b.slice = b.splice = b.concat = b.sort = b.unshift = null;

  // Array elements and properties.
  assert.ok(ƒ.isEqual(a, b), 'Arrays containing equivalent elements and different non-numeric properties are equal');
  a.push('White Rocks');
  assert.notOk(ƒ.isEqual(a, b), 'Arrays of different lengths are not equal');
  a.push('East Boulder');
  b.push('Gunbarrel Ranch', 'Teller Farm');
  assert.notOk(ƒ.isEqual(a, b), 'Arrays of identical lengths containing different elements are not equal');

  // Sparse arrays.
  assert.ok(ƒ.isEqual(Array(3), Array(3)), 'Sparse arrays of identical lengths are equal');
  assert.notOk(ƒ.isEqual(Array(3), Array(6)), 'Sparse arrays of different lengths are not equal when both are empty');

  var sparse = [];
  sparse[1] = 5;
  assert.ok(ƒ.isEqual(sparse, [void 0, 5]), 'Handles sparse arrays as dense');

  // Simple objects.
  assert.ok(ƒ.isEqual({a: 'Curly', b: 1, c: true}, {a: 'Curly', b: 1, c: true}), 'Objects containing identical primitives are equal');
  assert.ok(ƒ.isEqual({a: /Curly/g, b: new Date(2009, 11, 13)}, {a: /Curly/g, b: new Date(2009, 11, 13)}), 'Objects containing equivalent members are equal');
  assert.notOk(ƒ.isEqual({a: 63, b: 75}, {a: 61, b: 55}), 'Objects of identical sizes with different values are not equal');
  assert.notOk(ƒ.isEqual({a: 63, b: 75}, {a: 61, c: 55}), 'Objects of identical sizes with different property names are not equal');
  assert.notOk(ƒ.isEqual({a: 1, b: 2}, {a: 1}), 'Objects of different sizes are not equal');
  assert.notOk(ƒ.isEqual({a: 1}, {a: 1, b: 2}), 'Commutative equality is implemented for objects');
  assert.notOk(ƒ.isEqual({x: 1, y: void 0}, {x: 1, z: 2}), 'Objects with identical keys and different values are not equivalent');

  // `A` contains nested objects and arrays.
  a = {
    name: new String('Moe Howard'),
    age: new Number(77),
    stooge: true,
    hobbies: ['acting'],
    film: {
      name: 'Sing a Song of Six Pants',
      release: new Date(1947, 9, 30),
      stars: [new String('Larry Fine'), 'Shemp Howard'],
      minutes: new Number(16),
      seconds: 54
    }
  };

  // `B` contains equivalent nested objects and arrays.
  b = {
    name: new String('Moe Howard'),
    age: new Number(77),
    stooge: true,
    hobbies: ['acting'],
    film: {
      name: 'Sing a Song of Six Pants',
      release: new Date(1947, 9, 30),
      stars: [new String('Larry Fine'), 'Shemp Howard'],
      minutes: new Number(16),
      seconds: 54
    }
  };
  assert.ok(ƒ.isEqual(a, b), 'Objects with nested equivalent members are recursively compared');

  // Instances.
  assert.ok(ƒ.isEqual(new First, new First), 'Object instances are equal');
  assert.notOk(ƒ.isEqual(new First, new Second), 'Objects with different constructors and identical own properties are not equal');
  assert.notOk(ƒ.isEqual({value: 1}, new First), 'Object instances and objects sharing equivalent properties are not equal');
  assert.notOk(ƒ.isEqual({value: 2}, new Second), 'The prototype chain of objects should not be examined');

  // Circular Arrays.
  (a = []).push(a);
  (b = []).push(b);
  assert.ok(ƒ.isEqual(a, b), 'Arrays containing circular references are equal');
  a.push(new String('Larry'));
  b.push(new String('Larry'));
  assert.ok(ƒ.isEqual(a, b), 'Arrays containing circular references and equivalent properties are equal');
  a.push('Shemp');
  b.push('Curly');
  assert.notOk(ƒ.isEqual(a, b), 'Arrays containing circular references and different properties are not equal');

  // More circular arrays #767.
  a = ['everything is checked but', 'this', 'is not'];
  a[1] = a;
  b = ['everything is checked but', ['this', 'array'], 'is not'];
  assert.notOk(ƒ.isEqual(a, b), 'Comparison of circular references with non-circular references are not equal');

  // Circular Objects.
  a = {abc: null};
  b = {abc: null};
  a.abc = a;
  b.abc = b;
  assert.ok(ƒ.isEqual(a, b), 'Objects containing circular references are equal');
  a.def = 75;
  b.def = 75;
  assert.ok(ƒ.isEqual(a, b), 'Objects containing circular references and equivalent properties are equal');
  a.def = new Number(75);
  b.def = new Number(63);
  assert.notOk(ƒ.isEqual(a, b), 'Objects containing circular references and different properties are not equal');

  // More circular objects #767.
  a = {everything: 'is checked', but: 'this', is: 'not'};
  a.but = a;
  b = {everything: 'is checked', but: {that: 'object'}, is: 'not'};
  assert.notOk(ƒ.isEqual(a, b), 'Comparison of circular references with non-circular object references are not equal');

  // Cyclic Structures.
  a = [{abc: null}];
  b = [{abc: null}];
  (a[0].abc = a).push(a);
  (b[0].abc = b).push(b);
  assert.ok(ƒ.isEqual(a, b), 'Cyclic structures are equal');
  a[0].def = 'Larry';
  b[0].def = 'Larry';
  assert.ok(ƒ.isEqual(a, b), 'Cyclic structures containing equivalent properties are equal');
  a[0].def = new String('Larry');
  b[0].def = new String('Curly');
  assert.notOk(ƒ.isEqual(a, b), 'Cyclic structures containing different properties are not equal');

  // Complex Circular References.
  a = {foo: {b: {foo: {c: {foo: null}}}}};
  b = {foo: {b: {foo: {c: {foo: null}}}}};
  a.foo.b.foo.c.foo = a;
  b.foo.b.foo.c.foo = b;
  assert.ok(ƒ.isEqual(a, b), 'Cyclic structures with nested and identically-named properties are equal');

  // Chaining.
  assert.notOk(ƒ.isEqual(ƒ({x: 1, y: void 0}).chain(), ƒ({x: 1, z: 2}).chain()), 'Chained objects containing different values are not equal');

  a = ƒ({x: 1, y: 2}).chain();
  b = ƒ({x: 1, y: 2}).chain();
  assert.strictEqual(ƒ.isEqual(a.isEqual(b), ƒ(true)), true, '`isEqual` can be chained');

  // Objects without a `constructor` property
  if (Object.create) {
    a = Object.create(null, {x: {value: 1, enumerable: true}});
    b = {x: 1};
    assert.ok(ƒ.isEqual(a, b), 'Handles objects without a constructor (e.g. from Object.create');
  }

  function Foo() { this.a = 1; }
  Foo.prototype.constructor = null;

  var other = {a: 1};
  assert.strictEqual(ƒ.isEqual(new Foo, other), false, 'Objects from different constructors are not equal');


  // Tricky object cases val comparisons
  assert.strictEqual(ƒ.isEqual([0], [-0]), false);
  assert.strictEqual(ƒ.isEqual({a: 0}, {a: -0}), false);
  assert.strictEqual(ƒ.isEqual([NaN], [NaN]), true);
  assert.strictEqual(ƒ.isEqual({a: NaN}, {a: NaN}), true);

  if (typeof Symbol !== 'undefined') {
    var symbol = Symbol('x');
    assert.strictEqual(ƒ.isEqual(symbol, symbol), true, 'A symbol is equal to itself');
    assert.strictEqual(ƒ.isEqual(symbol, Object(symbol)), true, 'Even when wrapped in Object()');
    assert.strictEqual(ƒ.isEqual(symbol, null), false, 'Different types are not equal');
  }

});

QUnit.test('isEmpty', function(assert) {
  assert.notOk(ƒ([1]).isEmpty(), '[1] is not empty');
  assert.ok(ƒ.isEmpty([]), '[] is empty');
  assert.notOk(ƒ.isEmpty({one: 1}), '{one: 1} is not empty');
  assert.ok(ƒ.isEmpty({}), '{} is empty');
  assert.ok(ƒ.isEmpty(new RegExp('')), 'objects with prototype properties are empty');
  assert.ok(ƒ.isEmpty(null), 'null is empty');
  assert.ok(ƒ.isEmpty(), 'undefined is empty');
  assert.ok(ƒ.isEmpty(''), 'the empty string is empty');
  assert.notOk(ƒ.isEmpty('moe'), 'but other strings are not');

  var obj = {one: 1};
  delete obj.one;
  assert.ok(ƒ.isEmpty(obj), 'deleting all the keys from an object empties it');

  var args = function(){ return arguments; };
  assert.ok(ƒ.isEmpty(args()), 'empty arguments object is empty');
  assert.notOk(ƒ.isEmpty(args('')), 'non-empty arguments object is not empty');

  // covers collecting non-enumerable properties in IE < 9
  var nonEnumProp = {toString: 5};
  assert.notOk(ƒ.isEmpty(nonEnumProp), 'non-enumerable property is not empty');
});

if (typeof document === 'object') {
  QUnit.test('isElement', function(assert) {
    assert.notOk(ƒ.isElement('div'), 'strings are not dom elements');
    assert.ok(ƒ.isElement(testElement), 'an element is a DOM element');
  });
}

QUnit.test('isArguments', function(assert) {
  var args = (function(){ return arguments; }(1, 2, 3));
  assert.notOk(ƒ.isArguments('string'), 'a string is not an arguments object');
  assert.notOk(ƒ.isArguments(ƒ.isArguments), 'a function is not an arguments object');
  assert.ok(ƒ.isArguments(args), 'but the arguments object is an arguments object');
  assert.notOk(ƒ.isArguments(ƒ.toArray(args)), 'but not when it\'s converted into an array');
  assert.notOk(ƒ.isArguments([1, 2, 3]), 'and not vanilla arrays.');
});

QUnit.test('isObject', function(assert) {
  assert.ok(ƒ.isObject(arguments), 'the arguments object is object');
  assert.ok(ƒ.isObject([1, 2, 3]), 'and arrays');
  if (testElement) {
    assert.ok(ƒ.isObject(testElement), 'and DOM element');
  }
  assert.ok(ƒ.isObject(function() {}), 'and functions');
  assert.notOk(ƒ.isObject(null), 'but not null');
  assert.notOk(ƒ.isObject(void 0), 'and not undefined');
  assert.notOk(ƒ.isObject('string'), 'and not string');
  assert.notOk(ƒ.isObject(12), 'and not number');
  assert.notOk(ƒ.isObject(true), 'and not boolean');
  assert.ok(ƒ.isObject(new String('string')), 'but new String()');
});

QUnit.test('isArray', function(assert) {
  assert.notOk(ƒ.isArray(void 0), 'undefined vars are not arrays');
  assert.notOk(ƒ.isArray(arguments), 'the arguments object is not an array');
  assert.ok(ƒ.isArray([1, 2, 3]), 'but arrays are');
});

QUnit.test('isString', function(assert) {
  var obj = new String('I am a string object');
  if (testElement) {
    assert.notOk(ƒ.isString(testElement), 'an element is not a string');
  }
  assert.ok(ƒ.isString([1, 2, 3].join(', ')), 'but strings are');
  assert.strictEqual(ƒ.isString('I am a string literal'), true, 'string literals are');
  assert.ok(ƒ.isString(obj), 'so are String objects');
  assert.strictEqual(ƒ.isString(1), false);
});

QUnit.test('isSymbol', function(assert) {
  assert.notOk(ƒ.isSymbol(0), 'numbers are not symbols');
  assert.notOk(ƒ.isSymbol(''), 'strings are not symbols');
  assert.notOk(ƒ.isSymbol(ƒ.isSymbol), 'functions are not symbols');
  if (typeof Symbol === 'function') {
    assert.ok(ƒ.isSymbol(Symbol()), 'symbols are symbols');
    assert.ok(ƒ.isSymbol(Symbol('description')), 'described symbols are symbols');
    assert.ok(ƒ.isSymbol(Object(Symbol())), 'boxed symbols are symbols');
  }
});

QUnit.test('isNumber', function(assert) {
  assert.notOk(ƒ.isNumber('string'), 'a string is not a number');
  assert.notOk(ƒ.isNumber(arguments), 'the arguments object is not a number');
  assert.notOk(ƒ.isNumber(void 0), 'undefined is not a number');
  assert.ok(ƒ.isNumber(3 * 4 - 7 / 10), 'but numbers are');
  assert.ok(ƒ.isNumber(NaN), 'NaN *is* a number');
  assert.ok(ƒ.isNumber(Infinity), 'Infinity is a number');
  assert.notOk(ƒ.isNumber('1'), 'numeric strings are not numbers');
});

QUnit.test('isBoolean', function(assert) {
  assert.notOk(ƒ.isBoolean(2), 'a number is not a boolean');
  assert.notOk(ƒ.isBoolean('string'), 'a string is not a boolean');
  assert.notOk(ƒ.isBoolean('false'), 'the string "false" is not a boolean');
  assert.notOk(ƒ.isBoolean('true'), 'the string "true" is not a boolean');
  assert.notOk(ƒ.isBoolean(arguments), 'the arguments object is not a boolean');
  assert.notOk(ƒ.isBoolean(void 0), 'undefined is not a boolean');
  assert.notOk(ƒ.isBoolean(NaN), 'NaN is not a boolean');
  assert.notOk(ƒ.isBoolean(null), 'null is not a boolean');
  assert.ok(ƒ.isBoolean(true), 'but true is');
  assert.ok(ƒ.isBoolean(false), 'and so is false');
});

QUnit.test('isMap', function(assert) {
  assert.notOk(ƒ.isMap('string'), 'a string is not a map');
  assert.notOk(ƒ.isMap(2), 'a number is not a map');
  assert.notOk(ƒ.isMap({}), 'an object is not a map');
  assert.notOk(ƒ.isMap(false), 'a boolean is not a map');
  assert.notOk(ƒ.isMap(void 0), 'undefined is not a map');
  assert.notOk(ƒ.isMap([1, 2, 3]), 'an array is not a map');
  if (typeof Set === 'function') {
    assert.notOk(ƒ.isMap(new Set()), 'a set is not a map');
  }
  if (typeof WeakSet === 'function') {
    assert.notOk(ƒ.isMap(new WeakSet()), 'a weakset is not a map');
  }
  if (typeof WeakMap === 'function') {
    assert.notOk(ƒ.isMap(new WeakMap()), 'a weakmap is not a map');
  }
  if (typeof Map === 'function') {
    var keyString = 'a string';
    var obj = new Map();
    obj.set(keyString, 'value');
    assert.ok(ƒ.isMap(obj), 'but a map is');
  }
});

QUnit.test('isWeakMap', function(assert) {
  assert.notOk(ƒ.isWeakMap('string'), 'a string is not a weakmap');
  assert.notOk(ƒ.isWeakMap(2), 'a number is not a weakmap');
  assert.notOk(ƒ.isWeakMap({}), 'an object is not a weakmap');
  assert.notOk(ƒ.isWeakMap(false), 'a boolean is not a weakmap');
  assert.notOk(ƒ.isWeakMap(void 0), 'undefined is not a weakmap');
  assert.notOk(ƒ.isWeakMap([1, 2, 3]), 'an array is not a weakmap');
  if (typeof Set === 'function') {
    assert.notOk(ƒ.isWeakMap(new Set()), 'a set is not a weakmap');
  }
  if (typeof WeakSet === 'function') {
    assert.notOk(ƒ.isWeakMap(new WeakSet()), 'a weakset is not a weakmap');
  }
  if (typeof Map === 'function') {
    assert.notOk(ƒ.isWeakMap(new Map()), 'a map is not a weakmap');
  }
  if (typeof WeakMap === 'function') {
    var keyObj = {}, obj = new WeakMap();
    obj.set(keyObj, 'value');
    assert.ok(ƒ.isWeakMap(obj), 'but a weakmap is');
  }
});

QUnit.test('isSet', function(assert) {
  assert.notOk(ƒ.isSet('string'), 'a string is not a set');
  assert.notOk(ƒ.isSet(2), 'a number is not a set');
  assert.notOk(ƒ.isSet({}), 'an object is not a set');
  assert.notOk(ƒ.isSet(false), 'a boolean is not a set');
  assert.notOk(ƒ.isSet(void 0), 'undefined is not a set');
  assert.notOk(ƒ.isSet([1, 2, 3]), 'an array is not a set');
  if (typeof Map === 'function') {
    assert.notOk(ƒ.isSet(new Map()), 'a map is not a set');
  }
  if (typeof WeakMap === 'function') {
    assert.notOk(ƒ.isSet(new WeakMap()), 'a weakmap is not a set');
  }
  if (typeof WeakSet === 'function') {
    assert.notOk(ƒ.isSet(new WeakSet()), 'a weakset is not a set');
  }
  if (typeof Set === 'function') {
    var obj = new Set();
    obj.add(1).add('string').add(false).add({});
    assert.ok(ƒ.isSet(obj), 'but a set is');
  }
});

QUnit.test('isWeakSet', function(assert) {

  assert.notOk(ƒ.isWeakSet('string'), 'a string is not a weakset');
  assert.notOk(ƒ.isWeakSet(2), 'a number is not a weakset');
  assert.notOk(ƒ.isWeakSet({}), 'an object is not a weakset');
  assert.notOk(ƒ.isWeakSet(false), 'a boolean is not a weakset');
  assert.notOk(ƒ.isWeakSet(void 0), 'undefined is not a weakset');
  assert.notOk(ƒ.isWeakSet([1, 2, 3]), 'an array is not a weakset');
  if (typeof Map === 'function') {
    assert.notOk(ƒ.isWeakSet(new Map()), 'a map is not a weakset');
  }
  if (typeof WeakMap === 'function') {
    assert.notOk(ƒ.isWeakSet(new WeakMap()), 'a weakmap is not a weakset');
  }
  if (typeof Set === 'function') {
    assert.notOk(ƒ.isWeakSet(new Set()), 'a set is not a weakset');
  }
  if (typeof WeakSet === 'function') {
    var obj = new WeakSet();
    obj.add({x: 1}, {y: 'string'}).add({y: 'string'}).add({z: [1, 2, 3]});
    assert.ok(ƒ.isWeakSet(obj), 'but a weakset is');
  }
});

QUnit.test('isFunction', function(assert) {
  assert.notOk(ƒ.isFunction(void 0), 'undefined vars are not functions');
  assert.notOk(ƒ.isFunction([1, 2, 3]), 'arrays are not functions');
  assert.notOk(ƒ.isFunction('moe'), 'strings are not functions');
  assert.ok(ƒ.isFunction(ƒ.isFunction), 'but functions are');
  assert.ok(ƒ.isFunction(function(){}), 'even anonymous ones');

  if (testElement) {
    assert.notOk(ƒ.isFunction(testElement), 'elements are not functions');
  }

  var nodelist = typeof document != 'undefined' && document.childNodes;
  if (nodelist) {
    assert.notOk(ƒ.isFunction(nodelist));
  }
});

if (typeof Int8Array !== 'undefined') {
  QUnit.test('#1929 Typed Array constructors are functions', function(assert) {
    ƒ.chain(['Float32Array', 'Float64Array', 'Int8Array', 'Int16Array', 'Int32Array', 'Uint8Array', 'Uint8ClampedArray', 'Uint16Array', 'Uint32Array'])
    .map(ƒ.propertyOf(typeof GLOBAL != 'undefined' ? GLOBAL : window))
    .compact()
    .each(function(TypedArray) {
      // PhantomJS reports `typeof UInt8Array == 'object'` and doesn't report toString TypeArray
      // as a function
      assert.strictEqual(ƒ.isFunction(TypedArray), Object.prototype.toString.call(TypedArray) === '[object Function]');
    });
  });
}

QUnit.test('isDate', function(assert) {
  assert.notOk(ƒ.isDate(100), 'numbers are not dates');
  assert.notOk(ƒ.isDate({}), 'objects are not dates');
  assert.ok(ƒ.isDate(new Date()), 'but dates are');
});

QUnit.test('isRegExp', function(assert) {
  assert.notOk(ƒ.isRegExp(ƒ.identity), 'functions are not RegExps');
  assert.ok(ƒ.isRegExp(/identity/), 'but RegExps are');
});

QUnit.test('isFinite', function(assert) {
  assert.notOk(ƒ.isFinite(void 0), 'undefined is not finite');
  assert.notOk(ƒ.isFinite(null), 'null is not finite');
  assert.notOk(ƒ.isFinite(NaN), 'NaN is not finite');
  assert.notOk(ƒ.isFinite(Infinity), 'Infinity is not finite');
  assert.notOk(ƒ.isFinite(-Infinity), '-Infinity is not finite');
  assert.ok(ƒ.isFinite('12'), 'Numeric strings are numbers');
  assert.notOk(ƒ.isFinite('1a'), 'Non numeric strings are not numbers');
  assert.notOk(ƒ.isFinite(''), 'Empty strings are not numbers');
  var obj = new Number(5);
  assert.ok(ƒ.isFinite(obj), 'Number instances can be finite');
  assert.ok(ƒ.isFinite(0), '0 is finite');
  assert.ok(ƒ.isFinite(123), 'Ints are finite');
  assert.ok(ƒ.isFinite(-12.44), 'Floats are finite');
  if (typeof Symbol === 'function') {
    assert.notOk(ƒ.isFinite(Symbol()), 'symbols are not numbers');
    assert.notOk(ƒ.isFinite(Symbol('description')), 'described symbols are not numbers');
    assert.notOk(ƒ.isFinite(Object(Symbol())), 'boxed symbols are not numbers');
  }
});

QUnit.test('isNaN', function(assert) {
  assert.notOk(ƒ.isNaN(void 0), 'undefined is not NaN');
  assert.notOk(ƒ.isNaN(null), 'null is not NaN');
  assert.notOk(ƒ.isNaN(0), '0 is not NaN');
  assert.notOk(ƒ.isNaN(new Number(0)), 'wrapped 0 is not NaN');
  assert.ok(ƒ.isNaN(NaN), 'but NaN is');
  assert.ok(ƒ.isNaN(new Number(NaN)), 'wrapped NaN is still NaN');
  if (typeof Symbol !== 'undefined'){
    assert.notOk(ƒ.isNaN(Symbol()), 'symbol is not NaN');
  }
});

QUnit.test('isNull', function(assert) {
  assert.notOk(ƒ.isNull(void 0), 'undefined is not null');
  assert.notOk(ƒ.isNull(NaN), 'NaN is not null');
  assert.ok(ƒ.isNull(null), 'but null is');
});

QUnit.test('isUndefined', function(assert) {
  assert.notOk(ƒ.isUndefined(1), 'numbers are defined');
  assert.notOk(ƒ.isUndefined(null), 'null is defined');
  assert.notOk(ƒ.isUndefined(false), 'false is defined');
  assert.notOk(ƒ.isUndefined(NaN), 'NaN is defined');
  assert.ok(ƒ.isUndefined(), 'nothing is undefined');
  assert.ok(ƒ.isUndefined(void 0), 'undefined is undefined');
});

QUnit.test('isError', function(assert) {
  assert.notOk(ƒ.isError(1), 'numbers are not Errors');
  assert.notOk(ƒ.isError(null), 'null is not an Error');
  assert.notOk(ƒ.isError(Error), 'functions are not Errors');
  assert.ok(ƒ.isError(new Error()), 'Errors are Errors');
  assert.ok(ƒ.isError(new EvalError()), 'EvalErrors are Errors');
  assert.ok(ƒ.isError(new RangeError()), 'RangeErrors are Errors');
  assert.ok(ƒ.isError(new ReferenceError()), 'ReferenceErrors are Errors');
  assert.ok(ƒ.isError(new SyntaxError()), 'SyntaxErrors are Errors');
  assert.ok(ƒ.isError(new TypeError()), 'TypeErrors are Errors');
  assert.ok(ƒ.isError(new URIError()), 'URIErrors are Errors');
});

QUnit.test('tap', function(assert) {
  var intercepted = null;
  var interceptor = function(obj) { intercepted = obj; };
  var returned = ƒ.tap(1, interceptor);
  assert.strictEqual(intercepted, 1, 'passes tapped object to interceptor');
  assert.strictEqual(returned, 1, 'returns tapped object');

  returned = ƒ([1, 2, 3]).chain().
    map(function(n){ return n * 2; }).
    max().
    tap(interceptor).
    value();
  assert.strictEqual(returned, 6, 'can use tapped objects in a chain');
  assert.strictEqual(intercepted, returned, 'can use tapped objects in a chain');
});

QUnit.test('has', function(assert) {
  var obj = {foo: 'bar', func: function(){}};
  assert.ok(ƒ.has(obj, 'foo'), 'checks that the object has a property.');
  assert.notOk(ƒ.has(obj, 'baz'), "returns false if the object doesn't have the property.");
  assert.ok(ƒ.has(obj, 'func'), 'works for functions too.');
  obj.hasOwnProperty = null;
  assert.ok(ƒ.has(obj, 'foo'), 'works even when the hasOwnProperty method is deleted.');
  var child = {};
  child.prototype = obj;
  assert.notOk(ƒ.has(child, 'foo'), 'does not check the prototype chain for a property.');
  assert.strictEqual(ƒ.has(null, 'foo'), false, 'returns false for null');
  assert.strictEqual(ƒ.has(void 0, 'foo'), false, 'returns false for undefined');

  assert.ok(ƒ.has({a: {b: 'foo'}}, ['a', 'b']), 'can check for nested properties.');
  assert.notOk(ƒ.has({a: child}, ['a', 'foo']), 'does not check the prototype of nested props.');
});

QUnit.test('property', function(assert) {
  var stooge = {name: 'moe'};
  assert.strictEqual(ƒ.property('name')(stooge), 'moe', 'should return the property with the given name');
  assert.strictEqual(ƒ.property('name')(null), void 0, 'should return undefined for null values');
  assert.strictEqual(ƒ.property('name')(void 0), void 0, 'should return undefined for undefined values');
  assert.strictEqual(ƒ.property(null)('foo'), void 0, 'should return undefined for null object');
  assert.strictEqual(ƒ.property('x')({x: null}), null, 'can fetch null values');
  assert.strictEqual(ƒ.property('length')(null), void 0, 'does not crash on property access of non-objects');

  // Deep property access
  assert.strictEqual(ƒ.property('a')({a: 1}), 1, 'can get a direct property');
  assert.strictEqual(ƒ.property(['a', 'b'])({a: {b: 2}}), 2, 'can get a nested property');
  assert.strictEqual(ƒ.property(['a'])({a: false}), false, 'can fetch falsy values');
  assert.strictEqual(ƒ.property(['x', 'y'])({x: {y: null}}), null, 'can fetch null values deeply');
  assert.strictEqual(ƒ.property(['x', 'y'])({x: null}), void 0, 'does not crash on property access of nested non-objects');
  assert.strictEqual(ƒ.property([])({x: 'y'}), void 0, 'returns `undefined` for a path that is an empty array');
});

QUnit.test('propertyOf', function(assert) {
  var stoogeRanks = ƒ.propertyOf({curly: 2, moe: 1, larry: 3});
  assert.strictEqual(stoogeRanks('curly'), 2, 'should return the property with the given name');
  assert.strictEqual(stoogeRanks(null), void 0, 'should return undefined for null values');
  assert.strictEqual(stoogeRanks(void 0), void 0, 'should return undefined for undefined values');
  assert.strictEqual(ƒ.propertyOf({a: null})('a'), null, 'can fetch null values');

  function MoreStooges() { this.shemp = 87; }
  MoreStooges.prototype = {curly: 2, moe: 1, larry: 3};
  var moreStoogeRanks = ƒ.propertyOf(new MoreStooges());
  assert.strictEqual(moreStoogeRanks('curly'), 2, 'should return properties from further up the prototype chain');

  var nullPropertyOf = ƒ.propertyOf(null);
  assert.strictEqual(nullPropertyOf('curly'), void 0, 'should return undefined when obj is null');

  var undefPropertyOf = ƒ.propertyOf(void 0);
  assert.strictEqual(undefPropertyOf('curly'), void 0, 'should return undefined when obj is undefined');

  var deepPropertyOf = ƒ.propertyOf({curly: {number: 2}, joe: {number: null}});
  assert.strictEqual(deepPropertyOf(['curly', 'number']), 2, 'can fetch nested properties of obj');
  assert.strictEqual(deepPropertyOf(['joe', 'number']), null, 'can fetch nested null properties of obj');
});

QUnit.test('isMatch', function(assert) {
  var moe = {name: 'Moe Howard', hair: true};
  var curly = {name: 'Curly Howard', hair: false};

  assert.strictEqual(ƒ.isMatch(moe, {hair: true}), true, 'Returns a boolean');
  assert.strictEqual(ƒ.isMatch(curly, {hair: true}), false, 'Returns a boolean');

  assert.strictEqual(ƒ.isMatch(5, {ƒƒxƒƒ: void 0}), false, 'can match undefined props on primitives');
  assert.strictEqual(ƒ.isMatch({ƒƒxƒƒ: void 0}, {ƒƒxƒƒ: void 0}), true, 'can match undefined props');

  assert.strictEqual(ƒ.isMatch(null, {}), true, 'Empty spec called with null object returns true');
  assert.strictEqual(ƒ.isMatch(null, {a: 1}), false, 'Non-empty spec called with null object returns false');

  ƒ.each([null, void 0], function(item) { assert.strictEqual(ƒ.isMatch(item, null), true, 'null matches null'); });
  ƒ.each([null, void 0], function(item) { assert.strictEqual(ƒ.isMatch(item, null), true, 'null matches {}'); });
  assert.strictEqual(ƒ.isMatch({b: 1}, {a: void 0}), false, 'handles undefined values (1683)');

  ƒ.each([true, 5, NaN, null, void 0], function(item) {
    assert.strictEqual(ƒ.isMatch({a: 1}, item), true, 'treats primitives as empty');
  });

  function Prototest() {}
  Prototest.prototype.x = 1;
  var specObj = new Prototest;
  assert.strictEqual(ƒ.isMatch({x: 2}, specObj), true, 'spec is restricted to own properties');

  specObj.y = 5;
  assert.strictEqual(ƒ.isMatch({x: 1, y: 5}, specObj), true);
  assert.strictEqual(ƒ.isMatch({x: 1, y: 4}, specObj), false);

  assert.ok(ƒ.isMatch(specObj, {x: 1, y: 5}), 'inherited and own properties are checked on the test object');

  Prototest.x = 5;
  assert.ok(ƒ.isMatch({x: 5, y: 1}, Prototest), 'spec can be a function');

  //null edge cases
  var oCon = {constructor: Object};
  assert.deepEqual(ƒ.map([null, void 0, 5, {}], ƒ.partial(ƒ.isMatch, ƒ, oCon)), [false, false, false, true], 'doesnt falsy match constructor on undefined/null');
});

QUnit.test('matcher', function(assert) {
  var moe = {name: 'Moe Howard', hair: true};
  var curly = {name: 'Curly Howard', hair: false};
  var stooges = [moe, curly];

  assert.strictEqual(ƒ.matcher({hair: true})(moe), true, 'Returns a boolean');
  assert.strictEqual(ƒ.matcher({hair: true})(curly), false, 'Returns a boolean');

  assert.strictEqual(ƒ.matcher({ƒƒxƒƒ: void 0})(5), false, 'can match undefined props on primitives');
  assert.strictEqual(ƒ.matcher({ƒƒxƒƒ: void 0})({ƒƒxƒƒ: void 0}), true, 'can match undefined props');

  assert.strictEqual(ƒ.matcher({})(null), true, 'Empty spec called with null object returns true');
  assert.strictEqual(ƒ.matcher({a: 1})(null), false, 'Non-empty spec called with null object returns false');

  assert.strictEqual(ƒ.find(stooges, ƒ.matcher({hair: false})), curly, 'returns a predicate that can be used by finding functions.');
  assert.strictEqual(ƒ.find(stooges, ƒ.matcher(moe)), moe, 'can be used to locate an object exists in a collection.');
  assert.deepEqual(ƒ.filter([null, void 0], ƒ.matcher({a: 1})), [], 'Do not throw on null values.');

  assert.deepEqual(ƒ.filter([null, void 0], ƒ.matcher(null)), [null, void 0], 'null matches null');
  assert.deepEqual(ƒ.filter([null, void 0], ƒ.matcher({})), [null, void 0], 'null matches {}');
  assert.deepEqual(ƒ.filter([{b: 1}], ƒ.matcher({a: void 0})), [], 'handles undefined values (1683)');

  ƒ.each([true, 5, NaN, null, void 0], function(item) {
    assert.strictEqual(ƒ.matcher(item)({a: 1}), true, 'treats primitives as empty');
  });

  function Prototest() {}
  Prototest.prototype.x = 1;
  var specObj = new Prototest;
  var protospec = ƒ.matcher(specObj);
  assert.strictEqual(protospec({x: 2}), true, 'spec is restricted to own properties');

  specObj.y = 5;
  protospec = ƒ.matcher(specObj);
  assert.strictEqual(protospec({x: 1, y: 5}), true);
  assert.strictEqual(protospec({x: 1, y: 4}), false);

  assert.ok(ƒ.matcher({x: 1, y: 5})(specObj), 'inherited and own properties are checked on the test object');

  Prototest.x = 5;
  assert.ok(ƒ.matcher(Prototest)({x: 5, y: 1}), 'spec can be a function');

  // #1729
  var o = {b: 1};
  var m = ƒ.matcher(o);

  assert.strictEqual(m({b: 1}), true);
  o.b = 2;
  o.a = 1;
  assert.strictEqual(m({b: 1}), true, 'changing spec object doesnt change matches result');


  //null edge cases
  var oCon = ƒ.matcher({constructor: Object});
  assert.deepEqual(ƒ.map([null, void 0, 5, {}], oCon), [false, false, false, true], 'doesnt falsy match constructor on undefined/null');
});

QUnit.test('matches', function(assert) {
  assert.strictEqual(ƒ.matches, ƒ.matcher, 'is an alias for matcher');
});

QUnit.test('findKey', function(assert) {
  var objects = {
    a: {a: 0, b: 0},
    b: {a: 1, b: 1},
    c: {a: 2, b: 2}
  };

  assert.strictEqual(ƒ.findKey(objects, function(obj) {
    return obj.a === 0;
  }), 'a');

  assert.strictEqual(ƒ.findKey(objects, function(obj) {
    return obj.b * obj.a === 4;
  }), 'c');

  assert.strictEqual(ƒ.findKey(objects, 'a'), 'b', 'Uses lookupIterator');

  assert.strictEqual(ƒ.findKey(objects, function(obj) {
    return obj.b * obj.a === 5;
  }), void 0);

  assert.strictEqual(ƒ.findKey([1, 2, 3, 4, 5, 6], function(obj) {
    return obj === 3;
  }), '2', 'Keys are strings');

  assert.strictEqual(ƒ.findKey(objects, function(a) {
    return a.foo === null;
  }), void 0);

  ƒ.findKey({a: {a: 1}}, function(a, key, obj) {
    assert.strictEqual(key, 'a');
    assert.deepEqual(obj, {a: {a: 1}});
    assert.strictEqual(this, objects, 'called with context');
  }, objects);

  var array = [1, 2, 3, 4];
  array.match = 55;
  assert.strictEqual(ƒ.findKey(array, function(x) { return x === 55; }), 'match', 'matches array-likes keys');
});


QUnit.test('mapObject', function(assert) {
  var obj = {a: 1, b: 2};
  var objects = {
    a: {a: 0, b: 0},
    b: {a: 1, b: 1},
    c: {a: 2, b: 2}
  };

  assert.deepEqual(ƒ.mapObject(obj, function(val) {
    return val * 2;
  }), {a: 2, b: 4}, 'simple objects');

  assert.deepEqual(ƒ.mapObject(objects, function(val) {
    return ƒ.reduce(val, function(memo, v){
      return memo + v;
    }, 0);
  }), {a: 0, b: 2, c: 4}, 'nested objects');

  assert.deepEqual(ƒ.mapObject(obj, function(val, key, o) {
    return o[key] * 2;
  }), {a: 2, b: 4}, 'correct keys');

  assert.deepEqual(ƒ.mapObject([1, 2], function(val) {
    return val * 2;
  }), {0: 2, 1: 4}, 'check behavior for arrays');

  assert.deepEqual(ƒ.mapObject(obj, function(val) {
    return val * this.multiplier;
  }, {multiplier: 3}), {a: 3, b: 6}, 'keep context');

  assert.deepEqual(ƒ.mapObject({a: 1}, function() {
    return this.length;
  }, [1, 2]), {a: 2}, 'called with context');

  var ids = ƒ.mapObject({length: 2, 0: {id: '1'}, 1: {id: '2'}}, function(n){
    return n.id;
  });
  assert.deepEqual(ids, {length: void 0, 0: '1', 1: '2'}, 'Check with array-like objects');

  // Passing a property name like ƒ.pluck.
  var people = {a: {name: 'moe', age: 30}, b: {name: 'curly', age: 50}};
  assert.deepEqual(ƒ.mapObject(people, 'name'), {a: 'moe', b: 'curly'}, 'predicate string map to object properties');

  ƒ.each([null, void 0, 1, 'abc', [], {}, void 0], function(val){
    assert.deepEqual(ƒ.mapObject(val, ƒ.identity), {}, 'mapValue identity');
  });

  var Proto = function(){ this.a = 1; };
  Proto.prototype.b = 1;
  var protoObj = new Proto();
  assert.deepEqual(ƒ.mapObject(protoObj, ƒ.identity), {a: 1}, 'ignore inherited values from prototypes');

});