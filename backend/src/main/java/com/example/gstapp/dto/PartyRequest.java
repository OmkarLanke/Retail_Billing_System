package com.example.gstapp.dto;

import com.example.gstapp.model.Party;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;

public class PartyRequest {
    
    @NotBlank(message = "Party name is required")
    private String name;
    
    @Pattern(regexp = "^(|^[0-9]{10})$", message = "Phone number must be 10 digits or empty")
    private String phone;
    
    @Pattern(regexp = "^(|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})$", message = "Invalid email format")
    private String email;
    
    private String address;
    
    @Pattern(regexp = "^(|^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})$", message = "Invalid GST number format")
    private String gstNumber;
    
    @Pattern(regexp = "^(|^[A-Z]{5}[0-9]{4}[A-Z]{1})$", message = "Invalid PAN number format")
    private String panNumber;
    
    private BigDecimal openingBalance = BigDecimal.ZERO;
    
    @NotNull(message = "Party type is required")
    private Party.PartyType partyType;
    
    private Party.BalanceType balanceType = Party.BalanceType.TO_PAY;
    
    // Constructors
    public PartyRequest() {}
    
    public PartyRequest(String name, Party.PartyType partyType) {
        this.name = name;
        this.partyType = partyType;
    }
    
    // Getters and Setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public String getGstNumber() {
        return gstNumber;
    }
    
    public void setGstNumber(String gstNumber) {
        this.gstNumber = gstNumber;
    }
    
    public String getPanNumber() {
        return panNumber;
    }
    
    public void setPanNumber(String panNumber) {
        this.panNumber = panNumber;
    }
    
    public BigDecimal getOpeningBalance() {
        return openingBalance;
    }
    
    public void setOpeningBalance(BigDecimal openingBalance) {
        this.openingBalance = openingBalance;
    }
    
    public Party.PartyType getPartyType() {
        return partyType;
    }
    
    public void setPartyType(Party.PartyType partyType) {
        this.partyType = partyType;
    }
    
    public Party.BalanceType getBalanceType() {
        return balanceType;
    }
    
    public void setBalanceType(Party.BalanceType balanceType) {
        this.balanceType = balanceType;
    }
}
