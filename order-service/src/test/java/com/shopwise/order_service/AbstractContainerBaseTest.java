package com.shopwise.order_service;

import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
public class AbstractContainerBaseTest {
    @Container
    static final MySQLContainer<?> MY_SQL_CONTAINER;

    static {
        MY_SQL_CONTAINER = new MySQLContainer<>("mysql:8.0")
                .withUsername("root")
                .withPassword("root")
                .withDatabaseName("shopwise_order_test_db");

        MY_SQL_CONTAINER.start();
    }

    // 2. Connect Spring Boot to this Container
    // Normally, application.properties points to localhost:3306.
    // But this container runs on a random port (e.g., 54321) to avoid conflicts.
    // This method overrides the properties dynamically.
    @DynamicPropertySource
    static void dynamicPropertySource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", MY_SQL_CONTAINER::getJdbcUrl);
        registry.add("spring.datasource.username", MY_SQL_CONTAINER::getUsername);
        registry.add("spring.datasource.password", MY_SQL_CONTAINER::getPassword);
    }
}
