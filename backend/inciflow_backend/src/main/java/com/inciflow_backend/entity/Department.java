package com.inciflow_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

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

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "head_name")
    private String headName;

    // الحوادث المرتبطة بالقسم سيتم حذفها تلقائياً عند حذف القسم
    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Incident> incidents;

    // المستخدمين لن يتم حذفهم، بل سنقوم بفك ارتباطهم برمجياً
    @OneToMany(mappedBy = "department")
    private List<User> users;
}