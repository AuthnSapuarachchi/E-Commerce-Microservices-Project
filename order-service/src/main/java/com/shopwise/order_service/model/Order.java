package com.shopwise.order_service.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "t_orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String orderNumber;

    // We will simulate a list of items later, for now let's keep it simple
    private String skuCode;
    private BigDecimal price;
    private Integer quantity;

    private String userId;

    public Order() {
    }

    public Order(Long id, String orderNumber, String skuCode, BigDecimal price, Integer quantity, String userId) {
        this.id = id;
        this.orderNumber = orderNumber;
        this.skuCode = skuCode;
        this.price = price;
        this.quantity = quantity;
        this.userId = userId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public String getSkuCode() {
        return skuCode;
    }

    public void setSkuCode(String skuCode) {
        this.skuCode = skuCode;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
