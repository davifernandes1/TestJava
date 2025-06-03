package com.progress.progress_api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "metas_pdi")
@Data
@NoArgsConstructor
public class MetaPDI {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Removido o @ManyToOne para PDI daqui, pois o relacionamento é unidirecional de PDI para MetaPDI
    // e a @JoinColumn está em PDI.

    @Column(nullable = false)
    private String descricaoMeta;

    @Column(columnDefinition = "TEXT")
    private String acoesNecessarias;

    private LocalDate prazo;
    private boolean concluida;
    private String recursosNecessarios; // Ex: Curso X, Mentoria com Y
    private String feedbackMeta; // Feedback específico sobre o progresso desta meta
}
