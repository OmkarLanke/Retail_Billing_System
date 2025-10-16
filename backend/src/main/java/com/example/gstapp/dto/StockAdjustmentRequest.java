package com.example.gstapp.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class StockAdjustmentRequest {
    private Long itemId;
    private String adjustmentType; // "ADD" or "REDUCE"
    private BigDecimal quantity;
    private BigDecimal pricePerUnit;
    private LocalDateTime adjustmentDate;
    private String details;
    private String reason;

    // Constructors
    public StockAdjustmentRequest() {}

    public StockAdjustmentRequest(Long itemId, String adjustmentType, BigDecimal quantity, 
                                 BigDecimal pricePerUnit, LocalDateTime adjustmentDate, 
                                 String details, String reason) {
        this.itemId = itemId;
        this.adjustmentType = adjustmentType;
        this.quantity = quantity;
        this.pricePerUnit = pricePerUnit;
        this.adjustmentDate = adjustmentDate;
        this.details = details;
        this.reason = reason;
    }

    // Getters and Setters
    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public String getAdjustmentType() {
        return adjustmentType;
    }

    public void setAdjustmentType(String adjustmentType) {
        this.adjustmentType = adjustmentType;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPricePerUnit() {
        return pricePerUnit;
    }

    public void setPricePerUnit(BigDecimal pricePerUnit) {
        this.pricePerUnit = pricePerUnit;
    }

    public LocalDateTime getAdjustmentDate() {
        return adjustmentDate;
    }

    public void setAdjustmentDate(LocalDateTime adjustmentDate) {
        this.adjustmentDate = adjustmentDate;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
