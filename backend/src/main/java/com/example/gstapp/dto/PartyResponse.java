package com.example.gstapp.dto;

import com.example.gstapp.model.Party;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class PartyResponse {
    private Long id;
    private String name;
    private String phone;
    private String email;
    private String address;
    private String gstNumber;
    private String panNumber;
    private BigDecimal openingBalance;
    private BigDecimal currentBalance;
    private Party.PartyType partyType;
    private Party.BalanceType balanceType;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<PartyTransactionResponse> transactions;

    // Constructors
    public PartyResponse() {}

    public PartyResponse(Party party) {
        this.id = party.getId();
        this.name = party.getName();
        this.phone = party.getPhone();
        this.email = party.getEmail();
        this.address = party.getAddress();
        this.gstNumber = party.getGstNumber();
        this.panNumber = party.getPanNumber();
        this.openingBalance = party.getOpeningBalance();
        this.currentBalance = party.getCurrentBalance();
        this.partyType = party.getPartyType();
        this.balanceType = party.getBalanceType();
        this.isActive = party.getIsActive();
        this.createdAt = party.getCreatedAt();
        this.updatedAt = party.getUpdatedAt();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public BigDecimal getCurrentBalance() {
        return currentBalance;
    }

    public void setCurrentBalance(BigDecimal currentBalance) {
        this.currentBalance = currentBalance;
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

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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

    public List<PartyTransactionResponse> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<PartyTransactionResponse> transactions) {
        this.transactions = transactions;
    }
}
