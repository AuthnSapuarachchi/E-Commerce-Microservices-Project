package com.shopwise.order_service.service;

import com.shopwise.order_service.client.InventoryClient;
import com.shopwise.order_service.client.ProductClient;
import com.shopwise.order_service.dto.OrderRequest;
import com.shopwise.order_service.event.OrderPlacedEvent;
import com.shopwise.order_service.model.Order;
import com.shopwise.order_service.repository.OrderRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductClient productClient; // Inject the Feign Client
    private final KafkaTemplate<String, OrderPlacedEvent> kafkaTemplate; // Inject this
    private final InventoryClient inventoryClient;

    // Manual Constructor Injection
    public OrderService(OrderRepository orderRepository, ProductClient productClient, KafkaTemplate<String, OrderPlacedEvent> kafkaTemplate, InventoryClient inventoryClient) {
        this.orderRepository = orderRepository;
        this.productClient = productClient;
        this.kafkaTemplate = kafkaTemplate;
        this.inventoryClient = inventoryClient;
    }

    @CircuitBreaker(name = "inventory", fallbackMethod = "fallbackPlaceOrder")
    public void placeOrder(OrderRequest orderRequest) {
        // 1. Call Product Service to check if product exists
        boolean productExists = productClient.checkProductExists(orderRequest.getSkuCode());
        System.out.println("🔹 Step 1: Calling Inventory...");
        // Call Inventory Service
        boolean inStock = inventoryClient.checkStock(orderRequest.getSkuCode(), orderRequest.getQuantity());

        if (!productExists) {
            throw new RuntimeException("Product with ID " + orderRequest.getSkuCode() + " not found!");
        }

        if (!inStock) {
            System.out.println("❌ Not in stock!");
            throw new RuntimeException("Product not in stock");
        }

        System.out.println("🔹 Step 1: Reducing Stock...");
        inventoryClient.reduceStock(orderRequest.getSkuCode(), orderRequest.getQuantity());

        // --- START OF TRANSACTION DANGER ZONE ---
        try {
            // 4. Save Order
            System.out.println("🔹 Step 2: Saving Order...");
            Order order = new Order();
            order.setOrderNumber(UUID.randomUUID().toString());
            order.setSkuCode(orderRequest.getSkuCode());
            order.setPrice(orderRequest.getPrice());
            order.setQuantity(orderRequest.getQuantity());

            // SIMULATE A CRASH HERE FOR TESTING (Uncomment next line to test)
            // if(true) throw new RuntimeException("Database Crash Simulation!");

            orderRepository.save(order);

            // 5. Notify
            System.out.println("🔹 Step 3: Sending Notification...");
            kafkaTemplate.send("notificationTopic", new OrderPlacedEvent(order.getOrderNumber()));

        } catch (Exception e) {
            // --- ROLLBACK LOGIC ---
            System.out.println("🔴 ERROR OCCURRED: " + e.getMessage());
            System.out.println("🔄 TRIGGERING ROLLBACK: Adding stock back...");

            inventoryClient.increaseStock(orderRequest.getSkuCode(), orderRequest.getQuantity());

            // Re-throw the exception so the user knows it failed
            throw new RuntimeException("Order Failed. Stock has been rolled back.");
        }
    }

    // Must match the argument list of placeOrder + Throwable
    public void fallbackPlaceOrder(OrderRequest orderRequest, Throwable runtimeException) {
        System.out.println("❌ Fallback Triggered! Reason: " + runtimeException.getMessage());
        System.out.println("Cannot Place Order. Executing Fallback logic");
        // In a real app, you might save this to a "failed_orders" database to retry later
        throw new RuntimeException("Oops! Product Service is down. Please order later.");
    }
}
