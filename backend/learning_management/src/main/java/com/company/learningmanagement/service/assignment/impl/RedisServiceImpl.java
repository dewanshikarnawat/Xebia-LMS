package com.company.learningmanagement.service.assignment.impl;

import com.company.learningmanagement.dto.assignment.response.AssignmentStatusResponse;
import com.company.learningmanagement.service.assignment.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service("amsRedisService")
@RequiredArgsConstructor
@Slf4j
public class RedisServiceImpl implements RedisService {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String KEY_PREFIX = "assignment:status:";

    private String buildKey(Long assignmentId) {
        return KEY_PREFIX + assignmentId;
    }

    @Override
    public void saveAssignmentStatus(Long assignmentId, AssignmentStatusResponse status) {
        try {
            String key = buildKey(assignmentId);
            redisTemplate.opsForValue().set(key, status, 7, TimeUnit.DAYS);
        } catch (Exception e) {
            log.error("Failed to save assignment status to Redis: {}", e.getMessage());
        }
    }

    @Override
    public AssignmentStatusResponse getAssignmentStatus(Long assignmentId) {
        try {
            String key = buildKey(assignmentId);
            Object value = redisTemplate.opsForValue().get(key);
            if (value instanceof AssignmentStatusResponse) {
                return (AssignmentStatusResponse) value;
            }
        } catch (Exception e) {
            log.error("Failed to retrieve assignment status from Redis: {}", e.getMessage());
        }
        return null;
    }

    @Override
    public void deleteAssignmentStatus(Long assignmentId) {
        try {
            String key = buildKey(assignmentId);
            redisTemplate.delete(key);
        } catch (Exception e) {
            log.error("Failed to delete assignment status from Redis: {}", e.getMessage());
        }
    }
}
