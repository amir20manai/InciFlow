package com.inciflow_backend.controller;

import com.inciflow_backend.entity.Notification;
import com.inciflow_backend.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class NotificationController {

    private final NotificationService notificationService;

    // GET: الـ Angular يعيط لها باش يجيب الـ notifications متاع الـ user المكونكتي
    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(Principal principal) {
        String email = principal.getName();
        List<Notification> notifications = notificationService.getUserNotifications(email);
        return ResponseEntity.ok(notifications);
    }

    // PATCH: تقريب notification فردية تردها مقروءة
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        System.out.println(">>> Mark as read called for notification ID: " + id);
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Principal principal) {
        if (principal == null) {
            System.out.println(">>> ERROR: Principal is NULL in markAllAsRead!");
            return ResponseEntity.status(401).build();
        }
        String email = principal.getName();
        System.out.println(">>> Mark all as read called for user: " + email);
        notificationService.markAllAsRead(email);
        return ResponseEntity.ok().build();
    }
}