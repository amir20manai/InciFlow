package com.inciflow_backend.repository;

import com.inciflow_backend.entity.Notification;
import com.inciflow_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // ============================================================
    // Récupérer les notifications d'un utilisateur donné
    // triées par date de création décroissante (les plus récentes en premier)
    // ============================================================
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
}