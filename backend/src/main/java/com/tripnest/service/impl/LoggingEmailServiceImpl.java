package com.tripnest.service.impl;

import com.tripnest.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Milestone 1 keeps email delivery out of scope, but auth flows (forgot
 * password, welcome email) still need somewhere to call. This logs the
 * intent so the flow is fully wired; Milestone 3 swaps this bean for a
 * JavaMailSender/SendGrid implementation without touching AuthService.
 */
@Service
public class LoggingEmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(LoggingEmailServiceImpl.class);

    @Override
    @Async
    public void sendPasswordResetEmail(String toEmail, String fullName, String resetToken) {
        log.info("[EMAIL] Password reset link for {} ({}): /reset-password?token={}",
                fullName, toEmail, resetToken);
    }

    @Override
    @Async
    public void sendWelcomeEmail(String toEmail, String fullName) {
        log.info("[EMAIL] Welcome email queued for {} ({})", fullName, toEmail);
    }
}
