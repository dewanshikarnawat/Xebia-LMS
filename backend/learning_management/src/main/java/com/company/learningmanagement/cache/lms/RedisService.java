package com.company.learningmanagement.cache.lms;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service("lmsRedisService")
public class RedisService {

    private final RedisTemplate<String, Object> redisTemplate;

    public RedisService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public Object get(String key) {
        try {
            return redisTemplate.opsForValue().get(key);
        } catch (Exception e) {
            // Log warning, return null to fall back to PostgreSQL database
            System.err.println("Redis GET failed for key " + key + ": " + e.getMessage());
            return null;
        }
    }

    public void set(String key, Object value, long timeoutMinutes) {
        try {
            redisTemplate.opsForValue().set(key, value, timeoutMinutes, TimeUnit.MINUTES);
        } catch (Exception e) {
            // Log warning, continue
            System.err.println("Redis SET failed for key " + key + ": " + e.getMessage());
        }
    }

    public void delete(String key) {
        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            System.err.println("Redis DELETE failed for key " + key + ": " + e.getMessage());
        }
    }

    public void deletePattern(String pattern) {
        try {
            Set<String> keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } catch (Exception e) {
            System.err.println("Redis Pattern DELETE failed for pattern " + pattern + ": " + e.getMessage());
        }
    }
}
