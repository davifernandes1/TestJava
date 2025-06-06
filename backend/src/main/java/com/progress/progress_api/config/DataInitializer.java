package com.progress.progress_api.config;

import com.progress.progress_api.model.Role;
import com.progress.progress_api.repository.RoleRepository;
import com.progress.progress_api.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private UsuarioService usuarioService;

    @Override
    public void run(String... args) throws Exception {
        // Cria os papéis básicos se eles ainda não existirem no banco de dados
        if (roleRepository.findByName("ROLE_ADMIN").isEmpty()) {
            roleRepository.save(new Role(null, "ROLE_ADMIN"));
        }
        if (roleRepository.findByName("ROLE_MANAGER").isEmpty()) {
            roleRepository.save(new Role(null, "ROLE_MANAGER"));
        }
        if (roleRepository.findByName("ROLE_COLLABORATOR").isEmpty()) {
            roleRepository.save(new Role(null, "ROLE_COLLABORATOR"));
        }

        // Cria o usuário admin inicial se ele não existir
        usuarioService.criarAdminSeNaoExistir();
    }
}