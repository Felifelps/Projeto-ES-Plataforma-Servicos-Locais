package br.com.ufape.backend.dto;
import br.com.ufape.backend.enums.FormaCobranca;


public record ServicoDetalheResponseDto(
    Long id,
    String titulo,
    String descricao,
    String categoria,
    String bairro,
    String cidade,
    FormaCobranca formaCobranca,
    String nomePrestador,
    String telefonePrestador,
    String descricaoPrestador
) {}