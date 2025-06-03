package com.progress.progress_api.dto;

import com.progress.progress_api.model.Role;
import lombok.Data;

@Data
public class UsuarioDTO {
    private Long id;
    private String nome;
    private String email;
    private String senha; // Apenas para criação/atualização de senha
    private Role role;
    private String cargo;
    private String area;
}