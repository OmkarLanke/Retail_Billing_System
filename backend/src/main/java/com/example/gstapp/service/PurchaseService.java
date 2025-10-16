package com.example.gstapp.service;

import com.example.gstapp.dto.PurchaseRequest;
import com.example.gstapp.dto.PurchaseResponse;
import com.example.gstapp.dto.PurchaseItemRequest;
import com.example.gstapp.dto.PurchaseItemResponse;
import com.example.gstapp.model.*;
import com.example.gstapp.repository.PurchaseRepository;
import com.example.gstapp.repository.PurchaseItemRepository;
import com.example.gstapp.repository.PartyRepository;
import com.example.gstapp.repository.ItemRepository;
import com.example.gstapp.repository.PartyTransactionRepository;
import com.example.gstapp.repository.ItemTransactionRepository;
import com.example.gstapp.repository.BankAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class PurchaseService {

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private PurchaseItemRepository purchaseItemRepository;

    @Autowired
    private PartyRepository partyRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private PartyService partyService;

    @Autowired
    private CashTransactionService cashTransactionService;

    @Autowired
    private BankTransactionService bankTransactionService;

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @Autowired
    private PartyTransactionRepository partyTransactionRepository;

    @Autowired
    private ItemTransactionRepository itemTransactionRepository;

    public PurchaseResponse createPurchase(Long merchantId, PurchaseRequest request) {
        // Validate party exists
        Party party = partyRepository.findByIdAndMerchantIdAndIsActiveTrue(request.getPartyId(), merchantId)
                .orElseThrow(() -> new RuntimeException("Party not found"));

        // Generate bill number if not provided
        String billNumber = request.getBillNumber();
        if (billNumber == null || billNumber.trim().isEmpty()) {
            billNumber = generateBillNumber(merchantId);
        }

        // Create purchase entity
        Purchase purchase = new Purchase();
        purchase.setMerchantId(merchantId);
        purchase.setBillNumber(billNumber);
        purchase.setBillDate(request.getBillDate() != null ? request.getBillDate() : LocalDateTime.now());
        purchase.setStateOfSupply(request.getStateOfSupply());
        purchase.setPartyId(request.getPartyId());
        purchase.setPhoneNo(request.getPhoneNo());
        purchase.setPaymentType(request.getPaymentType());
        purchase.setRoundOff(request.getRoundOff() != null ? request.getRoundOff() : BigDecimal.ZERO);
        purchase.setPaidAmount(request.getPaidAmount() != null ? request.getPaidAmount() : BigDecimal.ZERO);
        purchase.setDescription(request.getDescription());

        // Process items and calculate totals
        List<PurchaseItem> purchaseItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;

        for (PurchaseItemRequest itemRequest : request.getItems()) {
            if (itemRequest.getItemId() == null || itemRequest.getQuantity() == null || 
                itemRequest.getPricePerUnit() == null) {
                continue; // Skip invalid items
            }

            // Get item details
            Item item = itemRepository.findById(itemRequest.getItemId())
                    .filter(i -> i.getMerchantId().equals(merchantId))
                    .orElseThrow(() -> new RuntimeException("Item not found: " + itemRequest.getItemId()));

            // Create purchase item
            PurchaseItem purchaseItem = new PurchaseItem();
            purchaseItem.setPurchaseId(purchase.getId());
            purchaseItem.setItemId(itemRequest.getItemId());
            purchaseItem.setItemName(itemRequest.getItemName() != null ? itemRequest.getItemName() : item.getName());
            purchaseItem.setQuantity(itemRequest.getQuantity());
            purchaseItem.setUnit(itemRequest.getUnit() != null ? itemRequest.getUnit() : item.getUnit());
            purchaseItem.setPricePerUnit(itemRequest.getPricePerUnit());

            // Calculate discount
            BigDecimal discountPercent = itemRequest.getDiscountPercent() != null ? itemRequest.getDiscountPercent() : BigDecimal.ZERO;
            BigDecimal discountAmount = itemRequest.getDiscountAmount() != null ? itemRequest.getDiscountAmount() : BigDecimal.ZERO;
            
            if (discountPercent.compareTo(BigDecimal.ZERO) > 0) {
                discountAmount = itemRequest.getQuantity()
                        .multiply(itemRequest.getPricePerUnit())
                        .multiply(discountPercent)
                        .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            }

            purchaseItem.setDiscountPercent(discountPercent);
            purchaseItem.setDiscountAmount(discountAmount);

            // Calculate tax
            BigDecimal taxPercent = itemRequest.getTaxPercent() != null ? itemRequest.getTaxPercent() : BigDecimal.ZERO;
            BigDecimal taxAmount = itemRequest.getTaxAmount() != null ? itemRequest.getTaxAmount() : BigDecimal.ZERO;
            
            if (taxPercent.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal taxableAmount = itemRequest.getQuantity()
                        .multiply(itemRequest.getPricePerUnit())
                        .subtract(discountAmount);
                taxAmount = taxableAmount.multiply(taxPercent).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            }

            purchaseItem.setTaxPercent(taxPercent);
            purchaseItem.setTaxAmount(taxAmount);

            // Calculate item amount
            BigDecimal itemAmount = itemRequest.getQuantity()
                    .multiply(itemRequest.getPricePerUnit())
                    .subtract(discountAmount)
                    .add(taxAmount);
            purchaseItem.setAmount(itemAmount);

            purchaseItems.add(purchaseItem);

            // Update totals
            subtotal = subtotal.add(itemRequest.getQuantity().multiply(itemRequest.getPricePerUnit()));
            totalDiscount = totalDiscount.add(discountAmount);
            totalTax = totalTax.add(taxAmount);
        }

        // Set calculated totals
        purchase.setSubtotal(subtotal);
        purchase.setTotalDiscount(totalDiscount);
        purchase.setTotalTax(totalTax);
        purchase.setTotalAmount(subtotal.subtract(totalDiscount).add(totalTax).add(purchase.getRoundOff()));
        
        // Calculate balance and determine status
        BigDecimal balanceAmount = purchase.getTotalAmount().subtract(purchase.getPaidAmount());
        purchase.setBalanceAmount(balanceAmount);
        
        if (balanceAmount.compareTo(BigDecimal.ZERO) <= 0) {
            purchase.setStatus("COMPLETED");
        } else {
            purchase.setStatus("PARTIAL");
        }

        // Save purchase
        purchase = purchaseRepository.save(purchase);

        // Set purchase ID and purchase reference for items and save them
        for (PurchaseItem item : purchaseItems) {
            item.setPurchaseId(purchase.getId());
            item.setPurchase(purchase);
        }
        
        // Save the purchase items explicitly to ensure they are persisted with the correct relationships
        purchaseItems = purchaseItemRepository.saveAll(purchaseItems);
        purchase.setItems(purchaseItems);

        // Update party balance - add the remaining balance amount (what we still owe them)
        // This represents the outstanding amount after the purchase
        partyService.updatePartyBalance(merchantId, party.getId(), balanceAmount, PartyTransaction.TransactionType.PURCHASE);

        // Create party transaction
        createPartyTransaction(merchantId, party.getId(), purchase);

        // Record payment transaction based on payment type
        recordPurchasePaymentTransaction(merchantId, request, purchase, party);

        // Update item stock
        updateItemStock(purchaseItems, merchantId, party);

        return convertToResponse(purchase);
    }

    public List<PurchaseResponse> getPurchasesByMerchant(Long merchantId) {
        List<Purchase> purchases = purchaseRepository.findByMerchantIdOrderByCreatedAtDesc(merchantId);
        System.out.println("Service: Getting all purchases for merchant " + merchantId + " - found " + purchases.size() + " purchases");
        for (Purchase purchase : purchases) {
            System.out.println("Service: Purchase ID " + purchase.getId() + " has bill date: " + purchase.getBillDate() + " and created at: " + purchase.getCreatedAt());
        }
        return purchases.stream().map(this::convertToResponse).toList();
    }

    public List<PurchaseResponse> getPurchasesByDateRange(Long merchantId, LocalDateTime startDate, LocalDateTime endDate) {
        System.out.println("Service: Searching purchases for merchant " + merchantId + " between " + startDate + " and " + endDate);
        
        // Check if it's a same-date scenario
        boolean isSameDate = startDate.toLocalDate().equals(endDate.toLocalDate());
        System.out.println("Service: Is same date scenario: " + isSameDate);
        
        // Use the alternative BETWEEN query for better compatibility
        List<Purchase> purchases = purchaseRepository.findByMerchantIdAndBillDateBetweenAlt(merchantId, startDate, endDate);
        System.out.println("Service: Repository returned " + purchases.size() + " purchases");
        
        // Debug: Print bill dates of found purchases
        for (Purchase purchase : purchases) {
            System.out.println("Service: Purchase ID " + purchase.getId() + " has bill date: " + purchase.getBillDate() + " (matches range: " + 
                (purchase.getBillDate().isAfter(startDate.minusNanos(1)) && purchase.getBillDate().isBefore(endDate.plusNanos(1))) + ")");
        }
        
        return purchases.stream().map(this::convertToResponse).toList();
    }

    public PurchaseResponse getPurchaseById(Long merchantId, Long purchaseId) {
        Purchase purchase = purchaseRepository.findById(purchaseId)
                .orElseThrow(() -> new RuntimeException("Purchase not found"));
        
        if (!purchase.getMerchantId().equals(merchantId)) {
            throw new RuntimeException("Purchase not found");
        }

        return convertToResponse(purchase);
    }

    public void deletePurchase(Long merchantId, Long purchaseId) {
        Purchase purchase = purchaseRepository.findById(purchaseId)
                .orElseThrow(() -> new RuntimeException("Purchase not found"));
        
        if (!purchase.getMerchantId().equals(merchantId)) {
            throw new RuntimeException("Purchase not found");
        }

        // Reverse party balance
        partyService.updatePartyBalance(merchantId, purchase.getPartyId(), purchase.getTotalAmount().negate(), PartyTransaction.TransactionType.PURCHASE);

        // Reverse item stock
        reverseItemStock(purchase.getItems(), merchantId);

        purchaseRepository.delete(purchase);
    }

    private String generateBillNumber(Long merchantId) {
        Long count = purchaseRepository.countByMerchantId(merchantId);
        return "PUR-" + String.format("%06d", count + 1);
    }


    private void createPartyTransaction(Long merchantId, Long partyId, Purchase purchase) {
        PartyTransaction transaction = new PartyTransaction();
        transaction.setMerchantId(merchantId);
        transaction.setPartyId(partyId);
        transaction.setTransactionType(PartyTransaction.TransactionType.PURCHASE);
        transaction.setTransactionNumber(purchase.getBillNumber());
        transaction.setAmount(purchase.getTotalAmount());
        transaction.setDescription("Purchase - " + purchase.getBillNumber());
        transaction.setTransactionDate(purchase.getBillDate());
        transaction.setPurchaseId(purchase.getId());
        transaction.setPurchase(purchase);
        
        partyTransactionRepository.save(transaction);
    }

    private void recordPurchasePaymentTransaction(Long merchantId, PurchaseRequest request, Purchase purchase, Party party) {
        if (request.getPaidAmount() == null || request.getPaidAmount().compareTo(BigDecimal.ZERO) <= 0) {
            // No payment made, skip transaction recording
            return;
        }

        String description = "Purchase from " + party.getName() + " - " + purchase.getBillNumber();
        
        if ("Cash".equals(request.getPaymentType()) || "CASH".equals(request.getPaymentType())) {
            // Record cash transaction (money going out for purchase)
            System.out.println("Recording cash transaction for purchase: " + request.getPaidAmount());
            cashTransactionService.createCashTransaction(
                merchantId,
                CashTransaction.TransactionType.OUT,
                request.getPaidAmount(),
                description,
                purchase.getBillNumber(),
                purchase.getBillDate()
            );
        } else if ("Cheque".equals(request.getPaymentType()) || "CHEQUE".equals(request.getPaymentType())) {
            // For cheque, we might record it differently or not at all
            // This depends on your business logic
            System.out.println("Cheque payment for purchase recorded: " + request.getPaidAmount());
        } else {
            // Check if it's a bank account payment type
            // The payment type might be the bank account name
            BankAccount bankAccount = bankAccountRepository.findByMerchantIdAndAccountDisplayName(merchantId, request.getPaymentType())
                .orElse(bankAccountRepository.findByMerchantIdAndBankName(merchantId, request.getPaymentType()).orElse(null));
            
            if (bankAccount != null) {
                // Record bank transaction (money going out for purchase)
                System.out.println("Recording bank transaction for purchase: " + bankAccount.getAccountDisplayName() + ", amount: " + request.getPaidAmount());
                
                // Calculate new balance after withdrawal
                BigDecimal currentBalance = bankAccount.getCurrentBalance() != null ? bankAccount.getCurrentBalance() : BigDecimal.ZERO;
                BigDecimal newBalance = currentBalance.subtract(request.getPaidAmount());
                
                // Update bank account balance
                bankAccount.setCurrentBalance(newBalance);
                bankAccountRepository.save(bankAccount);
                
                bankTransactionService.createBankTransaction(
                    merchantId,
                    bankAccount.getId(),
                    BankTransaction.TransactionType.WITHDRAWAL,
                    request.getPaidAmount(),
                    description,
                    purchase.getBillNumber(),
                    newBalance,
                    purchase.getBillDate()
                );
            } else {
                System.out.println("Unknown payment type for purchase: " + request.getPaymentType());
            }
        }
    }

    private void updateItemStock(List<PurchaseItem> items, Long merchantId, Party party) {
        for (PurchaseItem item : items) {
            Item itemEntity = itemRepository.findById(item.getItemId())
                    .filter(i -> i.getMerchantId().equals(merchantId))
                    .orElseThrow(() -> new RuntimeException("Item not found: " + item.getItemId()));

            // Update current stock (total stock including opening + purchases)
            Integer currentStock = itemEntity.getCurrentStock() != null ? itemEntity.getCurrentStock() : 0;
            Integer newStock = currentStock + item.getQuantity().intValue();
            itemEntity.setCurrentStock(newStock);
            itemRepository.save(itemEntity);

            // Create item transaction for purchase (separate from opening stock)
            createItemTransaction(merchantId, item, "PURCHASE", party);
        }
    }

    private void reverseItemStock(List<PurchaseItem> items, Long merchantId) {
        for (PurchaseItem item : items) {
            Item itemEntity = itemRepository.findById(item.getItemId())
                    .filter(i -> i.getMerchantId().equals(merchantId))
                    .orElseThrow(() -> new RuntimeException("Item not found: " + item.getItemId()));

            // Update current stock (reduce by the reversed quantity)
            Integer currentStock = itemEntity.getCurrentStock() != null ? itemEntity.getCurrentStock() : 0;
            Integer newStock = currentStock - item.getQuantity().intValue();
            itemEntity.setCurrentStock(newStock);
            itemRepository.save(itemEntity);

            // Create item transaction - for reversal, we need to get the party from the purchase
            // Since this is a reversal, the purchase relationship should be properly set
            Party party = item.getPurchase().getParty();
            createItemTransaction(merchantId, item, "PURCHASE_REVERSAL", party);
        }
    }

    private void createItemTransaction(Long merchantId, PurchaseItem item, String transactionType, Party party) {
        ItemTransaction itemTransaction = new ItemTransaction();
        itemTransaction.setItemId(item.getItemId());
        
        // Set transaction type based on the parameter
        if ("PURCHASE".equals(transactionType)) {
            itemTransaction.setTransactionType(ItemTransactionType.PURCHASE);
        } else if ("PURCHASE_REVERSAL".equals(transactionType)) {
            itemTransaction.setTransactionType(ItemTransactionType.RETURN_PURCHASE);
        } else {
            itemTransaction.setTransactionType(ItemTransactionType.PURCHASE); // Default fallback
        }
        
        itemTransaction.setInvoiceRef(item.getPurchase().getBillNumber());
        itemTransaction.setPartyName(party.getName());
        itemTransaction.setQuantity(item.getQuantity());
        itemTransaction.setPricePerUnit(item.getPricePerUnit());
        itemTransaction.setTotalAmount(item.getAmount());
        itemTransaction.setStatus(item.getPurchase().getStatus());
        itemTransaction.setTransactionDate(LocalDateTime.now());
        itemTransaction.setMerchantId(merchantId);

        itemTransactionRepository.save(itemTransaction);
    }

    private PurchaseResponse convertToResponse(Purchase purchase) {
        PurchaseResponse response = new PurchaseResponse();
        response.setId(purchase.getId());
        response.setBillNumber(purchase.getBillNumber());
        response.setBillDate(purchase.getBillDate());
        response.setStateOfSupply(purchase.getStateOfSupply());
        response.setPartyId(purchase.getPartyId());
        response.setPartyName(purchase.getParty() != null ? purchase.getParty().getName() : null);
        response.setPhoneNo(purchase.getPhoneNo());
        response.setPaymentType(purchase.getPaymentType());
        response.setRoundOff(purchase.getRoundOff());
        response.setSubtotal(purchase.getSubtotal());
        response.setTotalDiscount(purchase.getTotalDiscount());
        response.setTotalTax(purchase.getTotalTax());
        response.setTotalAmount(purchase.getTotalAmount());
        response.setPaidAmount(purchase.getPaidAmount());
        response.setBalanceAmount(purchase.getBalanceAmount());
        response.setStatus(purchase.getStatus());
        response.setDescription(purchase.getDescription());
        response.setCreatedAt(purchase.getCreatedAt());
        response.setUpdatedAt(purchase.getUpdatedAt());

        // Convert items
        if (purchase.getItems() != null) {
            List<PurchaseItemResponse> itemResponses = purchase.getItems().stream()
                    .map(this::convertItemToResponse)
                    .toList();
            response.setItems(itemResponses);
        }

        return response;
    }

    private PurchaseItemResponse convertItemToResponse(PurchaseItem item) {
        PurchaseItemResponse response = new PurchaseItemResponse();
        response.setId(item.getId());
        response.setItemId(item.getItemId());
        response.setItemName(item.getItemName());
        response.setQuantity(item.getQuantity());
        response.setUnit(item.getUnit());
        response.setPricePerUnit(item.getPricePerUnit());
        response.setDiscountPercent(item.getDiscountPercent());
        response.setDiscountAmount(item.getDiscountAmount());
        response.setTaxPercent(item.getTaxPercent());
        response.setTaxAmount(item.getTaxAmount());
        response.setAmount(item.getAmount());
        return response;
    }
}
