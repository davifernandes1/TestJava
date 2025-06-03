package com.progress.progress_api.repository;

import com.progress.progress_api.model.PDI;
import com.progress.progress_api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PDIRepository extends JpaRepository<PDI, Long> {
    List<PDI> findByColaborador(Usuario colaborador);
    List<PDI> findByColaboradorId(Long colaboradorId);
}
