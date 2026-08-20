package br.com.ufape.backend.exception;

import org.springframework.http.HttpStatus;

public class AvaliacaoDuplicadaException extends BaseException {
    public AvaliacaoDuplicadaException() {
        super("O usuário já avaliou este serviço", HttpStatus.CONFLICT);
    }
}
