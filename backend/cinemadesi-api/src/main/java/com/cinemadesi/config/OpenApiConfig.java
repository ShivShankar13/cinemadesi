package com.cinemadesi.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Registers a {@code bearerAuth} JWT security scheme on the OpenAPI doc
 * so Swagger UI ({@code /swagger-ui}) shows an <strong>Authorize</strong>
 * button and persists the token across calls.
 *
 * <p>Without this, every call from Swagger UI would need manual
 * {@code Authorization: Bearer ...} headers.</p>
 */
@Configuration
public class OpenApiConfig {

    private static final String BEARER_SCHEME = "bearerAuth";

    @Bean
    public OpenAPI cinemaDesiOpenAPI(
            @Value("${server.port:8080}") String port
    ) {
        return new OpenAPI()
                .info(new Info()
                        .title("CinemaDesi API")
                        .version("1.0.0")
                        .description("Indian cinema social platform — log films, rate, "
                                + "review, build watch groups, and discover regional films.")
                        .contact(new Contact().name("CinemaDesi"))
                        .license(new License().name("MIT")))
                .servers(List.of(
                        new Server().url("http://localhost:" + port).description("Local"),
                        new Server().url("/").description("Same-host")
                ))
                .components(new Components()
                        .addSecuritySchemes(BEARER_SCHEME, new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Paste the access token from POST /auth/login (no 'Bearer ' prefix).")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_SCHEME));
    }
}
