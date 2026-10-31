package com.inciflow_backend.controller;

import com.inciflow_backend.entity.User;
import com.inciflow_backend.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    // ============================================================
    // Récupérer le profil de l'utilisateur connecté
    // GET /api/users/me
    // ============================================================
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Ne jamais renvoyer le mot de passe dans la réponse
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    // ============================================================
    // Mettre à jour le profil de l'utilisateur connecté
    // PUT /api/users/update
    // ============================================================
    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(Authentication authentication, @RequestBody User updatedUser) {
        String email = authentication.getName();
        userService.updateUser(email, updatedUser);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }

    // ============================================================
    // Changer le mot de passe de l'utilisateur connecté
    // PUT /api/users/change-password
    // ============================================================
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(Authentication authentication, @RequestBody Map<String, String> request) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        // Vérifier que l'ancien mot de passe est correct
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect"));
        }

        // Encoder et enregistrer le nouveau mot de passe
        user.setPassword(passwordEncoder.encode(newPassword));
        userService.saveUser(user);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}