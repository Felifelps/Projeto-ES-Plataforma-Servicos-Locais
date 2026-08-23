package br.com.ufape.backend.dto;

import br.com.ufape.backend.enums.StatusServico;

public record ServicoContratadoResponseDto(
        Long id,
        String titulo,
        String categoria,
        String bairro,
        String cidade,
        String nomePrestador,
        StatusServico statusAtual
) {}
