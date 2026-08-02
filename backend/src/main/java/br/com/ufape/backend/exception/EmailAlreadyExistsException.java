package br.com.ufape.backend.exception;

import org.springframework.http.HttpStatus;

public class EmailAlreadyExistsException extends BaseException {
    public EmailAlreadyExistsException(String email) {
        super("Email " + email + " já cadastrado", HttpStatus.CONFLICT);
    }
}
