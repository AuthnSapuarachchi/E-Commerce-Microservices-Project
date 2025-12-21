package com.shopwise.inventory_service.service;

import com.shopwise.inventory_service.dto.InventoryRequest;
import com.shopwise.inventory_service.model.Inventory;
import com.shopwise.inventory_service.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    @Transactional(readOnly = true)
    public boolean isInStock(String skuCode, Integer quantity) {
        // Check if product exists AND has enough quantity
        return inventoryRepository.existsBySkuCodeAndQuantityGreaterThanEqual(skuCode, quantity);
    }

    @Transactional // vital for updating the database
    public void reduceStock(String skuCode, Integer quantity) {
        // 1. Find the inventory item
        Inventory inventory = inventoryRepository.findBySkuCode(skuCode)
                .orElseThrow(() -> new RuntimeException("Product not found in inventory"));

        // 2. Check if we have enough stock (Double check just to be safe)
        if (inventory.getQuantity() < quantity) {
            throw new RuntimeException("Not enough stock for " + skuCode);
        }

        // 3. Deduct the quantity
        inventory.setQuantity(inventory.getQuantity() - quantity);

        try {
            inventoryRepository.save(inventory);
        } catch (org.springframework.dao.OptimisticLockingFailureException e) {
            throw new RuntimeException("Someone else updated the stock! Please retry.");
        }
    }

    @Transactional
    public void increaseStock(String skuCode, Integer quantity) {
        Inventory inventory = inventoryRepository.findBySkuCode(skuCode)
                .orElseGet(() -> {
                    // IF NOT FOUND: Create a new record instead of crashing!
                    Inventory newInv = new Inventory();
                    newInv.setSkuCode(skuCode);
                    newInv.setQuantity(0);
                    return newInv;
                });

        // Add the new quantity to the existing (or new) quantity
        inventory.setQuantity(inventory.getQuantity() + quantity);

        // Save it to the database
        inventoryRepository.save(inventory);

        System.out.println("✅ Stock updated for " + skuCode + ". New Qty: " + inventory.getQuantity());

    }

    public void addStock(InventoryRequest inventoryRequest) {
        Inventory inventory = new Inventory();
        inventory.setSkuCode(inventoryRequest.getSkuCode());
        inventory.setQuantity(inventoryRequest.getQuantity());

        inventoryRepository.save(inventory);
    }

}
