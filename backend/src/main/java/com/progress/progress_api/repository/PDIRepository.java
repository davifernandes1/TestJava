package com.progress.progress_api.repository;

import com.progress.progress_api.model.PDI;
import com.progress.progress_api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // <-- Importe a anotação Query
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PDIRepository extends JpaRepository<PDI, Long> {
    
    // Seus métodos existentes (estão corretos)
    List<PDI> findByColaborador(Usuario colaborador);
    List<PDI> findByColaboradorId(Long colaboradorId);

    // --- NOVOS MÉTODOS PARA O DASHBOARD ---

    /**
     * Conta quantos PDIs existem para um determinado status.
     * Ex: "Em Andamento", "Concluído"
     * @param status O status a ser contado.
     * @return A contagem de PDIs.
     */
    long countByStatus(String status);

    /**
     * Retorna uma lista com a contagem de PDIs agrupados por cada status.
     * Ex: [ ["Em Andamento", 5], ["Concluído", 10] ]
     * @return Uma lista de arrays de objetos, onde obj[0] é o status (String) e obj[1] é a contagem (Long).
     */
    @Query("SELECT p.status, COUNT(p) FROM PDI p GROUP BY p.status")
    List<Object[]> countPDIsByStatus();
}