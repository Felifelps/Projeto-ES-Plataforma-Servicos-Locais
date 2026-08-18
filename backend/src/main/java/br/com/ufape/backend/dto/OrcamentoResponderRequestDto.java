package br.com.ufape.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record OrcamentoResponderRequestDto(
        @NotNull(message = "O valor estimado é obrigatório")
        BigDecimal valor_resposta,

        @NotBlank(message = "A resposta/condições não pode ficar em branco")
        String descricao_resposta
) {}