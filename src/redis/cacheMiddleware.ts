import { RedisCache } from './cache';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to cache route responses
 * @param {number} duration - Cache duration in seconds
 * @returns {Function} Express middleware
 */
const cacheMiddleware = (duration: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      // Try to get cached response
      const cachedResponse = await RedisCache.get(key);

      if (cachedResponse) {
        return res.json(cachedResponse);
      }

      // Store original json method
      const originalJson = res.json;

      // Override json method to cache the response
      res.json = function (data) {
        // Cache the response
        RedisCache.set(key, data, duration);

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Middleware to clear cache for specific routes
 * @param {string[]} patterns - Array of URL patterns to clear cache for
 * @returns {Function} Express middleware
 */
const clearCacheMiddleware = (patterns: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Clear cache for matching patterns
      for (const pattern of patterns) {
        if (req.originalUrl.includes(pattern)) {
          const key = `cache:${req.originalUrl}`;
          await RedisCache.del(key);
        }
      }
      next();
    } catch (error) {
      console.error('Clear cache middleware error:', error);
      next();
    }
  };
};

export {
  cacheMiddleware,
  clearCacheMiddleware
}; 