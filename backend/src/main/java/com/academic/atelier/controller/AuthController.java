package com.academic.atelier.controller;

import com.academic.atelier.model.ERole;
import com.academic.atelier.model.User;
import com.academic.atelier.payload.request.LoginRequest;
import com.academic.atelier.payload.request.SignupRequest;
import com.academic.atelier.payload.response.JwtResponse;
import com.academic.atelier.payload.response.MessageResponse;
import com.academic.atelier.repository.UserRepository;
import com.academic.atelier.security.jwt.JwtUtils;
import com.academic.atelier.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        User user = userRepository.findByUsername(loginRequest.getUsername())
                .or(() -> userRepository.findByEmail(loginRequest.getUsername()))
                .orElse(null);

        if (user != null) {
            if (!user.isApproved() && !user.isVerified()) {
                String message = user.isTrialExpired() 
                    ? "Error: Your 7-day trial has expired. Please contact admin for access."
                    : "Error: Your access has been revoked. Please contact admin.";
                return ResponseEntity
                        .status(org.springframework.http.HttpStatus.FORBIDDEN)
                        .body(new MessageResponse(message));
            }
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                role,
                userDetails.isVerified()));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        ERole role = ERole.valueOf(signUpRequest.getRole() != null ? signUpRequest.getRole() : "ROLE_STUDENT");

        User user = User.builder()
                .username(signUpRequest.getUsername())
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .role(role)
                .isApproved(role == ERole.ROLE_ADMIN) 
                .isVerified(true) // Verified for trial access
                .build();

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}
