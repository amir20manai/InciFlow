package com.inciflow_backend.repository;

import com.inciflow_backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // ============================================================
    // Récupérer une catégorie par son nom
    // (utilisé lors de la création d'un incident)
    // ============================================================
    Optional<Category> findByName(String name);
}