package com.company.learningmanagement.controller.lms;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.data.redis.core.RedisTemplate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class StatusController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> status = new HashMap<>();
        
        // 1. Check DB Connection
        try {
            jdbcTemplate.execute("SELECT 1");
            status.put("database", "connected");
        } catch (Exception e) {
            status.put("database", "failed: " + e.getMessage());
        }

        // 2. Check Redis Connection
        try {
            redisTemplate.getConnectionFactory().getConnection().ping();
            status.put("redis", "connected");
        } catch (Exception e) {
            status.put("redis", "failed: " + e.getMessage());
        }

        return ResponseEntity.ok(status);
    }
}
