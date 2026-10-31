package com.inciflow_backend.entity;

import com.inciflow_backend.enums.IncidentPriority;
import com.inciflow_backend.enums.IncidentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

// Entité représentant un incident signalé
@Entity
@Table(name = "incidents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Titre de l'incident
    @Column(nullable = false)
    private String title;

    // Description détaillée (TEXT pour éviter la limite de longueur)
    @Column(columnDefinition = "TEXT")
    private String description;

    // URL relative de l'image jointe (optionnelle)
    private String imageUrl;

    // Date de création
    private LocalDateTime createdAt = LocalDateTime.now();

    // Statut de l'incident (NOUVEAU, ACCEPTE, EN_COURS, RESOLU, REJETE)
    @Enumerated(EnumType.STRING)
    private IncidentStatus status;

    // Priorité (BASSE, MOYENNE, HAUTE, CRITIQUE)
    @Enumerated(EnumType.STRING)
    private IncidentPriority priority;

    // Notes / rapport d'intervention rédigés par le technicien
    @Column(columnDefinition = "TEXT")
    private String notes;

    // Relations
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    // Employé ayant signalé l'incident
    @ManyToOne
    @JoinColumn(name = "employee_id")
    private User employee;

    // Technicien assigné à l'incident
    @ManyToOne
    @JoinColumn(name = "technician_id")
    private User technician;
}