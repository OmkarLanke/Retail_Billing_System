package com.example.gstapp.service;

import com.example.gstapp.dto.SaleRequest;
import com.example.gstapp.dto.SaleResponse;
import com.example.gstapp.model.*;
import com.example.gstapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SaleService {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private SaleItemRepository saleItemRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private PartyRepository partyRepository;

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @Autowired
    private ItemTransactionService itemTransactionService;

    @Autowired
    private PartyTransactionService partyTransactionService;

    @Autowired
    private BankTransactionService bankTransactionService;

    @Autowired
    private CashTransactionService cashTransactionService;

    public List<SaleResponse> getAllSales(User user) {
        List<Sale> sales = saleRepository.findByUserOrderByInvoiceDateDescIdDesc(user);
        return sales.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public List<SaleResponse> getSalesByDateRange(User user, LocalDate startDate, LocalDate endDate) {
        List<Sale> sales = saleRepository.findByUserAndInvoiceDateBetweenOrderByInvoiceDateDescIdDesc(
            user, startDate, endDate);
        return sales.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public SaleResponse getSaleById(Long id, User user) {
        Sale sale = saleRepository.findByIdAndUserWithItems(id, user)
            .orElseThrow(() -> new RuntimeException("Sale not found"));
        return convertToResponseWithItems(sale);
    }

    public SaleResponse createSale(SaleRequest request, User user) {
        System.out.println("Creating sale for user: " + user.getUsername() + " (ID: " + user.getId() + ")");
        System.out.println("Request invoice number: " + request.getInvoiceNumber());
        
        // Generate invoice number if not provided
        if (request.getInvoiceNumber() == null || request.getInvoiceNumber().isEmpty()) {
            System.out.println("Invoice number is empty, generating new one...");
            try {
                String generatedInvoiceNumber = generateInvoiceNumber(user);
                request.setInvoiceNumber(generatedInvoiceNumber);
                System.out.println("Generated invoice number: " + generatedInvoiceNumber);
            } catch (Exception e) {
                System.err.println("Error generating invoice number: " + e.getMessage());
                e.printStackTrace();
                throw new RuntimeException("Failed to generate invoice number: " + e.getMessage());
            }
        } else {
            System.out.println("Using provided invoice number: " + request.getInvoiceNumber());
            // Check if invoice number already exists
            if (saleRepository.existsByInvoiceNumberAndUser(request.getInvoiceNumber(), user)) {
                throw new RuntimeException("Invoice number already exists");
            }
        }

        // Create sale entity
        Sale sale = new Sale();
        sale.setInvoiceNumber(request.getInvoiceNumber());
        sale.setInvoiceDate(request.getInvoiceDate() != null ? request.getInvoiceDate() : LocalDate.now());
        sale.setBillingName(request.getBillingName());
        sale.setBillingAddress(request.getBillingAddress());
        sale.setPhoneNumber(request.getPhoneNumber());
        sale.setSaleType(request.getSaleType());
        sale.setPaymentType(request.getPaymentType());
        sale.setDescription(request.getDescription());
        sale.setAttachmentUrl(request.getAttachmentUrl());
        sale.setUser(user);

        // Set party if provided
        if (request.getPartyId() != null) {
            Party party = partyRepository.findByIdAndUser(request.getPartyId(), user)
                .orElseThrow(() -> new RuntimeException("Party not found"));
            sale.setParty(party);
        }

        // Set bank account if provided
        if (request.getBankAccountId() != null) {
            BankAccount bankAccount = bankAccountRepository.findByIdAndUser(request.getBankAccountId(), user)
                .orElseThrow(() -> new RuntimeException("Bank account not found"));
            sale.setBankAccount(bankAccount);
        }

        // Calculate totals
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;

        // Process sale items
        List<SaleItem> saleItems = new ArrayList<>();
        if (request.getItems() != null) {
            for (SaleRequest.SaleItemRequest itemRequest : request.getItems()) {
                Item item = itemRepository.findByIdAndUser(itemRequest.getItemId(), user)
                    .orElseThrow(() -> new RuntimeException("Item not found: " + itemRequest.getItemId()));

                SaleItem saleItem = new SaleItem();
                saleItem.setItem(item);
                saleItem.setQuantity(itemRequest.getQuantity());
                saleItem.setUnit(itemRequest.getUnit() != null ? itemRequest.getUnit() : item.getUnit());
                saleItem.setPrice(itemRequest.getPrice());
                saleItem.setDiscountPercentage(itemRequest.getDiscountPercentage());
                saleItem.setDiscountAmount(itemRequest.getDiscountAmount());
                saleItem.setTaxPercentage(itemRequest.getTaxPercentage());
                saleItem.setTaxAmount(itemRequest.getTaxAmount());

                // Calculate item total
                BigDecimal itemTotal = itemRequest.getPrice()
                    .multiply(new BigDecimal(itemRequest.getQuantity()));
                
                if (itemRequest.getDiscountAmount() != null) {
                    itemTotal = itemTotal.subtract(itemRequest.getDiscountAmount());
                    totalDiscount = totalDiscount.add(itemRequest.getDiscountAmount());
                }
                
                if (itemRequest.getTaxAmount() != null) {
                    itemTotal = itemTotal.add(itemRequest.getTaxAmount());
                    totalTax = totalTax.add(itemRequest.getTaxAmount());
                }

                saleItem.setTotalAmount(itemTotal);
                saleItem.setSale(sale);
                saleItems.add(saleItem);

                subtotal = subtotal.add(itemRequest.getPrice()
                    .multiply(new BigDecimal(itemRequest.getQuantity())));

                // Item stock will be updated when transactions are recorded after sale is saved
            }
        }

        sale.setSaleItems(saleItems);
        sale.setSubtotal(subtotal);
        sale.setDiscountAmount(totalDiscount);
        sale.setTaxAmount(totalTax);

        // Calculate final total
        BigDecimal total = subtotal.subtract(totalDiscount).add(totalTax);
        if (request.getRoundOff() != null) {
            sale.setRoundOff(request.getRoundOff());
            total = total.add(request.getRoundOff());
        }
        sale.setTotalAmount(total);

        // Handle payment based on sale type
        if ("Cash".equals(request.getSaleType())) {
            sale.setReceivedAmount(total);
            sale.setBalanceAmount(BigDecimal.ZERO);
        } else {
            // Credit sale
            BigDecimal received = request.getReceivedAmount() != null ? 
                request.getReceivedAmount() : BigDecimal.ZERO;
            sale.setReceivedAmount(received);
            sale.setBalanceAmount(total.subtract(received));
        }

        // Save sale
        sale = saleRepository.save(sale);

        // Record transactions
        recordTransactions(sale, user);

        return convertToResponseWithItems(sale);
    }

    public SaleResponse updateSale(Long id, SaleRequest request, User user) {
        Sale sale = saleRepository.findByIdAndUserWithItems(id, user)
            .orElseThrow(() -> new RuntimeException("Sale not found"));

        // Reverse previous transactions before updating
        reverseTransactions(sale);

        // Update sale details
        if (request.getInvoiceNumber() != null && !request.getInvoiceNumber().equals(sale.getInvoiceNumber())) {
            if (saleRepository.existsByInvoiceNumberAndUser(request.getInvoiceNumber(), user)) {
                throw new RuntimeException("Invoice number already exists");
            }
            sale.setInvoiceNumber(request.getInvoiceNumber());
        }

        sale.setInvoiceDate(request.getInvoiceDate() != null ? request.getInvoiceDate() : sale.getInvoiceDate());
        sale.setBillingName(request.getBillingName());
        sale.setBillingAddress(request.getBillingAddress());
        sale.setPhoneNumber(request.getPhoneNumber());
        sale.setSaleType(request.getSaleType());
        sale.setPaymentType(request.getPaymentType());
        sale.setDescription(request.getDescription());
        sale.setAttachmentUrl(request.getAttachmentUrl());

        // Update party
        if (request.getPartyId() != null) {
            Party party = partyRepository.findByIdAndUser(request.getPartyId(), user)
                .orElseThrow(() -> new RuntimeException("Party not found"));
            sale.setParty(party);
        } else {
            sale.setParty(null);
        }

        // Update bank account
        if (request.getBankAccountId() != null) {
            BankAccount bankAccount = bankAccountRepository.findByIdAndUser(request.getBankAccountId(), user)
                .orElseThrow(() -> new RuntimeException("Bank account not found"));
            sale.setBankAccount(bankAccount);
        } else {
            sale.setBankAccount(null);
        }

        // Clear existing items
        sale.getSaleItems().clear();
        saleItemRepository.deleteBySaleId(sale.getId());

        // Add new items
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;

        if (request.getItems() != null) {
            for (SaleRequest.SaleItemRequest itemRequest : request.getItems()) {
                Item item = itemRepository.findByIdAndUser(itemRequest.getItemId(), user)
                    .orElseThrow(() -> new RuntimeException("Item not found: " + itemRequest.getItemId()));

                SaleItem saleItem = new SaleItem();
                saleItem.setItem(item);
                saleItem.setQuantity(itemRequest.getQuantity());
                saleItem.setUnit(itemRequest.getUnit() != null ? itemRequest.getUnit() : item.getUnit());
                saleItem.setPrice(itemRequest.getPrice());
                saleItem.setDiscountPercentage(itemRequest.getDiscountPercentage());
                saleItem.setDiscountAmount(itemRequest.getDiscountAmount());
                saleItem.setTaxPercentage(itemRequest.getTaxPercentage());
                saleItem.setTaxAmount(itemRequest.getTaxAmount());

                // Calculate item total
                BigDecimal itemTotal = itemRequest.getPrice()
                    .multiply(new BigDecimal(itemRequest.getQuantity()));
                
                if (itemRequest.getDiscountAmount() != null) {
                    itemTotal = itemTotal.subtract(itemRequest.getDiscountAmount());
                    totalDiscount = totalDiscount.add(itemRequest.getDiscountAmount());
                }
                
                if (itemRequest.getTaxAmount() != null) {
                    itemTotal = itemTotal.add(itemRequest.getTaxAmount());
                    totalTax = totalTax.add(itemRequest.getTaxAmount());
                }

                saleItem.setTotalAmount(itemTotal);
                sale.addSaleItem(saleItem);

                subtotal = subtotal.add(itemRequest.getPrice()
                    .multiply(new BigDecimal(itemRequest.getQuantity())));

                // Item stock will be updated when transactions are recorded after sale is saved
            }
        }

        sale.setSubtotal(subtotal);
        sale.setDiscountAmount(totalDiscount);
        sale.setTaxAmount(totalTax);

        // Calculate final total
        BigDecimal total = subtotal.subtract(totalDiscount).add(totalTax);
        if (request.getRoundOff() != null) {
            sale.setRoundOff(request.getRoundOff());
            total = total.add(request.getRoundOff());
        }
        sale.setTotalAmount(total);

        // Handle payment
        if ("Cash".equals(request.getSaleType())) {
            sale.setReceivedAmount(total);
            sale.setBalanceAmount(BigDecimal.ZERO);
        } else {
            BigDecimal received = request.getReceivedAmount() != null ? 
                request.getReceivedAmount() : BigDecimal.ZERO;
            sale.setReceivedAmount(received);
            sale.setBalanceAmount(total.subtract(received));
        }

        // Save updated sale
        sale = saleRepository.save(sale);

        // Record new transactions
        recordTransactions(sale, user);

        return convertToResponseWithItems(sale);
    }

    public void deleteSale(Long id, User user) {
        Sale sale = saleRepository.findByIdAndUserWithItems(id, user)
            .orElseThrow(() -> new RuntimeException("Sale not found"));

        // Reverse transactions
        reverseTransactions(sale);

        // Delete sale
        saleRepository.delete(sale);
    }

    private void recordTransactions(Sale sale, User user) {
        // Calculate correct payment status after sale is saved with proper amounts
        String status = calculatePaymentStatus(sale);
        
        System.out.println("Recording transactions for sale " + sale.getId() + ":");
        System.out.println("  Total Amount: " + sale.getTotalAmount());
        System.out.println("  Received Amount: " + sale.getReceivedAmount());
        System.out.println("  Sale Type: " + sale.getSaleType());
        System.out.println("  Calculated Status: " + status);
        
        // Record item transactions with correct status
        for (SaleItem saleItem : sale.getSaleItems()) {
            Item item = saleItem.getItem();
            String partyName = sale.getParty() != null ? sale.getParty().getName() : sale.getBillingName();
            itemTransactionService.recordSale(item, saleItem.getQuantity(), user, 
                sale.getInvoiceNumber(), partyName, saleItem.getPrice(), saleItem.getTotalAmount(), status);
        }
        
        // Record party transaction for credit sales
        if (sale.getParty() != null && "Credit".equals(sale.getSaleType())) {
            partyTransactionService.recordSaleTransaction(
                sale.getParty(),
                sale.getTotalAmount(),
                sale.getReceivedAmount(),
                "Sale Invoice: " + sale.getInvoiceNumber()
            );
        }

        // Record payment transaction
        if (sale.getReceivedAmount() != null && sale.getReceivedAmount().compareTo(BigDecimal.ZERO) > 0) {
            if ("Cash".equals(sale.getPaymentType())) {
                cashTransactionService.recordSalePayment(
                    sale.getReceivedAmount(),
                    "Sale Payment - Invoice: " + sale.getInvoiceNumber(),
                    sale.getUser()
                );
            } else if ("Cheque".equals(sale.getPaymentType())) {
                // For cheque, we might record it differently or not at all
                // This depends on your business logic
                System.out.println("Cheque payment for sale recorded: " + sale.getReceivedAmount());
            } else {
                // Check if it's a bank account payment type
                // First check if bank account is directly linked
                BankAccount bankAccount = sale.getBankAccount();
                
                // If not directly linked, try to find by payment type name
                if (bankAccount == null) {
                    bankAccount = bankAccountRepository.findByMerchantIdAndAccountDisplayName(user.getId(), sale.getPaymentType())
                        .orElse(bankAccountRepository.findByMerchantIdAndBankName(user.getId(), sale.getPaymentType()).orElse(null));
                }
                
                if (bankAccount != null) {
                    bankTransactionService.recordSalePayment(
                        bankAccount,
                        sale.getReceivedAmount(),
                        "Sale Payment - Invoice: " + sale.getInvoiceNumber(),
                        sale.getUser()
                    );
                } else {
                    System.out.println("Unknown payment type for sale: " + sale.getPaymentType());
                }
            }
        }
    }

    /**
     * Calculate payment status based on received amount vs total amount
     */
    private String calculatePaymentStatus(Sale sale) {
        if (sale.getTotalAmount() == null) {
            return "Unpaid";
        }
        
        BigDecimal totalAmount = sale.getTotalAmount();
        BigDecimal receivedAmount = sale.getReceivedAmount() != null ? sale.getReceivedAmount() : BigDecimal.ZERO;
        
        if (receivedAmount.compareTo(BigDecimal.ZERO) == 0) {
            return "Unpaid";
        } else if (receivedAmount.compareTo(totalAmount) >= 0) {
            return "Paid";
        } else {
            return "Partial";
        }
    }

    private void reverseTransactions(Sale sale) {
        // Reverse item stock changes
        for (SaleItem item : sale.getSaleItems()) {
            String partyName = sale.getParty() != null ? sale.getParty().getName() : sale.getBillingName();
            String status = calculatePaymentStatus(sale);
            itemTransactionService.reverseSale(item.getItem(), item.getQuantity(), sale.getUser(), 
                sale.getInvoiceNumber(), partyName, item.getPrice(), item.getTotalAmount(), status);
        }

        // Reverse party transaction
        if (sale.getParty() != null && "Credit".equals(sale.getSaleType())) {
            partyTransactionService.reverseSaleTransaction(
                sale.getParty(),
                sale.getTotalAmount(),
                sale.getReceivedAmount()
            );
        }

        // Reverse payment transaction
        if (sale.getReceivedAmount() != null && sale.getReceivedAmount().compareTo(BigDecimal.ZERO) > 0) {
            if ("Cash".equals(sale.getPaymentType())) {
                cashTransactionService.reverseSalePayment(
                    sale.getReceivedAmount(),
                    sale.getUser()
                );
            } else if (sale.getBankAccount() != null) {
                bankTransactionService.reverseSalePayment(
                    sale.getBankAccount(),
                    sale.getReceivedAmount(),
                    sale.getUser()
                );
            }
        }
    }

    private String generateInvoiceNumber(User user) {
        try {
            System.out.println("Generating invoice number for user: " + user.getUsername() + " (ID: " + user.getId() + ")");
            
            String maxInvoiceNumber = null;
            Long count = null;
            
            try {
                // Try using User object first
                maxInvoiceNumber = saleRepository.findMaxInvoiceNumberByUser(user);
                count = saleRepository.countByUser(user);
                System.out.println("Using User object queries - Max invoice: " + maxInvoiceNumber + ", Count: " + count);
            } catch (Exception e) {
                System.out.println("User object queries failed, trying user ID queries: " + e.getMessage());
                try {
                    // Fallback to user ID-based queries
                    maxInvoiceNumber = saleRepository.findMaxInvoiceNumberByUserId(user.getId());
                    count = saleRepository.countByUserId(user.getId());
                    System.out.println("Using User ID queries - Max invoice: " + maxInvoiceNumber + ", Count: " + count);
                } catch (Exception e2) {
                    System.err.println("Both query methods failed: " + e2.getMessage());
                    e2.printStackTrace();
                    // Use timestamp-based fallback
                    return "INV-" + System.currentTimeMillis() % 100000;
                }
            }
            
            if (maxInvoiceNumber == null) {
                System.out.println("No existing invoices found, starting with INV-001");
                return "INV-001";
            }
            
            // Extract number from invoice number
            String[] parts = maxInvoiceNumber.split("-");
            if (parts.length == 2) {
                try {
                    int number = Integer.parseInt(parts[1]);
                    String newInvoiceNumber = String.format("INV-%03d", number + 1);
                    System.out.println("Generated new invoice number: " + newInvoiceNumber);
                    return newInvoiceNumber;
                } catch (NumberFormatException e) {
                    System.out.println("Failed to parse invoice number, falling back to count-based generation");
                    // If parsing fails, generate based on count
                }
            }
            
            if (count != null) {
                String newInvoiceNumber = String.format("INV-%03d", count + 1);
                System.out.println("Generated invoice number based on count (" + count + "): " + newInvoiceNumber);
                return newInvoiceNumber;
            } else {
                // Final fallback
                return "INV-" + System.currentTimeMillis() % 100000;
            }
        } catch (Exception e) {
            System.err.println("Error generating invoice number: " + e.getMessage());
            e.printStackTrace();
            // Fallback to a simple timestamp-based invoice number
            return "INV-" + System.currentTimeMillis() % 100000;
        }
    }

    private SaleResponse convertToResponse(Sale sale) {
        SaleResponse response = new SaleResponse();
        response.setId(sale.getId());
        response.setInvoiceNumber(sale.getInvoiceNumber());
        response.setInvoiceDate(sale.getInvoiceDate());
        response.setPartyName(sale.getParty() != null ? sale.getParty().getName() : "Walk-in Customer");
        response.setPartyId(sale.getParty() != null ? sale.getParty().getId() : null);
        response.setBillingName(sale.getBillingName());
        response.setBillingAddress(sale.getBillingAddress());
        response.setPhoneNumber(sale.getPhoneNumber());
        response.setSaleType(sale.getSaleType());
        response.setPaymentType(sale.getPaymentType());
        response.setBankAccountId(sale.getBankAccount() != null ? sale.getBankAccount().getId() : null);
        response.setBankAccountName(sale.getBankAccount() != null ? 
            sale.getBankAccount().getAccountDisplayName() : null);
        response.setSubtotal(sale.getSubtotal());
        response.setDiscountAmount(sale.getDiscountAmount());
        response.setTaxAmount(sale.getTaxAmount());
        response.setRoundOff(sale.getRoundOff());
        response.setTotalAmount(sale.getTotalAmount());
        response.setReceivedAmount(sale.getReceivedAmount());
        response.setBalanceAmount(sale.getBalanceAmount());
        response.setDescription(sale.getDescription());
        response.setAttachmentUrl(sale.getAttachmentUrl());
        response.setCreatedAt(sale.getCreatedAt());
        response.setUpdatedAt(sale.getUpdatedAt());
        return response;
    }

    private SaleResponse convertToResponseWithItems(Sale sale) {
        SaleResponse response = convertToResponse(sale);
        
        List<SaleResponse.SaleItemResponse> itemResponses = new ArrayList<>();
        for (SaleItem saleItem : sale.getSaleItems()) {
            SaleResponse.SaleItemResponse itemResponse = new SaleResponse.SaleItemResponse();
            itemResponse.setId(saleItem.getId());
            itemResponse.setItemId(saleItem.getItem().getId());
            itemResponse.setItemName(saleItem.getItem().getName());
            itemResponse.setItemCode(saleItem.getItem().getCode());
            itemResponse.setHsnCode(saleItem.getItem().getHsnCode());
            itemResponse.setQuantity(saleItem.getQuantity());
            itemResponse.setUnit(saleItem.getUnit());
            itemResponse.setPrice(saleItem.getPrice());
            itemResponse.setDiscountPercentage(saleItem.getDiscountPercentage());
            itemResponse.setDiscountAmount(saleItem.getDiscountAmount());
            itemResponse.setTaxPercentage(saleItem.getTaxPercentage());
            itemResponse.setTaxAmount(saleItem.getTaxAmount());
            itemResponse.setTotalAmount(saleItem.getTotalAmount());
            itemResponses.add(itemResponse);
        }
        
        response.setItems(itemResponses);
        return response;
    }
}
