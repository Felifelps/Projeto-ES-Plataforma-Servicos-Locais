package br.com.ufape.backend.service;

import br.com.ufape.backend.enums.UserRole;
import br.com.ufape.backend.model.InvalidatedToken;
import br.com.ufape.backend.model.User;
import br.com.ufape.backend.repository.InvalidatedTokenRepository;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TokenServiceTest {

    @Mock
    private InvalidatedTokenRepository invalidatedTokenRepository;

    @InjectMocks
    private TokenService tokenService;

    private void configurarSecret() {
        ReflectionTestUtils.setField(tokenService, "secret", "segredo-de-teste");
    }

    @Test
    void deveGerarTokenComSucesso() {
        configurarSecret();
        User user = new User("Ana", "ana@email.com", UserRole.USER, "senha123");

        String token = tokenService.gerarToken(user);

        assertNotNull(token);
        assertEquals("ana@email.com", tokenService.validateToken(token));
    }

    @Test
    void deveRetornarVazioQuandoTokenEstiverInvalidado() {
        configurarSecret();
        when(invalidatedTokenRepository.existsByToken("token")).thenReturn(true);

        String resultado = tokenService.validateToken("token");

        assertEquals("", resultado);
    }

    @Test
    void deveRetornarVazioQuandoTokenForInvalido() {
        configurarSecret();
        when(invalidatedTokenRepository.existsByToken("token-invalido")).thenReturn(false);

        String resultado = tokenService.validateToken("token-invalido");

        assertEquals("", resultado);
    }

    @Test
    void deveRetornarVazioQuandoTokenEstiverExpirado() {
        configurarSecret();
        when(invalidatedTokenRepository.existsByToken(anyString())).thenReturn(false);

        String tokenExpirado = JWT.create()
                .withIssuer("housing")
                .withSubject("ana@email.com")
                .withExpiresAt(Instant.now().minus(1, ChronoUnit.HOURS))
                .sign(Algorithm.HMAC256("segredo-de-teste"));

        String resultado = tokenService.validateToken(tokenExpirado);

        assertEquals("", resultado);
    }

    @Test
    void deveInformarQuandoTokenFoiInvalidado() {
        when(invalidatedTokenRepository.existsByToken("token")).thenReturn(true);

        assertTrue(tokenService.isTokenInvalidated("token"));
        assertFalse(tokenService.isTokenInvalidated("outro-token"));
    }

    @Test
    void deveSalvarTokenInvalidado() {
        tokenService.invalidateToken("token");

        ArgumentCaptor<InvalidatedToken> captor = ArgumentCaptor.forClass(InvalidatedToken.class);
        verify(invalidatedTokenRepository).save(captor.capture());
        assertEquals("token", captor.getValue().getToken());
    }
}
