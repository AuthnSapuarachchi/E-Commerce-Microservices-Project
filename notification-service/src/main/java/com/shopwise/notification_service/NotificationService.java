package com.shopwise.notification_service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class NotificationService {
    @KafkaListener(topics = "notificationTopic")
    public void handleNotification(OrderPlacedEvent orderPlacedEvent) {
        // Here you would send an email
        log.info("Received Notification for Order - {}", orderPlacedEvent.getOrderNumber());
    }
}
