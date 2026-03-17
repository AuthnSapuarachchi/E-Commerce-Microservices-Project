package com.shopwise.product_service.service;

import com.shopwise.product_service.dto.ProductRequest;
import com.shopwise.product_service.dto.ProductResponse;
import com.shopwise.product_service.model.Product;
import com.shopwise.product_service.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {
    private final ProductRepository productRepository;

    @CacheEvict(value = "products", allEntries = true)
    public void createProduct(ProductRequest productRequest) {
        Product product = Product.builder()
                .name(productRequest.getName())
                .description(productRequest.getDescription())
                .price(productRequest.getPrice())
                .skuCode(productRequest.getSkuCode())
                .build();

        productRepository.save(product);
        log.info("Product {} is saved", product.getId());
    }

    @Cacheable(value = "products")
    public List<ProductResponse> getAllProducts() {
        log.info("Fetching products from Database (Cache Miss)..."); // Log to prove when we hit DB
        // Simulate a "Slow Database" so you can feel the difference
        try { Thread.sleep(2000); } catch (InterruptedException e) {}

        List<Product> products = productRepository.findAll();

        return products.stream().map(this::mapToProductResponse).toList();
    }

    private ProductResponse mapToProductResponse(Product product) {
        
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice()
        );
    }

    public boolean productExists(String id) {
        return productRepository.existsById(id);
    }
}
