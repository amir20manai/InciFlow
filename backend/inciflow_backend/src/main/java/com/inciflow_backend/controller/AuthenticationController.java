package com.inciflow_backend.controller;

import com.inciflow_backend.dto.AuthenticationRequest;
import com.inciflow_backend.dto.AuthenticationResponse;
import com.inciflow_backend.dto.RegisterRequest;
import com.inciflow_backend.services.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    // POST: register http://localhost:8080/api/auth/register
    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authenticationService.register(request));
    }

    // POST: login http://localhost:8080/api/auth/authenticate
    // ✅ Modifié pour renvoyer 404 si email inexistant, 401 si mot de passe incorrect
    @PostMapping("/authenticate")
    public ResponseEntity<?> authenticate(@RequestBody AuthenticationRequest request) {
        try {
            AuthenticationResponse response = authenticationService.authenticate(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            String message = e.getMessage() != null ? e.getMessage().toLowerCase() : "";

            // ✅ Cas 1 : Email inexistant → 404 Not Found
            if (message.contains("user not found")) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }

            // ✅ Cas 2 : Mot de passe incorrect → 401 Unauthorized
            if (message.contains("invalid password")) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid password"));
            }

            // ✅ Cas par défaut : 401
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication failed"));
        }
    }
}