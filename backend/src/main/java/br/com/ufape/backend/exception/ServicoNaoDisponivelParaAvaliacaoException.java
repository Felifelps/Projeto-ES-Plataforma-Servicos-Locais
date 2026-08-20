package br.com.ufape.backend.exception;

import org.springframework.http.HttpStatus;

public class ServicoNaoDisponivelParaAvaliacaoException extends BaseException {
    public ServicoNaoDisponivelParaAvaliacaoException() {
        super("O serviço informado não pertence ao usuário ou ainda não foi realizado", HttpStatus.FORBIDDEN);
    }
}
