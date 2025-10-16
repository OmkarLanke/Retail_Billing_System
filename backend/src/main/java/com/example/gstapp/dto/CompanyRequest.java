package com.example.gstapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CompanyRequest {
    
    @NotBlank(message = "Business name is required")
    private String businessName;
    
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Phone number should be valid Indian mobile number")
    private String phoneNumber;
    
    @Pattern(regexp = "^$|^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$", 
             message = "GSTIN should be valid (15 characters: 2 digits + 5 letters + 4 digits + 1 letter + 1 letter + Z + 1 letter)")
    private String gstin;
    
    @Email(message = "Email should be valid")
    private String email;
    
    private String businessType;
    
    private String businessCategory;
    
    private String state;
    
    @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Pincode should be valid 6-digit number")
    private String pincode;
    
    @Size(max = 1000, message = "Business address should not exceed 1000 characters")
    private String businessAddress;
    
    // Constructors
    public CompanyRequest() {}
    
    public CompanyRequest(String businessName, String phoneNumber, String gstin, String email, 
                         String businessType, String businessCategory, String state, String pincode, 
                         String businessAddress) {
        this.businessName = businessName;
        this.phoneNumber = phoneNumber;
        this.gstin = gstin;
        this.email = email;
        this.businessType = businessType;
        this.businessCategory = businessCategory;
        this.state = state;
        this.pincode = pincode;
        this.businessAddress = businessAddress;
    }
    
    // Getters and Setters
    public String getBusinessName() {
        return businessName;
    }
    
    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public String getGstin() {
        return gstin;
    }
    
    public void setGstin(String gstin) {
        this.gstin = gstin;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getBusinessType() {
        return businessType;
    }
    
    public void setBusinessType(String businessType) {
        this.businessType = businessType;
    }
    
    public String getBusinessCategory() {
        return businessCategory;
    }
    
    public void setBusinessCategory(String businessCategory) {
        this.businessCategory = businessCategory;
    }
    
    public String getState() {
        return state;
    }
    
    public void setState(String state) {
        this.state = state;
    }
    
    public String getPincode() {
        return pincode;
    }
    
    public void setPincode(String pincode) {
        this.pincode = pincode;
    }
    
    public String getBusinessAddress() {
        return businessAddress;
    }
    
    public void setBusinessAddress(String businessAddress) {
        this.businessAddress = businessAddress;
    }
}
