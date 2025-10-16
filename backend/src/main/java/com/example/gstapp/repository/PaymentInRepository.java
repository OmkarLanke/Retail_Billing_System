package com.example.gstapp.repository;

import com.example.gstapp.model.PaymentIn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentInRepository extends JpaRepository<PaymentIn, Long> {
    
    // Find all payment in records for a merchant
    List<PaymentIn> findByMerchantIdOrderByPaymentDateDesc(Long merchantId);
    
    // Find payment in records for a specific party
    List<PaymentIn> findByMerchantIdAndPartyIdOrderByPaymentDateDesc(Long merchantId, Long partyId);
    
    // Find payment in records by payment type
    List<PaymentIn> findByMerchantIdAndPaymentTypeOrderByPaymentDateDesc(Long merchantId, String paymentType);
    
    // Find payment in records by bank account
    List<PaymentIn> findByMerchantIdAndBankAccountIdOrderByPaymentDateDesc(Long merchantId, Long bankAccountId);
    
    // Find payment in records within date range
    @Query("SELECT pi FROM PaymentIn pi WHERE pi.merchantId = :merchantId AND pi.paymentDate BETWEEN :startDate AND :endDate ORDER BY pi.paymentDate DESC")
    List<PaymentIn> findByMerchantIdAndPaymentDateBetween(@Param("merchantId") Long merchantId, 
                                                          @Param("startDate") LocalDateTime startDate, 
                                                          @Param("endDate") LocalDateTime endDate);
    
    // Find total amount received by payment type for a merchant
    @Query("SELECT SUM(pi.amount) FROM PaymentIn pi WHERE pi.merchantId = :merchantId AND pi.paymentType = :paymentType")
    BigDecimal getTotalAmountByPaymentType(@Param("merchantId") Long merchantId, @Param("paymentType") String paymentType);
    
    // Find total amount received from a specific party
    @Query("SELECT SUM(pi.amount) FROM PaymentIn pi WHERE pi.merchantId = :merchantId AND pi.partyId = :partyId")
    BigDecimal getTotalAmountByParty(@Param("merchantId") Long merchantId, @Param("partyId") Long partyId);
    
    // Find total amount received by bank account
    @Query("SELECT SUM(pi.amount) FROM PaymentIn pi WHERE pi.merchantId = :merchantId AND pi.bankAccountId = :bankAccountId")
    BigDecimal getTotalAmountByBankAccount(@Param("merchantId") Long merchantId, @Param("bankAccountId") Long bankAccountId);
    
    // Find total amount received within date range
    @Query("SELECT SUM(pi.amount) FROM PaymentIn pi WHERE pi.merchantId = :merchantId AND pi.paymentDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalAmountByDateRange(@Param("merchantId") Long merchantId, 
                                        @Param("startDate") LocalDateTime startDate, 
                                        @Param("endDate") LocalDateTime endDate);
}
