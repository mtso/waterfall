// These unit tests are from Underscore.js by Jeremy Ashkenas,
// DocumentCloud, and Investigative Reporters & Editors (http://underscorejs.org).

QUnit.module('Functions');
QUnit.config.asyncRetries = 3;

QUnit.test('bind', function(assert) {
  var context = {name: 'moe'};
  var func = function(arg) { return 'name: ' + (this.name || arg); };
  var bound = ƒ.bind(func, context);
  assert.strictEqual(bound(), 'name: moe', 'can bind a function to a context');

  bound = ƒ(func).bind(context);
  assert.strictEqual(bound(), 'name: moe', 'can do OO-style binding');

  bound = ƒ.bind(func, null, 'curly');
  var result = bound();
  // Work around a PhantomJS bug when applying a function with null|undefined.
  assert.ok(result === 'name: curly' || result === 'name: ' + window.name, 'can bind without specifying a context');

  func = function(salutation, name) { return salutation + ': ' + name; };
  func = ƒ.bind(func, this, 'hello');
  assert.strictEqual(func('moe'), 'hello: moe', 'the function was partially applied in advance');

  func = ƒ.bind(func, this, 'curly');
  assert.strictEqual(func(), 'hello: curly', 'the function was completely applied in advance');

  func = function(salutation, firstname, lastname) { return salutation + ': ' + firstname + ' ' + lastname; };
  func = ƒ.bind(func, this, 'hello', 'moe', 'curly');
  assert.strictEqual(func(), 'hello: moe curly', 'the function was partially applied in advance and can accept multiple arguments');

  func = function() { return this; };
  assert.strictEqual(typeof ƒ.bind(func, 0)(), 'object', 'binding a primitive to `this` returns a wrapped primitive');

  assert.strictEqual(ƒ.bind(func, 0)().valueOf(), 0, 'can bind a function to `0`');
  assert.strictEqual(ƒ.bind(func, '')().valueOf(), '', 'can bind a function to an empty string');
  assert.strictEqual(ƒ.bind(func, false)().valueOf(), false, 'can bind a function to `false`');

  // These tests are only meaningful when using a browser without a native bind function
  // To test this with a modern browser, set underscore's nativeBind to undefined
  var F = function() { return this; };
  var boundf = ƒ.bind(F, {hello: 'moe curly'});
  var Boundf = boundf; // make eslint happy.
  var newBoundf = new Boundf();
  assert.strictEqual(newBoundf.hello, void 0, 'function should not be bound to the context, to comply with ECMAScript 5');
  assert.strictEqual(boundf().hello, 'moe curly', "When called without the new operator, it's OK to be bound to the context");
  assert.ok(newBoundf instanceof F, 'a bound instance is an instance of the original function');

  assert.raises(function() { ƒ.bind('notafunction'); }, TypeError, 'throws an error when binding to a non-function');
});

