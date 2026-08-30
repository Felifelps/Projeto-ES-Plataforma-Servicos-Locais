package br.com.ufape.backend.enums;

public enum StatusServico {
    DISPONIVEL,
    CONTRATADO,
    EM_ANDAMENTO,
    REALIZADO;

    public boolean isMudancaValida(StatusServico novoStatus) {
    return (this == CONTRATADO && novoStatus == EM_ANDAMENTO)
            || (this == EM_ANDAMENTO && novoStatus == REALIZADO);
    }
}
