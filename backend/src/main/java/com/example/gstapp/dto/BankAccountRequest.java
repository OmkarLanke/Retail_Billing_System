package com.example.gstapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public class BankAccountRequest {
    
    @NotBlank(message = "Account display name is required")
    private String accountDisplayName;
    
    @NotNull(message = "Opening balance is required")
    @PositiveOrZero(message = "Opening balance must be positive or zero")
    private BigDecimal openingBalance;
    
    private String asOfDate;
    
    private Boolean printUpiQr = false;
    
    private Boolean printBankDetails = false;
    
    private String bankName;
    
    private String accountNumber;
    
    private String ifscCode;
    
    private String accountHolderName;
    
    private String branchName;
    
    private String accountType;

    // Constructors
    public BankAccountRequest() {}

    public BankAccountRequest(String accountDisplayName, BigDecimal openingBalance, String asOfDate,
                             Boolean printUpiQr, Boolean printBankDetails, String bankName, 
                             String accountNumber, String ifscCode, String accountHolderName, 
                             String branchName, String accountType) {
        this.accountDisplayName = accountDisplayName;
        this.openingBalance = openingBalance;
        this.asOfDate = asOfDate;
        this.printUpiQr = printUpiQr;
        this.printBankDetails = printBankDetails;
        this.bankName = bankName;
        this.accountNumber = accountNumber;
        this.ifscCode = ifscCode;
        this.accountHolderName = accountHolderName;
        this.branchName = branchName;
        this.accountType = accountType;
    }

    // Getters and Setters
    public String getAccountDisplayName() {
        return accountDisplayName;
    }

    public void setAccountDisplayName(String accountDisplayName) {
        this.accountDisplayName = accountDisplayName;
    }

    public BigDecimal getOpeningBalance() {
        return openingBalance;
    }

    public void setOpeningBalance(BigDecimal openingBalance) {
        this.openingBalance = openingBalance;
    }

    public String getAsOfDate() {
        return asOfDate;
    }

    public void setAsOfDate(String asOfDate) {
        this.asOfDate = asOfDate;
    }

    public Boolean getPrintUpiQr() {
        return printUpiQr;
    }

    public void setPrintUpiQr(Boolean printUpiQr) {
        this.printUpiQr = printUpiQr;
    }

    public Boolean getPrintBankDetails() {
        return printBankDetails;
    }

    public void setPrintBankDetails(Boolean printBankDetails) {
        this.printBankDetails = printBankDetails;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getIfscCode() {
        return ifscCode;
    }

    public void setIfscCode(String ifscCode) {
        this.ifscCode = ifscCode;
    }

    public String getAccountHolderName() {
        return accountHolderName;
    }

    public void setAccountHolderName(String accountHolderName) {
        this.accountHolderName = accountHolderName;
    }

    public String getBranchName() {
        return branchName;
    }

    public void setBranchName(String branchName) {
        this.branchName = branchName;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }
}
