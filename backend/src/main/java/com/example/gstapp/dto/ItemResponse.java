package com.example.gstapp.dto;

import com.example.gstapp.model.ItemType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ItemResponse {
    private Long id;
    private String name;
    private String code;
    private String hsnCode;
    private ItemType itemType;
    private String unit;
    private String category;
    private BigDecimal salePrice;
    private String salePriceType;
    private BigDecimal saleDiscount;
    private String saleDiscountType;
    private BigDecimal purchasePrice;
    private String purchasePriceType;
    private String taxRate;
    private BigDecimal openingQuantity;
    private BigDecimal openingPrice;
    private LocalDateTime openingDate;
    private BigDecimal minStock;
    private String location;
    private String imageUrl;
    private BigDecimal currentQuantity;
    private BigDecimal stockValue;
    private List<ItemTransactionResponse> transactions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public ItemResponse() {}

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

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getHsnCode() {
        return hsnCode;
    }

    public void setHsnCode(String hsnCode) {
        this.hsnCode = hsnCode;
    }

    public ItemType getItemType() {
        return itemType;
    }

    public void setItemType(ItemType itemType) {
        this.itemType = itemType;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getSalePrice() {
        return salePrice;
    }

    public void setSalePrice(BigDecimal salePrice) {
        this.salePrice = salePrice;
    }

    public String getSalePriceType() {
        return salePriceType;
    }

    public void setSalePriceType(String salePriceType) {
        this.salePriceType = salePriceType;
    }

    public BigDecimal getSaleDiscount() {
        return saleDiscount;
    }

    public void setSaleDiscount(BigDecimal saleDiscount) {
        this.saleDiscount = saleDiscount;
    }

    public String getSaleDiscountType() {
        return saleDiscountType;
    }

    public void setSaleDiscountType(String saleDiscountType) {
        this.saleDiscountType = saleDiscountType;
    }

    public BigDecimal getPurchasePrice() {
        return purchasePrice;
    }

    public void setPurchasePrice(BigDecimal purchasePrice) {
        this.purchasePrice = purchasePrice;
    }

    public String getPurchasePriceType() {
        return purchasePriceType;
    }

    public void setPurchasePriceType(String purchasePriceType) {
        this.purchasePriceType = purchasePriceType;
    }

    public String getTaxRate() {
        return taxRate;
    }

    public void setTaxRate(String taxRate) {
        this.taxRate = taxRate;
    }

    public BigDecimal getOpeningQuantity() {
        return openingQuantity;
    }

    public void setOpeningQuantity(BigDecimal openingQuantity) {
        this.openingQuantity = openingQuantity;
    }

    public BigDecimal getOpeningPrice() {
        return openingPrice;
    }

    public void setOpeningPrice(BigDecimal openingPrice) {
        this.openingPrice = openingPrice;
    }

    public LocalDateTime getOpeningDate() {
        return openingDate;
    }

    public void setOpeningDate(LocalDateTime openingDate) {
        this.openingDate = openingDate;
    }

    public BigDecimal getMinStock() {
        return minStock;
    }

    public void setMinStock(BigDecimal minStock) {
        this.minStock = minStock;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public BigDecimal getCurrentQuantity() {
        return currentQuantity;
    }

    public void setCurrentQuantity(BigDecimal currentQuantity) {
        this.currentQuantity = currentQuantity;
    }

    public BigDecimal getStockValue() {
        return stockValue;
    }

    public void setStockValue(BigDecimal stockValue) {
        this.stockValue = stockValue;
    }

    public List<ItemTransactionResponse> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<ItemTransactionResponse> transactions) {
        this.transactions = transactions;
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
