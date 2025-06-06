package com.progress.progress_api.repository;

import com.progress.progress_api.model.Feedback;
import com.progress.progress_api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    // Seus métodos existentes (estão corretos)
    List<Feedback> findByAutor(Usuario autor);
    List<Feedback> findByDestinatario(Usuario destinatario);
    List<Feedback> findByAutorAndDestinatario(Usuario autor, Usuario destinatario);

    // --- NOVO MÉTODO PARA O DASHBOARD ---

    /**
     * Busca os 5 feedbacks mais recentes, ordenados pela data de envio de forma decrescente.
     * @return Uma lista com até 5 entidades de Feedback.
     */
    List<Feedback> findTop5ByOrderByDataEnvioDesc();
}