package com.progress.progress_api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pdis")
@Data
@NoArgsConstructor
public class PDI {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "colaborador_id", nullable = false)
    private Usuario colaborador;

    @Column(nullable = false)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descricaoGeral; // Objetivos gerais

    private LocalDate dataInicio;
    private LocalDate dataConclusaoPrevista;
    private LocalDate dataConclusaoReal;

    @Enumerated(EnumType.STRING)
    private StatusPDI status; // Ex: EM_ANDAMENTO, CONCLUIDO, CANCELADO

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "pdi_id") // Adiciona a coluna de chave estrangeira na tabela 'meta_pdi'
    private List<MetaPDI> metas = new ArrayList<>();

    public enum StatusPDI {
        PLANEJADO,
        EM_ANDAMENTO,
        CONCLUIDO,
        CANCELADO,
        ATRASADO
    }
}
