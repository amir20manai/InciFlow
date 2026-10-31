package com.inciflow_backend.repository;

import com.inciflow_backend.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    // ============================================================
    // Récupérer un département par son nom
    // (utilisé lors de l'affectation d'un utilisateur ou d'un incident)
    // ============================================================
    Optional<Department> findByName(String name);
}