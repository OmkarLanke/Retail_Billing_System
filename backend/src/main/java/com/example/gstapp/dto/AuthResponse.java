package com.example.gstapp.dto;

public class AuthResponse {
    
    private String token;
    private String type = "Bearer";
    private Long userId;
    private String username;
    private String role;
    private String businessName;
    private String message;
    private boolean success;
    
    public AuthResponse() {}
    
    public AuthResponse(String token, Long userId, String username, String role, String businessName, String message, boolean success) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.role = role;
        this.businessName = businessName;
        this.message = message;
        this.success = success;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public String getBusinessName() {
        return businessName;
    }
    
    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
}
