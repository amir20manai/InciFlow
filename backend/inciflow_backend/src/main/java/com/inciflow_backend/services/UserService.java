package com.inciflow_backend.services;

import com.inciflow_backend.entity.Department;
import com.inciflow_backend.entity.User;
import com.inciflow_backend.repository.DepartmentRepository; // زيد هذا
import com.inciflow_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository; // زيد حقن الـ DepartmentRepository

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

        // تحديث الـ Department عبر اسمه إذا تم إرساله
        if (updatedUserData.getDepartment() != null && updatedUserData.getDepartment().getName() != null) {
            String deptName = updatedUserData.getDepartment().getName();
            Department department = departmentRepository.findByName(deptName)
                    .orElseThrow(() -> new RuntimeException("Department not found with name: " + deptName));
            user.setDepartment(department);
        }

        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}