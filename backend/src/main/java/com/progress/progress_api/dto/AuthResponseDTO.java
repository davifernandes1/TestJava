package com.progress.progress_api.dto;

import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {

    private String token;
    private Long id;
    private String nome;
    private String email;
    private Set<String> roles; // Alterado para um conjunto de Nomes de Papel
}