package br.com.ufape.backend.repository;

import br.com.ufape.backend.model.Orcamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrcamentoRepository extends JpaRepository<Orcamento, Long> {
    List<Orcamento> findByPrestadorUserId(Long usuarioId);
}
