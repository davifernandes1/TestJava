package com.progress.progress_api.model;

import jakarta.persistence.*; // Importe as anotações do Jakarta Persistence
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity // <-- ANOTAÇÃO MAIS IMPORTANTE: Marca esta classe como uma tabela no banco de dados.
@Table(name = "roles") // Define o nome da tabela
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {

    @Id // <-- Define que este campo é a chave primária
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Gera o ID automaticamente
    private Long id;

    @Column(length = 20, unique = true, nullable = false)
    private String name; // Ex: ROLE_ADMIN, ROLE_MANAGER
}