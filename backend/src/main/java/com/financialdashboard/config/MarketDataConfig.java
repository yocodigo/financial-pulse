package com.financialdashboard.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class MarketDataConfig {

    @Value("${market.alpha.vantage.api.key}")
    private String alphaVantageApiKey;

    @Value("${market.finnhub.api.key}")
    private String finnhubApiKey;

    @Value("${market.yahoo.finance.api.key}")
    private String yahooFinanceApiKey;

    @Bean
    public RestTemplate marketDataRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(5000);
        return new RestTemplate(factory);
    }

    @Bean
    public String alphaVantageApiKey() {
        return alphaVantageApiKey;
    }

    @Bean
    public String finnhubApiKey() {
        return finnhubApiKey;
    }

    @Bean
    public String yahooFinanceApiKey() {
        return yahooFinanceApiKey;
    }
} 