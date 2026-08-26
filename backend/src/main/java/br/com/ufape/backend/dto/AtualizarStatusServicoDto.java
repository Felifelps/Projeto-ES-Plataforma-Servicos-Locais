package br.com.ufape.backend.dto;

import br.com.ufape.backend.enums.StatusServico;
import jakarta.validation.constraints.NotNull;

public record AtualizarStatusServicoDto(
    @NotNull(message = "O novo status é obrigatório")
    StatusServico status
) {}