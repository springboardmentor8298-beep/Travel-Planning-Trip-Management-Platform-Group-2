package com.tripnest.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class DropStaleIndexRunner implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS UK_9q63snka3mdh91as4io72espi");
        } catch (Exception e) {}

        try {
            jdbcTemplate.execute("ALTER TABLE users DROP COLUMN IF EXISTS phone_number");
        } catch (Exception e) {}

        try {
            // Delete orphan or unauthenticated test user accounts (retaining only real user accounts)
            jdbcTemplate.execute("DELETE FROM users WHERE email IS NULL OR email = '' OR email = 'null' OR email LIKE '%default%' OR email NOT IN ('thiruppathip.srgm@gmail.com', 'purushothaman.srgm@gmail.com')");
        } catch (Exception e) {}

        try {
            // Clean up orphan trips without valid owner_email
            jdbcTemplate.execute("DELETE FROM trips WHERE owner_email IS NULL OR owner_email = '' OR owner_email = 'null' OR owner_email LIKE '%default%'");
        } catch (Exception e) {}

        try {
            // Clean up any stale or duplicate shared_members strings in trips table
            jdbcTemplate.execute("UPDATE trips SET shared_members = 'purushothaman.srgm@gmail.com', member_count = 2 WHERE owner_email LIKE 'thiruppathip%' OR owner_email LIKE 'Thiruppathi%'");
        } catch (Exception e) {}

        try {
            List<Map<String, Object>> users = jdbcTemplate.queryForList("SELECT id, name, email FROM users");
            System.out.println("[DatabaseInitializer] Cleaned Registered User Accounts Count: " + users.size());
            for (Map<String, Object> u : users) {
                System.out.println("   -> User: " + u.get("email") + " (" + u.get("name") + ")");
            }

            List<Map<String, Object>> trips = jdbcTemplate.queryForList("SELECT id, title, owner_email, total_budget FROM trips");
            System.out.println("[DatabaseInitializer] Cleaned Total Trips Count: " + trips.size());
            for (Map<String, Object> t : trips) {
                System.out.println("   -> Trip: " + t.get("title") + " (Owner: " + t.get("owner_email") + ", Budget: ₹" + t.get("total_budget") + ")");
            }
        } catch (Exception e) {}
    }
}
