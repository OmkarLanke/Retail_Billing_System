package com.example.gstapp.service;

import com.example.gstapp.dto.*;
import com.example.gstapp.model.*;
import com.example.gstapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private ItemTransactionRepository itemTransactionRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UnitRepository unitRepository;

    // Item CRUD Operations
    public ItemResponse createItem(ItemRequest request, Long merchantId) {
        // Check if code already exists (only if code is provided)
        if (request.getCode() != null && !request.getCode().trim().isEmpty()) {
            System.out.println("Checking code uniqueness for merchant: " + merchantId + ", code: " + request.getCode());
            if (itemRepository.findByMerchantIdAndCode(merchantId, request.getCode()).isPresent()) {
                System.out.println("Code already exists for this merchant: " + request.getCode());
                throw new RuntimeException("Item code already exists");
            }
            System.out.println("Code is unique for this merchant: " + request.getCode());
        } else {
            System.out.println("No code provided, proceeding without code");
        }

        Item item = new Item();
        mapRequestToItem(request, item);
        item.setMerchantId(merchantId);
        item.setCreatedAt(LocalDateTime.now());
        item.setUpdatedAt(LocalDateTime.now());

        try {
            Item savedItem = itemRepository.save(item);
            System.out.println("Item saved successfully with ID: " + savedItem.getId());
            
            // Create opening stock transaction if opening quantity is provided
            if (request.getOpeningQuantity() != null && request.getOpeningQuantity().compareTo(BigDecimal.ZERO) > 0) {
                createOpeningStockTransaction(savedItem, request.getOpeningQuantity(), request.getOpeningPrice(), request.getOpeningDate());
            }

            return mapItemToResponse(savedItem);
        } catch (Exception e) {
            System.out.println("Error saving item: " + e.getMessage());
            if (e.getMessage().contains("unique") || e.getMessage().contains("duplicate")) {
                throw new RuntimeException("Item code already exists for this merchant");
            }
            throw new RuntimeException("Failed to save item: " + e.getMessage());
        }
    }

    public List<ItemResponse> getAllItems(Long merchantId) {
        List<Item> items = itemRepository.findByMerchantId(merchantId);
        return items.stream()
                .map(this::mapItemToResponse)
                .collect(Collectors.toList());
    }

    public List<ItemResponse> getItemsByType(Long merchantId, ItemType itemType) {
        List<Item> items = itemRepository.findByMerchantIdAndItemType(merchantId, itemType);
        return items.stream()
                .map(this::mapItemToResponse)
                .collect(Collectors.toList());
    }

    public ItemResponse getItemById(Long itemId, Long merchantId) {
        Optional<Item> item = itemRepository.findById(itemId);
        if (item.isPresent() && item.get().getMerchantId().equals(merchantId)) {
            return mapItemToResponseWithTransactions(item.get());
        }
        throw new RuntimeException("Item not found");
    }

    public ItemResponse updateItem(Long itemId, ItemRequest request, Long merchantId) {
        Optional<Item> itemOpt = itemRepository.findById(itemId);
        if (!itemOpt.isPresent() || !itemOpt.get().getMerchantId().equals(merchantId)) {
            throw new RuntimeException("Item not found");
        }

        Item item = itemOpt.get();
        
        // Store old opening quantity for comparison
        BigDecimal oldOpeningQuantity = item.getOpeningQuantity();
        
        mapRequestToItem(request, item);
        item.setUpdatedAt(LocalDateTime.now());

        Item savedItem = itemRepository.save(item);
        
        // Handle opening quantity change
        if (request.getOpeningQuantity() != null && 
            !request.getOpeningQuantity().equals(oldOpeningQuantity)) {
            
            // Calculate the difference
            BigDecimal oldQty = oldOpeningQuantity != null ? oldOpeningQuantity : BigDecimal.ZERO;
            BigDecimal newQty = request.getOpeningQuantity();
            BigDecimal difference = newQty.subtract(oldQty);
            
            System.out.println("Opening quantity change detected:");
            System.out.println("  - Old quantity: " + oldQty);
            System.out.println("  - New quantity: " + newQty);
            System.out.println("  - Difference: " + difference);
            
            if (difference.compareTo(BigDecimal.ZERO) != 0) {
                // Create adjustment transaction for the difference
                ItemTransaction adjustmentTransaction = new ItemTransaction();
                adjustmentTransaction.setItemId(item.getId());
                adjustmentTransaction.setTransactionType(ItemTransactionType.ADJUSTMENT);
                adjustmentTransaction.setInvoiceRef(null);
                adjustmentTransaction.setPartyName("Opening Stock Update");
                adjustmentTransaction.setQuantity(difference);
                adjustmentTransaction.setPricePerUnit(request.getOpeningPrice() != null ? request.getOpeningPrice() : BigDecimal.ZERO);
                adjustmentTransaction.setTotalAmount(difference.multiply(adjustmentTransaction.getPricePerUnit()));
                adjustmentTransaction.setStatus("Completed");
                adjustmentTransaction.setAdjustmentType(difference.compareTo(BigDecimal.ZERO) > 0 ? "ADD" : "REDUCE");
                adjustmentTransaction.setTransactionDate(LocalDateTime.now());
                adjustmentTransaction.setMerchantId(merchantId);
                adjustmentTransaction.setCreatedAt(LocalDateTime.now());
                
                ItemTransaction savedTransaction = itemTransactionRepository.save(adjustmentTransaction);
                System.out.println("Created adjustment transaction: " + savedTransaction.getId());
                
                // Update current stock to reflect the opening stock adjustment
                Integer currentStock = item.getCurrentStock() != null ? item.getCurrentStock() : 0;
                Integer newStock = currentStock + difference.intValue();
                item.setCurrentStock(newStock);
                itemRepository.save(item);
            }
        }
        
        return mapItemToResponseWithTransactions(savedItem);
    }

    public void deleteItem(Long itemId, Long merchantId) {
        Optional<Item> item = itemRepository.findById(itemId);
        if (item.isPresent() && item.get().getMerchantId().equals(merchantId)) {
            itemRepository.delete(item.get());
        } else {
            throw new RuntimeException("Item not found");
        }
    }

    public List<ItemResponse> searchItems(Long merchantId, String searchTerm) {
        List<Item> items = itemRepository.searchItems(merchantId, searchTerm);
        return items.stream()
                .map(this::mapItemToResponse)
                .collect(Collectors.toList());
    }

    // Stock Adjustment Operations
    public ItemResponse adjustStock(StockAdjustmentRequest request, Long merchantId) {
        Optional<Item> itemOpt = itemRepository.findById(request.getItemId());
        if (!itemOpt.isPresent() || !itemOpt.get().getMerchantId().equals(merchantId)) {
            throw new RuntimeException("Item not found");
        }

        Item item = itemOpt.get();
        
        // Validate adjustment type
        if (!"ADD".equals(request.getAdjustmentType()) && !"REDUCE".equals(request.getAdjustmentType())) {
            throw new RuntimeException("Invalid adjustment type. Must be 'ADD' or 'REDUCE'");
        }

        // Calculate quantity change (positive for ADD, negative for REDUCE)
        BigDecimal quantityChange = "ADD".equals(request.getAdjustmentType()) ? 
            request.getQuantity() : request.getQuantity().negate();

        // Create transaction record
        ItemTransaction transaction = new ItemTransaction();
        transaction.setItemId(item.getId());
        transaction.setTransactionType(ItemTransactionType.ADJUSTMENT);
        transaction.setInvoiceRef(null); // No invoice reference for adjustments
        transaction.setPartyName("System Adjustment");
        transaction.setQuantity(quantityChange);
        transaction.setPricePerUnit(request.getPricePerUnit()); // Can be null
        // Calculate total amount only if price per unit is provided, otherwise set to 0
        if (request.getPricePerUnit() != null) {
            transaction.setTotalAmount(quantityChange.multiply(request.getPricePerUnit()));
        } else {
            transaction.setTotalAmount(BigDecimal.ZERO);
        }
        transaction.setStatus("Completed");
        transaction.setAdjustmentType(request.getAdjustmentType()); // Set ADD or REDUCE
        transaction.setTransactionDate(request.getAdjustmentDate() != null ? 
            request.getAdjustmentDate() : LocalDateTime.now());
        transaction.setMerchantId(merchantId);
        transaction.setCreatedAt(LocalDateTime.now());

        // Save transaction
        itemTransactionRepository.save(transaction);

        // Update item's current stock to reflect the adjustment
        Integer currentStock = item.getCurrentStock() != null ? item.getCurrentStock() : 0;
        Integer newStock = currentStock + quantityChange.intValue();
        item.setCurrentStock(newStock);
        item.setUpdatedAt(LocalDateTime.now());
        itemRepository.save(item);
        
        System.out.println("Stock adjustment completed:");
        System.out.println("  - Item ID: " + item.getId());
        System.out.println("  - Adjustment Type: " + request.getAdjustmentType());
        System.out.println("  - Quantity Change: " + quantityChange);
        System.out.println("  - Old Stock: " + currentStock);
        System.out.println("  - New Stock: " + newStock);

        // Return updated item with transactions
        return mapItemToResponseWithTransactions(item);
    }

    public List<ItemTransactionResponse> getItemAdjustments(Long itemId, Long merchantId) {
        List<ItemTransaction> transactions = itemTransactionRepository
            .findByItemIdAndMerchantIdAndTransactionType(itemId, merchantId, ItemTransactionType.ADJUSTMENT);
        return transactions.stream()
                .map(this::mapTransactionToResponse)
                .collect(Collectors.toList());
    }

    // Category Operations
    public CategoryResponse createCategory(CategoryRequest request, Long merchantId) {
        // Check if category already exists
        if (categoryRepository.findByMerchantIdAndName(merchantId, request.getName()).isPresent()) {
            throw new RuntimeException("Category already exists");
        }

        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setMerchantId(merchantId);
        category.setCreatedAt(LocalDateTime.now());
        category.setUpdatedAt(LocalDateTime.now());

        Category savedCategory = categoryRepository.save(category);
        return mapCategoryToResponse(savedCategory);
    }

    public List<CategoryResponse> getAllCategories(Long merchantId) {
        List<Category> categories = categoryRepository.findByMerchantId(merchantId);
        return categories.stream()
                .map(this::mapCategoryToResponse)
                .collect(Collectors.toList());
    }

    // Unit Operations
    public Unit createUnit(String name, String shortName, Long merchantId) {
        // Check if unit already exists
        if (unitRepository.findByMerchantIdAndName(merchantId, name).isPresent()) {
            throw new RuntimeException("Unit already exists");
        }

        Unit unit = new Unit();
        unit.setName(name);
        unit.setShortName(shortName);
        unit.setMerchantId(merchantId);
        unit.setCreatedAt(LocalDateTime.now());
        unit.setUpdatedAt(LocalDateTime.now());

        return unitRepository.save(unit);
    }

    public List<Unit> getAllUnits(Long merchantId) {
        return unitRepository.findByMerchantId(merchantId);
    }

    // Transaction Operations
    public List<ItemTransactionResponse> getItemTransactions(Long itemId, Long merchantId) {
        List<ItemTransaction> transactions = itemTransactionRepository.findByItemIdAndMerchantIdOrderByTransactionDateDesc(itemId, merchantId);
        return transactions.stream()
                .map(this::mapTransactionToResponse)
                .collect(Collectors.toList());
    }

    // Helper Methods

    private void createOpeningStockTransaction(Item item, BigDecimal quantity, BigDecimal price, LocalDateTime date) {
        ItemTransaction transaction = new ItemTransaction();
        transaction.setItemId(item.getId());
        transaction.setTransactionType(ItemTransactionType.OPENING_STOCK);
        transaction.setPartyName("Opening Stock");
        transaction.setQuantity(quantity);
        transaction.setPricePerUnit(price);
        transaction.setTotalAmount(quantity.multiply(price != null ? price : BigDecimal.ZERO));
        transaction.setStatus("-");
        transaction.setTransactionDate(date != null ? date : LocalDateTime.now());
        transaction.setMerchantId(item.getMerchantId());
        transaction.setCreatedAt(LocalDateTime.now());

        itemTransactionRepository.save(transaction);
        
        // Update current stock to include opening stock
        Integer currentStock = item.getCurrentStock() != null ? item.getCurrentStock() : 0;
        Integer newStock = currentStock + quantity.intValue();
        item.setCurrentStock(newStock);
        itemRepository.save(item);
    }

    private void mapRequestToItem(ItemRequest request, Item item) {
        item.setName(request.getName());
        item.setCode(request.getCode());
        item.setHsnCode(request.getHsnCode());
        item.setItemType(request.getItemType());
        item.setUnit(request.getUnit());
        item.setCategory(request.getCategory());
        item.setSalePrice(request.getSalePrice());
        item.setSalePriceType(request.getSalePriceType());
        item.setSaleDiscount(request.getSaleDiscount());
        item.setSaleDiscountType(request.getSaleDiscountType());
        item.setPurchasePrice(request.getPurchasePrice());
        item.setPurchasePriceType(request.getPurchasePriceType());
        item.setTaxRate(request.getTaxRate());
        item.setOpeningQuantity(request.getOpeningQuantity());
        item.setOpeningPrice(request.getOpeningPrice());
        item.setOpeningDate(request.getOpeningDate());
        item.setMinStock(request.getMinStock());
        item.setLocation(request.getLocation());
        item.setImageUrl(request.getImageUrl());
    }

    private ItemResponse mapItemToResponse(Item item) {
        ItemResponse response = new ItemResponse();
        response.setId(item.getId());
        response.setName(item.getName());
        response.setCode(item.getCode());
        response.setHsnCode(item.getHsnCode());
        response.setItemType(item.getItemType());
        response.setUnit(item.getUnit());
        response.setCategory(item.getCategory());
        response.setSalePrice(item.getSalePrice());
        response.setSalePriceType(item.getSalePriceType());
        response.setSaleDiscount(item.getSaleDiscount());
        response.setSaleDiscountType(item.getSaleDiscountType());
        response.setPurchasePrice(item.getPurchasePrice());
        response.setPurchasePriceType(item.getPurchasePriceType());
        response.setTaxRate(item.getTaxRate());
        response.setOpeningQuantity(item.getOpeningQuantity());
        response.setOpeningPrice(item.getOpeningPrice());
        response.setOpeningDate(item.getOpeningDate());
        response.setMinStock(item.getMinStock());
        response.setLocation(item.getLocation());
        response.setImageUrl(item.getImageUrl());
        response.setCreatedAt(item.getCreatedAt());
        response.setUpdatedAt(item.getUpdatedAt());

        // Calculate current quantity and stock value
        BigDecimal currentQuantity = calculateCurrentQuantity(item.getId(), item.getMerchantId());
        response.setCurrentQuantity(currentQuantity);
        
        // Calculate stock value using purchase price (or sale price as fallback)
        BigDecimal priceForStockValue = item.getPurchasePrice() != null ? item.getPurchasePrice() : 
                                       (item.getSalePrice() != null ? item.getSalePrice() : BigDecimal.ZERO);
        response.setStockValue(currentQuantity.multiply(priceForStockValue));

        return response;
    }

    private ItemResponse mapItemToResponseWithTransactions(Item item) {
        ItemResponse response = mapItemToResponse(item);
        List<ItemTransactionResponse> transactions = getItemTransactions(item.getId(), item.getMerchantId());
        response.setTransactions(transactions);
        return response;
    }

    private BigDecimal calculateCurrentQuantity(Long itemId, Long merchantId) {
        // Get the item to access current stock
        Optional<Item> itemOpt = itemRepository.findById(itemId);
        if (itemOpt.isPresent() && itemOpt.get().getMerchantId().equals(merchantId)) {
            Item item = itemOpt.get();
            Integer currentStock = item.getCurrentStock() != null ? item.getCurrentStock() : 0;
            System.out.println("Current stock for item " + itemId + ": " + currentStock);
            return new BigDecimal(currentStock);
        }
        System.out.println("Item not found for calculating current quantity: " + itemId);
        return BigDecimal.ZERO;
    }

    private ItemTransactionResponse mapTransactionToResponse(ItemTransaction transaction) {
        System.out.println("Mapping transaction to response:");
        System.out.println("  Transaction ID: " + transaction.getId());
        System.out.println("  Transaction Type: " + transaction.getTransactionType());
        System.out.println("  Invoice Ref: " + transaction.getInvoiceRef());
        System.out.println("  Party Name: " + transaction.getPartyName());
        System.out.println("  Quantity: " + transaction.getQuantity());
        System.out.println("  Price Per Unit: " + transaction.getPricePerUnit());
        System.out.println("  Total Amount: " + transaction.getTotalAmount());
        System.out.println("  Status: " + transaction.getStatus());
        
        ItemTransactionResponse response = new ItemTransactionResponse();
        response.setId(transaction.getId());
        response.setItemId(transaction.getItemId());
        response.setTransactionType(transaction.getTransactionType());
        response.setInvoiceRef(transaction.getInvoiceRef());
        response.setPartyName(transaction.getPartyName());
        response.setQuantity(transaction.getQuantity());
        response.setPricePerUnit(transaction.getPricePerUnit());
        response.setTotalAmount(transaction.getTotalAmount());
        response.setStatus(transaction.getStatus());
        response.setAdjustmentType(transaction.getAdjustmentType());
        response.setTransactionDate(transaction.getTransactionDate());
        response.setCreatedAt(transaction.getCreatedAt());
        return response;
    }

    private CategoryResponse mapCategoryToResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setDescription(category.getDescription());
        response.setCreatedAt(category.getCreatedAt());
        response.setUpdatedAt(category.getUpdatedAt());
        return response;
    }
}
