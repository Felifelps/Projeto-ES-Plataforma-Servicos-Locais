package br.com.ufape.backend.controller;

import br.com.ufape.backend.dto.AvaliacaoRequestDto;
import br.com.ufape.backend.dto.AvaliacaoResponseDto;
import br.com.ufape.backend.dto.ServicoContratadoResponseDto;
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
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
    void deveRetornar401QuandoUsuarioNaoEstaAutenticadoAoListarServicosContratados() throws Exception {
        mockMvc.perform(get("/api/servicos/contratados")
                        .contextPath("/api"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void deveRetornarServicosContratadosQuandoUsuarioAutenticadoPossuirServicos() throws Exception {
        List<ServicoContratadoResponseDto> response = List.of(
                new ServicoContratadoResponseDto(
                        1L,
                        "Instalação Elétrica",
                        "Eletricista",
                        "Boa Viagem",
                        "Recife",
                        "Carlos Prestador",
                        "CONTRATADO"
                ),
                new ServicoContratadoResponseDto(
                        2L,
                        "Pintura Residencial",
                        "Pintor",
                        "Casa Amarela",
                        "Recife",
                        "Marcos Pintor",
                        "EM_ANDAMENTO"
                )
        );

        when(servicoService.buscarContratadosPorCliente(eq(usuarioAutenticado.getId()))).thenReturn(response);

        mockMvc.perform(get("/api/servicos/contratados")
                        .contextPath("/api")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                                        usuarioAutenticado,
                                        null,
                                        usuarioAutenticado.getAuthorities()
                                ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].titulo").value("Instalação Elétrica"))
                .andExpect(jsonPath("$[0].categoria").value("Eletricista"))
                .andExpect(jsonPath("$[0].bairro").value("Boa Viagem"))
                .andExpect(jsonPath("$[0].cidade").value("Recife"))
                .andExpect(jsonPath("$[0].nomePrestador").value("Carlos Prestador"))
                .andExpect(jsonPath("$[0].statusAtual").value("CONTRATADO"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].statusAtual").value("EM_ANDAMENTO"));
    }

    @Test
    void deveRetornarListaVaziaQuandoUsuarioAutenticadoNaoPossuirServicosContratados() throws Exception {
        when(servicoService.buscarContratadosPorCliente(anyLong())).thenReturn(List.of());

        mockMvc.perform(get("/api/servicos/contratados")
                        .contextPath("/api")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                                        usuarioAutenticado,
                                        null,
                                        usuarioAutenticado.getAuthorities()
                                ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
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
}
