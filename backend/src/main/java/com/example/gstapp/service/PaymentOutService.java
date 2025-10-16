package com.example.gstapp.service;

import com.example.gstapp.dto.PaymentOutRequest;
import com.example.gstapp.dto.PaymentOutResponse;
import com.example.gstapp.model.BankAccount;
import com.example.gstapp.model.BankTransaction;
import com.example.gstapp.model.CashTransaction;
import com.example.gstapp.model.Party;
import com.example.gstapp.model.PartyTransaction;
import com.example.gstapp.model.PaymentOut;
import com.example.gstapp.repository.BankAccountRepository;
import com.example.gstapp.repository.PartyRepository;
import com.example.gstapp.repository.PaymentOutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class PaymentOutService {
    
    @Autowired
    private PaymentOutRepository paymentOutRepository;
    
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
    
    public PaymentOutResponse createPaymentOut(Long merchantId, PaymentOutRequest request) {
        System.out.println("Creating payment out for merchant: " + merchantId + ", amount: " + request.getAmount());
        
        // Validate party exists
        Party party = partyRepository.findByIdAndMerchantIdAndIsActiveTrue(request.getPartyId(), merchantId)
            .orElseThrow(() -> new RuntimeException("Party not found"));
        
        // Validate bank account if payment type is bank account
        BankAccount bankAccount = null;
        if (request.getBankAccountId() != null) {
            bankAccount = bankAccountRepository.findByIdAndMerchantId(request.getBankAccountId(), merchantId)
                .orElseThrow(() -> new RuntimeException("Bank account not found"));
        }
        
        // Create payment out record
        PaymentOut paymentOut = new PaymentOut(
            merchantId,
            request.getPartyId(),
            request.getPaymentType(),
            request.getBankAccountId(),
            request.getAmount(),
            request.getReceiptNumber(),
            request.getPaymentDate(),
            request.getDescription()
        );
        
        // Adjust party balance using consistent logic
        System.out.println("PaymentOutService: Calling updatePartyBalance with amount=" + request.getAmount() + ", transactionType=PAYMENT_OUT");
        partyService.updatePartyBalance(merchantId, party.getId(), request.getAmount(), PartyTransaction.TransactionType.PAYMENT_OUT);
        
        // Get the updated balance after payment and store it with the payment record
        BigDecimal balanceAfterPayment = partyService.getPartyBalance(merchantId, party.getId());
        paymentOut.setBalanceAfter(balanceAfterPayment);
        
        paymentOut = paymentOutRepository.save(paymentOut);
        System.out.println("Payment out saved with ID: " + paymentOut.getId() + ", balance after: " + balanceAfterPayment);
        
        // Record transaction based on payment type
        recordPaymentTransaction(merchantId, request, bankAccount, party);
        
        return convertToResponse(paymentOut, party, bankAccount);
    }
    
    
    private void recordPaymentTransaction(Long merchantId, PaymentOutRequest request, BankAccount bankAccount, Party party) {
        String description = "Payment to " + party.getName() + (request.getDescription() != null && !request.getDescription().trim().isEmpty() ? " - " + request.getDescription() : "");
        
        // Priority: Check for bankAccountId first, then specific payment types
        if (bankAccount != null) {
            // Record bank transaction (money going out)
            System.out.println("Recording bank transaction for account: " + bankAccount.getAccountDisplayName() + ", amount: " + request.getAmount());
            
            // Calculate new balance after withdrawal
            BigDecimal currentBalance = bankAccount.getCurrentBalance() != null ? bankAccount.getCurrentBalance() : BigDecimal.ZERO;
            BigDecimal newBalance = currentBalance.subtract(request.getAmount());
            
            // Update bank account balance
            bankAccount.setCurrentBalance(newBalance);
            bankAccountRepository.save(bankAccount);
            
            bankTransactionService.createBankTransaction(
                merchantId,
                bankAccount.getId(),
                BankTransaction.TransactionType.WITHDRAWAL,
                request.getAmount(),
                description,
                request.getReceiptNumber(),
                newBalance,
                request.getPaymentDate()
            );
        } else if ("Cash".equals(request.getPaymentType()) || "CASH".equals(request.getPaymentType())) {
            // Record cash transaction (money going out)
            System.out.println("Recording cash transaction: " + request.getAmount());
            cashTransactionService.createCashTransaction(
                merchantId,
                CashTransaction.TransactionType.OUT,
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
    
    public List<PaymentOutResponse> getPaymentOutsByMerchant(Long merchantId) {
        List<PaymentOut> paymentOuts = paymentOutRepository.findByMerchantIdOrderByPaymentDateDesc(merchantId);
        return paymentOuts.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    public List<PaymentOutResponse> getPaymentOutsByParty(Long merchantId, Long partyId) {
        List<PaymentOut> paymentOuts = paymentOutRepository.findByMerchantIdAndPartyIdOrderByPaymentDateDesc(merchantId, partyId);
        return paymentOuts.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    public List<PaymentOutResponse> getPaymentOutsByPaymentType(Long merchantId, String paymentType) {
        List<PaymentOut> paymentOuts = paymentOutRepository.findByMerchantIdAndPaymentTypeOrderByPaymentDateDesc(merchantId, paymentType);
        return paymentOuts.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    public List<PaymentOutResponse> getPaymentOutsByBankAccount(Long merchantId, Long bankAccountId) {
        List<PaymentOut> paymentOuts = paymentOutRepository.findByMerchantIdAndBankAccountIdOrderByPaymentDateDesc(merchantId, bankAccountId);
        return paymentOuts.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    public BigDecimal getTotalAmountByPaymentType(Long merchantId, String paymentType) {
        BigDecimal total = paymentOutRepository.getTotalAmountByPaymentType(merchantId, paymentType);
        return total != null ? total : BigDecimal.ZERO;
    }
    
    public BigDecimal getTotalAmountByParty(Long merchantId, Long partyId) {
        BigDecimal total = paymentOutRepository.getTotalAmountByParty(merchantId, partyId);
        return total != null ? total : BigDecimal.ZERO;
    }
    
    public void deletePaymentOut(Long merchantId, Long paymentOutId) {
        PaymentOut paymentOut = paymentOutRepository.findById(paymentOutId)
            .orElseThrow(() -> new RuntimeException("Payment out not found"));
        
        if (!paymentOut.getMerchantId().equals(merchantId)) {
            throw new RuntimeException("Unauthorized access");
        }
        
        paymentOutRepository.delete(paymentOut);
    }
    
    private PaymentOutResponse convertToResponse(PaymentOut paymentOut) {
        return convertToResponse(paymentOut, null, null);
    }
    
    private PaymentOutResponse convertToResponse(PaymentOut paymentOut, Party party, BankAccount bankAccount) {
        PaymentOutResponse response = new PaymentOutResponse();
        response.setId(paymentOut.getId());
        response.setPartyId(paymentOut.getPartyId());
        response.setPaymentType(paymentOut.getPaymentType());
        response.setBankAccountId(paymentOut.getBankAccountId());
        response.setAmount(paymentOut.getAmount());
        response.setReceiptNumber(paymentOut.getReceiptNumber());
        response.setPaymentDate(paymentOut.getPaymentDate());
        response.setDescription(paymentOut.getDescription());
        response.setCreatedAt(paymentOut.getCreatedAt());
        response.setUpdatedAt(paymentOut.getUpdatedAt());
        
        // Set party name if party is provided
        if (party != null) {
            response.setPartyName(party.getName());
        } else if (paymentOut.getPartyId() != null) {
            Optional<Party> partyOpt = partyRepository.findById(paymentOut.getPartyId());
            if (partyOpt.isPresent()) {
                response.setPartyName(partyOpt.get().getName());
            }
        }
        
        // Set bank account name if bank account is provided
        if (bankAccount != null) {
            response.setBankAccountName(bankAccount.getAccountDisplayName());
        } else if (paymentOut.getBankAccountId() != null) {
            Optional<BankAccount> bankOpt = bankAccountRepository.findById(paymentOut.getBankAccountId());
            if (bankOpt.isPresent()) {
                BankAccount bank = bankOpt.get();
                response.setBankAccountName(bank.getAccountDisplayName());
            }
        }
        
        return response;
    }
}
