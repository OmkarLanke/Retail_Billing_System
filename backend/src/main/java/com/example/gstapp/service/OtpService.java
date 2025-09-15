package com.example.gstapp.service;

import com.example.gstapp.model.OtpVerification;
import com.example.gstapp.repository.OtpVerificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class OtpService {
    
    @Autowired
    private OtpVerificationRepository otpVerificationRepository;
    
    @Autowired
    private SmsService smsService;
    
    private static final int OTP_LENGTH = 6;
    private static final int MAX_ATTEMPTS = 3;
    private static final int OTP_RESEND_LIMIT_MINUTES = 1;
    
    public String generateOtp() {
        Random random = new Random();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }
    
    public boolean sendOtp(String phoneNumber) {
        try {
            // Check if OTP was sent recently
            LocalDateTime oneMinuteAgo = LocalDateTime.now().minusMinutes(OTP_RESEND_LIMIT_MINUTES);
            long recentOtps = otpVerificationRepository.countOtpsSince(phoneNumber, oneMinuteAgo);
            
            if (recentOtps > 0) {
                return false; // OTP already sent recently
            }
            
            // Generate new OTP
            String otp = generateOtp();
            
            // Save OTP to database
            OtpVerification otpVerification = new OtpVerification(phoneNumber, otp);
            otpVerificationRepository.save(otpVerification);
            
            // Send SMS
            boolean smsSent = smsService.sendOtp(phoneNumber, otp);
            
            if (!smsSent) {
                // If SMS failed, delete the OTP record
                otpVerificationRepository.delete(otpVerification);
                return false;
            }
            
            return true;
            
        } catch (Exception e) {
            System.err.println("Error in sendOtp: " + e.getMessage());
            return false;
        }
    }
    
    public boolean verifyOtp(String phoneNumber, String otp) {
        try {
            OtpVerification otpVerification = otpVerificationRepository
                .findByPhoneAndOtpAndIsUsedFalse(phoneNumber, otp)
                .orElse(null);
            
            if (otpVerification == null) {
                return false; // Invalid OTP
            }
            
            if (otpVerification.isExpired()) {
                otpVerification.setIsUsed(true);
                otpVerificationRepository.save(otpVerification);
                return false; // OTP expired
            }
            
            if (otpVerification.getAttempts() >= MAX_ATTEMPTS) {
                otpVerification.setIsUsed(true);
                otpVerificationRepository.save(otpVerification);
                return false; // Too many attempts
            }
            
            // Increment attempts
            otpVerification.setAttempts(otpVerification.getAttempts() + 1);
            
            if (otpVerification.getOtp().equals(otp)) {
                // OTP is correct
                otpVerification.setIsUsed(true);
                otpVerificationRepository.save(otpVerification);
                return true;
            } else {
                // Wrong OTP
                otpVerificationRepository.save(otpVerification);
                return false;
            }
            
        } catch (Exception e) {
            System.err.println("Error in verifyOtp: " + e.getMessage());
            return false;
        }
    }
    
    public boolean isOtpValid(String phoneNumber) {
        LocalDateTime now = LocalDateTime.now();
        return otpVerificationRepository.findActiveOtpsByPhone(phoneNumber, now).size() > 0;
    }
}
