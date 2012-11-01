'use strict';

/*jslint node: true, indent: 2 */

var u = require('underscore'),
  genericMemcachedCache,
  genericMemoryCache,
  genericCache;

genericMemcachedCache = {
  connect : function (options) {
    var memjs = require('memjs'),
      storage = memjs.Client.create(options.servers || undefined, options);

    return {
      set : function (key, value, ttl, callback) {
        var defaultTtl = storage.options.expires;
        storage.options.expires = ttl;

        if (u.isObject(value)) {
          value = JSON.stringify(value);
        } else if (!u.isString(value) && !u.isNumber(value)) {
          console.log("Can't cache this value in memcache", value);
          return;
        }

        storage.set(key, value, callback);

        storage.options.expires = defaultTtl;
      },
      get : function (key, callback) {
        storage.get(key,  function (err, value) {
          value = (value === null ? false : value.toString());
          if (value.length && value.substr(0, 1) === '{') {
            value = JSON.parse(value);
          }
          callback(err, value);
        });
      },
      close : function () {
        storage.close();
      }
    };
  }
};

genericMemoryCache = {
  connect : function (options) {
    var NodeCache = require('node-cache'),
      storage = new NodeCache(options);

    return {
      set : function (key, value, ttl, callback) {
        storage.set(key, value, ttl, callback);
      },
      get : function (key, callback) {
        storage.get(key, function (err, value) {
          callback(err, value[key] === undefined ? false : value[key]);
        });
      }
    };
  }
};

genericCache = function (driver, options) {
  var storage = driver.connect(options || {});

  return {
    set : function (key, value, ttl, callback) {
      storage.set(key, value, ttl, callback ? function (err, result) {
        callback(err, result ? true : false);
      } : undefined);
    },
    get : function (key, callback) {
      storage.get(key, callback);
    },
    close : function () {
      if (storage.close) {
        storage.close();
      }
    }
  };
};

exports.genericMemcachedCache = genericMemcachedCache;
exports.genericMemoryCache = genericMemoryCache;
exports.genericCache = genericCache;
