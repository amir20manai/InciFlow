package com.inciflow_backend.services;

import com.inciflow_backend.dto.AuthenticationRequest;
import com.inciflow_backend.dto.AuthenticationResponse;
import com.inciflow_backend.dto.RegisterRequest;
import com.inciflow_backend.entity.User;
import com.inciflow_backend.enums.Role;
import com.inciflow_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
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

    // تسجيل مستعمل جديد
    public AuthenticationResponse register(RegisterRequest request) {
        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.EMPLOYEE)
                .build();

        userRepository.save(user);

        // توليد توكن حقيقي للمستخدم الجديد مباشرة بعد التسجيل
        var jwtToken = jwtService.generateToken(user);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .build();
    }

    // تسجيل الدخول
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        // التحقق من الإيميل وكلمة المرور عبر الـ AuthenticationManager
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // توليد توكن JWT حقيقي وصحيح
        var jwtToken = jwtService.generateToken(user);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .build();
    }
}