package com.example.gstapp.repository;

import com.example.gstapp.model.PartyTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PartyTransactionRepository extends JpaRepository<PartyTransaction, Long> {
    
    List<PartyTransaction> findByMerchantIdAndPartyIdOrderByTransactionDateDesc(Long merchantId, Long partyId);
    
    List<PartyTransaction> findByMerchantIdAndPartyIdAndTransactionTypeOrderByTransactionDateDesc(
        Long merchantId, Long partyId, PartyTransaction.TransactionType transactionType);
    
    List<PartyTransaction> findByMerchantIdAndTransactionType(Long merchantId, PartyTransaction.TransactionType transactionType);
    
    @Query("SELECT pt FROM PartyTransaction pt WHERE pt.merchantId = :merchantId AND pt.partyId = :partyId " +
           "AND (pt.transactionDate BETWEEN :startDate AND :endDate) " +
           "ORDER BY pt.transactionDate DESC")
    List<PartyTransaction> findByMerchantIdAndPartyIdAndDateRange(
        @Param("merchantId") Long merchantId, 
        @Param("partyId") Long partyId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COALESCE(SUM(pt.amount), 0) FROM PartyTransaction pt " +
           "WHERE pt.merchantId = :merchantId AND pt.partyId = :partyId " +
           "AND pt.transactionType IN ('SALE', 'PAYMENT_IN')")
    BigDecimal getTotalCreditAmount(@Param("merchantId") Long merchantId, @Param("partyId") Long partyId);
    
    @Query("SELECT COALESCE(SUM(pt.amount), 0) FROM PartyTransaction pt " +
           "WHERE pt.merchantId = :merchantId AND pt.partyId = :partyId " +
           "AND pt.transactionType IN ('PURCHASE', 'PAYMENT_OUT')")
    BigDecimal getTotalDebitAmount(@Param("merchantId") Long merchantId, @Param("partyId") Long partyId);
    
    PartyTransaction findTopByMerchantIdAndPartyIdOrderByTransactionDateDesc(Long merchantId, Long partyId);
}