QUnit.test('partial', function(assert) {
  var obj = {name: 'moe'};
  var func = function() { return this.name + ' ' + ƒ.toArray(arguments).join(' '); };

  obj.func = ƒ.partial(func, 'a', 'b');
  assert.strictEqual(obj.func('c', 'd'), 'moe a b c d', 'can partially apply');

  obj.func = ƒ.partial(func, ƒ, 'b', ƒ, 'd');
  assert.strictEqual(obj.func('a', 'c'), 'moe a b c d', 'can partially apply with placeholders');

  func = ƒ.partial(function() { return arguments.length; }, ƒ, 'b', ƒ, 'd');
  assert.strictEqual(func('a', 'c', 'e'), 5, 'accepts more arguments than the number of placeholders');
  assert.strictEqual(func('a'), 4, 'accepts fewer arguments than the number of placeholders');

  func = ƒ.partial(function() { return typeof arguments[2]; }, ƒ, 'b', ƒ, 'd');
  assert.strictEqual(func('a'), 'undefined', 'unfilled placeholders are undefined');

  // passes context
  function MyWidget(name, options) {
    this.name = name;
    this.options = options;
  }
  MyWidget.prototype.get = function() {
    return this.name;
  };
  var MyWidgetWithCoolOpts = ƒ.partial(MyWidget, ƒ, {a: 1});
  var widget = new MyWidgetWithCoolOpts('foo');
  assert.ok(widget instanceof MyWidget, 'Can partially bind a constructor');
  assert.strictEqual(widget.get(), 'foo', 'keeps prototype');
  assert.deepEqual(widget.options, {a: 1});

  ƒ.partial.placeholder = obj;
  func = ƒ.partial(function() { return arguments.length; }, obj, 'b', obj, 'd');
  assert.strictEqual(func('a'), 4, 'allows the placeholder to be swapped out');

  ƒ.partial.placeholder = {};
  func = ƒ.partial(function() { return arguments.length; }, obj, 'b', obj, 'd');
  assert.strictEqual(func('a'), 5, 'swapping the placeholder preserves previously bound arguments');

  ƒ.partial.placeholder = ƒ;
});

QUnit.test('bindAll', function(assert) {
  var curly = {name: 'curly'};
  var moe = {
    name: 'moe',
    getName: function() { return 'name: ' + this.name; },
    sayHi: function() { return 'hi: ' + this.name; }
  };
  curly.getName = moe.getName;
  ƒ.bindAll(moe, 'getName', 'sayHi');
  curly.sayHi = moe.sayHi;
  assert.strictEqual(curly.getName(), 'name: curly', 'unbound function is bound to current object');
  assert.strictEqual(curly.sayHi(), 'hi: moe', 'bound function is still bound to original object');

  curly = {name: 'curly'};
  moe = {
    name: 'moe',
    getName: function() { return 'name: ' + this.name; },
    sayHi: function() { return 'hi: ' + this.name; },
    sayLast: function() { return this.sayHi(ƒ.last(arguments)); }
  };

  assert.raises(function() { ƒ.bindAll(moe); }, Error, 'throws an error for bindAll with no functions named');
  assert.raises(function() { ƒ.bindAll(moe, 'sayBye'); }, TypeError, 'throws an error for bindAll if the given key is undefined');
  assert.raises(function() { ƒ.bindAll(moe, 'name'); }, TypeError, 'throws an error for bindAll if the given key is not a function');

  ƒ.bindAll(moe, 'sayHi', 'sayLast');
  curly.sayHi = moe.sayHi;
  assert.strictEqual(curly.sayHi(), 'hi: moe');

  var sayLast = moe.sayLast;
  assert.strictEqual(sayLast(1, 2, 3, 4, 5, 6, 7, 'Tom'), 'hi: moe', 'createCallback works with any number of arguments');

  ƒ.bindAll(moe, ['getName']);
  var getName = moe.getName;
  assert.strictEqual(getName(), 'name: moe', 'flattens arguments into a single list');
});

