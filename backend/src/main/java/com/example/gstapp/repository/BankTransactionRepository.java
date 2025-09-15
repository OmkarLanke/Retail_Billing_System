package com.example.gstapp.repository;

import com.example.gstapp.model.BankTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BankTransactionRepository extends JpaRepository<BankTransaction, Long> {
    
    List<BankTransaction> findByBankAccountIdOrderByTransactionDateDesc(Long bankAccountId);
    
    List<BankTransaction> findByMerchantIdOrderByTransactionDateDesc(Long merchantId);
    
    @Query("SELECT bt FROM BankTransaction bt WHERE bt.bankAccountId = :bankAccountId AND bt.transactionDate BETWEEN :startDate AND :endDate ORDER BY bt.transactionDate DESC")
    List<BankTransaction> findByBankAccountIdAndDateRange(@Param("bankAccountId") Long bankAccountId, 
                                                         @Param("startDate") LocalDateTime startDate, 
                                                         @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT bt FROM BankTransaction bt WHERE bt.merchantId = :merchantId AND bt.transactionDate BETWEEN :startDate AND :endDate ORDER BY bt.transactionDate DESC")
    List<BankTransaction> findByMerchantIdAndDateRange(@Param("merchantId") Long merchantId, 
                                                      @Param("startDate") LocalDateTime startDate, 
                                                      @Param("endDate") LocalDateTime endDate);
}
