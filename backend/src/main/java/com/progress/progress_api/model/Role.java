package com.progress.progress_api.model;

import org.springframework.security.core.GrantedAuthority;

public enum Role implements GrantedAuthority {
    ROLE_ADMIN,
    ROLE_GESTOR,
    ROLE_COLABORADOR;

    @Override
    public String getAuthority() {
        return name();
    }
}
