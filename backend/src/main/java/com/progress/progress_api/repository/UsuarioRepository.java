package com.progress.progress_api.repository;

import com.progress.progress_api.model.Usuario;
import com.progress.progress_api.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;


@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    Boolean existsByEmail(String email);
    List<Usuario> findByRole(Role role); // Para buscar usuários por papel
}
