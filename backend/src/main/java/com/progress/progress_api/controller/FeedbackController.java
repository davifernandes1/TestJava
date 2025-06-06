package com.progress.progress_api.controller;

import com.progress.progress_api.dto.FeedbackDTO;
import com.progress.progress_api.model.Usuario;
import com.progress.progress_api.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {
    
    @Autowired
    private FeedbackService feedbackService;

    @PostMapping
    @PreAuthorize("isAuthenticated()") // Qualquer usuário autenticado pode criar
    public ResponseEntity<FeedbackDTO> criarFeedback(@RequestBody FeedbackDTO feedbackDTO, Authentication authentication) {
        // Pega o objeto do usuário logado a partir do token
        Usuario usuarioLogado = (Usuario) authentication.getPrincipal();

        // Verifica se o usuário logado tem a permissão 'ROLE_ADMIN'
        boolean isAdmin = authentication.getAuthorities().stream()
                            .map(GrantedAuthority::getAuthority)
                            .anyMatch(roleName -> roleName.equals("ROLE_ADMIN"));

        // Se o autor não foi definido no DTO, ou se o usuário não é um admin,
        // define o autor como o próprio usuário logado.
        // Isso permite que um admin crie um feedback em nome de outro gestor, se necessário.
        if (feedbackDTO.getAutorId() == null || !isAdmin) {
            feedbackDTO.setAutorId(usuarioLogado.getId());
        }

        FeedbackDTO novoFeedback = feedbackService.criarFeedback(feedbackDTO);
        return new ResponseEntity<>(novoFeedback, HttpStatus.CREATED);
    }
    
    // Adicione outros endpoints aqui (GET, PUT, DELETE)...
}