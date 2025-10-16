package com.example.gstapp.repository;

import com.example.gstapp.model.BankAccount;
import com.example.gstapp.model.User;
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
    
    Optional<BankAccount> findByMerchantIdAndAccountDisplayName(Long merchantId, String accountDisplayName);
    
    Optional<BankAccount> findByMerchantIdAndBankName(Long merchantId, String bankName);
    
    default Optional<BankAccount> findByIdAndUser(Long id, User user) {
        return findByIdAndMerchantId(id, user.getId());
    }
}
