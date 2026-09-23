package com.inciflow_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

// Entité représentant une catégorie d'incident
@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nom de la catégorie (unique)
    @Column(nullable = false, unique = true)
    private String name;

    // Couleur utilisée pour l'indicateur visuel de la catégorie
    @Column(name = "dot_color")
    private String dotColor;

    // Liste des incidents appartenant à cette catégorie
    @OneToMany(mappedBy = "category")
    private List<Incident> incidents;
}