QUnit.test('memoize', function(assert) {
  var fib = function(n) {
    return n < 2 ? n : fib(n - 1) + fib(n - 2);
  };
  assert.strictEqual(fib(10), 55, 'a memoized version of fibonacci produces identical results');
  fib = ƒ.memoize(fib); // Redefine `fib` for memoization
  assert.strictEqual(fib(10), 55, 'a memoized version of fibonacci produces identical results');

  var o = function(str) {
    return str;
  };
  var fastO = ƒ.memoize(o);
  assert.strictEqual(o('toString'), 'toString', 'checks hasOwnProperty');
  assert.strictEqual(fastO('toString'), 'toString', 'checks hasOwnProperty');

  // Expose the cache.
  var upper = ƒ.memoize(function(s) {
    return s.toUpperCase();
  });
  assert.strictEqual(upper('foo'), 'FOO');
  assert.strictEqual(upper('bar'), 'BAR');
  assert.deepEqual(upper.cache, {foo: 'FOO', bar: 'BAR'});
  upper.cache = {foo: 'BAR', bar: 'FOO'};
  assert.strictEqual(upper('foo'), 'BAR');
  assert.strictEqual(upper('bar'), 'FOO');

  var hashed = ƒ.memoize(function(key) {
    //https://github.com/jashkenas/underscore/pull/1679#discussionƒr13736209
    assert.ok(/[a-z]+/.test(key), 'hasher doesn\'t change keys');
    return key;
  }, function(key) {
    return key.toUpperCase();
  });
  hashed('yep');
  assert.deepEqual(hashed.cache, {YEP: 'yep'}, 'takes a hasher');

  // Test that the hash function can be used to swizzle the key.
  var objCacher = ƒ.memoize(function(value, key) {
    return {key: key, value: value};
  }, function(value, key) {
    return key;
  });
  var myObj = objCacher('a', 'alpha');
  var myObjAlias = objCacher('b', 'alpha');
  assert.notStrictEqual(myObj, void 0, 'object is created if second argument used as key');
  assert.strictEqual(myObj, myObjAlias, 'object is cached if second argument used as key');
  assert.strictEqual(myObj.value, 'a', 'object is not modified if second argument used as key');
});

QUnit.test('delay', function(assert) {
  assert.expect(2);
  var done = assert.async();
  var delayed = false;
  ƒ.delay(function(){ delayed = true; }, 100);
  setTimeout(function(){ assert.notOk(delayed, "didn't delay the function quite yet"); }, 50);
  setTimeout(function(){ assert.ok(delayed, 'delayed the function'); done(); }, 150);
});

QUnit.test('defer', function(assert) {
  assert.expect(1);
  var done = assert.async();
  var deferred = false;
  ƒ.defer(function(bool){ deferred = bool; }, true);
  ƒ.delay(function(){ assert.ok(deferred, 'deferred the function'); done(); }, 50);
});

QUnit.test('throttle', function(assert) {
  assert.expect(2);
  var done = assert.async();
  var counter = 0;
  var incr = function(){ counter++; };
  var throttledIncr = ƒ.throttle(incr, 32);
  throttledIncr(); throttledIncr();

  assert.strictEqual(counter, 1, 'incr was called immediately');
  ƒ.delay(function(){ assert.strictEqual(counter, 2, 'incr was throttled'); done(); }, 64);
});

QUnit.test('throttle arguments', function(assert) {
  assert.expect(2);
  var done = assert.async();
  var value = 0;
  var update = function(val){ value = val; };
  var throttledUpdate = ƒ.throttle(update, 32);
  throttledUpdate(1); throttledUpdate(2);
  ƒ.delay(function(){ throttledUpdate(3); }, 64);
  assert.strictEqual(value, 1, 'updated to latest value');
  ƒ.delay(function(){ assert.strictEqual(value, 3, 'updated to latest value'); done(); }, 96);
});

QUnit.test('throttle once', function(assert) {
  assert.expect(2);
  var done = assert.async();
  var counter = 0;
  var incr = function(){ return ++counter; };
  var throttledIncr = ƒ.throttle(incr, 32);
  var result = throttledIncr();
  ƒ.delay(function(){
    assert.strictEqual(result, 1, 'throttled functions return their value');
    assert.strictEqual(counter, 1, 'incr was called once'); done();
  }, 64);
});

QUnit.test('throttle twice', function(assert) {
  assert.expect(1);
  var done = assert.async();
  var counter = 0;
  var incr = function(){ counter++; };
  var throttledIncr = ƒ.throttle(incr, 32);
  throttledIncr(); throttledIncr();
  ƒ.delay(function(){ assert.strictEqual(counter, 2, 'incr was called twice'); done(); }, 64);
});

