package com.tripnest.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI tripNestOpenAPI() {

        return new OpenAPI()

                .info(new Info()

                        .title("TripNest API")

                        .description("TripNest Travel Planning Platform REST API")

                        .version("1.0")

                        .contact(new Contact()

                                .name("Karna")

                                .email("karna@example.com")))

                .externalDocs(new ExternalDocumentation()

                        .description("TripNest Documentation"))

                .addSecurityItem(
                        new SecurityRequirement().addList(SECURITY_SCHEME_NAME)
                )

                .components(
                        new Components()
                                .addSecuritySchemes(
                                        SECURITY_SCHEME_NAME,
                                        new SecurityScheme()
                                                .type(SecurityScheme.Type.HTTP)
                                                .scheme("bearer")
                                                .bearerFormat("JWT")
                                )
                );
    }
}