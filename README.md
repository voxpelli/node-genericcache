# Generic Cache

A very simple generic interface for caching stuff with switchable backends.

## Example

```javascript
var cache = genericCache(options.cache === 'memcached' ? genericMemcachedCache : genericMemoryCache, options.cacheOptions),
cache.get(cacheKey, function (err, result) {});
cache.set(cacheKey, result, ttl);
```
