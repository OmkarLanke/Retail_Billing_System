package com.example.gstapp.dto;

import com.example.gstapp.model.PartyTransaction;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PartyTransactionResponse {
    private Long id;
    private Long partyId;
    private PartyTransaction.TransactionType transactionType;
    private String transactionNumber;
    private BigDecimal amount;
    private String description;
    private String referenceNumber;
    private LocalDateTime transactionDate;
    private BigDecimal balanceAfter;
    private BigDecimal purchaseBalance; // Remaining balance of the purchase
    private BigDecimal saleBalance; // Remaining balance of the specific sale
    private LocalDateTime createdAt;

    // Constructors
    public PartyTransactionResponse() {}

    public PartyTransactionResponse(PartyTransaction transaction) {
        this.id = transaction.getId();
        this.partyId = transaction.getPartyId();
        this.transactionType = transaction.getTransactionType();
        this.transactionNumber = transaction.getTransactionNumber();
        this.amount = transaction.getAmount();
        this.description = transaction.getDescription();
        this.referenceNumber = transaction.getReferenceNumber();
        this.transactionDate = transaction.getTransactionDate();
        this.balanceAfter = transaction.getBalanceAfter();
        this.purchaseBalance = transaction.getPurchase() != null ? transaction.getPurchase().getBalanceAmount() : null;
        this.saleBalance = transaction.getSaleBalance();
        this.createdAt = transaction.getCreatedAt();
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

    public PartyTransaction.TransactionType getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(PartyTransaction.TransactionType transactionType) {
        this.transactionType = transactionType;
    }

    public String getTransactionNumber() {
        return transactionNumber;
    }

    public void setTransactionNumber(String transactionNumber) {
        this.transactionNumber = transactionNumber;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }

    public BigDecimal getBalanceAfter() {
        return balanceAfter;
    }

    public void setBalanceAfter(BigDecimal balanceAfter) {
        this.balanceAfter = balanceAfter;
    }

    public BigDecimal getPurchaseBalance() {
        return purchaseBalance;
    }

    public void setPurchaseBalance(BigDecimal purchaseBalance) {
        this.purchaseBalance = purchaseBalance;
    }

    public BigDecimal getSaleBalance() {
        return saleBalance;
    }

    public void setSaleBalance(BigDecimal saleBalance) {
        this.saleBalance = saleBalance;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