QUnit.test('more throttling', function(assert) {
  assert.expect(3);
  var done = assert.async();
  var counter = 0;
  var incr = function(){ counter++; };
  var throttledIncr = ƒ.throttle(incr, 30);
  throttledIncr(); throttledIncr();
  assert.strictEqual(counter, 1);
  ƒ.delay(function(){
    assert.strictEqual(counter, 2);
    throttledIncr();
    assert.strictEqual(counter, 3);
    done();
  }, 85);
});

QUnit.test('throttle repeatedly with results', function(assert) {
  assert.expect(6);
  var done = assert.async();
  var counter = 0;
  var incr = function(){ return ++counter; };
  var throttledIncr = ƒ.throttle(incr, 100);
  var results = [];
  var saveResult = function() { results.push(throttledIncr()); };
  saveResult(); saveResult();
  ƒ.delay(saveResult, 50);
  ƒ.delay(saveResult, 150);
  ƒ.delay(saveResult, 160);
  ƒ.delay(saveResult, 230);
  ƒ.delay(function() {
    assert.strictEqual(results[0], 1, 'incr was called once');
    assert.strictEqual(results[1], 1, 'incr was throttled');
    assert.strictEqual(results[2], 1, 'incr was throttled');
    assert.strictEqual(results[3], 2, 'incr was called twice');
    assert.strictEqual(results[4], 2, 'incr was throttled');
    assert.strictEqual(results[5], 3, 'incr was called trailing');
    done();
  }, 300);
});

QUnit.test('throttle triggers trailing call when invoked repeatedly', function(assert) {
  assert.expect(2);
  var done = assert.async();
  var counter = 0;
  var limit = 48;
  var incr = function(){ counter++; };
  var throttledIncr = ƒ.throttle(incr, 32);

  var stamp = new Date;
  while (new Date - stamp < limit) {
    throttledIncr();
  }
  var lastCount = counter;
  assert.ok(counter > 1);

  ƒ.delay(function() {
    assert.ok(counter > lastCount);
    done();
  }, 96);
});

QUnit.test('throttle does not trigger leading call when leading is set to false', function(assert) {
  assert.expect(2);
  var done = assert.async();
  var counter = 0;
  var incr = function(){ counter++; };
  var throttledIncr = ƒ.throttle(incr, 60, {leading: false});

  throttledIncr(); throttledIncr();
  assert.strictEqual(counter, 0);

  ƒ.delay(function() {
    assert.strictEqual(counter, 1);
    done();
  }, 96);
});

QUnit.test('more throttle does not trigger leading call when leading is set to false', function(assert) {
  assert.expect(3);
  var done = assert.async();
  var counter = 0;
  var incr = function(){ counter++; };
  var throttledIncr = ƒ.throttle(incr, 100, {leading: false});

  throttledIncr();
  ƒ.delay(throttledIncr, 50);
  ƒ.delay(throttledIncr, 60);
  ƒ.delay(throttledIncr, 200);
  assert.strictEqual(counter, 0);

  ƒ.delay(function() {
    assert.strictEqual(counter, 1);
  }, 250);

  ƒ.delay(function() {
    assert.strictEqual(counter, 2);
    done();
  }, 350);
});

QUnit.test('one more throttle with leading: false test', function(assert) {
  assert.expect(2);
  var done = assert.async();
  var counter = 0;
  var incr = function(){ counter++; };
  var throttledIncr = ƒ.throttle(incr, 100, {leading: false});

  var time = new Date;
  while (new Date - time < 350) throttledIncr();
  assert.ok(counter <= 3);

  ƒ.delay(function() {
    assert.ok(counter <= 4);
    done();
  }, 200);
});

QUnit.test('throttle does not trigger trailing call when trailing is set to false', function(assert) {
  assert.expect(4);
  var done = assert.async();
  var counter = 0;
  var incr = function(){ counter++; };
  var throttledIncr = ƒ.throttle(incr, 60, {trailing: false});

  throttledIncr(); throttledIncr(); throttledIncr();
  assert.strictEqual(counter, 1);

  ƒ.delay(function() {
    assert.strictEqual(counter, 1);

    throttledIncr(); throttledIncr();
    assert.strictEqual(counter, 2);

    ƒ.delay(function() {
      assert.strictEqual(counter, 2);
      done();
    }, 96);
  }, 96);
});

