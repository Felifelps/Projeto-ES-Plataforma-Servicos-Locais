package br.com.ufape.backend.enums;

public enum StatusServico {
    DISPONIVEL,
    CONTRATADO,
    EM_ANDAMENTO,
    REALIZADO;

    public boolean isMudancaValida(StatusServico novoStatus) {
        if (this == CONTRATADO && novoStatus == EM_ANDAMENTO) return true;
        if (this == EM_ANDAMENTO && novoStatus == REALIZADO) return true;
        return false; 
    }
}
