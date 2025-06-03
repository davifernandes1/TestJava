package com.progress.progress_api.controller;

import com.progress.progress_api.dto.AuthRequestDTO;
import com.progress.progress_api.dto.AuthResponseDTO;
import com.progress.progress_api.dto.UsuarioDTO;
import com.progress.progress_api.model.Usuario;
import com.progress.progress_api.security.JwtUtil;
import com.progress.progress_api.service.CustomUserDetailsService;
import com.progress.progress_api.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
// @CrossOrigin(origins = "http://localhost:3000") // Configurado globalmente em SecurityConfig
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private UsuarioService usuarioService; // Para registro

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
        
        Usuario usuario = (Usuario) userDetails; // Cast seguro pois CustomUserDetailsService retorna Usuario

        return ResponseEntity.ok(new AuthResponseDTO(token, usuario.getId(), usuario.getEmail(), usuario.getNome(), usuario.getRole()));
    }

    // Endpoint de registro (exemplo, pode ser ajustado ou removido)
    @PostMapping("/registrar")
    public ResponseEntity<?> registrarUsuario(@RequestBody UsuarioDTO usuarioDTO) {
        try {
            UsuarioDTO novoUsuario = usuarioService.criarUsuario(usuarioDTO);
            return ResponseEntity.ok("Usuário registrado com sucesso! ID: " + novoUsuario.getId());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
