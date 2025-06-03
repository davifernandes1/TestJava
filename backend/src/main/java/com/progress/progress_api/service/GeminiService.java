package com.progress.progress_api.service;

import com.progress.progress_api.dto.FeedbackDTO;
import com.progress.progress_api.dto.MetaPDIDTO;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;

@Service
public class GeminiService {

    // Simula a análise de feedback pela IA
    public void analisarFeedbackComIA(FeedbackDTO feedbackDTO) {
        System.out.println("IA: Analisando feedback para: " + feedbackDTO.getDestinatarioNome());
        // Lógica mockada
        if (feedbackDTO.getFeedbackTextual() != null && feedbackDTO.getFeedbackTextual().toLowerCase().contains("difícil")) {
            feedbackDTO.setSentimentoAnalisado("Negativo");
            feedbackDTO.setCategoriaDificuldadeAnalisada("Gestão de Tarefas");
            feedbackDTO.setMetaSugeridaIA("Melhorar organização em 20% no próximo mês.");
            feedbackDTO.setCursoRecomendadoIA("Curso de Produtividade Avançada");
        } else {
            feedbackDTO.setSentimentoAnalisado("Positivo");
            feedbackDTO.setCategoriaDificuldadeAnalisada("N/A");
            feedbackDTO.setMetaSugeridaIA("Continuar o excelente trabalho!");
        }
        System.out.println("IA: Análise concluída. Sentimento: " + feedbackDTO.getSentimentoAnalisado());
    }

    // Simula a sugestão de metas para PDI pela IA
    public List<MetaPDIDTO> sugerirMetasPDIPorIA(Long colaboradorId, String objetivoPrincipal) {
        System.out.println("IA: Sugerindo metas de PDI para colaborador ID: " + colaboradorId + " com objetivo: " + objetivoPrincipal);
        List<MetaPDIDTO> metasSugeridas = new ArrayList<>();
        
        MetaPDIDTO meta1 = new MetaPDIDTO();
        meta1.setDescricaoMeta("Concluir curso de " + objetivoPrincipal + " online");
        meta1.setAcoesNecessarias("Pesquisar cursos, inscrever-se, dedicar 5h/semana");
        meta1.setRecursosNecessarios("Plataforma de cursos online (ex: Alura, Coursera)");
        metasSugeridas.add(meta1);

        MetaPDIDTO meta2 = new MetaPDIDTO();
        meta2.setDescricaoMeta("Aplicar conhecimentos de " + objetivoPrincipal + " em um projeto prático");
        meta2.setAcoesNecessarias("Identificar projeto, definir escopo, executar e apresentar resultados");
        meta2.setRecursosNecessarios("Mentoria de um colega sênior");
        metasSugeridas.add(meta2);

        System.out.println("IA: " + metasSugeridas.size() + " metas sugeridas.");
        return metasSugeridas;
    }
}
