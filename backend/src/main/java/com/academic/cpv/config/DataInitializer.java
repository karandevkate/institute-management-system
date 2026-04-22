package com.academic.cpv.config;

import com.academic.cpv.model.*;
import com.academic.cpv.repository.*;
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

        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@cpv.com")
                    .password(encoder.encode("admin123"))
                    .role(ERole.ROLE_ADMIN)
                    .isVerified(true)
                    .isApproved(true)
                    .trialExpired(false)
                    .build();
            userRepository.save(admin);
        }

        if (!userRepository.existsByUsername("trainer_john")) {
            User trainer = User.builder()
                    .username("trainer_john")
                    .email("john@cpv.com")
                    .password(encoder.encode("password123"))
                    .role(ERole.ROLE_TRAINER)
                    .isVerified(true)
                    .isApproved(true)
                    .trialExpired(false)
                    .build();
            userRepository.save(trainer);
        }

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
