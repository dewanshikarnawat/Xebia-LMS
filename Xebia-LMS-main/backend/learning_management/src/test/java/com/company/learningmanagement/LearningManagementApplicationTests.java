package com.company.learningmanagement;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
public class LearningManagementApplicationTests {

    @Test
    void contextLoads() {
        // Verification that the Spring ApplicationContext starts up without configuration errors
    }
}
