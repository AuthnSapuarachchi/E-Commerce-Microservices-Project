package com.shopwise.order_service.controller;

import com.shopwise.order_service.dto.OrderRequest;
import com.shopwise.order_service.model.Order;
import com.shopwise.order_service.repository.OrderRepository;
import com.shopwise.order_service.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order")
public class OrderController {
    private final OrderService orderService;
    private final OrderRepository orderRepository;

    public OrderController(OrderService orderService, OrderRepository orderRepository) {
        this.orderService = orderService;
        this.orderRepository = orderRepository;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public String placeOrder(@RequestBody OrderRequest orderRequest) {
        orderService.placeOrder(orderRequest);
        return "Order Placed Successfully";
    }

    @GetMapping("/user/{userId}")
    @ResponseStatus(HttpStatus.OK)
    public List<Order> getOrdersByUser(@PathVariable("userId") String userId) {
        return orderService.getOrdersByUser(userId);
    }

}
