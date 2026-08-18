package br.com.ufape.backend.dto;

public record OrcamentoResponseDto(
        Long id,
        String descricaoNecessidade,
        String localAtendimento,
        String dataOuPeriodoDesejado,
        Long servicoId,
        String tituloServico,
        String nomePrestador,
        String nomeSolicitante,
        String emailSolicitante
) {}
