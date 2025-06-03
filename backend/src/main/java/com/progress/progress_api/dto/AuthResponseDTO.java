package com.progress.progress_api.dto;

import com.progress.progress_api.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponseDTO {
    private String token;
    private Long id;
    private String email;
    private String nome;
    private Role role;
}