package com.inciflow_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

// Entité représentant un département de l'organisation
@Entity
@Table(name = "departments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nom du département (unique)
    @Column(nullable = false, unique = true)
    private String name;

    // Nom du chef de département
    @Column(name = "head_name")
    private String headName;

    // Liste des incidents liés à ce département
    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Incident> incidents;

    // Liste des utilisateurs appartenant à ce département
    @OneToMany(mappedBy = "department")
    private List<User> users;
}