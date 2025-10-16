package com.example.gstapp.service;

import com.example.gstapp.dto.PartyRequest;
import com.example.gstapp.dto.PartyResponse;
import com.example.gstapp.dto.PartyTransactionResponse;
import com.example.gstapp.model.Party;
import com.example.gstapp.model.PartyTransaction;
import com.example.gstapp.model.PaymentIn;
import com.example.gstapp.model.PaymentOut;
import com.example.gstapp.repository.PartyRepository;
import com.example.gstapp.repository.PartyTransactionRepository;
import com.example.gstapp.repository.PaymentInRepository;
import com.example.gstapp.repository.PaymentOutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class PartyService {

    @Autowired
    private PartyRepository partyRepository;

    @Autowired
    private PartyTransactionRepository partyTransactionRepository;

    @Autowired
    private PaymentOutRepository paymentOutRepository;

    @Autowired
    private PaymentInRepository paymentInRepository;

    public List<PartyResponse> getAllParties(Long merchantId) {
        List<Party> parties = partyRepository.findByMerchantIdAndIsActiveTrueOrderByNameAsc(merchantId);
        return parties.stream()
                .map(PartyResponse::new)
                .collect(Collectors.toList());
    }

    public List<PartyResponse> searchParties(Long merchantId, String searchTerm) {
        List<Party> parties = partyRepository.searchParties(merchantId, searchTerm);
        return parties.stream()
                .map(PartyResponse::new)
                .collect(Collectors.toList());
    }

    public PartyResponse getPartyById(Long merchantId, Long partyId) {
        Optional<Party> partyOpt = partyRepository.findByIdAndMerchantIdAndIsActiveTrue(partyId, merchantId);
        if (partyOpt.isPresent()) {
            Party party = partyOpt.get();
            PartyResponse response = new PartyResponse(party);
            
            // Get all transactions for this party
            List<PartyTransactionResponse> allTransactions = new ArrayList<>();
            
            // Get party transactions (purchases, etc.)
            List<PartyTransaction> partyTransactions = partyTransactionRepository
                    .findByMerchantIdAndPartyIdOrderByTransactionDateDesc(merchantId, partyId);
            List<PartyTransactionResponse> partyTransactionResponses = partyTransactions.stream()
                    .map(PartyTransactionResponse::new)
                    .collect(Collectors.toList());
            allTransactions.addAll(partyTransactionResponses);
            
            // Get payment-out transactions for this party
            List<PaymentOut> paymentOuts = paymentOutRepository
                    .findByMerchantIdAndPartyIdOrderByPaymentDateDesc(merchantId, partyId);
            List<PartyTransactionResponse> paymentOutResponses = paymentOuts.stream()
                    .map(paymentOut -> convertPaymentOutToTransactionResponse(paymentOut, party))
                    .collect(Collectors.toList());
            allTransactions.addAll(paymentOutResponses);
            
            // Get payment-in transactions for this party
            List<PaymentIn> paymentIns = paymentInRepository
                    .findByMerchantIdAndPartyIdOrderByPaymentDateDesc(merchantId, partyId);
            List<PartyTransactionResponse> paymentInResponses = paymentIns.stream()
                    .map(paymentIn -> convertPaymentInToTransactionResponse(paymentIn, party))
                    .collect(Collectors.toList());
            allTransactions.addAll(paymentInResponses);
            
            // Sort all transactions by date (most recent first)
            allTransactions.sort(Comparator.comparing(PartyTransactionResponse::getTransactionDate).reversed());
            
            // Calculate running balance for payment-out transactions
            calculateRunningBalanceForTransactions(allTransactions, party);
            
            response.setTransactions(allTransactions);
            
            return response;
        }
        throw new RuntimeException("Party not found");
    }
    
    private PartyTransactionResponse convertPaymentOutToTransactionResponse(PaymentOut paymentOut, Party party) {
        PartyTransactionResponse response = new PartyTransactionResponse();
        response.setId(paymentOut.getId());
        response.setPartyId(paymentOut.getPartyId());
        response.setTransactionType(PartyTransaction.TransactionType.PAYMENT_OUT);
        response.setTransactionNumber(paymentOut.getReceiptNumber());
        response.setAmount(paymentOut.getAmount());
        response.setDescription("Payment Out - " + (paymentOut.getDescription() != null ? paymentOut.getDescription() : paymentOut.getPaymentType()));
        response.setReferenceNumber(paymentOut.getReceiptNumber());
        response.setTransactionDate(paymentOut.getPaymentDate());
        response.setBalanceAfter(paymentOut.getBalanceAfter()); // Use stored balance from when payment was made
        response.setPurchaseBalance(null); // Not applicable for payment-out
        response.setCreatedAt(paymentOut.getCreatedAt());
        return response;
    }
    
    private PartyTransactionResponse convertPaymentInToTransactionResponse(PaymentIn paymentIn, Party party) {
        PartyTransactionResponse response = new PartyTransactionResponse();
        response.setId(paymentIn.getId());
        response.setPartyId(paymentIn.getPartyId());
        response.setTransactionType(PartyTransaction.TransactionType.PAYMENT_IN);
        response.setTransactionNumber(paymentIn.getReceiptNumber());
        response.setAmount(paymentIn.getAmount());
        response.setDescription("Payment In - " + (paymentIn.getDescription() != null ? paymentIn.getDescription() : paymentIn.getPaymentType()));
        response.setReferenceNumber(paymentIn.getReceiptNumber());
        response.setTransactionDate(paymentIn.getPaymentDate());
        response.setBalanceAfter(paymentIn.getBalanceAfter()); // Use stored balance from when payment was made
        response.setPurchaseBalance(null); // Not applicable for payment-in
        response.setCreatedAt(paymentIn.getCreatedAt());
        return response;
    }
    
    private void calculateRunningBalanceForTransactions(List<PartyTransactionResponse> transactions, Party party) {
        // This method is now mainly for legacy transactions that might not have balanceAfter set
        // New payment-out transactions should have their balance stored when created
        BigDecimal currentBalance = party.getCurrentBalance() != null ? party.getCurrentBalance() : BigDecimal.ZERO;
        
        for (PartyTransactionResponse transaction : transactions) {
            // Only calculate balance for transactions that don't have it set (legacy data)
            if (transaction.getBalanceAfter() == null) {
                // For legacy payment-out transactions without stored balance, use current balance as fallback
                // This is not ideal but prevents null values in the UI
                transaction.setBalanceAfter(currentBalance);
            }
        }
    }

    public PartyResponse createParty(Long merchantId, PartyRequest partyRequest) {
        // Validate unique constraints
        if (partyRequest.getPhone() != null && !partyRequest.getPhone().isEmpty()) {
            if (partyRepository.existsByMerchantIdAndPhoneAndIsActiveTrue(merchantId, partyRequest.getPhone())) {
                throw new RuntimeException("Phone number already exists");
            }
        }
        
        if (partyRequest.getEmail() != null && !partyRequest.getEmail().isEmpty()) {
            if (partyRepository.existsByMerchantIdAndEmailAndIsActiveTrue(merchantId, partyRequest.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
        }

        if (partyRepository.existsByMerchantIdAndNameAndIsActiveTrue(merchantId, partyRequest.getName())) {
            throw new RuntimeException("Party name already exists");
        }

        // Create new party
        Party party = new Party();
        party.setMerchantId(merchantId);
        party.setName(partyRequest.getName());
        party.setPhone(partyRequest.getPhone());
        party.setEmail(partyRequest.getEmail());
        party.setAddress(partyRequest.getAddress());
        party.setGstNumber(partyRequest.getGstNumber());
        party.setPanNumber(partyRequest.getPanNumber());
        party.setOpeningBalance(partyRequest.getOpeningBalance());
        party.setCurrentBalance(partyRequest.getOpeningBalance()); // Initially same as opening balance
        party.setPartyType(partyRequest.getPartyType());
        party.setBalanceType(partyRequest.getBalanceType());

        Party savedParty = partyRepository.save(party);
        return new PartyResponse(savedParty);
    }

    public PartyResponse updateParty(Long merchantId, Long partyId, PartyRequest partyRequest) {
        Optional<Party> partyOpt = partyRepository.findByIdAndMerchantIdAndIsActiveTrue(partyId, merchantId);
        if (!partyOpt.isPresent()) {
            throw new RuntimeException("Party not found");
        }

        Party party = partyOpt.get();
        
        // Validate unique constraints for updated values
        if (partyRequest.getPhone() != null && !partyRequest.getPhone().isEmpty()) {
            if (!party.getPhone().equals(partyRequest.getPhone()) && 
                partyRepository.existsByMerchantIdAndPhoneAndIsActiveTrue(merchantId, partyRequest.getPhone())) {
                throw new RuntimeException("Phone number already exists");
            }
        }
        
        if (partyRequest.getEmail() != null && !partyRequest.getEmail().isEmpty()) {
            if (!party.getEmail().equals(partyRequest.getEmail()) && 
                partyRepository.existsByMerchantIdAndEmailAndIsActiveTrue(merchantId, partyRequest.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
        }

        if (!party.getName().equals(partyRequest.getName()) && 
            partyRepository.existsByMerchantIdAndNameAndIsActiveTrue(merchantId, partyRequest.getName())) {
            throw new RuntimeException("Party name already exists");
        }

        // Update party details
        party.setName(partyRequest.getName());
        party.setPhone(partyRequest.getPhone());
        party.setEmail(partyRequest.getEmail());
        party.setAddress(partyRequest.getAddress());
        party.setGstNumber(partyRequest.getGstNumber());
        party.setPanNumber(partyRequest.getPanNumber());
        party.setPartyType(partyRequest.getPartyType());
        party.setBalanceType(partyRequest.getBalanceType());

        Party savedParty = partyRepository.save(party);
        return new PartyResponse(savedParty);
    }

    public void deleteParty(Long merchantId, Long partyId) {
        Optional<Party> partyOpt = partyRepository.findByIdAndMerchantIdAndIsActiveTrue(partyId, merchantId);
        if (!partyOpt.isPresent()) {
            throw new RuntimeException("Party not found");
        }

        Party party = partyOpt.get();
        party.setIsActive(false);
        partyRepository.save(party);
    }

    public BigDecimal getPartyBalance(Long merchantId, Long partyId) {
        Optional<Party> partyOpt = partyRepository.findByIdAndMerchantIdAndIsActiveTrue(partyId, merchantId);
        if (!partyOpt.isPresent()) {
            throw new RuntimeException("Party not found");
        }
        return partyOpt.get().getCurrentBalance();
    }

    public void updatePartyBalance(Long merchantId, Long partyId, BigDecimal amount, 
                                 PartyTransaction.TransactionType transactionType) {
        Optional<Party> partyOpt = partyRepository.findByIdAndMerchantIdAndIsActiveTrue(partyId, merchantId);
        if (!partyOpt.isPresent()) {
            throw new RuntimeException("Party not found");
        }

        Party party = partyOpt.get();
        BigDecimal currentBalance = party.getCurrentBalance() != null ? party.getCurrentBalance() : BigDecimal.ZERO;
        Party.BalanceType currentBalanceType = party.getBalanceType() != null ? party.getBalanceType() : Party.BalanceType.TO_RECEIVE;
        
        System.out.println("Updating party balance - Party: " + party.getName() + ", Current: " + currentBalance + " " + currentBalanceType + ", Transaction: " + transactionType + ", Amount: " + amount);

        BigDecimal newBalance;
        Party.BalanceType newBalanceType = currentBalanceType;

        // Update balance based on transaction type
        switch (transactionType) {
            case SALE:
                // Customer owes us more money
                System.out.println("SALE: currentBalance=" + currentBalance + ", currentBalanceType=" + currentBalanceType + ", amount=" + amount);
                if (currentBalanceType == Party.BalanceType.TO_PAY) {
                    // We owed them, now they owe us
                    newBalance = amount.subtract(currentBalance);
                    System.out.println("SALE TO_PAY: newBalance=" + newBalance);
                    if (newBalance.compareTo(BigDecimal.ZERO) > 0) {
                        newBalanceType = Party.BalanceType.TO_RECEIVE;
                    } else if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
                        newBalanceType = Party.BalanceType.TO_PAY;
                        newBalance = newBalance.abs();
                    } else {
                        // Balance is exactly 0 - no one owes anyone
                        newBalanceType = null;
                    }
                } else {
                    // They already owed us, now they owe us more
                    newBalance = currentBalance.add(amount);
                    System.out.println("SALE TO_RECEIVE: newBalance=" + newBalance);
                    newBalanceType = Party.BalanceType.TO_RECEIVE;
                }
                break;
                
            case PAYMENT_IN:
                // We received payment from them - reduce what they owe us or reduce what we owe them
                System.out.println("PAYMENT_IN: currentBalance=" + currentBalance + ", currentBalanceType=" + currentBalanceType + ", amount=" + amount);
                if (currentBalanceType == Party.BalanceType.TO_RECEIVE) {
                    // They owed us, now they owe us less (or we owe them)
                    newBalance = currentBalance.subtract(amount);
                    System.out.println("PAYMENT_IN TO_RECEIVE: newBalance=" + newBalance);
                    if (newBalance.compareTo(BigDecimal.ZERO) > 0) {
                        newBalanceType = Party.BalanceType.TO_RECEIVE;
                    } else if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
                        newBalanceType = Party.BalanceType.TO_PAY;
                        newBalance = newBalance.abs();
                    } else {
                        // Balance is exactly 0 - no one owes anyone
                        newBalanceType = null;
                    }
                } else {
                    // We owed them, they paid us, so now we owe them more
                    newBalance = currentBalance.add(amount);
                    System.out.println("PAYMENT_IN TO_PAY: newBalance=" + newBalance);
                    newBalanceType = Party.BalanceType.TO_PAY;
                }
                break;
                
            case PURCHASE:
                // We owe them more money (remaining balance from purchase)
                System.out.println("PURCHASE: currentBalance=" + currentBalance + ", currentBalanceType=" + currentBalanceType + ", amount=" + amount);
                if (currentBalanceType == Party.BalanceType.TO_RECEIVE) {
                    // They owed us, now we owe them
                    newBalance = amount.subtract(currentBalance);
                    System.out.println("PURCHASE TO_RECEIVE: newBalance=" + newBalance);
                    if (newBalance.compareTo(BigDecimal.ZERO) > 0) {
                        newBalanceType = Party.BalanceType.TO_PAY;
                    } else if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
                        newBalanceType = Party.BalanceType.TO_RECEIVE;
                        newBalance = newBalance.abs();
                    } else {
                        // Balance is exactly 0 - no one owes anyone
                        newBalanceType = null;
                    }
                } else {
                    // We already owed them, now we owe them more
                    newBalance = currentBalance.add(amount);
                    System.out.println("PURCHASE TO_PAY: newBalance=" + newBalance);
                    newBalanceType = Party.BalanceType.TO_PAY;
                }
                break;
                
            case PAYMENT_OUT:
                // We paid them money
                System.out.println("PAYMENT_OUT: currentBalance=" + currentBalance + ", currentBalanceType=" + currentBalanceType + ", amount=" + amount);
                if (currentBalanceType == Party.BalanceType.TO_PAY) {
                    // We owed them, now we owe them less (or they owe us)
                    newBalance = currentBalance.subtract(amount);
                    System.out.println("PAYMENT_OUT TO_PAY: newBalance=" + newBalance);
                    if (newBalance.compareTo(BigDecimal.ZERO) > 0) {
                        newBalanceType = Party.BalanceType.TO_PAY;
                    } else if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
                        newBalanceType = Party.BalanceType.TO_RECEIVE;
                        newBalance = newBalance.abs();
                    } else {
                        // Balance is exactly 0 - no one owes anyone
                        newBalanceType = null;
                    }
                } else {
                    // They owed us, we paid them anyway, so now they owe us more
                    newBalance = currentBalance.add(amount);
                    System.out.println("PAYMENT_OUT TO_RECEIVE: newBalance=" + newBalance);
                    newBalanceType = Party.BalanceType.TO_RECEIVE;
                }
                break;
                
            case ADJUSTMENT:
                newBalance = amount.abs(); // For adjustments, set to specific amount
                newBalanceType = amount.compareTo(BigDecimal.ZERO) >= 0 ? Party.BalanceType.TO_RECEIVE : Party.BalanceType.TO_PAY;
                break;
                
            default:
                throw new RuntimeException("Invalid transaction type");
        }

        System.out.println("New balance: " + newBalance + " " + newBalanceType);
        
        // Always store balance as positive value, use balanceType to indicate direction
        party.setCurrentBalance(newBalance.abs());
        party.setBalanceType(newBalanceType);
        partyRepository.save(party);
    }
}
