package com.newsrater.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI newsRaterOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Did you hear the news API")
                .description("Compare coverage of the same story across Left, Center, and Right outlets.")
                .version("0.0.1"));
    }
}