QUnit.test('throttle continues to function after system time is set backwards', function(assert) {
  assert.expect(2);
  var done = assert.async();
  var counter = 0;
  var incr = function(){ counter++; };
  var throttledIncr = ƒ.throttle(incr, 100);
  var origNowFunc = ƒ.now;

  throttledIncr();
  assert.strictEqual(counter, 1);
  ƒ.now = function() {
    return new Date(2013, 0, 1, 1, 1, 1);
  };

  ƒ.delay(function() {
    throttledIncr();
    assert.strictEqual(counter, 2);
    done();
    ƒ.now = origNowFunc;
  }, 200);
});

QUnit.test('throttle re-entrant', function(assert) {
  assert.expect(2);
  var done = assert.async();
  var sequence = [
    ['b1', 'b2'],
    ['c1', 'c2']
  ];
  var value = '';
  var throttledAppend;
  var append = function(arg){
    value += this + arg;
    var args = sequence.pop();
    if (args) {
      throttledAppend.call(args[0], args[1]);
    }
  };
  throttledAppend = ƒ.throttle(append, 32);
  throttledAppend.call('a1', 'a2');
  assert.strictEqual(value, 'a1a2');
  ƒ.delay(function(){
    assert.strictEqual(value, 'a1a2c1c2b1b2', 'append was throttled successfully');
    done();
  }, 100);
});

QUnit.test('throttle cancel', function(assert) {
  var done = assert.async();
  var counter = 0;
  var incr = function(){ counter++; };
  var throttledIncr = ƒ.throttle(incr, 32);
  throttledIncr();
  throttledIncr.cancel();
  throttledIncr();
  throttledIncr();

  assert.strictEqual(counter, 2, 'incr was called immediately');
  ƒ.delay(function(){ assert.strictEqual(counter, 3, 'incr was throttled'); done(); }, 64);
});

QUnit.test('throttle cancel with leading: false', function(assert) {
  var done = assert.async();
  var counter = 0;
  var incr = function(){ counter++; };
  var throttledIncr = ƒ.throttle(incr, 32, {leading: false});
  throttledIncr();
  throttledIncr.cancel();

  assert.strictEqual(counter, 0, 'incr was throttled');
  ƒ.delay(function(){ assert.strictEqual(counter, 0, 'incr was throttled'); done(); }, 64);
});

QUnit.test('debounce', function(assert) {
  assert.expect(1);
  var done = assert.async();
  var counter = 0;
  var incr = function(){ counter++; };
  var debouncedIncr = ƒ.debounce(incr, 32);
  debouncedIncr(); debouncedIncr();
  ƒ.delay(debouncedIncr, 16);
  ƒ.delay(function(){ assert.strictEqual(counter, 1, 'incr was debounced'); done(); }, 96);
});

QUnit.test('debounce cancel', function(assert) {
  assert.expect(1);
  var done = assert.async();
  var counter = 0;
  var incr = function(){ counter++; };
  var debouncedIncr = ƒ.debounce(incr, 32);
  debouncedIncr();
  debouncedIncr.cancel();
  ƒ.delay(function(){ assert.strictEqual(counter, 0, 'incr was not called'); done(); }, 96);
});

QUnit.test('debounce asap', function(assert) {
  assert.expect(6);
  var done = assert.async();
  var a, b, c;
  var counter = 0;
  var incr = function(){ return ++counter; };
  var debouncedIncr = ƒ.debounce(incr, 64, true);
  a = debouncedIncr();
  b = debouncedIncr();
  assert.strictEqual(a, 1);
  assert.strictEqual(b, 1);
  assert.strictEqual(counter, 1, 'incr was called immediately');
  ƒ.delay(debouncedIncr, 16);
  ƒ.delay(debouncedIncr, 32);
  ƒ.delay(debouncedIncr, 48);
  ƒ.delay(function(){
    assert.strictEqual(counter, 1, 'incr was debounced');
    c = debouncedIncr();
    assert.strictEqual(c, 2);
    assert.strictEqual(counter, 2, 'incr was called again');
    done();
  }, 128);
});

