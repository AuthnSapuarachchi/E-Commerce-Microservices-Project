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
        // Use the manual constructor instead of .builder()
        Product product = new Product(
                null, // ID is null because MongoDB generates it
                productRequest.getName(),
                productRequest.getDescription(),
                productRequest.getPrice()
        );

        productRepository.save(product);
        log.info("Product {} is saved", product.getId());
    }

    public List<ProductResponse> getAllProducts() {
        List<Product> products = productRepository.findAll();

        if (!products.isEmpty()) {
            System.out.println("RAW DB DATA: " + products.get(0).toString());
        } else {
            System.out.println("DATABASE IS EMPTY");
        }

        return products.stream()
                .map(this::mapToProductResponse)
                .toList();
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
