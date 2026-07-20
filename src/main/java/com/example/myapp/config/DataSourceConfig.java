package com.example.myapp.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.sql.Connection;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUsername;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    @Value("${spring.datasource.driver-class-name}")
    private String driverClassName;

    @Bean
    @Primary
    public DataSource dataSource() {
        log.info("[*] Initializing DataSource custom router...");
        log.info("[*] Configured database URL: {}", dbUrl);
        
        if (dbUrl == null || dbUrl.trim().isEmpty() || dbUrl.contains("jdbc:h2:")) {
            log.info("[*] H2 configured as default database.");
            return createH2DataSource();
        }

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(dbUrl);
        config.setUsername(dbUsername);
        config.setPassword(dbPassword);
        config.setDriverClassName(driverClassName);
        config.setInitializationFailTimeout(4000); // 4 seconds connection timeout
        config.setMaximumPoolSize(5);

        try {
            log.info("[*] Testing connection to the remote database...");
            HikariDataSource ds = new HikariDataSource(config);
            try (Connection conn = ds.getConnection()) {
                log.info("[+] Connection to remote database established successfully!");
                return ds;
            }
        } catch (Exception e) {
            log.error("[-] Remote database connection failed: {}. Falling back to H2 Database!", e.getMessage());
            return createH2DataSource();
        }
    }

    private DataSource createH2DataSource() {
        log.info("[*] Creating H2 In-Memory Database...");
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:h2:mem:sentinelcore;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE");
        config.setUsername("sa");
        config.setPassword("password");
        config.setDriverClassName("org.h2.Driver");
        return new HikariDataSource(config);
    }
}
