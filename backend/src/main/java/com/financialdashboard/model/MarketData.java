package com.financialdashboard.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "market_data")
public class MarketData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String symbol;

    @Column(nullable = false)
    private BigDecimal price;

    private Long volume;

    @Column(nullable = false)
    private ZonedDateTime timestamp;

    @Column(name = "data_source", nullable = false)
    @Enumerated(EnumType.STRING)
    private DataSource dataSource;

    public enum DataSource {
        YAHOO_FINANCE,
        ALPHA_VANTAGE,
        IEX_CLOUD,
        FINNHUB
    }
} 