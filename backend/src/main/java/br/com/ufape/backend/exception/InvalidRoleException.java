package br.com.ufape.backend.exception;

import org.springframework.http.HttpStatus;

public class InvalidRoleException extends BaseException {
    public InvalidRoleException(String role) {
        super("Cargo inválido: " + role, HttpStatus.BAD_REQUEST);
    }
}
