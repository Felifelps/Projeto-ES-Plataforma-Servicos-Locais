package br.com.ufape.backend.dto;

import br.com.ufape.backend.model.FormaCobranca;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ServicoRequestDto(
        @NotBlank(message = "O título é obrigatório")
        String titulo,

        @NotBlank(message = "A descrição é obrigatória")
        String descricao,

        @NotBlank(message = "A localização é obrigatória")
        String localizacao,

        @NotBlank(message = "A área de atendimento é obrigatória")
        String areaAtendimento,

        @NotNull(message = "A categoria é obrigatória")
        Long categoriaId,

        @NotNull(message = "A forma de cobrança é obrigatória")
        FormaCobranca formaCobranca
) {}