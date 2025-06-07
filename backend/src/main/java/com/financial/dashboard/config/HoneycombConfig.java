package com.financial.dashboard.config;

import io.honeycomb.libhoney.HoneyClient;
import io.honeycomb.libhoney.LibHoney;
import io.honeycomb.libhoney.Options;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class HoneycombConfig {

    @Value("${honeycomb.api-key}")
    private String apiKey;

    @Value("${honeycomb.dataset}")
    private String dataset;

    @Value("${honeycomb.service-name}")
    private String serviceName;

    @Bean
    public HoneyClient honeyClient() {
        Options options = new Options.Builder()
            .setApiKey(apiKey)
            .setDataset(dataset)
            .setServiceName(serviceName)
            .build();

        return LibHoney.create(options);
    }
} 