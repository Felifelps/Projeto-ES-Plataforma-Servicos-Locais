package br.com.ufape.backend.repository;

import br.com.ufape.backend.model.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {
    boolean existsByServicoIdAndUsuarioId(Long servicoId, Long usuarioId);
}