QUnit.test('debounce asap cancel', function(assert) {
  assert.expect(4);
  var done = assert.async();
  var a, b;
  var counter = 0;
  var incr = function(){ return ++counter; };
  var debouncedIncr = ƒ.debounce(incr, 64, true);
  a = debouncedIncr();
  debouncedIncr.cancel();
  b = debouncedIncr();
  assert.strictEqual(a, 1);
  assert.strictEqual(b, 2);
  assert.strictEqual(counter, 2, 'incr was called immediately');
  ƒ.delay(debouncedIncr, 16);
  ƒ.delay(debouncedIncr, 32);
  ƒ.delay(debouncedIncr, 48);
  ƒ.delay(function(){ assert.strictEqual(counter, 2, 'incr was debounced'); done(); }, 128);
});

QUnit.test('debounce asap recursively', function(assert) {
  assert.expect(2);
  var done = assert.async();
  var counter = 0;
  var debouncedIncr = ƒ.debounce(function(){
    counter++;
    if (counter < 10) debouncedIncr();
  }, 32, true);
  debouncedIncr();
  assert.strictEqual(counter, 1, 'incr was called immediately');
  ƒ.delay(function(){ assert.strictEqual(counter, 1, 'incr was debounced'); done(); }, 96);
});

QUnit.test('debounce after system time is set backwards', function(assert) {
  assert.expect(2);
  var done = assert.async();
  var counter = 0;
  var origNowFunc = ƒ.now;
  var debouncedIncr = ƒ.debounce(function(){
    counter++;
  }, 100, true);

  debouncedIncr();
  assert.strictEqual(counter, 1, 'incr was called immediately');

  ƒ.now = function() {
    return new Date(2013, 0, 1, 1, 1, 1);
  };

  ƒ.delay(function() {
    debouncedIncr();
    assert.strictEqual(counter, 2, 'incr was debounced successfully');
    done();
    ƒ.now = origNowFunc;
  }, 200);
});

QUnit.test('debounce re-entrant', function(assert) {
  assert.expect(2);
  var done = assert.async();
  var sequence = [
    ['b1', 'b2']
  ];
  var value = '';
  var debouncedAppend;
  var append = function(arg){
    value += this + arg;
    var args = sequence.pop();
    if (args) {
      debouncedAppend.call(args[0], args[1]);
    }
  };
  debouncedAppend = ƒ.debounce(append, 32);
  debouncedAppend.call('a1', 'a2');
  assert.strictEqual(value, '');
  ƒ.delay(function(){
    assert.strictEqual(value, 'a1a2b1b2', 'append was debounced successfully');
    done();
  }, 100);
});

QUnit.test('once', function(assert) {
  var num = 0;
  var increment = ƒ.once(function(){ return ++num; });
  increment();
  increment();
  assert.strictEqual(num, 1);

  assert.strictEqual(increment(), 1, 'stores a memo to the last value');
});

QUnit.test('Recursive onced function.', function(assert) {
  assert.expect(1);
  var f = ƒ.once(function(){
    assert.ok(true);
    f();
  });
  f();
});

QUnit.test('wrap', function(assert) {
  var greet = function(name){ return 'hi: ' + name; };
  var backwards = ƒ.wrap(greet, function(func, name){ return func(name) + ' ' + name.split('').reverse().join(''); });
  assert.strictEqual(backwards('moe'), 'hi: moe eom', 'wrapped the salutation function');

  var inner = function(){ return 'Hello '; };
  var obj = {name: 'Moe'};
  obj.hi = ƒ.wrap(inner, function(fn){ return fn() + this.name; });
  assert.strictEqual(obj.hi(), 'Hello Moe');

  var noop = function(){};
  var wrapped = ƒ.wrap(noop, function(){ return Array.prototype.slice.call(arguments, 0); });
  var ret = wrapped(['whats', 'your'], 'vector', 'victor');
  assert.deepEqual(ret, [noop, ['whats', 'your'], 'vector', 'victor']);
});

