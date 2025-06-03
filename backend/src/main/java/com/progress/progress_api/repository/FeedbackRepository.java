package com.progress.progress_api.repository;

import com.progress.progress_api.model.Feedback;
import com.progress.progress_api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByAutor(Usuario autor);
    List<Feedback> findByDestinatario(Usuario destinatario);
    List<Feedback> findByAutorAndDestinatario(Usuario autor, Usuario destinatario);
}
