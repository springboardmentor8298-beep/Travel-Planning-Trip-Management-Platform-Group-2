package com.tripnest;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

/**
 * Verifies the Spring context wires up correctly (security, JPA, JWT
 * config, etc.) against an in-memory H2 database.
 */
@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:tripnest_test;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.flyway.enabled=false",
        "tripnest.jwt.secret=test-secret-key-for-unit-tests-only-0123456789"
})
class TripNestApplicationTests {

    @Test
    void contextLoads() {
        // If the context fails to start, this test fails — that alone
        // catches most wiring mistakes (missing beans, bad property refs).
    }
}
