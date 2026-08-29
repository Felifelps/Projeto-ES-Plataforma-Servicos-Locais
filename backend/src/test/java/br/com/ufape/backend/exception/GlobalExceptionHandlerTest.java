package br.com.ufape.backend.exception;

import br.com.ufape.backend.dto.AtualizarStatusServicoDto;
import br.com.ufape.backend.dto.ErrorResponseDto;
import br.com.ufape.backend.enums.StatusServico;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }

    // Classe concreta para permitir o teste de BaseException
    private static class ConcreteBaseException extends BaseException {
        public ConcreteBaseException(String message, HttpStatus status) {
            super(message, status);
        }
    }

    @Test
    void deveTratarAuthenticationException() {
        AuthenticationException ex = new BadCredentialsException("Credenciais inválidas");
        ResponseEntity<ErrorResponseDto> response = exceptionHandler.handleAuthError(ex);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void deveTratarResponseStatusException() {
        ResponseStatusException ex = new ResponseStatusException(HttpStatus.NOT_FOUND, "Serviço não encontrado");
        ResponseEntity<ErrorResponseDto> response = exceptionHandler.handleResponseStatusException(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void deveTratarBaseException() {
        BaseException ex = new ConcreteBaseException("Acesso negado", HttpStatus.FORBIDDEN);
        ResponseEntity<ErrorResponseDto> response = exceptionHandler.handleBaseException(ex);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void deveTratarMethodArgumentNotValidException() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);

        FieldError fieldError = new FieldError("servico", "status", "O status não pode ser nulo");
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));
        when(ex.getBindingResult()).thenReturn(bindingResult);

        ResponseEntity<ErrorResponseDto> response = exceptionHandler.handleValidation(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void deveTratarHttpMessageNotReadableExceptionGenerica() {
        HttpInputMessage inputMessage = mock(HttpInputMessage.class);
        HttpMessageNotReadableException ex = new HttpMessageNotReadableException("JSON malformado", inputMessage);
        ResponseEntity<ErrorResponseDto> response = exceptionHandler.handleMessageNotReadable(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void deveTratarDataIntegrityViolationExceptionComChaveUnicaAvaliacao() {
        Throwable cause = new Throwable("violates unique constraint \"uk_avaliacao_servico_usuario\"");
        DataIntegrityViolationException ex = new DataIntegrityViolationException("Erro de banco", cause);

        ResponseEntity<ErrorResponseDto> response = exceptionHandler.handleDataIntegrityViolation(ex);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void deveTratarDataIntegrityViolationExceptionGenerica() {
        Throwable cause = new Throwable("foreign key constraint violation");
        DataIntegrityViolationException ex = new DataIntegrityViolationException("Erro de banco", cause);

        ResponseEntity<ErrorResponseDto> response = exceptionHandler.handleDataIntegrityViolation(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void deveCobrirAtualizarStatusServicoDto() {
        AtualizarStatusServicoDto dto = new AtualizarStatusServicoDto(StatusServico.EM_ANDAMENTO);
        assertEquals(StatusServico.EM_ANDAMENTO, dto.status());
    }
}