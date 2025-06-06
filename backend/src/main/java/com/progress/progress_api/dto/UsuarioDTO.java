package com.progress.progress_api.dto;

import lombok.Data;
import java.util.Set;

@Data
public class UsuarioDTO {
    private Long id;
    private String nome;
    private String email;
    private String senha; // Apenas para criação/atualização, não deve ser retornado
    private String cargo;
    private String area;
    private Set<String> roles; // Alterado para um conjunto de Nomes de Papel
}