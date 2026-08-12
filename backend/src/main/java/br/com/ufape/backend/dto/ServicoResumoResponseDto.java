package br.com.ufape.backend.dto;


public record ServicoResumoResponseDto(
    Long id,
    String titulo,
    String categoria,
    String bairro,
    String cidade,
    String nomePrestador
) {}