package com.shopwise.product_service.service;

import com.shopwise.product_service.dto.ProductRequest;
import com.shopwise.product_service.dto.ProductResponse;
import com.shopwise.product_service.model.Product;
import com.shopwise.product_service.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {
    private final ProductRepository productRepository;

    public void createProduct(ProductRequest productRequest) {
        Product product = Product.builder()
                .name(productRequest.getName())               // Changed to getter
                .description(productRequest.getDescription()) // Changed to getter
                .price(productRequest.getPrice())             // Changed to getter
                .build();

        productRepository.save(product);
        log.info("Product {} is saved", product.getId());
    }

    public List<ProductResponse> getAllProducts() {
        List<Product> products = productRepository.findAll();

        return products.stream()
                .map(this::mapToProductResponse)
                .toList();
    }

    private ProductResponse mapToProductResponse(Product product) {
        // Since we used @AllArgsConstructor in the DTO, this constructor works perfectly
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice()
        );
    }
}
