package com.progress.progress_api.dto;

import com.progress.progress_api.model.PDI.StatusPDI;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class PDIDTO {
    private Long id;
    private Long colaboradorId;
    private String colaboradorNome; // Para exibição
    private String titulo;
    private String descricaoGeral;
    private LocalDate dataInicio;
    private LocalDate dataConclusaoPrevista;
    private LocalDate dataConclusaoReal;
    private StatusPDI status;
    private List<MetaPDIDTO> metas;
}