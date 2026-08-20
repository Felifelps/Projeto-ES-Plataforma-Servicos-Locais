package br.com.ufape.backend.exception;

import org.springframework.http.HttpStatus;

public class ServicoNotFoundException extends BaseException {
    public ServicoNotFoundException() {
        super("Serviço não encontrado", HttpStatus.NOT_FOUND);
    }
}
