package com.inciflow_backend.repository;

import com.inciflow_backend.entity.Incident;
import com.inciflow_backend.entity.User;
import com.inciflow_backend.enums.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {

    // ============================================================
    // Récupérer les incidents par statut
    // (ex : tous les incidents NOUVEAU, EN_COURS, RESOLU, etc.)
    // ============================================================
    List<Incident> findByStatus(IncidentStatus status);

    // ============================================================
    // Récupérer les incidents déclarés par un employé donné
    // ============================================================
    List<Incident> findByEmployee(User employee);

    // ============================================================
    // Récupérer les incidents assignés à un technicien donné
    // (via son ID)
    // ============================================================
    List<Incident> findByTechnicianId(Long technicianId);
}