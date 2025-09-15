package com.example.gstapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class RegisterRequest {
    
    @NotBlank(message = "Username is required")
    private String username;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    @Email(message = "Email should be valid")
    private String email;
    
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Phone number should be valid Indian mobile number")
    private String phone;
    
    @NotBlank(message = "Business name is required")
    private String businessName;
    
    private String registerType; // "email", "phone"
    
    public RegisterRequest() {}
    
    public RegisterRequest(String username, String password, String email, String phone, String businessName, String registerType) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.phone = phone;
        this.businessName = businessName;
        this.registerType = registerType;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getBusinessName() {
        return businessName;
    }
    
    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }
    
    public String getRegisterType() {
        return registerType;
    }
    
    public void setRegisterType(String registerType) {
        this.registerType = registerType;
    }
}
