package com.inciflow_backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

// Entité représentant une notification envoyée à un utilisateur
@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Message de la notification
    @Column(nullable = false)
    private String message;

    // Date et heure de création
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Indique si la notification a été lue ou non
    // @JsonProperty("isRead") : exposé en JSON sous le nom "isRead" (pour Angular)
    @JsonProperty("isRead")
    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    // Utilisateur destinataire de la notification
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}