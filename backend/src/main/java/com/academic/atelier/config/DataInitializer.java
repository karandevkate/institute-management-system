package com.academic.atelier.config;

import com.academic.atelier.model.*;
import com.academic.atelier.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    UserRepository userRepository;

    @Autowired
    CourseRepository courseRepository;

    @Autowired
    PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Admin
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@atelier.edu")
                    .password(encoder.encode("admin123"))
                    .role(ERole.ROLE_ADMIN)
                    .isVerified(true)
                    .build();
            userRepository.save(admin);
        }

        // 2. Seed a Trainer
        if (!userRepository.existsByUsername("trainer_john")) {
            User trainer = User.builder()
                    .username("trainer_john")
                    .email("john@atelier.edu")
                    .password(encoder.encode("password123"))
                    .role(ERole.ROLE_TRAINER)
                    .isVerified(true)
                    .build();
            userRepository.save(trainer);
        }

        // 3. Seed a Course
        if (courseRepository.count() == 0) {
            Course course = Course.builder()
                    .name("Advanced UI/UX Design")
                    .duration("6 Months")
                    .description("Master the art of creating premium digital experiences.")
                    .build();
            courseRepository.save(course);
        }
    }
}
