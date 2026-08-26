package br.com.ufape.backend.controller;

import br.com.ufape.backend.dto.AvaliacaoRequestDto;
import br.com.ufape.backend.dto.AvaliacaoResponseDto;
import br.com.ufape.backend.enums.UserRole;
import br.com.ufape.backend.exception.AvaliacaoDuplicadaException;
import br.com.ufape.backend.exception.ServicoNaoDisponivelParaAvaliacaoException;
import br.com.ufape.backend.exception.ServicoNotFoundException;
import br.com.ufape.backend.model.User;
import br.com.ufape.backend.repository.UserRepository;
import br.com.ufape.backend.service.AvaliacaoService;
import br.com.ufape.backend.service.ServicoService;
import br.com.ufape.backend.service.TokenService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ServicoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private ServicoService servicoService;

    @MockitoBean
    private AvaliacaoService avaliacaoService;

    @MockitoBean
    private TokenService tokenService;

    @MockitoBean
    private UserRepository userRepository;

    private User usuarioAutenticado;

    @BeforeEach
    void setUp() {
        usuarioAutenticado = new User();
        usuarioAutenticado.setId(1L);
        usuarioAutenticado.setName("Ana");
        usuarioAutenticado.setEmail("ana@email.com");
        usuarioAutenticado.setRole(UserRole.USER);
        usuarioAutenticado.setPassword("senha123");
    }

    @Test
    void deveRetornar401QuandoUsuarioNaoEstaAutenticado() throws Exception {
        mockMvc.perform(post("/api/servicos/1/avaliacoes")
                        .contextPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AvaliacaoRequestDto(5, "Excelente"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void deveCriarAvaliacaoQuandoRequisicaoForValida() throws Exception {
        AvaliacaoResponseDto response = new AvaliacaoResponseDto(
                1L,
                1L,
                10L,
                1L,
                5,
                "Excelente atendimento",
                LocalDateTime.of(2026, 8, 20, 10, 0)
        );

        when(avaliacaoService.criar(eq(1L), eq(usuarioAutenticado), any(AvaliacaoRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/servicos/1/avaliacoes")
                        .contextPath("/api")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                                        usuarioAutenticado,
                                        null,
                                        usuarioAutenticado.getAuthorities()
                                )))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AvaliacaoRequestDto(5, "Excelente atendimento"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.servicoId").value(1))
                .andExpect(jsonPath("$.prestadorId").value(10))
                .andExpect(jsonPath("$.usuarioId").value(1))
                .andExpect(jsonPath("$.nota").value(5))
                .andExpect(jsonPath("$.comentario").value("Excelente atendimento"));
    }

    @Test
    void deveRetornar400QuandoNotaNaoForInformada() throws Exception {
        mockMvc.perform(post("/api/servicos/1/avaliacoes")
                        .contextPath("/api")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                                        usuarioAutenticado,
                                        null,
                                        usuarioAutenticado.getAuthorities()
                                )))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"comentario\":\"Excelente atendimento\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("nota: A nota é obrigatória"));
    }

    @Test
    void deveRetornar404QuandoServicoNaoExistir() throws Exception {
        when(avaliacaoService.criar(eq(999L), eq(usuarioAutenticado), any(AvaliacaoRequestDto.class)))
                .thenThrow(new ServicoNotFoundException());

        mockMvc.perform(post("/api/servicos/999/avaliacoes")
                        .contextPath("/api")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                                        usuarioAutenticado,
                                        null,
                                        usuarioAutenticado.getAuthorities()
                                )))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AvaliacaoRequestDto(5, "Excelente atendimento"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Serviço não encontrado"));
    }

    @Test
    void deveRetornar403QuandoServicoNaoPuderSerAvaliado() throws Exception {
        when(avaliacaoService.criar(eq(1L), eq(usuarioAutenticado), any(AvaliacaoRequestDto.class)))
                .thenThrow(new ServicoNaoDisponivelParaAvaliacaoException());

        mockMvc.perform(post("/api/servicos/1/avaliacoes")
                        .contextPath("/api")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                                        usuarioAutenticado,
                                        null,
                                        usuarioAutenticado.getAuthorities()
                                )))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AvaliacaoRequestDto(5, "Excelente atendimento"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message")
                        .value("O serviço informado não pertence ao usuário ou ainda não foi realizado"));
    }

    @Test
    void deveRetornar409QuandoAvaliacaoForDuplicada() throws Exception {
        when(avaliacaoService.criar(eq(1L), eq(usuarioAutenticado), any(AvaliacaoRequestDto.class)))
                .thenThrow(new AvaliacaoDuplicadaException());

        mockMvc.perform(post("/api/servicos/1/avaliacoes")
                        .contextPath("/api")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                                        usuarioAutenticado,
                                        null,
                                        usuarioAutenticado.getAuthorities()
                                )))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AvaliacaoRequestDto(5, "Excelente atendimento"))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("O usuário já avaliou este serviço"));
    }
    
    @Test
    @WithMockUser 
    void deveAtualizarStatusComSucesso() throws Exception {
        
        mockMvc.perform(put("/api/servicos/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{ \"status\": \"EM_ANDAMENTO\" }"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deveRetornar401SeNaoAutenticado() throws Exception {
        mockMvc.perform(put("/api/servicos/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{ \"status\": \"EM_ANDAMENTO\" }"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void deveRetornar403SeNaoForODono() throws Exception {
         
         mockMvc.perform(put("/api/servicos/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{ \"status\": \"EM_ANDAMENTO\" }"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser
    void deveRetornar400SeTransicaoInvalida() throws Exception {
         
         mockMvc.perform(put("/api/servicos/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{ \"status\": \"CONTRATADO\" }")) 
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void deveRetornar404SeServicoNaoExistir() throws Exception {
        mockMvc.perform(put("/api/servicos/999/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{ \"status\": \"EM_ANDAMENTO\" }"))
                .andExpect(status().isNotFound());
    }



}
