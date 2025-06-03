package com.progress.progress_api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nome; // Nome completo do usuário

    @Column(nullable = false, unique = true)
    private String email; // Usado para login

    @Column(nullable = false)
    private String senha; // Senha HASHED

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String cargo;
    private String area;

    // Relacionamento com Feedbacks (Um usuário pode ter muitos feedbacks)
    @OneToMany(mappedBy = "autor", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<Feedback> feedbacksCriados = new HashSet<>();

    // Relacionamento com PDIs (Um usuário pode ter muitos PDIs)
    @OneToMany(mappedBy = "colaborador", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<PDI> pdis = new HashSet<>();

    // Construtor para facilitar a criação
    public Usuario(String nome, String email, String senha, Role role, String cargo, String area) {
        this.nome = nome;
        this.email = email;
        this.senha = senha; // Lembre-se de hashear a senha antes de salvar
        this.role = role;
        this.cargo = cargo;
        this.area = area;
    }

    // Métodos da interface UserDetails
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(role);
    }

    @Override
    public String getPassword() {
        return this.senha;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
