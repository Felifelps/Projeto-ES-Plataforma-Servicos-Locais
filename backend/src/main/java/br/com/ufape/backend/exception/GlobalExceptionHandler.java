package br.com.ufape.backend.exception;

import br.com.ufape.backend.dto.ErrorResponseDto;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import tools.jackson.databind.exc.InvalidFormatException;

import org.springframework.security.core.AuthenticationException;
import org.springframework.web.server.ResponseStatusException;
import java.util.Arrays;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponseDto> handleAuthError(AuthenticationException ex) {
        return buildResponse("Email ou senha inválidos", HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponseDto> handleResponseStatusException(ResponseStatusException ex) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        return buildResponse(ex.getReason(), status);
    }

    @ExceptionHandler(BaseException.class)
    ResponseEntity<ErrorResponseDto> handleBaseException(BaseException ex) {
        HttpStatus httpStatus = ex.getHttpStatus();
        return buildResponse(ex.getMessage(), httpStatus);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDto> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining("; "));

        return buildResponse(message, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponseDto> handleMessageNotReadable(HttpMessageNotReadableException ex) {
        String message = "Corpo da requisição inválido ou mal formatado";

        if (ex.getCause() instanceof InvalidFormatException ife && ife.getTargetType().isEnum()) {
            message = "Valor inválido para o campo. Use um dos seguintes: "
                    + Arrays.toString(ife.getTargetType().getEnumConstants());
        }

        return buildResponse(message, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponseDto> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String message = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : "";

        if (message.contains("uk_avaliacao_servico_usuario")) {
            return buildResponse("O usuário já avaliou este serviço", HttpStatus.CONFLICT);
        }

        return buildResponse("Violação de integridade de dados", HttpStatus.BAD_REQUEST);
    }

    private ResponseEntity<ErrorResponseDto> buildResponse(String message, HttpStatus status) {
        ErrorResponseDto error = new ErrorResponseDto(
                status.value(),
                status.getReasonPhrase(),
                message
        );

        return ResponseEntity.status(status).body(error);
    }
}
