package com.inciflow_backend.services;

import com.inciflow_backend.entity.Department;
import com.inciflow_backend.entity.User;
import com.inciflow_backend.repository.DepartmentRepository;
import com.inciflow_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    // Récupérer tous les utilisateurs
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Sauvegarder un utilisateur (création ou mise à jour)
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    // Récupérer un utilisateur par son ID
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    // Récupérer un utilisateur par son email
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // ============================================================
    // Méthode pour l'utilisateur connecté (via email - endpoint /api/users/update)
    // ============================================================
    public User updateUser(String email, User updatedUserData) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Mise à jour du prénom si fourni
        if (updatedUserData.getFirstName() != null) {
            user.setFirstName(updatedUserData.getFirstName());
        }
        // Mise à jour du nom si fourni
        if (updatedUserData.getLastName() != null) {
            user.setLastName(updatedUserData.getLastName());
        }
        // Mise à jour de l'email si fourni
        if (updatedUserData.getEmail() != null) {
            user.setEmail(updatedUserData.getEmail());
        }

        // Mise à jour du département si fourni
        if (updatedUserData.getDepartment() != null && updatedUserData.getDepartment().getName() != null) {
            String deptName = updatedUserData.getDepartment().getName();
            Department department = departmentRepository.findByName(deptName)
                    .orElseThrow(() -> new RuntimeException("Department not found with name: " + deptName));
            user.setDepartment(department);
        }

        return userRepository.save(user);
    }

    // ============================================================
    // Méthode pour l'Admin (via ID - endpoint /api/admin/users/{id})
    // Gère le département reçu soit en String, soit en Objet
    // ============================================================
    public User updateUser(Long id, User updatedUserData) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Mise à jour du prénom
        if (updatedUserData.getFirstName() != null) {
            user.setFirstName(updatedUserData.getFirstName());
        }
        // Mise à jour du nom
        if (updatedUserData.getLastName() != null) {
            user.setLastName(updatedUserData.getLastName());
        }
        // Mise à jour de l'email
        if (updatedUserData.getEmail() != null) {
            user.setEmail(updatedUserData.getEmail());
        }
        // Mise à jour du rôle
        if (updatedUserData.getRole() != null) {
            user.setRole(updatedUserData.getRole());
        }

        // Gestion flexible du département (String ou Objet envoyé par le front)
        if (updatedUserData.getDepartment() != null) {
            String deptName = null;

            // On vérifie si c'est un Map (JSON), un objet Department, ou un String
            try {
                Object deptObj = updatedUserData.getDepartment();
                if (deptObj instanceof java.util.Map) {
                    deptName = (String) ((java.util.Map<?, ?>) deptObj).get("name");
                } else if (deptObj instanceof Department) {
                    deptName = ((Department) deptObj).getName();
                } else {
                    deptName = deptObj.toString();
                }
            } catch (Exception e) {
                deptName = updatedUserData.getDepartment().toString();
            }

            // On affecte le département uniquement s'il est valide et non "General"
            if (deptName != null && !deptName.isEmpty() && !deptName.equals("General")) {
                final String finalDeptName = deptName;
                Department department = departmentRepository.findByName(finalDeptName)
                        .orElseThrow(() -> new RuntimeException("Department not found with name: " + finalDeptName));
                user.setDepartment(department);
            }
        }

        return userRepository.save(user);
    }

    // Supprimer un utilisateur par son ID
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}