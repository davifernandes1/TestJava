package com.progress.progress_api.controller;

import com.progress.progress_api.dto.AuthRequestDTO;
import com.progress.progress_api.dto.AuthResponseDTO;
import com.progress.progress_api.model.Role;
import com.progress.progress_api.model.Usuario;
import com.progress.progress_api.security.JwtUtil;
import com.progress.progress_api.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.stream.Collectors;
import java.util.Set;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthRequestDTO authRequestDTO) throws Exception {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequestDTO.getEmail(), authRequestDTO.getSenha())
            );
        } catch (BadCredentialsException e) {
            throw new Exception("Email ou senha incorretos", e);
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(authRequestDTO.getEmail());
        final String token = jwtUtil.generateToken(userDetails);

        // Converte o UserDetails de volta para o nosso objeto Usuario
        Usuario usuario = (Usuario) userDetails;

        // Mapeia o Set<Role> para um Set<String> com os nomes dos papéis
        Set<String> roleNames = usuario.getRoles().stream()
                                    .map(Role::getName)
                                    .collect(Collectors.toSet());

        // Retorna o DTO com todos os dados necessários para o frontend
        return ResponseEntity.ok(
            new AuthResponseDTO(token, usuario.getId(), usuario.getNome(), usuario.getEmail(), roleNames)
        );
    }
}