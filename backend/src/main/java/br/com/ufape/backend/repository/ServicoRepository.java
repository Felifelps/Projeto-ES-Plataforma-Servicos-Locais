package br.com.ufape.backend.repository;

import br.com.ufape.backend.model.Servico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ServicoRepository extends JpaRepository<Servico, Long> {
    @Query("SELECT s FROM Servico s WHERE " +
       "(:categoria IS NULL OR s.categoria.name = :categoria) AND " +
       "(:cidade IS NULL OR s.areaAtendimento LIKE %:cidade%) AND " +
       "(:bairro IS NULL OR s.localizacao LIKE %:bairro%)")
    List<Servico> buscarComFiltrosOpcionais(
        @Param("categoria") String categoria, 
        @Param("cidade") String cidade, 
        @Param("bairro") String bairro
    );
    
}