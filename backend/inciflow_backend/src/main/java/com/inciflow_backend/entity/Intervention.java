package com.inciflow_backend.entity;

import com.inciflow_backend.enums.IncidentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interventions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Intervention {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDateTime interventionDate = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private IncidentStatus status;

    @ManyToOne
    @JoinColumn(name = "incident_id")
    private Incident incident;

    @ManyToOne
    @JoinColumn(name = "technician_id")
    private User technician;
}