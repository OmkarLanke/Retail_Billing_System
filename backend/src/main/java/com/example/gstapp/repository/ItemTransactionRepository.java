package com.example.gstapp.repository;

import com.example.gstapp.model.ItemTransaction;
import com.example.gstapp.model.ItemTransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ItemTransactionRepository extends JpaRepository<ItemTransaction, Long> {
    
    List<ItemTransaction> findByItemIdAndMerchantIdOrderByTransactionDateDesc(Long itemId, Long merchantId);
    
    List<ItemTransaction> findByMerchantIdOrderByTransactionDateDesc(Long merchantId);
    
    List<ItemTransaction> findByItemIdAndMerchantIdAndTransactionTypeOrderByTransactionDateDesc(
        Long itemId, Long merchantId, ItemTransactionType transactionType);
    
    List<ItemTransaction> findByItemIdAndMerchantIdAndTransactionType(Long itemId, Long merchantId, ItemTransactionType transactionType);
    
    List<ItemTransaction> findByMerchantIdAndTransactionType(Long merchantId, ItemTransactionType transactionType);
    
    @Query("SELECT SUM(it.quantity) FROM ItemTransaction it WHERE it.itemId = :itemId AND it.merchantId = :merchantId")
    java.math.BigDecimal getTotalQuantityByItemId(@Param("itemId") Long itemId, @Param("merchantId") Long merchantId);
    
    @Query("SELECT SUM(it.quantity) FROM ItemTransaction it WHERE it.itemId = :itemId AND it.merchantId = :merchantId AND it.transactionType = :transactionType")
    java.math.BigDecimal getTotalQuantityByItemIdAndType(@Param("itemId") Long itemId, @Param("merchantId") Long merchantId, @Param("transactionType") ItemTransactionType transactionType);
    
    @Query("SELECT it FROM ItemTransaction it WHERE it.itemId = :itemId AND it.merchantId = :merchantId AND " +
           "it.transactionDate BETWEEN :startDate AND :endDate ORDER BY it.transactionDate DESC")
    List<ItemTransaction> findByItemIdAndMerchantIdAndDateRange(
        @Param("itemId") Long itemId, 
        @Param("merchantId") Long merchantId, 
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate);
}
