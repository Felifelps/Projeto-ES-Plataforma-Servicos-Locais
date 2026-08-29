package br.com.ufape.backend.dto;
import java.math.BigDecimal;

public record OrcamentoResponseDto(
        Long id,
        String descricaoNecessidade,
        String localAtendimento,
        String dataOuPeriodoDesejado,
        Long servicoId,
        String tituloServico,
        String nomePrestador,
        String nomeSolicitante,
        String emailSolicitante,
        String descricaoResposta,
        String statusResposta,
        BigDecimal valorResposta
) {}
