package br.com.ufape.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record OrcamentoRequestDto(
        @NotNull(message = "O serviço é obrigatório")
        Long servicoId,

        @NotBlank(message = "A descrição da necessidade é obrigatória")
        String descricaoNecessidade,

        @NotBlank(message = "O local de atendimento é obrigatório")
        String localAtendimento,

        @NotBlank(message = "A data ou período desejado é obrigatório")
        String dataOuPeriodoDesejado
) {}
