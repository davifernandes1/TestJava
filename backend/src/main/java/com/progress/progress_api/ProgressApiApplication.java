package com.progress.progress_api;

import com.progress.progress_api.service.UsuarioService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ProgressApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProgressApiApplication.class, args);
    }

    // Bean para criar usuário admin inicial (opcional)
    @Bean
    CommandLineRunner run(UsuarioService usuarioService) {
        return args -> {
            // Chamar o método para criar o admin se ele não existir
            usuarioService.criarAdminInicialSeNaoExistir();
        };
    }
}
