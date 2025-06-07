package com.financialdashboard.repository;

import com.financialdashboard.model.MarketData;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MarketDataRepository extends JpaRepository<MarketData, Long> {
    List<MarketData> findBySymbolOrderByTimestampDesc(String symbol);
    
    @Query("SELECT m FROM MarketData m WHERE m.symbol = ?1 AND m.timestamp = " +
           "(SELECT MAX(m2.timestamp) FROM MarketData m2 WHERE m2.symbol = ?1)")
    Optional<MarketData> findLatestBySymbol(String symbol);
    
    List<MarketData> findBySymbolAndTimestampBetween(
        String symbol, 
        ZonedDateTime startTime, 
        ZonedDateTime endTime
    );
    
    Page<MarketData> findBySymbol(String symbol, Pageable pageable);
} 