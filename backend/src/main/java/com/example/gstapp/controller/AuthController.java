package com.example.gstapp.controller;

import com.example.gstapp.dto.*;
import com.example.gstapp.model.Role;
import com.example.gstapp.model.User;
import com.example.gstapp.service.OtpService;
import com.example.gstapp.service.UserService;
import com.example.gstapp.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private OtpService otpService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            // Check if username already exists
            if (userService.existsByUsername(registerRequest.getUsername())) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(null, null, null, null, null, "Username already exists", false));
            }
            
            // Check if email already exists (if provided)
            if (registerRequest.getEmail() != null && !registerRequest.getEmail().isEmpty()) {
                if (userService.existsByEmail(registerRequest.getEmail())) {
                    return ResponseEntity.badRequest()
                        .body(new AuthResponse(null, null, null, null, null, "Email already exists", false));
                }
            }
            
            // Check if phone already exists (if provided)
            if (registerRequest.getPhone() != null && !registerRequest.getPhone().isEmpty()) {
                if (userService.existsByPhone(registerRequest.getPhone())) {
                    return ResponseEntity.badRequest()
                        .body(new AuthResponse(null, null, null, null, null, "Phone number already exists", false));
                }
            }
            
            // Create user
            User user = userService.createUser(
                registerRequest.getUsername(),
                registerRequest.getPassword(),
                registerRequest.getEmail(),
                registerRequest.getPhone(),
                Role.MERCHANT, // Default role for registration
                registerRequest.getBusinessName()
            );
            
            // Generate JWT token
            String token = jwtUtil.generateToken(user, user.getId());
            
            return ResponseEntity.ok(new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getRole().name(),
                user.getBusinessName(),
                "Registration successful",
                true
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new AuthResponse(null, null, null, null, null, "Registration failed: " + e.getMessage(), false));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            User user = null;
            
            // Find user based on login type
            if ("phone".equals(loginRequest.getLoginType())) {
                user = userService.findByPhone(loginRequest.getUsername());
            } else {
                // Try email first, then username
                user = userService.findByEmail(loginRequest.getUsername());
                if (user == null) {
                    user = userService.findByUsername(loginRequest.getUsername());
                }
            }
            
            if (user == null) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(null, null, null, null, null, "User not found", false));
            }
            
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), loginRequest.getPassword())
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Generate JWT token
            String token = jwtUtil.generateToken(user, user.getId());
            
            return ResponseEntity.ok(new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getRole().name(),
                user.getBusinessName(),
                "Login successful",
                true
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new AuthResponse(null, null, null, null, null, "Login failed: " + e.getMessage(), false));
        }
    }
    
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@Valid @RequestBody OtpRequest otpRequest) {
        try {
            System.out.println("Received OTP request for phone: " + otpRequest.getPhone());
            
            boolean otpSent = otpService.sendOtp(otpRequest.getPhone());
            
            if (otpSent) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "OTP sent successfully");
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Failed to send OTP. Please try again.");
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            System.err.println("Error in sendOtp: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error sending OTP: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody OtpVerifyRequest otpVerifyRequest) {
        try {
            boolean otpValid = otpService.verifyOtp(otpVerifyRequest.getPhone(), otpVerifyRequest.getOtp());
            
            if (otpValid) {
                // Find user by phone
                User user = userService.findByPhone(otpVerifyRequest.getPhone());
                
                if (user != null) {
                    // Generate JWT token for existing user
                    String token = jwtUtil.generateToken(user, user.getId());
                    
                    return ResponseEntity.ok(new AuthResponse(
                        token,
                        user.getId(),
                        user.getUsername(),
                        user.getRole().name(),
                        user.getBusinessName(),
                        "OTP verified successfully",
                        true
                    ));
                } else {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "OTP verified successfully. Please complete registration.");
                    response.put("phone", otpVerifyRequest.getPhone());
                    return ResponseEntity.ok(response);
                }
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Invalid or expired OTP");
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error verifying OTP: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/register-with-otp")
    public ResponseEntity<?> registerWithOtp(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            // Verify OTP first
            boolean otpValid = otpService.verifyOtp(registerRequest.getPhone(), "000000"); // This should be passed in request
            
            if (!otpValid) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(null, null, null, null, null, "OTP verification required", false));
            }
            
            // Check if phone already exists
            if (userService.existsByPhone(registerRequest.getPhone())) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(null, null, null, null, null, "Phone number already registered", false));
            }
            
            // Create user
            User user = userService.createUser(
                registerRequest.getUsername(),
                registerRequest.getPassword(),
                registerRequest.getEmail(),
                registerRequest.getPhone(),
                Role.MERCHANT,
                registerRequest.getBusinessName()
            );
            
            // Mark phone as verified
            user.setIsPhoneVerified(true);
            userService.save(user);
            
            // Generate JWT token
            String token = jwtUtil.generateToken(user, user.getId());
            
            return ResponseEntity.ok(new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getRole().name(),
                user.getBusinessName(),
                "Registration with OTP successful",
                true
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new AuthResponse(null, null, null, null, null, "Registration failed: " + e.getMessage(), false));
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            User user = userService.findByUsername(username);
            if (user == null) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(null, null, null, null, null, "User not found", false));
            }
            
            return ResponseEntity.ok(new AuthResponse(
                null,
                user.getId(),
                user.getUsername(),
                user.getRole().name(),
                user.getBusinessName(),
                "User details retrieved",
                true
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new AuthResponse(null, null, null, null, null, "Error retrieving user: " + e.getMessage(), false));
        }
    }
}