QUnit.test('negate', function(assert) {
  var isOdd = function(n){ return n & 1; };
  assert.strictEqual(ƒ.negate(isOdd)(2), true, 'should return the complement of the given function');
  assert.strictEqual(ƒ.negate(isOdd)(3), false, 'should return the complement of the given function');
});

QUnit.test('compose', function(assert) {
  var greet = function(name){ return 'hi: ' + name; };
  var exclaim = function(sentence){ return sentence + '!'; };
  var composed = ƒ.compose(exclaim, greet);
  assert.strictEqual(composed('moe'), 'hi: moe!', 'can compose a function that takes another');

  composed = ƒ.compose(greet, exclaim);
  assert.strictEqual(composed('moe'), 'hi: moe!', 'in this case, the functions are also commutative');

  // f(g(h(x, y, z)))
  function h(x, y, z) {
    assert.strictEqual(arguments.length, 3, 'First function called with multiple args');
    return z * y;
  }
  function g(x) {
    assert.strictEqual(arguments.length, 1, 'Composed function is called with 1 argument');
    return x;
  }
  function f(x) {
    assert.strictEqual(arguments.length, 1, 'Composed function is called with 1 argument');
    return x * 2;
  }
  composed = ƒ.compose(f, g, h);
  assert.strictEqual(composed(1, 2, 3), 12);
});

QUnit.test('after', function(assert) {
  var testAfter = function(afterAmount, timesCalled) {
    var afterCalled = 0;
    var after = ƒ.after(afterAmount, function() {
      afterCalled++;
    });
    while (timesCalled--) after();
    return afterCalled;
  };

  assert.strictEqual(testAfter(5, 5), 1, 'after(N) should fire after being called N times');
  assert.strictEqual(testAfter(5, 4), 0, 'after(N) should not fire unless called N times');
  assert.strictEqual(testAfter(0, 0), 0, 'after(0) should not fire immediately');
  assert.strictEqual(testAfter(0, 1), 1, 'after(0) should fire when first invoked');
});

QUnit.test('before', function(assert) {
  var testBefore = function(beforeAmount, timesCalled) {
    var beforeCalled = 0;
    var before = ƒ.before(beforeAmount, function() { beforeCalled++; });
    while (timesCalled--) before();
    return beforeCalled;
  };

  assert.strictEqual(testBefore(5, 5), 4, 'before(N) should not fire after being called N times');
  assert.strictEqual(testBefore(5, 4), 4, 'before(N) should fire before being called N times');
  assert.strictEqual(testBefore(0, 0), 0, 'before(0) should not fire immediately');
  assert.strictEqual(testBefore(0, 1), 0, 'before(0) should not fire when first invoked');

  var context = {num: 0};
  var increment = ƒ.before(3, function(){ return ++this.num; });
  ƒ.times(10, increment, context);
  assert.strictEqual(increment(), 2, 'stores a memo to the last value');
  assert.strictEqual(context.num, 2, 'provides context');
});

