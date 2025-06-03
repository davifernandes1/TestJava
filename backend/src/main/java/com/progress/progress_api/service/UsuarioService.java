package com.progress.progress_api.service;

import com.progress.progress_api.dto.UsuarioDTO;
import com.progress.progress_api.model.Role;
import com.progress.progress_api.model.Usuario;
import com.progress.progress_api.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public UsuarioDTO criarUsuario(UsuarioDTO usuarioDTO) {
        if (usuarioRepository.existsByEmail(usuarioDTO.getEmail())) {
            throw new RuntimeException("Erro: Email já está em uso!");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(usuarioDTO.getNome());
        usuario.setEmail(usuarioDTO.getEmail());
        usuario.setSenha(passwordEncoder.encode(usuarioDTO.getSenha())); // Hashear a senha
        usuario.setRole(usuarioDTO.getRole() != null ? usuarioDTO.getRole() : Role.ROLE_COLABORADOR); // Default role
        usuario.setCargo(usuarioDTO.getCargo());
        usuario.setArea(usuarioDTO.getArea());

        Usuario novoUsuario = usuarioRepository.save(usuario);
        return convertToDTO(novoUsuario);
    }
    
    @Transactional(readOnly = true)
    public Optional<UsuarioDTO> buscarUsuarioPorId(Long id) {
        return usuarioRepository.findById(id).map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public Optional<UsuarioDTO> buscarUsuarioPorEmail(String email) {
        return usuarioRepository.findByEmail(email).map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public List<UsuarioDTO> listarTodosUsuarios() {
        return usuarioRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    @Transactional
    public Optional<UsuarioDTO> atualizarUsuario(Long id, UsuarioDTO usuarioDTO) {
        return usuarioRepository.findById(id).map(usuarioExistente -> {
            usuarioExistente.setNome(usuarioDTO.getNome());
            usuarioExistente.setEmail(usuarioDTO.getEmail()); // Considerar validação se o email mudou e já existe
            if (usuarioDTO.getSenha() != null && !usuarioDTO.getSenha().isEmpty()) {
                usuarioExistente.setSenha(passwordEncoder.encode(usuarioDTO.getSenha()));
            }
            usuarioExistente.setRole(usuarioDTO.getRole());
            usuarioExistente.setCargo(usuarioDTO.getCargo());
            usuarioExistente.setArea(usuarioDTO.getArea());
            Usuario atualizado = usuarioRepository.save(usuarioExistente);
            return convertToDTO(atualizado);
        });
    }

    @Transactional
    public boolean deletarUsuario(Long id) {
        if (usuarioRepository.existsById(id)) {
            usuarioRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Método para criar um admin inicial (chamar uma vez ou proteger bem)
    @Transactional
    public void criarAdminInicialSeNaoExistir() {
        if (!usuarioRepository.findByEmail("admin@email.com").isPresent()) {
            UsuarioDTO adminDTO = new UsuarioDTO();
            adminDTO.setNome("Administrador");
            adminDTO.setEmail("admin@email.com");
            adminDTO.setSenha("admin123"); // Senha provisória, deve ser forte
            adminDTO.setRole(Role.ROLE_ADMIN);
            adminDTO.setCargo("SysAdmin");
            adminDTO.setArea("TI");
            criarUsuario(adminDTO);
            System.out.println("Usuário admin inicial criado.");
        }
    }
    
    private UsuarioDTO convertToDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setEmail(usuario.getEmail());
        // Não retornar a senha no DTO
        dto.setRole(usuario.getRole());
        dto.setCargo(usuario.getCargo());
        dto.setArea(usuario.getArea());
        return dto;
    }
}