package com.inciflow_backend.repository;

import com.inciflow_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // هذه الميثود مهمة جداً باش الـ Spring Security و JwtFilter يلقاو المستخدم بالإيميل
    Optional<User> findByEmail(String email);
}