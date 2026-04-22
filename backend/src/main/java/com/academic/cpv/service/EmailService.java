package com.academic.cpv.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    public void sendAccessRevokedEmail(String to) {
        String subject = "Access Revoked - Trial Period Expired";
        String body = "Dear User,\n\nYour 7-day free trial access has been revoked. " +
                "To continue using the application, please contact the administrator for approval.\n\n" +
                "Best regards,\nCPV Management Team";
        sendEmail(to, subject, body);
    }

    public void sendAccessGrantedEmail(String to) {
        String subject = "Access Granted - CPV Management System";
        String body = "Dear User,\n\nYour access to the CPV application has been granted by the administrator. " +
                "You can now login and access all features.\n\n" +
                "Best regards,\nCPV Management Team";
        sendEmail(to, subject, body);
    }
}
