package com.example.gstapp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
public class Company {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Business name is required")
    @Column(name = "business_name", nullable = false)
    private String businessName;
    
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Phone number should be valid Indian mobile number")
    @Column(name = "phone_number")
    private String phoneNumber;
    
    @Pattern(regexp = "^$|^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$", 
             message = "GSTIN should be valid (15 characters: 2 digits + 5 letters + 4 digits + 1 letter + 1 letter + Z + 1 letter)")
    @Column(name = "gstin", unique = true)
    private String gstin;
    
    @Email(message = "Email should be valid")
    @Column(name = "email")
    private String email;
    
    @Column(name = "business_type")
    private String businessType;
    
    @Column(name = "business_category")
    private String businessCategory;
    
    @Column(name = "state")
    private String state;
    
    @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Pincode should be valid 6-digit number")
    @Column(name = "pincode")
    private String pincode;
    
    @Size(max = 1000, message = "Business address should not exceed 1000 characters")
    @Column(name = "business_address", length = 1000)
    private String businessAddress;
    
    @Column(name = "logo_path")
    private String logoPath;
    
    @Column(name = "signature_path")
    private String signaturePath;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    // Constructors
    public Company() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public Company(String businessName, String phoneNumber, String gstin, String email, 
                   String businessType, String businessCategory, String state, String pincode, 
                   String businessAddress, User user) {
        this();
        this.businessName = businessName;
        this.phoneNumber = phoneNumber;
        this.gstin = gstin;
        this.email = email;
        this.businessType = businessType;
        this.businessCategory = businessCategory;
        this.state = state;
        this.pincode = pincode;
        this.businessAddress = businessAddress;
        this.user = user;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
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
    
    public String getLogoPath() {
        return logoPath;
    }
    
    public void setLogoPath(String logoPath) {
        this.logoPath = logoPath;
    }
    
    public String getSignaturePath() {
        return signaturePath;
    }
    
    public void setSignaturePath(String signaturePath) {
        this.signaturePath = signaturePath;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
