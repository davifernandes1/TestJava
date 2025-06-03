package com.progress.progress_api.controller;

import com.progress.progress_api.dto.FeedbackDTO;
import com.progress.progress_api.model.Usuario;
import com.progress.progress_api.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @PostMapping
    @PreAuthorize("isAuthenticated()") // Qualquer usuário autenticado pode criar
    public ResponseEntity<?> criarFeedback(@RequestBody FeedbackDTO feedbackDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Usuario usuarioLogado = (Usuario) authentication.getPrincipal();

        // Define o autor como o usuário logado, a menos que seja um admin/gestor especificando outro autor
        // Para simplificar, vamos assumir que o autorId no DTO é o usuário logado se não for admin
        if (feedbackDTO.getAutorId() == null || !usuarioLogado.getRole().name().equals("ROLE_ADMIN")) {
             feedbackDTO.setAutorId(usuarioLogado.getId());
        }
        // Adicionar validações de permissão:
        // - Colaborador só pode dar feedback para si mesmo (ou se o sistema permitir para outros, com regras)
        // - Gestor pode dar feedback para seus liderados ou para si.
        // - Admin pode dar feedback para qualquer um.

        try {
            FeedbackDTO novoFeedback = feedbackService.criarFeedback(feedbackDTO);
            return new ResponseEntity<>(novoFeedback, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/destinatario/{destinatarioId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR') or #destinatarioId == authentication.principal.id")
    public ResponseEntity<List<FeedbackDTO>> listarFeedbacksPorDestinatario(@PathVariable Long destinatarioId) {
        List<FeedbackDTO> feedbacks = feedbackService.listarFeedbacksPorDestinatario(destinatarioId);
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')") // Somente admin pode ver todos os feedbacks sem filtro
    public ResponseEntity<List<FeedbackDTO>> listarTodosFeedbacks() {
        List<FeedbackDTO> feedbacks = feedbackService.listarTodosFeedbacks();
        return ResponseEntity.ok(feedbacks);
    }
}