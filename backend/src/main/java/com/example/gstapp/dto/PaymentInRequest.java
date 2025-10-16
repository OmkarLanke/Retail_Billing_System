package com.example.gstapp.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentInRequest {
    
    @NotNull(message = "Party ID is required")
    private Long partyId;
    
    @NotBlank(message = "Payment type is required")
    private String paymentType;
    
    private Long bankAccountId; // null for CASH and CHEQUE
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;
    
    private String receiptNumber;
    
    @NotNull(message = "Payment date is required")
    private LocalDateTime paymentDate;
    
    private String description;
    
    // Constructors
    public PaymentInRequest() {}
    
    public PaymentInRequest(Long partyId, String paymentType, Long bankAccountId, 
                           BigDecimal amount, String receiptNumber, LocalDateTime paymentDate, String description) {
        this.partyId = partyId;
        this.paymentType = paymentType;
        this.bankAccountId = bankAccountId;
        this.amount = amount;
        this.receiptNumber = receiptNumber;
        this.paymentDate = paymentDate;
        this.description = description;
    }
    
    // Getters and Setters
    public Long getPartyId() {
        return partyId;
    }
    
    public void setPartyId(Long partyId) {
        this.partyId = partyId;
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
}
