package com.shopwise.order_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shopwise.order_service.AbstractContainerBaseTest;
import com.shopwise.order_service.dto.OrderLineItemsDto;
import com.shopwise.order_service.dto.OrderRequest;
import com.shopwise.order_service.repository.OrderRepository;
// IMPORT YOUR FEIGN CLIENT HERE (Check the actual name in your project)
// It is likely in com.shopwise.order_service.client or .proxy
import com.shopwise.order_service.client.InventoryClient;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.math.BigDecimal;
import java.util.List;

@SpringBootTest
@AutoConfigureMockMvc
public class OrderControllerTest extends AbstractContainerBaseTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private OrderRepository orderRepository;

    // --- THE FIX: MOCK THE INVENTORY CLIENT ---
    // This creates a "Fake" Inventory Client that intercepts calls
    @MockitoBean
    private InventoryClient inventoryClient;

    @Test
    public void shouldPlaceOrder() throws Exception {
        // 1. Tell the Mock: "If anyone asks about stock, return TRUE"
        // Note: Change 'isInStock' to match your actual method name in InventoryClient
        Mockito.when(inventoryClient.checkStock(Mockito.anyString(), Mockito.anyInt()))
                .thenReturn(true);

        // 2. Prepare Request Data
        OrderRequest orderRequest = new OrderRequest();
        orderRequest.setUserEmail("test-user@gmail.com");

        OrderLineItemsDto item = new OrderLineItemsDto();
        item.setSkuCode("iphone_15");
        item.setPrice(BigDecimal.valueOf(1200));
        item.setQuantity(1);

        orderRequest.setOrderLineItemsList(List.of(item));

        String orderRequestString = objectMapper.writeValueAsString(orderRequest);

        // 3. Execute Request
        mockMvc.perform(MockMvcRequestBuilders.post("/api/order")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderRequestString))
                .andExpect(MockMvcResultMatchers.status().isCreated()); // Now expects 201

        // 4. Verify DB
        Assertions.assertTrue(orderRepository.findAll().size() > 0);

        System.out.println("✅ CONTROLLER TEST PASSED");
    }
}