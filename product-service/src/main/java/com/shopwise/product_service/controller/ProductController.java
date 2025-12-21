package com.shopwise.product_service.controller;

import com.shopwise.product_service.dto.ProductRequest;
import com.shopwise.product_service.dto.ProductResponse;
import com.shopwise.product_service.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void createProduct(@RequestBody ProductRequest productRequest) {
        productService.createProduct(productRequest);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<ProductResponse> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public boolean checkProductExists(@PathVariable("id") String id) {
        // We just return true if product exists, false if not.
        // In a real app, you might return the full Product object.
        return productService.productExists(id);
    }

}
