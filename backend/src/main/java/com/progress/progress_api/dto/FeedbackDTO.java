package com.progress.progress_api.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FeedbackDTO {
    private Long id;
    private Long autorId;
    private String autorNome; // Para exibição
    private Long destinatarioId;
    private String destinatarioNome; // Para exibição
    private String feedbackTextual;
    private String habilidadesUtilizadas;
    private String dificuldadesEncontradas;
    private String interessesAprendizado;
    private LocalDateTime dataEnvio;
    private String sentimentoAnalisado;
    private String categoriaDificuldadeAnalisada;
    private String metaSugeridaIA;
    private String cursoRecomendadoIA;
    private String mentorIndicadoIA;
}
