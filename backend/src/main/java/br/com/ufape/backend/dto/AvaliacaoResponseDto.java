package br.com.ufape.backend.dto;

import br.com.ufape.backend.model.Avaliacao;

import java.time.LocalDateTime;

public record AvaliacaoResponseDto(
        Long id,
        Long servicoId,
        Long prestadorId,
        Long usuarioId,
        Integer nota,
        String comentario,
        LocalDateTime createdAt
) {
    public static AvaliacaoResponseDto from(Avaliacao avaliacao) {
        return new AvaliacaoResponseDto(
                avaliacao.getId(),
                avaliacao.getServico().getId(),
                avaliacao.getPrestador().getId(),
                avaliacao.getUsuario().getId(),
                avaliacao.getNota(),
                avaliacao.getComentario(),
                avaliacao.getCreatedAt()
        );
    }
}
