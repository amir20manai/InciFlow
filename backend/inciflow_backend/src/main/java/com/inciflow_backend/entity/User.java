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

    private String firstName;
    private String lastName;
    private String email;
    private String password;

    // حقل الهاتف كـ String لقبول الأصفار والرموز الزائدة مثل +
    private String phone;


    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @Enumerated(EnumType.STRING)
    private Role role;

    // إرجاع اسم القسم كـ String للفرونت إند
    @JsonProperty("department")
    public String getDepartmentNameForJson() {
        return department != null ? department.getName() : null;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String roleName = (role != null) ? "ROLE_" + role.name() : "ROLE_EMPLOYEE";
        return Collections.singletonList(new SimpleGrantedAuthority(roleName));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}