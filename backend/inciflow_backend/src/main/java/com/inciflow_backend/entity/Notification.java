package com.inciflow_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String message;

    private LocalDateTime createdAt = LocalDateTime.now();

    private boolean isRead = false;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}