package com.progress.progress_api.dto;

import java.util.List;
import java.util.Map;

// Usaremos 'record' para um DTO imutável e conciso (requer Java 16+)
// Se estiver usando uma versão mais antiga, crie uma classe normal com getters.
public record AdminDashboardDTO(
    // Estatísticas de Usuários
    long totalUsuarios,
    long totalColaboradores,
    long totalGestores,
    long totalAdmins,
    Map<String, Long> usuariosPorPerfil, // Ex: {"ROLE_ADMIN": 1, "ROLE_MANAGER": 5}

    // Estatísticas de PDIs
    long totalPDIs,
    long pdisAtivos,
    long pdisConcluidos,
    long pdisAtrasados,
    Map<String, Long> pdisPorStatus,

    // Feedbacks Recentes
    List<FeedbackDTO> feedbacksRecentes
) {}