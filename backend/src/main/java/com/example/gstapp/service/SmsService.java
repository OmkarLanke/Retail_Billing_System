package com.example.gstapp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class SmsService {
    
    @Value("${sms.gateway.url}")
    private String smsGatewayUrl;
    
    @Value("${sms.gateway.user}")
    private String smsGatewayUser;
    
    @Value("${sms.gateway.password}")
    private String smsGatewayPassword;
    
    @Value("${sms.gateway.sender}")
    private String smsGatewaySender;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    public boolean sendOtp(String phoneNumber, String otp) {
        try {
            // For development/testing, always return true and log the OTP
            System.out.println("=== SMS OTP (Development Mode) ===");
            System.out.println("Phone: " + phoneNumber);
            System.out.println("OTP: " + otp);
            System.out.println("================================");
            
            // TODO: Uncomment below code when SMS gateway is working
            /*
            String message = "Your OTP for GST Accounting App is: " + otp + ". Valid for 5 minutes. Do not share with anyone.";
            
            // Prepare request parameters
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("user", smsGatewayUser);
            params.add("password", smsGatewayPassword);
            params.add("sender", smsGatewaySender);
            params.add("to", phoneNumber);
            params.add("msg", message);
            
            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
            
            // Send SMS
            ResponseEntity<String> response = restTemplate.postForEntity(smsGatewayUrl, request, String.class);
            
            // Check if SMS was sent successfully
            // The response format depends on your SMS gateway provider
            String responseBody = response.getBody();
            System.out.println("SMS Response: " + responseBody);
            
            return response.getStatusCode().is2xxSuccessful() && 
                   responseBody != null && 
                   !responseBody.contains("ERROR") &&
                   !responseBody.contains("File not found");
            */
            
            return true; // Always return true for development
            
        } catch (Exception e) {
            System.err.println("Error sending SMS: " + e.getMessage());
            return false;
        }
    }
    
    public boolean sendMessage(String phoneNumber, String message) {
        try {
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("user", smsGatewayUser);
            params.add("password", smsGatewayPassword);
            params.add("sender", smsGatewaySender);
            params.add("to", phoneNumber);
            params.add("msg", message);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(smsGatewayUrl, request, String.class);
            
            return response.getStatusCode().is2xxSuccessful() && 
                   response.getBody() != null && 
                   !response.getBody().contains("ERROR");
            
        } catch (Exception e) {
            System.err.println("Error sending SMS: " + e.getMessage());
            return false;
        }
    }
}
