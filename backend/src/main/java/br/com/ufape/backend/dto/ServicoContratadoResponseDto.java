package br.com.ufape.backend.dto;

public record ServicoContratadoResponseDto(
        Long id,
        String titulo,
        String categoria,
        String bairro,
        String cidade,
        String nomePrestador,
        String statusAtual
) {}
