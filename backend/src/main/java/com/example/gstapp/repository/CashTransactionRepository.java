package com.example.gstapp.repository;

import com.example.gstapp.model.CashTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CashTransactionRepository extends JpaRepository<CashTransaction, Long> {
    
    List<CashTransaction> findByMerchantIdOrderByTransactionDateDesc(Long merchantId);
    
    @Query("SELECT SUM(ct.amount) FROM CashTransaction ct WHERE ct.merchantId = :merchantId AND ct.transactionType = 'IN'")
    Optional<BigDecimal> getTotalCashInByMerchantId(@Param("merchantId") Long merchantId);
    
    @Query("SELECT SUM(ct.amount) FROM CashTransaction ct WHERE ct.merchantId = :merchantId AND ct.transactionType = 'OUT'")
    Optional<BigDecimal> getTotalCashOutByMerchantId(@Param("merchantId") Long merchantId);
    
    @Query("SELECT SUM(ct.amount) FROM CashTransaction ct WHERE ct.merchantId = :merchantId AND ct.transactionType = 'ADJUSTMENT'")
    Optional<BigDecimal> getTotalAdjustmentsByMerchantId(@Param("merchantId") Long merchantId);
    
    @Query("SELECT ct FROM CashTransaction ct WHERE ct.merchantId = :merchantId AND ct.transactionDate BETWEEN :startDate AND :endDate ORDER BY ct.transactionDate DESC")
    List<CashTransaction> findByMerchantIdAndDateRange(@Param("merchantId") Long merchantId, 
                                                      @Param("startDate") LocalDateTime startDate, 
                                                      @Param("endDate") LocalDateTime endDate);
}
