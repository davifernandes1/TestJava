package com.progress.progress_api;

import com.progress.progress_api.config.JwtProperties; // <-- Importe a nova classe
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties; // <-- Importe a anotação

@SpringBootApplication
@EnableConfigurationProperties(JwtProperties.class) // <-- Adicione esta anotação
public class ProgressApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProgressApiApplication.class, args);
	}

}