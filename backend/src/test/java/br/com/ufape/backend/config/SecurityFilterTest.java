package br.com.ufape.backend.config;

import br.com.ufape.backend.enums.UserRole;
import br.com.ufape.backend.model.User;
import br.com.ufape.backend.repository.UserRepository;
import br.com.ufape.backend.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SecurityFilterTest {

    private final TokenService tokenService = Mockito.mock(TokenService.class);
    private final UserRepository userRepository = Mockito.mock(UserRepository.class);
    private final SecurityFilter securityFilter = new SecurityFilter(tokenService, userRepository);

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void deveIgnorarRequestsOptions() throws ServletException, IOException {
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        FilterChain filterChain = Mockito.mock(FilterChain.class);

        when(request.getMethod()).thenReturn("OPTIONS");

        securityFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(tokenService, never()).validateToken(Mockito.anyString());
    }

    @Test
    void deveSeguirFluxoQuandoTokenEstiverAusente() throws ServletException, IOException {
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        FilterChain filterChain = Mockito.mock(FilterChain.class);

        when(request.getMethod()).thenReturn("GET");
        when(request.getHeader("Authorization")).thenReturn(null);

        securityFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(tokenService, never()).validateToken(Mockito.anyString());
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void deveSeguirFluxoQuandoHeaderAuthorizationEstiverVazio() throws ServletException, IOException {
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        FilterChain filterChain = Mockito.mock(FilterChain.class);

        when(request.getMethod()).thenReturn("GET");
        when(request.getHeader("Authorization")).thenReturn("");

        securityFilter.doFilterInternal(request, response, filterChain);

        verify(tokenService, never()).validateToken(Mockito.anyString());
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void deveSeguirFluxoQuandoHeaderNaoForBearer() throws ServletException, IOException {
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        FilterChain filterChain = Mockito.mock(FilterChain.class);

        when(request.getMethod()).thenReturn("GET");
        when(request.getHeader("Authorization")).thenReturn("Basic abc");

        securityFilter.doFilterInternal(request, response, filterChain);

        verify(tokenService, never()).validateToken(Mockito.anyString());
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void deveAutenticarUsuarioQuandoTokenForValido() throws ServletException, IOException {
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        FilterChain filterChain = Mockito.mock(FilterChain.class);

        User user = new User();
        user.setEmail("ana@email.com");
        user.setName("Ana");
        user.setRole(UserRole.USER);
        user.setPassword("senha123");

        when(request.getMethod()).thenReturn("GET");
        when(request.getHeader("Authorization")).thenReturn("Bearer token-valido");
        when(tokenService.validateToken("token-valido")).thenReturn("ana@email.com");
        when(userRepository.findByEmail("ana@email.com")).thenReturn(user);

        securityFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertEquals("ana@email.com", SecurityContextHolder.getContext().getAuthentication().getName());
    }

    @Test
    void deveNaoAutenticarQuandoTokenValidadoRetornarVazio() throws ServletException, IOException {
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        FilterChain filterChain = Mockito.mock(FilterChain.class);

        when(request.getMethod()).thenReturn("GET");
        when(request.getHeader("Authorization")).thenReturn("Bearer token-invalido");
        when(tokenService.validateToken("token-invalido")).thenReturn("");

        securityFilter.doFilterInternal(request, response, filterChain);

        verify(userRepository, never()).findByEmail(Mockito.anyString());
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void deveLimparContextoQuandoFalharAoValidarToken() throws ServletException, IOException {
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        FilterChain filterChain = Mockito.mock(FilterChain.class);

        when(request.getMethod()).thenReturn("GET");
        when(request.getHeader("Authorization")).thenReturn("Bearer token-quebrado");
        when(tokenService.validateToken("token-quebrado")).thenThrow(new IllegalStateException("erro"));

        securityFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }
}
