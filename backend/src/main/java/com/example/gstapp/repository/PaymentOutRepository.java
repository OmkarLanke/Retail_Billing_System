package com.example.gstapp.repository;

import com.example.gstapp.model.PaymentOut;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentOutRepository extends JpaRepository<PaymentOut, Long> {
    
    // Find all payment out records for a merchant
    List<PaymentOut> findByMerchantIdOrderByPaymentDateDesc(Long merchantId);
    
    // Find payment out records for a specific party
    List<PaymentOut> findByMerchantIdAndPartyIdOrderByPaymentDateDesc(Long merchantId, Long partyId);
    
    // Find payment out records by payment type
    List<PaymentOut> findByMerchantIdAndPaymentTypeOrderByPaymentDateDesc(Long merchantId, String paymentType);
    
    // Find payment out records by bank account
    List<PaymentOut> findByMerchantIdAndBankAccountIdOrderByPaymentDateDesc(Long merchantId, Long bankAccountId);
    
    // Find payment out records within date range
    @Query("SELECT po FROM PaymentOut po WHERE po.merchantId = :merchantId AND po.paymentDate BETWEEN :startDate AND :endDate ORDER BY po.paymentDate DESC")
    List<PaymentOut> findByMerchantIdAndPaymentDateBetween(@Param("merchantId") Long merchantId, 
                                                          @Param("startDate") LocalDateTime startDate, 
                                                          @Param("endDate") LocalDateTime endDate);
    
    // Find total amount paid out by payment type for a merchant
    @Query("SELECT SUM(po.amount) FROM PaymentOut po WHERE po.merchantId = :merchantId AND po.paymentType = :paymentType")
    BigDecimal getTotalAmountByPaymentType(@Param("merchantId") Long merchantId, @Param("paymentType") String paymentType);
    
    // Find total amount paid out to a specific party
    @Query("SELECT SUM(po.amount) FROM PaymentOut po WHERE po.merchantId = :merchantId AND po.partyId = :partyId")
    BigDecimal getTotalAmountByParty(@Param("merchantId") Long merchantId, @Param("partyId") Long partyId);
}
