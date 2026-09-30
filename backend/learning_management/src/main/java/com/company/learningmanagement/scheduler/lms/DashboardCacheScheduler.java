package com.company.learningmanagement.scheduler.lms;

import com.company.learningmanagement.cache.lms.RedisService;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@EnableScheduling
public class DashboardCacheScheduler {

    private final RedisService redisService;

    public DashboardCacheScheduler(RedisService redisService) {
        this.redisService = redisService;
    }

    // Runs every night at 2:00 AM
    @Scheduled(cron = "0 0 2 * * *")
    public void refreshDashboardCache() {
        System.out.println("[DashboardCacheScheduler] Starting scheduled cleanup of dashboard caches...");
        try {
            redisService.deletePattern("dashboard_*");
            System.out.println("[DashboardCacheScheduler] Dashboard caches successfully evicted.");
        } catch (Exception e) {
            System.err.println("[DashboardCacheScheduler] Failed to evict dashboard caches: " + e.getMessage());
        }
    }
}
