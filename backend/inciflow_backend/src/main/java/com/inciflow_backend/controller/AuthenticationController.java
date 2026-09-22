package com.inciflow_backend.controller;

import com.inciflow_backend.dto.AuthenticationRequest;
import com.inciflow_backend.dto.AuthenticationResponse;
import com.inciflow_backend.dto.RegisterRequest;
import com.inciflow_backend.services.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // POST:login http://localhost:8080/api/auth/authenticate
    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(authenticationService.authenticate(request));
    }
}