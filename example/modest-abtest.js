(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ABTest = factory());
}(this, (function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];

    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;

        var F = function () {};

        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }

      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var normalCompletion = true,
        didErr = false,
        err;
    return {
      s: function () {
        it = it.call(o);
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }

  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
          v = c == 'x' ? r : r & 0x3 | 0x8;
      return v.toString(16);
    });
  }

  var BUCKET_NUM = 100;
  var ABTEST_UID_COOKIE_NAME = 'abtest-uid-';
  var ABTEST_TRACE_ID_COOKIE_NAME = 'abtest-trace-id-';
  var ABTEST_COOKIE_ALIVE_TIME = 60 * 60 * 24 * 365;

  function genModel(app_id, config) {
    if (!Array.isArray(config)) {
      throw new Error("config must be an array");
    }

    return createAppShuntModel(app_id, config);
  }

  function createAppShuntModel(app_id, config) {
    var shunt_model = {};
    shunt_model[app_id] = {
      launch_layer: {},
      layer: {}
    };

    var _iterator = _createForOfIteratorHelper(config),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var item = _step.value;
        var hit = item.hit,
            _item$layer_id = item.layer_id,
            layer_id = _item$layer_id === void 0 ? 'defaultLayerId' : _item$layer_id,
            _item$version = item.version,
            version = _item$version === void 0 ? '' : _item$version,
            exp_set = item.exp_set,
            ref_exp_data = item.ref_exp_data; // (100 - hit * 100) / 100 Avoid bugs caused by precision loss

        shunt_model[app_id].layer[layer_id] = {
          ref_exp: {
            data: ref_exp_data,
            bucket: getBucket(0, (100 - hit * 100) / 100 * BUCKET_NUM),
            version: version
          },
          exp_set: {}
        };
        var index = 0; // exp set model gen

        var _iterator2 = _createForOfIteratorHelper(exp_set),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var exp_item = _step2.value;
            var id = exp_item.id,
                data = exp_item.data,
                weight = exp_item.weight;
            var len = Math.round(weight * BUCKET_NUM);
            var bucket = getBucket(index, len);
            shunt_model[app_id].layer[layer_id].exp_set[id] = {
              data: data,
              bucket: bucket,
              version: version
            };
            index += len; // 100% exp upgrade to launch layer

            if (weight === 1) {
              shunt_model[app_id].launch_layer[layer_id] = {
                data: data,
                id: id,
                version: version
              };
            }
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    return shunt_model[app_id];
  }

  function getBucket() {
    var start = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var len = arguments.length > 1 ? arguments[1] : undefined;
    var arr = new Array(len),
        i = start,
        index = 0;

    while (len--) {
      arr[index] = i;
      i++;
      index++;
    }

    return arr;
  }

  var murmurHash3js = {exports: {}};

  /* jshint -W086: true */

  (function (module, exports) {

  (function (root, undefined$1) {

    var library = {
      'version': '3.0.1',
      'x86': {},
      'x64': {}
    }; // PRIVATE FUNCTIONS
    // -----------------

    function _x86Multiply(m, n) {
      //
      // Given two 32bit ints, returns the two multiplied together as a
      // 32bit int.
      //
      return (m & 0xffff) * n + (((m >>> 16) * n & 0xffff) << 16);
    }

    function _x86Rotl(m, n) {
      //
      // Given a 32bit int and an int representing a number of bit positions,
      // returns the 32bit int rotated left by that number of positions.
      //
      return m << n | m >>> 32 - n;
    }

    function _x86Fmix(h) {
      //
      // Given a block, returns murmurHash3's final x86 mix of that block.
      //
      h ^= h >>> 16;
      h = _x86Multiply(h, 0x85ebca6b);
      h ^= h >>> 13;
      h = _x86Multiply(h, 0xc2b2ae35);
      h ^= h >>> 16;
      return h;
    }

    function _x64Add(m, n) {
      //
      // Given two 64bit ints (as an array of two 32bit ints) returns the two
      // added together as a 64bit int (as an array of two 32bit ints).
      //
      m = [m[0] >>> 16, m[0] & 0xffff, m[1] >>> 16, m[1] & 0xffff];
      n = [n[0] >>> 16, n[0] & 0xffff, n[1] >>> 16, n[1] & 0xffff];
      var o = [0, 0, 0, 0];
      o[3] += m[3] + n[3];
      o[2] += o[3] >>> 16;
      o[3] &= 0xffff;
      o[2] += m[2] + n[2];
      o[1] += o[2] >>> 16;
      o[2] &= 0xffff;
      o[1] += m[1] + n[1];
      o[0] += o[1] >>> 16;
      o[1] &= 0xffff;
      o[0] += m[0] + n[0];
      o[0] &= 0xffff;
      return [o[0] << 16 | o[1], o[2] << 16 | o[3]];
    }

    function _x64Multiply(m, n) {
      //
      // Given two 64bit ints (as an array of two 32bit ints) returns the two
      // multiplied together as a 64bit int (as an array of two 32bit ints).
      //
      m = [m[0] >>> 16, m[0] & 0xffff, m[1] >>> 16, m[1] & 0xffff];
      n = [n[0] >>> 16, n[0] & 0xffff, n[1] >>> 16, n[1] & 0xffff];
      var o = [0, 0, 0, 0];
      o[3] += m[3] * n[3];
      o[2] += o[3] >>> 16;
      o[3] &= 0xffff;
      o[2] += m[2] * n[3];
      o[1] += o[2] >>> 16;
      o[2] &= 0xffff;
      o[2] += m[3] * n[2];
      o[1] += o[2] >>> 16;
      o[2] &= 0xffff;
      o[1] += m[1] * n[3];
      o[0] += o[1] >>> 16;
      o[1] &= 0xffff;
      o[1] += m[2] * n[2];
      o[0] += o[1] >>> 16;
      o[1] &= 0xffff;
      o[1] += m[3] * n[1];
      o[0] += o[1] >>> 16;
      o[1] &= 0xffff;
      o[0] += m[0] * n[3] + m[1] * n[2] + m[2] * n[1] + m[3] * n[0];
      o[0] &= 0xffff;
      return [o[0] << 16 | o[1], o[2] << 16 | o[3]];
    }

    function _x64Rotl(m, n) {
      //
      // Given a 64bit int (as an array of two 32bit ints) and an int
      // representing a number of bit positions, returns the 64bit int (as an
      // array of two 32bit ints) rotated left by that number of positions.
      //
      n %= 64;

      if (n === 32) {
        return [m[1], m[0]];
      } else if (n < 32) {
        return [m[0] << n | m[1] >>> 32 - n, m[1] << n | m[0] >>> 32 - n];
      } else {
        n -= 32;
        return [m[1] << n | m[0] >>> 32 - n, m[0] << n | m[1] >>> 32 - n];
      }
    }

    function _x64LeftShift(m, n) {
      //
      // Given a 64bit int (as an array of two 32bit ints) and an int
      // representing a number of bit positions, returns the 64bit int (as an
      // array of two 32bit ints) shifted left by that number of positions.
      //
      n %= 64;

      if (n === 0) {
        return m;
      } else if (n < 32) {
        return [m[0] << n | m[1] >>> 32 - n, m[1] << n];
      } else {
        return [m[1] << n - 32, 0];
      }
    }

    function _x64Xor(m, n) {
      //
      // Given two 64bit ints (as an array of two 32bit ints) returns the two
      // xored together as a 64bit int (as an array of two 32bit ints).
      //
      return [m[0] ^ n[0], m[1] ^ n[1]];
    }

    function _x64Fmix(h) {
      //
      // Given a block, returns murmurHash3's final x64 mix of that block.
      // (`[0, h[0] >>> 1]` is a 33 bit unsigned right shift. This is the
      // only place where we need to right shift 64bit ints.)
      //
      h = _x64Xor(h, [0, h[0] >>> 1]);
      h = _x64Multiply(h, [0xff51afd7, 0xed558ccd]);
      h = _x64Xor(h, [0, h[0] >>> 1]);
      h = _x64Multiply(h, [0xc4ceb9fe, 0x1a85ec53]);
      h = _x64Xor(h, [0, h[0] >>> 1]);
      return h;
    } // PUBLIC FUNCTIONS
    // ----------------


    library.x86.hash32 = function (key, seed) {
      //
      // Given a string and an optional seed as an int, returns a 32 bit hash
      // using the x86 flavor of MurmurHash3, as an unsigned int.
      //
      key = key || '';
      seed = seed || 0;
      var remainder = key.length % 4;
      var bytes = key.length - remainder;
      var h1 = seed;
      var k1 = 0;
      var c1 = 0xcc9e2d51;
      var c2 = 0x1b873593;

      for (var i = 0; i < bytes; i = i + 4) {
        k1 = key.charCodeAt(i) & 0xff | (key.charCodeAt(i + 1) & 0xff) << 8 | (key.charCodeAt(i + 2) & 0xff) << 16 | (key.charCodeAt(i + 3) & 0xff) << 24;
        k1 = _x86Multiply(k1, c1);
        k1 = _x86Rotl(k1, 15);
        k1 = _x86Multiply(k1, c2);
        h1 ^= k1;
        h1 = _x86Rotl(h1, 13);
        h1 = _x86Multiply(h1, 5) + 0xe6546b64;
      }

      k1 = 0;

      switch (remainder) {
        case 3:
          k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;

        case 2:
          k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;

        case 1:
          k1 ^= key.charCodeAt(i) & 0xff;
          k1 = _x86Multiply(k1, c1);
          k1 = _x86Rotl(k1, 15);
          k1 = _x86Multiply(k1, c2);
          h1 ^= k1;
      }

      h1 ^= key.length;
      h1 = _x86Fmix(h1);
      return h1 >>> 0;
    };

    library.x86.hash128 = function (key, seed) {
      //
      // Given a string and an optional seed as an int, returns a 128 bit
      // hash using the x86 flavor of MurmurHash3, as an unsigned hex.
      //
      key = key || '';
      seed = seed || 0;
      var remainder = key.length % 16;
      var bytes = key.length - remainder;
      var h1 = seed;
      var h2 = seed;
      var h3 = seed;
      var h4 = seed;
      var k1 = 0;
      var k2 = 0;
      var k3 = 0;
      var k4 = 0;
      var c1 = 0x239b961b;
      var c2 = 0xab0e9789;
      var c3 = 0x38b34ae5;
      var c4 = 0xa1e38b93;

      for (var i = 0; i < bytes; i = i + 16) {
        k1 = key.charCodeAt(i) & 0xff | (key.charCodeAt(i + 1) & 0xff) << 8 | (key.charCodeAt(i + 2) & 0xff) << 16 | (key.charCodeAt(i + 3) & 0xff) << 24;
        k2 = key.charCodeAt(i + 4) & 0xff | (key.charCodeAt(i + 5) & 0xff) << 8 | (key.charCodeAt(i + 6) & 0xff) << 16 | (key.charCodeAt(i + 7) & 0xff) << 24;
        k3 = key.charCodeAt(i + 8) & 0xff | (key.charCodeAt(i + 9) & 0xff) << 8 | (key.charCodeAt(i + 10) & 0xff) << 16 | (key.charCodeAt(i + 11) & 0xff) << 24;
        k4 = key.charCodeAt(i + 12) & 0xff | (key.charCodeAt(i + 13) & 0xff) << 8 | (key.charCodeAt(i + 14) & 0xff) << 16 | (key.charCodeAt(i + 15) & 0xff) << 24;
        k1 = _x86Multiply(k1, c1);
        k1 = _x86Rotl(k1, 15);
        k1 = _x86Multiply(k1, c2);
        h1 ^= k1;
        h1 = _x86Rotl(h1, 19);
        h1 += h2;
        h1 = _x86Multiply(h1, 5) + 0x561ccd1b;
        k2 = _x86Multiply(k2, c2);
        k2 = _x86Rotl(k2, 16);
        k2 = _x86Multiply(k2, c3);
        h2 ^= k2;
        h2 = _x86Rotl(h2, 17);
        h2 += h3;
        h2 = _x86Multiply(h2, 5) + 0x0bcaa747;
        k3 = _x86Multiply(k3, c3);
        k3 = _x86Rotl(k3, 17);
        k3 = _x86Multiply(k3, c4);
        h3 ^= k3;
        h3 = _x86Rotl(h3, 15);
        h3 += h4;
        h3 = _x86Multiply(h3, 5) + 0x96cd1c35;
        k4 = _x86Multiply(k4, c4);
        k4 = _x86Rotl(k4, 18);
        k4 = _x86Multiply(k4, c1);
        h4 ^= k4;
        h4 = _x86Rotl(h4, 13);
        h4 += h1;
        h4 = _x86Multiply(h4, 5) + 0x32ac3b17;
      }

      k1 = 0;
      k2 = 0;
      k3 = 0;
      k4 = 0;

      switch (remainder) {
        case 15:
          k4 ^= key.charCodeAt(i + 14) << 16;

        case 14:
          k4 ^= key.charCodeAt(i + 13) << 8;

        case 13:
          k4 ^= key.charCodeAt(i + 12);
          k4 = _x86Multiply(k4, c4);
          k4 = _x86Rotl(k4, 18);
          k4 = _x86Multiply(k4, c1);
          h4 ^= k4;

        case 12:
          k3 ^= key.charCodeAt(i + 11) << 24;

        case 11:
          k3 ^= key.charCodeAt(i + 10) << 16;

        case 10:
          k3 ^= key.charCodeAt(i + 9) << 8;

        case 9:
          k3 ^= key.charCodeAt(i + 8);
          k3 = _x86Multiply(k3, c3);
          k3 = _x86Rotl(k3, 17);
          k3 = _x86Multiply(k3, c4);
          h3 ^= k3;

        case 8:
          k2 ^= key.charCodeAt(i + 7) << 24;

        case 7:
          k2 ^= key.charCodeAt(i + 6) << 16;

        case 6:
          k2 ^= key.charCodeAt(i + 5) << 8;

        case 5:
          k2 ^= key.charCodeAt(i + 4);
          k2 = _x86Multiply(k2, c2);
          k2 = _x86Rotl(k2, 16);
          k2 = _x86Multiply(k2, c3);
          h2 ^= k2;

        case 4:
          k1 ^= key.charCodeAt(i + 3) << 24;

        case 3:
          k1 ^= key.charCodeAt(i + 2) << 16;

        case 2:
          k1 ^= key.charCodeAt(i + 1) << 8;

        case 1:
          k1 ^= key.charCodeAt(i);
          k1 = _x86Multiply(k1, c1);
          k1 = _x86Rotl(k1, 15);
          k1 = _x86Multiply(k1, c2);
          h1 ^= k1;
      }

      h1 ^= key.length;
      h2 ^= key.length;
      h3 ^= key.length;
      h4 ^= key.length;
      h1 += h2;
      h1 += h3;
      h1 += h4;
      h2 += h1;
      h3 += h1;
      h4 += h1;
      h1 = _x86Fmix(h1);
      h2 = _x86Fmix(h2);
      h3 = _x86Fmix(h3);
      h4 = _x86Fmix(h4);
      h1 += h2;
      h1 += h3;
      h1 += h4;
      h2 += h1;
      h3 += h1;
      h4 += h1;
      return ("00000000" + (h1 >>> 0).toString(16)).slice(-8) + ("00000000" + (h2 >>> 0).toString(16)).slice(-8) + ("00000000" + (h3 >>> 0).toString(16)).slice(-8) + ("00000000" + (h4 >>> 0).toString(16)).slice(-8);
    };

    library.x64.hash128 = function (key, seed) {
      //
      // Given a string and an optional seed as an int, returns a 128 bit
      // hash using the x64 flavor of MurmurHash3, as an unsigned hex.
      //
      key = key || '';
      seed = seed || 0;
      var remainder = key.length % 16;
      var bytes = key.length - remainder;
      var h1 = [0, seed];
      var h2 = [0, seed];
      var k1 = [0, 0];
      var k2 = [0, 0];
      var c1 = [0x87c37b91, 0x114253d5];
      var c2 = [0x4cf5ad43, 0x2745937f];

      for (var i = 0; i < bytes; i = i + 16) {
        k1 = [key.charCodeAt(i + 4) & 0xff | (key.charCodeAt(i + 5) & 0xff) << 8 | (key.charCodeAt(i + 6) & 0xff) << 16 | (key.charCodeAt(i + 7) & 0xff) << 24, key.charCodeAt(i) & 0xff | (key.charCodeAt(i + 1) & 0xff) << 8 | (key.charCodeAt(i + 2) & 0xff) << 16 | (key.charCodeAt(i + 3) & 0xff) << 24];
        k2 = [key.charCodeAt(i + 12) & 0xff | (key.charCodeAt(i + 13) & 0xff) << 8 | (key.charCodeAt(i + 14) & 0xff) << 16 | (key.charCodeAt(i + 15) & 0xff) << 24, key.charCodeAt(i + 8) & 0xff | (key.charCodeAt(i + 9) & 0xff) << 8 | (key.charCodeAt(i + 10) & 0xff) << 16 | (key.charCodeAt(i + 11) & 0xff) << 24];
        k1 = _x64Multiply(k1, c1);
        k1 = _x64Rotl(k1, 31);
        k1 = _x64Multiply(k1, c2);
        h1 = _x64Xor(h1, k1);
        h1 = _x64Rotl(h1, 27);
        h1 = _x64Add(h1, h2);
        h1 = _x64Add(_x64Multiply(h1, [0, 5]), [0, 0x52dce729]);
        k2 = _x64Multiply(k2, c2);
        k2 = _x64Rotl(k2, 33);
        k2 = _x64Multiply(k2, c1);
        h2 = _x64Xor(h2, k2);
        h2 = _x64Rotl(h2, 31);
        h2 = _x64Add(h2, h1);
        h2 = _x64Add(_x64Multiply(h2, [0, 5]), [0, 0x38495ab5]);
      }

      k1 = [0, 0];
      k2 = [0, 0];

      switch (remainder) {
        case 15:
          k2 = _x64Xor(k2, _x64LeftShift([0, key.charCodeAt(i + 14)], 48));

        case 14:
          k2 = _x64Xor(k2, _x64LeftShift([0, key.charCodeAt(i + 13)], 40));

        case 13:
          k2 = _x64Xor(k2, _x64LeftShift([0, key.charCodeAt(i + 12)], 32));

        case 12:
          k2 = _x64Xor(k2, _x64LeftShift([0, key.charCodeAt(i + 11)], 24));

        case 11:
          k2 = _x64Xor(k2, _x64LeftShift([0, key.charCodeAt(i + 10)], 16));

        case 10:
          k2 = _x64Xor(k2, _x64LeftShift([0, key.charCodeAt(i + 9)], 8));

        case 9:
          k2 = _x64Xor(k2, [0, key.charCodeAt(i + 8)]);
          k2 = _x64Multiply(k2, c2);
          k2 = _x64Rotl(k2, 33);
          k2 = _x64Multiply(k2, c1);
          h2 = _x64Xor(h2, k2);

        case 8:
          k1 = _x64Xor(k1, _x64LeftShift([0, key.charCodeAt(i + 7)], 56));

        case 7:
          k1 = _x64Xor(k1, _x64LeftShift([0, key.charCodeAt(i + 6)], 48));

        case 6:
          k1 = _x64Xor(k1, _x64LeftShift([0, key.charCodeAt(i + 5)], 40));

        case 5:
          k1 = _x64Xor(k1, _x64LeftShift([0, key.charCodeAt(i + 4)], 32));

        case 4:
          k1 = _x64Xor(k1, _x64LeftShift([0, key.charCodeAt(i + 3)], 24));

        case 3:
          k1 = _x64Xor(k1, _x64LeftShift([0, key.charCodeAt(i + 2)], 16));

        case 2:
          k1 = _x64Xor(k1, _x64LeftShift([0, key.charCodeAt(i + 1)], 8));

        case 1:
          k1 = _x64Xor(k1, [0, key.charCodeAt(i)]);
          k1 = _x64Multiply(k1, c1);
          k1 = _x64Rotl(k1, 31);
          k1 = _x64Multiply(k1, c2);
          h1 = _x64Xor(h1, k1);
      }

      h1 = _x64Xor(h1, [0, key.length]);
      h2 = _x64Xor(h2, [0, key.length]);
      h1 = _x64Add(h1, h2);
      h2 = _x64Add(h2, h1);
      h1 = _x64Fmix(h1);
      h2 = _x64Fmix(h2);
      h1 = _x64Add(h1, h2);
      h2 = _x64Add(h2, h1);
      return ("00000000" + (h1[0] >>> 0).toString(16)).slice(-8) + ("00000000" + (h1[1] >>> 0).toString(16)).slice(-8) + ("00000000" + (h2[0] >>> 0).toString(16)).slice(-8) + ("00000000" + (h2[1] >>> 0).toString(16)).slice(-8);
    }; // INITIALIZATION
    // --------------
    // Export murmurHash3 for CommonJS, either as an AMD module or just as part
    // of the global object.


    {
      if (module.exports) {
        exports = module.exports = library;
      }

      exports.murmurHash3 = library;
    }
  })();
  }(murmurHash3js, murmurHash3js.exports));

  var murmurhash3js = murmurHash3js.exports;

  function getHitInfo(app_id, qs_layer_id, shunt_model, hash_id, uid) {
    var hit_info = {
      layer: {},
      trace_id: []
    };
    var layers = shunt_model.layer;

    for (var layer_id in layers) {
      if (!!qs_layer_id && layer_id !== qs_layer_id) {
        continue;
      }

      var layer_shunt_model = layers[layer_id];
      var hash = murmurhash3js.x86.hash32(hash_id);
      var mod = hash % BUCKET_NUM;

      if (layer_shunt_model.ref_exp.bucket.includes(mod)) {
        hit_info.layer[layer_id] = {
          hit_exp_data: layer_shunt_model.ref_exp.data,
          hit_exp_id: '',
          version: layer_shunt_model.ref_exp.version
        };
      } else {
        // launch layer
        if (shunt_model.launch_layer[layer_id]) {
          var _shunt_model$launch_l = shunt_model.launch_layer[layer_id],
              data = _shunt_model$launch_l.data,
              id = _shunt_model$launch_l.id,
              version = _shunt_model$launch_l.version;
          hit_info.layer[layer_id] = {
            hit_exp_data: data,
            hit_exp_id: id,
            version: version
          };
          hit_info.trace_id.push("".concat(app_id, "_").concat(layer_id, "_").concat(id, "_").concat(version));
          continue;
        } // 进入实验的流量重新hash打散


        var _hash = murmurhash3js.x86.hash32(hash_id + layer_id);

        var _mod = _hash % BUCKET_NUM;

        var exp_set = layer_shunt_model.exp_set;

        for (var _id in exp_set) {
          // 命中桶的记录下来
          if (exp_set[_id].bucket.includes(_mod)) {
            var _exp_set$_id = exp_set[_id],
                _version = _exp_set$_id.version,
                _data = _exp_set$_id.data;
            hit_info.layer[layer_id] = {
              hit_exp_data: _data,
              hit_exp_id: _id,
              version: _version
            };
            hit_info.trace_id.push("".concat(app_id, "_").concat(layer_id, "_").concat(_id, "_").concat(_version));
            break;
          }
        }
      }
    }

    hit_info.trace_id = hit_info.trace_id.join('|');
    hit_info.uid = uid;
    return hit_info;
  }

  /*!
   * cookie
   * Copyright(c) 2012-2014 Roman Shtylman
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   */
  /**
   * Module exports.
   * @public
   */

  var parse_1 = parse;
  var serialize_1 = serialize;
  /**
   * Module variables.
   * @private
   */

  var decode = decodeURIComponent;
  var encode = encodeURIComponent;
  var pairSplitRegExp = /; */;
  /**
   * RegExp to match field-content in RFC 7230 sec 3.2
   *
   * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
   * field-vchar   = VCHAR / obs-text
   * obs-text      = %x80-FF
   */

  var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
  /**
   * Parse a cookie header.
   *
   * Parse the given cookie header string into an object
   * The object has the various cookies as keys(names) => values
   *
   * @param {string} str
   * @param {object} [options]
   * @return {object}
   * @public
   */

  function parse(str, options) {
    if (typeof str !== 'string') {
      throw new TypeError('argument str must be a string');
    }

    var obj = {};
    var opt = options || {};
    var pairs = str.split(pairSplitRegExp);
    var dec = opt.decode || decode;

    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i];
      var eq_idx = pair.indexOf('='); // skip things that don't look like key=value

      if (eq_idx < 0) {
        continue;
      }

      var key = pair.substr(0, eq_idx).trim();
      var val = pair.substr(++eq_idx, pair.length).trim(); // quoted values

      if ('"' == val[0]) {
        val = val.slice(1, -1);
      } // only assign once


      if (undefined == obj[key]) {
        obj[key] = tryDecode(val, dec);
      }
    }

    return obj;
  }
  /**
   * Serialize data into a cookie header.
   *
   * Serialize the a name value pair into a cookie string suitable for
   * http headers. An optional options object specified cookie parameters.
   *
   * serialize('foo', 'bar', { httpOnly: true })
   *   => "foo=bar; httpOnly"
   *
   * @param {string} name
   * @param {string} val
   * @param {object} [options]
   * @return {string}
   * @public
   */


  function serialize(name, val, options) {
    var opt = options || {};
    var enc = opt.encode || encode;

    if (typeof enc !== 'function') {
      throw new TypeError('option encode is invalid');
    }

    if (!fieldContentRegExp.test(name)) {
      throw new TypeError('argument name is invalid');
    }

    var value = enc(val);

    if (value && !fieldContentRegExp.test(value)) {
      throw new TypeError('argument val is invalid');
    }

    var str = name + '=' + value;

    if (null != opt.maxAge) {
      var maxAge = opt.maxAge - 0;

      if (isNaN(maxAge) || !isFinite(maxAge)) {
        throw new TypeError('option maxAge is invalid');
      }

      str += '; Max-Age=' + Math.floor(maxAge);
    }

    if (opt.domain) {
      if (!fieldContentRegExp.test(opt.domain)) {
        throw new TypeError('option domain is invalid');
      }

      str += '; Domain=' + opt.domain;
    }

    if (opt.path) {
      if (!fieldContentRegExp.test(opt.path)) {
        throw new TypeError('option path is invalid');
      }

      str += '; Path=' + opt.path;
    }

    if (opt.expires) {
      if (typeof opt.expires.toUTCString !== 'function') {
        throw new TypeError('option expires is invalid');
      }

      str += '; Expires=' + opt.expires.toUTCString();
    }

    if (opt.httpOnly) {
      str += '; HttpOnly';
    }

    if (opt.secure) {
      str += '; Secure';
    }

    if (opt.sameSite) {
      var sameSite = typeof opt.sameSite === 'string' ? opt.sameSite.toLowerCase() : opt.sameSite;

      switch (sameSite) {
        case true:
          str += '; SameSite=Strict';
          break;

        case 'lax':
          str += '; SameSite=Lax';
          break;

        case 'strict':
          str += '; SameSite=Strict';
          break;

        case 'none':
          str += '; SameSite=None';
          break;

        default:
          throw new TypeError('option sameSite is invalid');
      }
    }

    return str;
  }
  /**
   * Try decoding a string using a decoding function.
   *
   * @param {string} str
   * @param {function} decode
   * @private
   */


  function tryDecode(str, decode) {
    try {
      return decode(str);
    } catch (e) {
      return str;
    }
  }

  function setCookies(app_id, uid, trace_id) {
    var hostname = location.hostname;
    var domain = isIpHostName(hostname) ? hostname : hostname.replace(/(.+)(?=\..+\..+\b)/, ''); // set uid in cookie

    document.cookie = serialize_1("".concat(ABTEST_UID_COOKIE_NAME).concat(app_id), uid, {
      maxAge: ABTEST_COOKIE_ALIVE_TIME,
      domain: domain
    }); // set trace_id in cookie

    document.cookie = serialize_1("".concat(ABTEST_TRACE_ID_COOKIE_NAME).concat(app_id), trace_id, {
      maxAge: ABTEST_COOKIE_ALIVE_TIME,
      domain: domain
    });
  }

  function isIpHostName(str) {
    return str.split('.').length === 4;
  }

  var ABTest = /*#__PURE__*/function () {
    function ABTest(app_id, config) {
      _classCallCheck(this, ABTest);

      this.app_id = app_id;
      this.config = config;
      this.model = genModel(app_id, config);
    }

    _createClass(ABTest, [{
      key: "getUid",
      value: function getUid() {
        return this.uid || parse_1(document.cookie)[ABTEST_UID_COOKIE_NAME + this.app_id];
      }
    }, {
      key: "getTraceId",
      value: function getTraceId() {
        return this.trace_id || parse_1(document.cookie)[ABTEST_TRACE_ID_COOKIE_NAME + this.app_id];
      }
    }, {
      key: "run",
      value: function run(layer_id) {
        var uid = this.getUid() || uuid();
        var hash_id = "".concat(uid, "_").concat(location.protocol + '://' + location.host + location.path);
        var hit_info = getHitInfo(this.app_id, layer_id, this.model, hash_id, uid); // set uid trace_id in cookie

        setCookies(this.app_id, uid, hit_info.trace_id);
        this.uid = uid;
        this.trace_id = this.trace_id;
        return hit_info;
      }
    }]);

    return ABTest;
  }();

  return ABTest;

})));
