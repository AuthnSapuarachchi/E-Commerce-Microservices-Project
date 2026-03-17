package com.shopwise.order_service.service;

import com.shopwise.order_service.client.InventoryClient;
import com.shopwise.order_service.client.ProductClient;
import com.shopwise.order_service.dto.OrderLineItemsDto;
import com.shopwise.order_service.dto.OrderRequest;
import com.shopwise.order_service.event.OrderPlacedEvent;
import com.shopwise.order_service.model.Order;
import com.shopwise.order_service.model.OrderLineItems;
import com.shopwise.order_service.repository.OrderRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import jakarta.transaction.Transactional;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductClient productClient;
    private final KafkaTemplate<String, OrderPlacedEvent> kafkaTemplate;
    private final InventoryClient inventoryClient;

    //  Inject Services and Repositories.
    public OrderService(OrderRepository orderRepository, ProductClient productClient, KafkaTemplate<String, OrderPlacedEvent> kafkaTemplate, InventoryClient inventoryClient) {
        this.orderRepository = orderRepository;
        this.productClient = productClient;
        this.kafkaTemplate = kafkaTemplate;
        this.inventoryClient = inventoryClient;
    }

    @CircuitBreaker(name = "inventory", fallbackMethod = "fallbackPlaceOrder")
    public void placeOrder(OrderRequest orderRequest) {
        Order order = new Order();
        order.setOrderNumber(UUID.randomUUID().toString());
        order.setUserId(orderRequest.getUserEmail());

        // 1. Convert the Request DTOs to Database Entities
        List<OrderLineItems> orderLineItems = orderRequest.getOrderLineItemsList()
                .stream()
                .map(this::mapToDto)
                .toList();

        System.out.println("Received " + orderLineItems.size() + " items from Frontend.");

        for (OrderLineItems item : orderLineItems) {
            item.setOrder(order);
        }

        order.setOrderLineItemsList(orderLineItems);

        // 2. CHECK STOCK FOR ALL ITEMS (Fail Fast)
        System.out.println("Step 1: Checking Inventory for " + orderLineItems.size() + " items...");

        for (OrderLineItems item : orderLineItems) {
            boolean inStock = inventoryClient.checkStock(item.getSkuCode(), item.getQuantity());
            if (!inStock) {
                System.out.println("Not in stock: " + item.getSkuCode());
                throw new RuntimeException("Product " + item.getSkuCode() + " is out of stock!");
            }
        }

        // 3. REDUCE STOCK FOR ALL ITEMS
        System.out.println("Step 2: Reducing Stock...");
        for (OrderLineItems item : orderLineItems) {
            inventoryClient.reduceStock(item.getSkuCode(), item.getQuantity());
        }

        // --- START OF TRANSACTION DANGER ZONE ---
        try {
            // 4. Save Order (With all items inside)
            System.out.println("Saving Order with  items.");

            orderRepository.save(order);

            // 5. Notify
            System.out.println("Step 4: Sending Notification...");
            kafkaTemplate.send("notificationTopic", new OrderPlacedEvent(order.getOrderNumber()));

        } catch (Exception e) {
            // --- ROLLBACK LOGIC (MULTI-ITEM) ---
            System.out.println("ERROR OCCURRED: " + e.getMessage());
            System.out.println("TRIGGERING ROLLBACK: Restoring stock for ALL items...");

            // Loop through the list and add stock back for each item
            for (OrderLineItems item : orderLineItems) {
                inventoryClient.increaseStock(item.getSkuCode(), item.getQuantity());
            }

            // Re-throw the exception so the user/frontend knows it failed
            throw new RuntimeException("Order Failed. Stock has been rolled back.");
        }
    }

    // Helper method to convert DTO to Entity
    private OrderLineItems mapToDto(OrderLineItemsDto orderLineItemsDto) {
        OrderLineItems orderLineItems = new OrderLineItems();
        orderLineItems.setPrice(orderLineItemsDto.getPrice());
        orderLineItems.setQuantity(orderLineItemsDto.getQuantity());
        orderLineItems.setSkuCode(orderLineItemsDto.getSkuCode());
        orderLineItems.setName(orderLineItemsDto.getName());
        return orderLineItems;
    }

    public List<Order> getOrdersByUser(String userId) {
        return orderRepository.findByUserId(userId);
    }

    // Fallback Method
    public void fallbackPlaceOrder(OrderRequest orderRequest, Throwable runtimeException) {
        System.out.println("Fallback Triggered! Reason: " + runtimeException.getMessage());
        System.out.println("Cannot Place Order. Executing Fallback logic");
        throw new RuntimeException("Oops! Product Service is down. Please order later.");
    }
}