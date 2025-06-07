package com.financialdashboard.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "portfolio_holdings")
public class PortfolioHolding {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private FinancialAccount account;

    @Column(nullable = false)
    private String symbol;

    @Column(nullable = false)
    private BigDecimal quantity;

    @Column(name = "average_price", nullable = false)
    private BigDecimal averagePrice;

    @Column(name = "current_price")
    private BigDecimal currentPrice;

    @UpdateTimestamp
    @Column(name = "last_updated")
    private ZonedDateTime lastUpdated;

    @Transient
    public BigDecimal getMarketValue() {
        return quantity.multiply(currentPrice != null ? currentPrice : averagePrice);
    }

    @Transient
    public BigDecimal getUnrealizedGainLoss() {
        if (currentPrice == null) {
            return BigDecimal.ZERO;
        }
        return quantity.multiply(currentPrice.subtract(averagePrice));
    }
} 