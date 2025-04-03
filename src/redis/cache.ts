import { Redis } from 'ioredis';
import { redisClient } from './config';

class RedisCache {
  /**
   * Set a key-value pair in Redis with optional expiration
   * @param {string} key - The key to store
   * @param {string|object} value - The value to store
   * @param {number} [expireSeconds] - Time to live in seconds
   * @returns {Promise<void>}
   */
  static async set(key: string, value: string | object, expireSeconds: number | null = null) {
    try {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;
      if (expireSeconds) {
        await redisClient.setex(key, expireSeconds, stringValue);
      } else {
        await redisClient.set(key, stringValue);
      }
    } catch (error) {
      console.error('Redis set error:', error);
      throw error;
    }
  }

  /**
   * Get a value from Redis by key
   * @param {string} key - The key to retrieve
   * @returns {Promise<string|object|null>}
   */
  static async get(key: string) {
    try {
      const value = await redisClient.get(key);
      if (!value) return null;

      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('Redis get error:', error);
      throw error;
    }
  }

  /**
   * Delete a key from Redis
   * @param {string} key - The key to delete
   * @returns {Promise<void>}
   */
  static async del(key: string) {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
      throw error;
    }
  }

  /**
   * Check if a key exists in Redis
   * @param {string} key - The key to check
   * @returns {Promise<boolean>}
   */
  static async exists(key: string) {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      throw error;
    }
  }

  /**
   * Set multiple key-value pairs in Redis
   * @param {Object} keyValuePairs - Object containing key-value pairs
   * @returns {Promise<void>}
   */
  static async mset(keyValuePairs: Record<string, string | object>) {
    try {
      const pairs = Object.entries(keyValuePairs).flatMap(([key, value]) => [
        key,
        typeof value === 'object' ? JSON.stringify(value) : value
      ]);
      await redisClient.mset(pairs);
    } catch (error) {
      console.error('Redis mset error:', error);
      throw error;
    }
  }

  /**
   * Get multiple values from Redis by keys
   * @param {string[]} keys - Array of keys to retrieve
   * @returns {Promise<Array<string|object|null>>}
   */
  static async mget(keys: string[]) {
    try {
      const values = await redisClient.mget(keys);
      return values.map(value => {
        if (!value) return null;
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      });
    } catch (error) {
      console.error('Redis mget error:', error);
      throw error;
    }
  }
}

export { RedisCache }; 