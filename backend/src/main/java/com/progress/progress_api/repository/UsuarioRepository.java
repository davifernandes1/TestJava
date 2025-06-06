package com.progress.progress_api.repository;


import com.progress.progress_api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // <-- Importe a anotação Query
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    // Seus métodos existentes (estão corretos)
    Optional<Usuario> findByEmail(String email);
    Boolean existsByEmail(String email);

    // O método abaixo provavelmente não funciona como esperado se um usuário tiver múltiplos papéis.
    // List<Usuario> findByRole(Role role); // <-- COMENTADO/REMOVIDO

    // --- NOVOS MÉTODOS PARA O DASHBOARD E BUSCAS CORRETAS ---

    /**
     * Conta quantos usuários possuem um determinado papel (role).
     * Este método funciona para relações Many-to-Many entre Usuario e Role.
     * @param roleName O nome do papel, ex: "ROLE_ADMIN".
     * @return A contagem de usuários.
     */
    long countByRoles_Name(String roleName);

    /**
     * Retorna uma lista com a contagem de usuários agrupados por cada papel (role).
     * Funciona para relações Many-to-Many.
     * @return Uma lista de arrays de objetos, onde obj[0] é o nome do papel (String) e obj[1] é a contagem (Long).
     */
    @Query("SELECT r.name, COUNT(u) FROM Usuario u JOIN u.roles r GROUP BY r.name")
    List<Object[]> countUsuariosByRole();
}