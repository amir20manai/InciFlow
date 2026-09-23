package com.inciflow_backend.services;

import com.inciflow_backend.entity.Notification;
import com.inciflow_backend.entity.User;
import com.inciflow_backend.repository.NotificationRepository;
import com.inciflow_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // ============================================================
    // Récupérer les notifications de l'utilisateur connecté
    // (via son email, triées de la plus récente à la plus ancienne)
    // ============================================================
    public List<Notification> getUserNotifications(String userEmail) {
        // Chercher l'utilisateur par son email
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Retourner ses notifications, triées par date décroissante
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    // ============================================================
    // Marquer une notification comme lue (isRead = true)
    // ============================================================
    @Transactional
    public void markAsRead(Long notificationId) {
        // Chercher la notification par son ID
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // La marquer comme lue
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    // ============================================================
    // Marquer TOUTES les notifications comme lues pour un utilisateur
    // (via son email)
    // ============================================================
    @Transactional
    public void markAllAsRead(String userEmail) {
        // Chercher l'utilisateur par son email
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Récupérer toutes ses notifications
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);

        // Les marquer toutes comme lues
        for (Notification n : notifications) {
            n.setRead(true);
        }

        // Sauvegarder en batch
        notificationRepository.saveAll(notifications);
    }

    // ============================================================
    // Créer une nouvelle notification pour un utilisateur donné
    // ============================================================
    @Transactional
    public void createNotification(User user, String message) {
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }
}