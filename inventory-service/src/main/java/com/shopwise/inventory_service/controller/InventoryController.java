package com.shopwise.inventory_service.controller;

import com.shopwise.inventory_service.dto.InventoryRequest;
import com.shopwise.inventory_service.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    // URL: http://localhost:8083/api/inventory?skuCode=iphone_15&quantity=1
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public boolean isInStock(@RequestParam String skuCode, @RequestParam Integer quantity) {
        System.out.println("Received check for SKU: " + skuCode + " with QTY: " + quantity);
        boolean inStock = inventoryService.isInStock(skuCode, quantity);
        System.out.println("👉 Result from DB: " + inStock);
        return inStock;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public String addStock(@RequestBody InventoryRequest inventoryRequest) {
        inventoryService.addStock(inventoryRequest);
        return "Stock added successfully";
    }

    @PutMapping("/reduce")
    @ResponseStatus(HttpStatus.OK)
    public String reduceStock(@RequestParam String skuCode, @RequestParam Integer quantity) {
        inventoryService.reduceStock(skuCode, quantity);
        return "Stock reduced successfully";
    }

    @PutMapping("/increase")
    @ResponseStatus(HttpStatus.OK)
    public String increaseStock(@RequestParam String skuCode, @RequestParam Integer quantity) {
        inventoryService.increaseStock(skuCode, quantity);
        return "Stock increased successfully";
    }

}
