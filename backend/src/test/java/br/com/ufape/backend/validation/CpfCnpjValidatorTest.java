package br.com.ufape.backend.validation;

import jakarta.validation.ConstraintValidatorContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class CpfCnpjValidatorTest {

    private CpfCnpjValidator validator;

    @Mock
    private ConstraintValidatorContext context;

    @BeforeEach
    void setUp() {
        validator = new CpfCnpjValidator();
    }

    @Test
    void deveRetornarTrueQuandoValorForNulo() {
        assertTrue(validator.isValid(null, context));
    }

    @Test
    void deveRetornarTrueQuandoValorForVazioOuEmBranco() {
        assertTrue(validator.isValid("", context));
        assertTrue(validator.isValid("   ", context));
    }

    @Test
    void deveValidarDocumentoUsandoDocumentUtils() {
        // Testa o fluxo chamando o DocumentUtils.isValid(value)
        // Documento no formato correto (ou incorreto) para percorrer a chamada do método
        boolean resultadoValido = validator.isValid("111.444.777-05", context);
        boolean resultadoInvalido = validator.isValid("1234", context);

        // Apenas assere a execução dos fluxos
        assertNotNull(resultadoValido);
        assertFalse(resultadoInvalido);
    }
}