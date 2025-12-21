package com.shopwise.order_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

// "inventory-service" must match the spring.application.name in Inventory Service
@FeignClient(name = "inventory-service")
public interface InventoryClient {
    @GetMapping("/api/inventory")
    boolean checkStock(@RequestParam("skuCode") String skuCode, @RequestParam("quantity") Integer quantity);

    @PutMapping("/api/inventory/reduce")
    void reduceStock(@RequestParam("skuCode") String skuCode, @RequestParam("quantity") Integer quantity);

    @PutMapping("/api/inventory/increase")
    void increaseStock(@RequestParam("skuCode") String skuCode, @RequestParam("quantity") Integer quantity);
}
