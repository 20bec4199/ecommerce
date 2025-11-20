// services/cacheService.js
class CacheService {
  constructor() {
    console.log('Caching disabled');
  }

  async get(key) {
    return null;
  }

  async set(key, value, expiration = 3600) {
    // Do nothing
    return true;
  }

  async delete(key) {
    return true;
  }

  async deletePattern(pattern) {
    return true;
  }
}

module.exports = new CacheService();