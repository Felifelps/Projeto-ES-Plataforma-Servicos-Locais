package br.com.ufape.backend.controller;

import br.com.ufape.backend.dto.UserResponseDto;
import br.com.ufape.backend.enums.UserRole;
import br.com.ufape.backend.model.User;
import br.com.ufape.backend.repository.UserRepository;
import br.com.ufape.backend.service.AuthService;
import br.com.ufape.backend.service.TokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private AuthenticationManager authenticationManager;

    @MockitoBean
    private TokenService tokenService;

    @MockitoBean
    private UserRepository userRepository;

    private User usuario;

    @BeforeEach
    void setUp() {
        usuario = new User();
        usuario.setId(1L);
        usuario.setName("Usuario Teste");
        usuario.setEmail("teste@email.com");
        usuario.setRole(UserRole.USER);
        usuario.setPassword("senha123");
    }

    @Test
    void deveRegistrarUsuarioComSucesso() throws Exception {
        UserResponseDto userResponse = new UserResponseDto(1L, "Usuario Teste", "teste@email.com", UserRole.USER);
        when(authService.register(any())).thenReturn(userResponse);

        String jsonPayload = """
            {
                "name": "Usuario Teste",
                "email": "teste@email.com",
                "password": "senha123",
                "role": "USER"
            }
            """;

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isCreated());
    }

    @Test
    void deveEfetuarLoginComSucesso() throws Exception {
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(usuario, null, usuario.getAuthorities());
        when(authenticationManager.authenticate(any())).thenReturn(authToken);
        when(tokenService.gerarToken(any(User.class))).thenReturn("token-jwt-mock");

        String jsonPayload = """
            {
                "email": "teste@email.com",
                "password": "senha123"
            }
            """;

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isOk());
    }

    @Test
    void deveFazerLogoutEInvalidarToken() throws Exception {
        doNothing().when(tokenService).invalidateToken("token-valido-123");

        mockMvc.perform(post("/auth/logout")
                        .header("Authorization", "Bearer token-valido-123"))
                .andExpect(status().isNoContent());

        verify(tokenService, times(1)).invalidateToken("token-valido-123");
    }

    @Test
    void deveFazerLogoutSemHeaderAuthorization() throws Exception {
        mockMvc.perform(post("/auth/logout"))
                .andExpect(status().isNoContent());

        verify(tokenService, never()).invalidateToken(anyString());
    }
}