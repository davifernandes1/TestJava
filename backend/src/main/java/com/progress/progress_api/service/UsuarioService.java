package com.progress.progress_api.service;

import com.progress.progress_api.dto.UsuarioDTO;
import com.progress.progress_api.model.Role;
import com.progress.progress_api.model.Usuario;
import com.progress.progress_api.repository.RoleRepository;
import com.progress.progress_api.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // --- MÉTODOS DE CRIAÇÃO ---

    @Transactional
    public UsuarioDTO criarUsuario(UsuarioDTO usuarioDTO) {
        if (usuarioRepository.existsByEmail(usuarioDTO.getEmail())) {
            throw new RuntimeException("Erro: Email já está em uso!");
        }
        
        // Mapeia os dados do DTO para a nova entidade
        Usuario usuario = new Usuario();
        usuario.setNome(usuarioDTO.getNome());
        usuario.setEmail(usuarioDTO.getEmail());
        usuario.setCargo(usuarioDTO.getCargo());
        usuario.setArea(usuarioDTO.getArea());
        
        // IMPORTANTE: Hashear a senha antes de salvar!
        usuario.setSenha(passwordEncoder.encode(usuarioDTO.getSenha()));

        // Atribui o papel de colaborador por padrão
        Role defaultRole = roleRepository.findByName("ROLE_COLLABORATOR")
                .orElseThrow(() -> new RuntimeException("Erro: Papel padrão 'ROLE_COLLABORATOR' não encontrado."));
        
        usuario.setRoles(Set.of(defaultRole));

        // Salva a nova entidade no banco de dados
        Usuario novoUsuario = usuarioRepository.save(usuario);
        
        return convertToDTO(novoUsuario);
    }

    @Transactional
    public void criarAdminSeNaoExistir() {
        if (usuarioRepository.findByEmail("admin@admin.com").isEmpty()) {
            Usuario admin = new Usuario();
            admin.setNome("Administrador");
            admin.setEmail("admin@admin.com");
            
            // Lembre-se de hashear a senha!
            admin.setSenha(passwordEncoder.encode("admin123")); // Senha provisória, deve ser forte
            
            // Busca o papel "ROLE_ADMIN" no banco de dados
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseThrow(() -> new RuntimeException("Erro: Papel 'ROLE_ADMIN' não encontrado."));
            
            admin.setRoles(Set.of(adminRole));
            
            admin.setCargo("SysAdmin");
            admin.setArea("TI");

            usuarioRepository.save(admin);
            System.out.println("Usuário admin inicial criado.");
        }
    }

    // --- MÉTODOS DE LEITURA ---

    @Transactional(readOnly = true)
    public List<UsuarioDTO> listarTodosUsuarios() {
        return usuarioRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<UsuarioDTO> buscarUsuarioPorEmail(String email) {
        return usuarioRepository.findByEmail(email).map(this::convertToDTO);
    }
    
    @Transactional(readOnly = true)
    public Optional<UsuarioDTO> buscarUsuarioPorId(Long id) {
        return usuarioRepository.findById(id).map(this::convertToDTO);
    }

    // --- MÉTODOS DE ATUALIZAÇÃO E DELEÇÃO ---

    @Transactional
    public UsuarioDTO atualizarUsuario(Long id, UsuarioDTO usuarioDTO) {
        Usuario usuarioExistente = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com ID: " + id));

        usuarioExistente.setNome(usuarioDTO.getNome());
        usuarioExistente.setEmail(usuarioDTO.getEmail());
        usuarioExistente.setCargo(usuarioDTO.getCargo());
        usuarioExistente.setArea(usuarioDTO.getArea());

        // Atualiza a senha apenas se uma nova for fornecida
        if (usuarioDTO.getSenha() != null && !usuarioDTO.getSenha().isEmpty()) {
            usuarioExistente.setSenha(passwordEncoder.encode(usuarioDTO.getSenha()));
        }

        Usuario usuarioAtualizado = usuarioRepository.save(usuarioExistente);
        return convertToDTO(usuarioAtualizado);
    }

    @Transactional
    public void deletarUsuario(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RuntimeException("Usuário não encontrado com ID: " + id);
        }
        usuarioRepository.deleteById(id);
    }

    // --- MÉTODO AUXILIAR DE CONVERSÃO ---
    private UsuarioDTO convertToDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setEmail(usuario.getEmail());
        dto.setCargo(usuario.getCargo());
        dto.setArea(usuario.getArea());
        if (usuario.getRoles() != null) {
            dto.setRoles(usuario.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
        }
        return dto;
    }
}