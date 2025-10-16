package com.example.gstapp.service;

import com.example.gstapp.dto.PaymentInRequest;
import com.example.gstapp.dto.PaymentInResponse;
import com.example.gstapp.model.BankAccount;
import com.example.gstapp.model.BankTransaction;
import com.example.gstapp.model.CashTransaction;
import com.example.gstapp.model.Party;
import com.example.gstapp.model.PartyTransaction;
import com.example.gstapp.model.PaymentIn;
import com.example.gstapp.repository.BankAccountRepository;
import com.example.gstapp.repository.PartyRepository;
import com.example.gstapp.repository.PaymentInRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class PaymentInService {
    
    @Autowired
    private PaymentInRepository paymentInRepository;
    
    @Autowired
    private PartyRepository partyRepository;
    
    @Autowired
    private BankAccountRepository bankAccountRepository;
    
    @Autowired
    private BankTransactionService bankTransactionService;
    
    @Autowired
    private CashTransactionService cashTransactionService;
    
    @Autowired
    private PartyService partyService;
    
    public PaymentInResponse createPaymentIn(Long merchantId, PaymentInRequest request) {
        System.out.println("Creating payment in for merchant: " + merchantId + ", amount: " + request.getAmount());
        
        // Validate party exists
        Party party = partyRepository.findByIdAndMerchantIdAndIsActiveTrue(request.getPartyId(), merchantId)
            .orElseThrow(() -> new RuntimeException("Party not found"));
        
        // Validate bank account if payment type is bank account
        BankAccount bankAccount = null;
        if (request.getBankAccountId() != null) {
            bankAccount = bankAccountRepository.findByIdAndMerchantId(request.getBankAccountId(), merchantId)
                .orElseThrow(() -> new RuntimeException("Bank account not found"));
        }
        
        // Create payment in record
        PaymentIn paymentIn = new PaymentIn(
            merchantId,
            request.getPartyId(),
            request.getPaymentType(),
            request.getBankAccountId(),
            request.getAmount(),
            request.getReceiptNumber(),
            request.getPaymentDate(),
            request.getDescription()
        );
        
        // Adjust party balance using consistent logic (PAYMENT_IN increases balance)
        partyService.updatePartyBalance(merchantId, party.getId(), request.getAmount(), PartyTransaction.TransactionType.PAYMENT_IN);
        
        // Get the updated balance after payment and store it with the payment record
        BigDecimal balanceAfterPayment = partyService.getPartyBalance(merchantId, party.getId());
        paymentIn.setBalanceAfter(balanceAfterPayment);
        
        paymentIn = paymentInRepository.save(paymentIn);
        System.out.println("Payment in saved with ID: " + paymentIn.getId() + ", balance after: " + balanceAfterPayment);
        
        // Record transaction based on payment type
        recordPaymentTransaction(merchantId, request, bankAccount, party);
        
        return convertToResponse(paymentIn, party, bankAccount);
    }
    
    private void recordPaymentTransaction(Long merchantId, PaymentInRequest request, BankAccount bankAccount, Party party) {
        String description = "Payment from " + party.getName() + (request.getDescription() != null && !request.getDescription().trim().isEmpty() ? " - " + request.getDescription() : "");
        
        // Priority: Check for bankAccountId first, then specific payment types
        if (bankAccount != null) {
            // Record bank transaction (money coming in)
            System.out.println("Recording bank transaction for account: " + bankAccount.getAccountDisplayName() + ", amount: " + request.getAmount());
            
            // Calculate new balance after deposit
            BigDecimal currentBalance = bankAccount.getCurrentBalance() != null ? bankAccount.getCurrentBalance() : BigDecimal.ZERO;
            BigDecimal newBalance = currentBalance.add(request.getAmount());
            
            // Update bank account balance
            bankAccount.setCurrentBalance(newBalance);
            bankAccountRepository.save(bankAccount);
            
            bankTransactionService.createBankTransaction(
                merchantId,
                bankAccount.getId(),
                BankTransaction.TransactionType.DEPOSIT,
                request.getAmount(),
                description,
                request.getReceiptNumber(),
                newBalance,
                request.getPaymentDate()
            );
        } else if ("Cash".equals(request.getPaymentType()) || "CASH".equals(request.getPaymentType())) {
            // Record cash transaction (money coming in)
            System.out.println("Recording cash transaction: " + request.getAmount());
            cashTransactionService.createCashTransaction(
                merchantId,
                CashTransaction.TransactionType.IN,
                request.getAmount(),
                description,
                request.getReceiptNumber(),
                request.getPaymentDate()
            );
        } else if ("Cheque".equals(request.getPaymentType()) || "CHEQUE".equals(request.getPaymentType())) {
            // For cheque, we might record it differently or not at all
            // This depends on your business logic
            System.out.println("Cheque payment recorded: " + request.getAmount());
        } else {
            // Handle any other payment types (including bank account names that don't have bankAccountId)
            System.out.println("Payment recorded for type: " + request.getPaymentType() + ", amount: " + request.getAmount());
        }
    }
    
    public List<PaymentInResponse> getPaymentInsByMerchant(Long merchantId) {
        List<PaymentIn> paymentIns = paymentInRepository.findByMerchantIdOrderByPaymentDateDesc(merchantId);
        return paymentIns.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    public List<PaymentInResponse> getPaymentInsByParty(Long merchantId, Long partyId) {
        List<PaymentIn> paymentIns = paymentInRepository.findByMerchantIdAndPartyIdOrderByPaymentDateDesc(merchantId, partyId);
        return paymentIns.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    public List<PaymentInResponse> getPaymentInsByPaymentType(Long merchantId, String paymentType) {
        List<PaymentIn> paymentIns = paymentInRepository.findByMerchantIdAndPaymentTypeOrderByPaymentDateDesc(merchantId, paymentType);
        return paymentIns.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    public List<PaymentInResponse> getPaymentInsByBankAccount(Long merchantId, Long bankAccountId) {
        List<PaymentIn> paymentIns = paymentInRepository.findByMerchantIdAndBankAccountIdOrderByPaymentDateDesc(merchantId, bankAccountId);
        return paymentIns.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    public BigDecimal getTotalAmountByPaymentType(Long merchantId, String paymentType) {
        BigDecimal total = paymentInRepository.getTotalAmountByPaymentType(merchantId, paymentType);
        return total != null ? total : BigDecimal.ZERO;
    }
    
    public BigDecimal getTotalAmountByParty(Long merchantId, Long partyId) {
        BigDecimal total = paymentInRepository.getTotalAmountByParty(merchantId, partyId);
        return total != null ? total : BigDecimal.ZERO;
    }
    
    public BigDecimal getTotalAmountByBankAccount(Long merchantId, Long bankAccountId) {
        BigDecimal total = paymentInRepository.getTotalAmountByBankAccount(merchantId, bankAccountId);
        return total != null ? total : BigDecimal.ZERO;
    }
    
    public void deletePaymentIn(Long merchantId, Long paymentInId) {
        PaymentIn paymentIn = paymentInRepository.findById(paymentInId)
            .orElseThrow(() -> new RuntimeException("Payment in not found"));
        
        if (!paymentIn.getMerchantId().equals(merchantId)) {
            throw new RuntimeException("Unauthorized access");
        }
        
        paymentInRepository.delete(paymentIn);
    }
    
    private PaymentInResponse convertToResponse(PaymentIn paymentIn) {
        return convertToResponse(paymentIn, null, null);
    }
    
    private PaymentInResponse convertToResponse(PaymentIn paymentIn, Party party, BankAccount bankAccount) {
        PaymentInResponse response = new PaymentInResponse();
        response.setId(paymentIn.getId());
        response.setPartyId(paymentIn.getPartyId());
        response.setPaymentType(paymentIn.getPaymentType());
        response.setBankAccountId(paymentIn.getBankAccountId());
        response.setAmount(paymentIn.getAmount());
        response.setReceiptNumber(paymentIn.getReceiptNumber());
        response.setPaymentDate(paymentIn.getPaymentDate());
        response.setDescription(paymentIn.getDescription());
        response.setBalanceAfter(paymentIn.getBalanceAfter());
        response.setCreatedAt(paymentIn.getCreatedAt());
        response.setUpdatedAt(paymentIn.getUpdatedAt());
        
        // Set party name if party is provided
        if (party != null) {
            response.setPartyName(party.getName());
        } else if (paymentIn.getPartyId() != null) {
            Optional<Party> partyOpt = partyRepository.findById(paymentIn.getPartyId());
            if (partyOpt.isPresent()) {
                response.setPartyName(partyOpt.get().getName());
            }
        }
        
        // Set bank account name if bank account is provided
        if (bankAccount != null) {
            response.setBankAccountName(bankAccount.getAccountDisplayName());
        } else if (paymentIn.getBankAccountId() != null) {
            Optional<BankAccount> bankOpt = bankAccountRepository.findById(paymentIn.getBankAccountId());
            if (bankOpt.isPresent()) {
                BankAccount bank = bankOpt.get();
                response.setBankAccountName(bank.getAccountDisplayName());
            }
        }
        
        return response;
    }
}
