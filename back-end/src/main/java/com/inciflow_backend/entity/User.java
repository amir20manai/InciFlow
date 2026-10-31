package com.inciflow_backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.inciflow_backend.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

// Entité représentant un utilisateur de l'application
// Implémente UserDetails pour l'intégration avec Spring Security
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;       // Prénom
    private String lastName;        // Nom
    private String email;           // Email (utilisé comme identifiant)
    private String password;        // Mot de passe (hashé avec BCrypt)
    private String phone;           // Numéro de téléphone

    // Département auquel appartient l'utilisateur (relation ManyToOne)
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    // Rôle de l'utilisateur (ADMIN, TECHNICIAN, EMPLOYEE)
    @Enumerated(EnumType.STRING)
    private Role role;

    // ============================================================
    // Champ exposé en JSON sous le nom "department"
    // Permet d'envoyer uniquement le nom du département au front
    // ============================================================
    @JsonProperty("department")
    public String getDepartmentNameForJson() {
        return department != null ? department.getName() : null;
    }

    // ============================================================
    // Méthodes de UserDetails (Spring Security)
    // ============================================================

    // Retourne les autorités (rôles) sous forme "ROLE_XXX"
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String roleName = (role != null) ? "ROLE_" + role.name() : "ROLE_EMPLOYEE";
        return Collections.singletonList(new SimpleGrantedAuthority(roleName));
    }

    // Utilisé comme username pour l'authentification
    @Override
    public String getUsername() {
        return email;
    }

    // Retourne le mot de passe hashé
    @Override
    public String getPassword() {
        return password;
    }

    // Tous les comptes sont valides par défaut
    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}