package com.shopwise.order_service.repository;

import com.shopwise.order_service.AbstractContainerBaseTest;
import com.shopwise.order_service.model.Order; // Import your Entity
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.ArrayList;

// 1. Extend the Base Class so we get the Docker Container
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class OrderRepositoryTest extends AbstractContainerBaseTest {

    @Autowired
    private OrderRepository orderRepository;

    @Test
    @DisplayName("Should save Order and verify Auto-Increment ID")
    public void shouldSaveOrder() {
        // --- STEP 1: Create the Data ---
        Order order = new Order();
        order.setOrderNumber("ORD-TEST-101");
        order.setUserId("user-123");

        // Important: Initialize the list to avoid NullPointerException
        order.setOrderLineItemsList(new ArrayList<>());

        // Optional: If you want to test saving items too, you would do this:
        /*
        OrderLineItems item = new OrderLineItems();
        item.setSkuCode("iphone_15");
        item.setPrice(BigDecimal.valueOf(1200));
        item.setQuantity(1);
        item.setOrder(order); // CRITICAL for mappedBy="order"
        order.getOrderLineItemsList().add(item);
        */

        // --- STEP 2: Save to Docker Container ---
        Order savedOrder = orderRepository.save(order);

        // --- STEP 3: Verify (Assertions) ---

        // Check if ID was generated (it should be 1 or higher)
        Assertions.assertNotNull(savedOrder.getId());
        Assertions.assertTrue(savedOrder.getId() > 0);

        // Check if data matches
        Assertions.assertEquals("ORD-TEST-101", savedOrder.getOrderNumber());
        Assertions.assertEquals("user-123", savedOrder.getUserId());

        System.out.println("✅ TEST SUCCESS: Order saved with ID: " + savedOrder.getId());
    }

}
