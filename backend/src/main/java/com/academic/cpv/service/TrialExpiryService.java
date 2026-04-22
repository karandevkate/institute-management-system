package com.academic.cpv.service;

import com.academic.cpv.model.User;
import com.academic.cpv.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TrialExpiryService {

    private static final Logger logger = LoggerFactory.getLogger(TrialExpiryService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    // Run every hour to check for expired trials
    @Scheduled(cron = "0 0 * * * *")
    public void checkTrialExpirations() {
        logger.info("Checking for expired trials...");
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);

        List<User> usersToRevoke = userRepository.findAll().stream()
                .filter(user -> !user.isApproved() && !user.isTrialExpired())
                .filter(user -> user.getTrialStartDate() != null && user.getTrialStartDate().isBefore(sevenDaysAgo))
                .toList();

        for (User user : usersToRevoke) {
            user.setTrialExpired(true);
            user.setVerified(false); // Invalidate session or access
            userRepository.save(user);
            
            try {
                emailService.sendAccessRevokedEmail(user.getEmail());
                logger.info("Access revoked and email sent to user: {}", user.getUsername());
            } catch (Exception e) {
                logger.error("Failed to send revocation email to {}: {}", user.getEmail(), e.getMessage());
            }
        }
    }
}
