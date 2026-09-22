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

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // 1. Méthode lel User 3adi (tkhdem b String email - mta3 /api/users/update)
    public User updateUser(String email, User updatedUserData) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updatedUserData.getFirstName() != null) {
            user.setFirstName(updatedUserData.getFirstName());
        }
        if (updatedUserData.getLastName() != null) {
            user.setLastName(updatedUserData.getLastName());
        }
        if (updatedUserData.getEmail() != null) {
            user.setEmail(updatedUserData.getEmail());
        }

        if (updatedUserData.getDepartment() != null && updatedUserData.getDepartment().getName() != null) {
            String deptName = updatedUserData.getDepartment().getName();
            Department department = departmentRepository.findByName(deptName)
                    .orElseThrow(() -> new RuntimeException("Department not found with name: " + deptName));
            user.setDepartment(department);
        }

        return userRepository.save(user);
    }

    // 2. Méthode lel Admin (tkhdem b Long id - mta3 /api/admin/users/{id})
    // Méthode lel Admin (tkhdem b Long id) - Msal7a lel Département String wela Object
    public User updateUser(Long id, User updatedUserData) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        if (updatedUserData.getFirstName() != null) {
            user.setFirstName(updatedUserData.getFirstName());
        }
        if (updatedUserData.getLastName() != null) {
            user.setLastName(updatedUserData.getLastName());
        }
        if (updatedUserData.getEmail() != null) {
            user.setEmail(updatedUserData.getEmail());
        }
        if (updatedUserData.getRole() != null) {
            user.setRole(updatedUserData.getRole());
        }

        // Handling flexible lel Department (ken jey String wala Object mel front)
        if (updatedUserData.getDepartment() != null) {
            String deptName = null;

            // Nchoufu kenou Object wela String direct
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

            if (deptName != null && !deptName.isEmpty() && !deptName.equals("General")) {
                final String finalDeptName = deptName;
                Department department = departmentRepository.findByName(finalDeptName)
                        .orElseThrow(() -> new RuntimeException("Department not found with name: " + finalDeptName));
                user.setDepartment(department);
            }
        }

        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}