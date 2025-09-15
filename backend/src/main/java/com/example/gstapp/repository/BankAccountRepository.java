package com.example.gstapp.repository;

import com.example.gstapp.model.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {
    
    List<BankAccount> findByMerchantIdAndIsActiveTrueOrderByCreatedAtDesc(Long merchantId);
    
    Optional<BankAccount> findByIdAndMerchantId(Long id, Long merchantId);
    
    @Query("SELECT SUM(ba.currentBalance) FROM BankAccount ba WHERE ba.merchantId = :merchantId AND ba.isActive = true")
    Optional<BigDecimal> getTotalBankBalanceByMerchantId(@Param("merchantId") Long merchantId);
    
    boolean existsByMerchantIdAndAccountNumberAndIsActiveTrue(Long merchantId, String accountNumber);
}
