package com.tripnest.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Async
    public void sendEmail(String toEmail, String subject, String body) {
        try {
            if (mailSender != null) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(toEmail);
                message.setSubject(subject);
                message.setText(body);
                message.setFrom("TripNest Notifications <no-reply@tripnest.app>");
                mailSender.send(message);
                System.out.println("[EmailService] Real email sent to: " + toEmail + " | Subject: " + subject);
            } else {
                System.out.println("[EmailService Simulation] Email to: " + toEmail + " | Subject: " + subject + "\nBody: " + body);
            }
        } catch (Exception e) {
            System.out.println("[EmailService Fallback] Failed to send email via SMTP, logged notification for: " + toEmail + " -> " + e.getMessage());
        }
    }

    public void sendWelcomeEmail(String toEmail, String userName) {
        String subject = "Welcome to TripNest - Your Journey Begins!";
        String body = "Hello " + userName + ",\n\nWelcome to TripNest! Start planning your dream itineraries, managing budgets, and collaborating with travel companions.\n\nHappy Travels,\nThe TripNest Team";
        sendEmail(toEmail, subject, body);
    }

    public void sendTripReminder(String toEmail, String tripTitle, String destination, String startDate) {
        String subject = "Upcoming Trip Reminder: " + tripTitle;
        String body = "Hi Traveler,\n\nYour upcoming trip to " + destination + " (" + tripTitle + ") is scheduled to start on " + startDate + ". Check your dashboard for itinerary details!\n\nBest,\nTripNest";
        sendEmail(toEmail, subject, body);
    }
}
