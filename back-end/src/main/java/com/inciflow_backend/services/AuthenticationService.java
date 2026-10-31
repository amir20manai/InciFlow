package com.inciflow_backend.services;

import com.inciflow_backend.dto.AuthenticationRequest;
import com.inciflow_backend.dto.AuthenticationResponse;
import com.inciflow_backend.dto.RegisterRequest;
import com.inciflow_backend.entity.User;
import com.inciflow_backend.enums.Role;
import com.inciflow_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // ============================================================
    // INSCRIPTION
    // ============================================================
    public AuthenticationResponse register(RegisterRequest request) {
        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))  // Mot de passe hashé
                .phone(request.getPhone())
                .role(Role.EMPLOYEE)                                       // Rôle par défaut
                .build();

        userRepository.save(user);

        // Génération d'un token JWT après l'inscription
        var jwtToken = jwtService.generateToken(user);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .build();
    }

    // ============================================================
    // CONNEXION
    // Distingue "email inexistant" (404) de "mot de passe incorrect" (401)
    // ============================================================
    public AuthenticationResponse authenticate(AuthenticationRequest request) {

        // ÉTAPE 1 : Vérifie d'abord si l'email existe dans la base
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ÉTAPE 2 : L'email existe → on valide le mot de passe via AuthenticationManager
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            // Le mot de passe est incorrect
            throw new RuntimeException("Invalid password");
        }

        // ÉTAPE 3 : Tout est bon → génération du token JWT
        var jwtToken = jwtService.generateToken(user);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .build();
    }
}