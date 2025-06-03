package com.progress.progress_api.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class MetaPDIDTO {
    private Long id;
    private String descricaoMeta;
    private String acoesNecessarias;
    private LocalDate prazo;
    private boolean concluida;
    private String recursosNecessarios;
    private String feedbackMeta;
}
