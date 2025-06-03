package com.progress.progress_api.service;

import com.progress.progress_api.dto.FeedbackDTO;
import com.progress.progress_api.model.Feedback;
import com.progress.progress_api.model.Usuario;
import com.progress.progress_api.repository.FeedbackRepository;
import com.progress.progress_api.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private GeminiService geminiService; // Mockado

    @Transactional
    public FeedbackDTO criarFeedback(FeedbackDTO feedbackDTO) {
        Usuario autor = usuarioRepository.findById(feedbackDTO.getAutorId())
                .orElseThrow(() -> new RuntimeException("Autor não encontrado com ID: " + feedbackDTO.getAutorId()));
        Usuario destinatario = usuarioRepository.findById(feedbackDTO.getDestinatarioId())
                .orElseThrow(() -> new RuntimeException("Destinatário não encontrado com ID: " + feedbackDTO.getDestinatarioId()));

        Feedback feedback = new Feedback();
        feedback.setAutor(autor);
        feedback.setDestinatario(destinatario);
        feedback.setFeedbackTextual(feedbackDTO.getFeedbackTextual());
        feedback.setHabilidadesUtilizadas(feedbackDTO.getHabilidadesUtilizadas());
        feedback.setDificuldadesEncontradas(feedbackDTO.getDificuldadesEncontradas());
        feedback.setInteressesAprendizado(feedbackDTO.getInteressesAprendizado());
        
        // Simular chamada à IA
        geminiService.analisarFeedbackComIA(feedbackDTO); // Atualiza o DTO com dados da IA
        
        // Copiar dados da IA do DTO para a entidade
        feedback.setSentimentoAnalisado(feedbackDTO.getSentimentoAnalisado());
        feedback.setCategoriaDificuldadeAnalisada(feedbackDTO.getCategoriaDificuldadeAnalisada());
        feedback.setMetaSugeridaIA(feedbackDTO.getMetaSugeridaIA());
        feedback.setCursoRecomendadoIA(feedbackDTO.getCursoRecomendadoIA());
        feedback.setMentorIndicadoIA(feedbackDTO.getMentorIndicadoIA());

        Feedback feedbackSalvo = feedbackRepository.save(feedback);
        return convertToDTO(feedbackSalvo);
    }

    @Transactional(readOnly = true)
    public List<FeedbackDTO> listarFeedbacksPorDestinatario(Long destinatarioId) {
        Usuario destinatario = usuarioRepository.findById(destinatarioId)
                .orElseThrow(() -> new RuntimeException("Destinatário não encontrado com ID: " + destinatarioId));
        return feedbackRepository.findByDestinatario(destinatario).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<FeedbackDTO> listarTodosFeedbacks() {
        return feedbackRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private FeedbackDTO convertToDTO(Feedback feedback) {
        FeedbackDTO dto = new FeedbackDTO();
        dto.setId(feedback.getId());
        dto.setAutorId(feedback.getAutor().getId());
        dto.setAutorNome(feedback.getAutor().getNome());
        dto.setDestinatarioId(feedback.getDestinatario().getId());
        dto.setDestinatarioNome(feedback.getDestinatario().getNome());
        dto.setFeedbackTextual(feedback.getFeedbackTextual());
        dto.setHabilidadesUtilizadas(feedback.getHabilidadesUtilizadas());
        dto.setDificuldadesEncontradas(feedback.getDificuldadesEncontradas());
        dto.setInteressesAprendizado(feedback.getInteressesAprendizado());
        dto.setDataEnvio(feedback.getDataEnvio());
        dto.setSentimentoAnalisado(feedback.getSentimentoAnalisado());
        dto.setCategoriaDificuldadeAnalisada(feedback.getCategoriaDificuldadeAnalisada());
        dto.setMetaSugeridaIA(feedback.getMetaSugeridaIA());
        dto.setCursoRecomendadoIA(feedback.getCursoRecomendadoIA());
        dto.setMentorIndicadoIA(feedback.getMentorIndicadoIA());
        return dto;
    }
}
