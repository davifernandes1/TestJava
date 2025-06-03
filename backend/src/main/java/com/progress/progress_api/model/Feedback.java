package com.progress.progress_api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedbacks")
@Data
@NoArgsConstructor
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "autor_id", nullable = false)
    private Usuario autor; // Quem deu o feedback (pode ser gestor ou o próprio colaborador)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destinatario_id", nullable = false)
    private Usuario destinatario; // Para quem é o feedback

    @Column(columnDefinition = "TEXT")
    private String feedbackTextual;

    private String habilidadesUtilizadas;
    private String dificuldadesEncontradas;
    private String interessesAprendizado;

    private LocalDateTime dataEnvio;

    // Campos preenchidos pela IA (ou manualmente)
    private String sentimentoAnalisado; // Ex: Positivo, Neutro, Negativo
    private String categoriaDificuldadeAnalisada; // Ex: Gestão de tempo
    private String metaSugeridaIA;
    private String cursoRecomendadoIA;
    private String mentorIndicadoIA; // Pode ser o nome ou ID de outro Usuario

    @PrePersist
    protected void onCreate() {
        dataEnvio = LocalDateTime.now();
    }
}