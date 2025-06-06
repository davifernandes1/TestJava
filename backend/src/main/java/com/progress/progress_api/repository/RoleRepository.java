package com.progress.progress_api.repository;

import com.progress.progress_api.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    /**
     * Busca um papel (role) pelo seu nome único.
     * @param name O nome do papel (ex: "ROLE_ADMIN").
     * @return Um Optional contendo o Role, se encontrado.
     */
    Optional<Role> findByName(String name);
}