package com.example.gstapp.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentInResponse {
    
    private Long id;
    private Long partyId;
    private String partyName;
    private String paymentType;
    private Long bankAccountId;
    private String bankAccountName;
    private BigDecimal amount;
    private String receiptNumber;
    private LocalDateTime paymentDate;
    private String description;
    private BigDecimal balanceAfter;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public PaymentInResponse() {}
    
    public PaymentInResponse(Long id, Long partyId, String partyName, String paymentType, 
                            Long bankAccountId, String bankAccountName, BigDecimal amount, 
                            String receiptNumber, LocalDateTime paymentDate, String description, 
                            BigDecimal balanceAfter, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.partyId = partyId;
        this.partyName = partyName;
        this.paymentType = paymentType;
        this.bankAccountId = bankAccountId;
        this.bankAccountName = bankAccountName;
        this.amount = amount;
        this.receiptNumber = receiptNumber;
        this.paymentDate = paymentDate;
        this.description = description;
        this.balanceAfter = balanceAfter;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getPartyId() {
        return partyId;
    }
    
    public void setPartyId(Long partyId) {
        this.partyId = partyId;
    }
    
    public String getPartyName() {
        return partyName;
    }
    
    public void setPartyName(String partyName) {
        this.partyName = partyName;
    }
    
    public String getPaymentType() {
        return paymentType;
    }
    
    public void setPaymentType(String paymentType) {
        this.paymentType = paymentType;
    }
    
    public Long getBankAccountId() {
        return bankAccountId;
    }
    
    public void setBankAccountId(Long bankAccountId) {
        this.bankAccountId = bankAccountId;
    }
    
    public String getBankAccountName() {
        return bankAccountName;
    }
    
    public void setBankAccountName(String bankAccountName) {
        this.bankAccountName = bankAccountName;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public String getReceiptNumber() {
        return receiptNumber;
    }
    
    public void setReceiptNumber(String receiptNumber) {
        this.receiptNumber = receiptNumber;
    }
    
    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }
    
    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public BigDecimal getBalanceAfter() {
        return balanceAfter;
    }
    
    public void setBalanceAfter(BigDecimal balanceAfter) {
        this.balanceAfter = balanceAfter;
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
}
