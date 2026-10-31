package com.inciflow_backend.controller;

import com.inciflow_backend.entity.User;
import com.inciflow_backend.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;

    // ============================================================
    // Récupérer tous les utilisateurs (Admin)
    // GET /api/admin/users
    // ============================================================
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        // On masque les mots de passe avant l'envoi
        users.forEach(user -> user.setPassword(null));
        return ResponseEntity.ok(users);
    }

    // ============================================================
    // Supprimer un utilisateur (Admin)
    // DELETE /api/admin/users/{id}
    // ============================================================
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    // ============================================================
    // Mettre à jour un utilisateur (Admin)
    // PUT /api/admin/users/{id}
    // ============================================================
    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updatedUserData) {
        User updatedUser = userService.updateUser(id, updatedUserData);
        updatedUser.setPassword(null); // Ne pas renvoyer le mot de passe
        return ResponseEntity.ok(updatedUser);
    }
}