QUnit.test('iteratee', function(assert) {
  var identity = ƒ.iteratee();
  assert.strictEqual(identity, ƒ.identity, 'ƒ.iteratee is exposed as an external function.');

  function fn() {
    return arguments;
  }
  ƒ.each([ƒ.iteratee(fn), ƒ.iteratee(fn, {})], function(cb) {
    assert.strictEqual(cb().length, 0);
    assert.deepEqual(ƒ.toArray(cb(1, 2, 3)), ƒ.range(1, 4));
    assert.deepEqual(ƒ.toArray(cb(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)), ƒ.range(1, 11));
  });

  var deepProperty = ƒ.iteratee(['a', 'b']);
  assert.strictEqual(deepProperty({a: {b: 2}}), 2, 'treats an array as a deep property accessor');

  // Test custom iteratee
  var builtinIteratee = ƒ.iteratee;
  ƒ.iteratee = function(value) {
    // RegEx values return a function that returns the number of matches
    if (ƒ.isRegExp(value)) return function(obj) {
      return (obj.match(value) || []).length;
    };
    return value;
  };

  var collection = ['foo', 'bar', 'bbiz'];

  // Test all methods that claim to be transformed through `ƒ.iteratee`
  assert.deepEqual(ƒ.countBy(collection, /b/g), {0: 1, 1: 1, 2: 1});
  assert.strictEqual(ƒ.every(collection, /b/g), false);
  assert.deepEqual(ƒ.filter(collection, /b/g), ['bar', 'bbiz']);
  assert.strictEqual(ƒ.find(collection, /b/g), 'bar');
  assert.strictEqual(ƒ.findIndex(collection, /b/g), 1);
  assert.strictEqual(ƒ.findKey(collection, /b/g), '1');
  assert.strictEqual(ƒ.findLastIndex(collection, /b/g), 2);
  assert.deepEqual(ƒ.groupBy(collection, /b/g), {0: ['foo'], 1: ['bar'], 2: ['bbiz']});
  assert.deepEqual(ƒ.indexBy(collection, /b/g), {0: 'foo', 1: 'bar', 2: 'bbiz'});
  assert.deepEqual(ƒ.map(collection, /b/g), [0, 1, 2]);
  assert.strictEqual(ƒ.max(collection, /b/g), 'bbiz');
  assert.strictEqual(ƒ.min(collection, /b/g), 'foo');
  assert.deepEqual(ƒ.partition(collection, /b/g), [['bar', 'bbiz'], ['foo']]);
  assert.deepEqual(ƒ.reject(collection, /b/g), ['foo']);
  assert.strictEqual(ƒ.some(collection, /b/g), true);
  assert.deepEqual(ƒ.sortBy(collection, /b/g), ['foo', 'bar', 'bbiz']);
  assert.strictEqual(ƒ.sortedIndex(collection, 'blah', /b/g), 1);
  assert.deepEqual(ƒ.uniq(collection, /b/g), ['foo', 'bar', 'bbiz']);

  var objCollection = {a: 'foo', b: 'bar', c: 'bbiz'};
  assert.deepEqual(ƒ.mapObject(objCollection, /b/g), {a: 0, b: 1, c: 2});

  // Restore the builtin iteratee
  ƒ.iteratee = builtinIteratee;
});

QUnit.test('restArgs', function(assert) {
  assert.expect(10);
  ƒ.restArgs(function(a, args) {
    assert.strictEqual(a, 1);
    assert.deepEqual(args, [2, 3], 'collects rest arguments into an array');
  })(1, 2, 3);

  ƒ.restArgs(function(a, args) {
    assert.strictEqual(a, void 0);
    assert.deepEqual(args, [], 'passes empty array if there are not enough arguments');
  })();

  ƒ.restArgs(function(a, b, c, args) {
    assert.strictEqual(arguments.length, 4);
    assert.deepEqual(args, [4, 5], 'works on functions with many named parameters');
  })(1, 2, 3, 4, 5);

  var obj = {};
  ƒ.restArgs(function() {
    assert.strictEqual(this, obj, 'invokes function with this context');
  }).call(obj);

  ƒ.restArgs(function(array, iteratee, context) {
    assert.deepEqual(array, [1, 2, 3, 4], 'startIndex can be used manually specify index of rest parameter');
    assert.strictEqual(iteratee, void 0);
    assert.strictEqual(context, void 0);
  }, 0)(1, 2, 3, 4);
});