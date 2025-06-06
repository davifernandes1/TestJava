package com.progress.progress_api.service;

import com.progress.progress_api.dto.AdminDashboardDTO;
import com.progress.progress_api.dto.FeedbackDTO;
import com.progress.progress_api.repository.FeedbackRepository;
import com.progress.progress_api.repository.PDIRepository;
import com.progress.progress_api.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PDIRepository pdiRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;
    
    @Autowired
    private FeedbackService feedbackService; // Reutilizar para converter para DTO

    public AdminDashboardDTO getAdminDashboardData() {
        // 1. Estatísticas de Usuários
        long totalUsuarios = usuarioRepository.count();
        long totalAdmins = usuarioRepository.countByRoles_Name("ROLE_ADMIN");
        long totalGestores = usuarioRepository.countByRoles_Name("ROLE_MANAGER");
        long totalColaboradores = usuarioRepository.countByRoles_Name("ROLE_COLLABORATOR");
        
        Map<String, Long> usuariosPorPerfil = usuarioRepository.countUsuariosByRole().stream()
                .collect(Collectors.toMap(obj -> (String) obj[0], obj -> (Long) obj[1]));

        // 2. Estatísticas de PDIs
        long totalPDIs = pdiRepository.count();
        long pdisAtivos = pdiRepository.countByStatus("Em Andamento"); // Use os nomes exatos do seu status
        long pdisConcluidos = pdiRepository.countByStatus("Concluído");
        long pdisAtrasados = pdiRepository.countByStatus("Atrasado");

        Map<String, Long> pdisPorStatus = pdiRepository.countPDIsByStatus().stream()
                .collect(Collectors.toMap(obj -> (String) obj[0], obj -> (Long) obj[1]));

        // 3. Feedbacks Recentes
        List<FeedbackDTO> feedbacksRecentes = feedbackRepository.findTop5ByOrderByDataEnvioDesc().stream()
                .map(feedbackService::convertToDTO) // Supondo que você tenha um método para converter
                .collect(Collectors.toList());

        // 4. Monta o DTO de resposta
        return new AdminDashboardDTO(
            totalUsuarios, totalColaboradores, totalGestores, totalAdmins, usuariosPorPerfil,
            totalPDIs, pdisAtivos, pdisConcluidos, pdisAtrasados, pdisPorStatus,
            feedbacksRecentes
        );
    }
}