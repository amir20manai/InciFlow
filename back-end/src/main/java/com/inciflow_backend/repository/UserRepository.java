package com.inciflow_backend.repository;

import com.inciflow_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // ============================================================
    // Récupérer un utilisateur par son email
    // (utilisé principalement pour l'authentification et la recherche)
    // ============================================================
    Optional<User> findByEmail(String email);
}