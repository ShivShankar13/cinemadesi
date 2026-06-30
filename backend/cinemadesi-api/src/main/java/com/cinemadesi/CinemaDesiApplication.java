package com.cinemadesi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * CinemaDesi API — Indian cinema social platform.
 *
 * <p>Bootstrap entry point. Virtual threads are enabled via
 * {@code spring.threads.virtual.enabled=true} in {@code application.yml}.
 * {@code @EnableScheduling} powers the TMDB trending refresh job.</p>
 */
@SpringBootApplication
@EnableScheduling
public class CinemaDesiApplication {

    public static void main(String[] args) {
        SpringApplication.run(CinemaDesiApplication.class, args);
    }
}
