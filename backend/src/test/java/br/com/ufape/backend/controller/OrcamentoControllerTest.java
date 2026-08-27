package br.com.ufape.backend.controller;

import br.com.ufape.backend.dto.OrcamentoResponseDto;
import br.com.ufape.backend.enums.UserRole;
import br.com.ufape.backend.model.User;
import br.com.ufape.backend.repository.UserRepository;
import br.com.ufape.backend.service.OrcamentoService;
import br.com.ufape.backend.service.TokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrcamentoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OrcamentoService orcamentoService;

    @MockitoBean
    private TokenService tokenService;

    @MockitoBean
    private UserRepository userRepository;

    private User clienteAutenticado;
    private User prestadorAutenticado;

    @BeforeEach
    void setUp() {
        clienteAutenticado = new User();
        clienteAutenticado.setId(1L);
        clienteAutenticado.setName("Cliente Teste");
        clienteAutenticado.setEmail("cliente@email.com");
        clienteAutenticado.setRole(UserRole.USER);
        clienteAutenticado.setPassword("senha123");

        prestadorAutenticado = new User();
        prestadorAutenticado.setId(2L);
        prestadorAutenticado.setName("Prestador Teste");
        prestadorAutenticado.setEmail("prestador@email.com");
        prestadorAutenticado.setRole(UserRole.PRESTADOR);
        prestadorAutenticado.setPassword("senha123");
    }

    private OrcamentoResponseDto criarResponseDtoMock() {
        return new OrcamentoResponseDto(
                1L,
                "Pendente",
                "Conserto hidraulico",
                "Centro",
                1L,
                "Cliente Teste",
                "cliente@email.com",
                "Amanha a tarde",
                "Prestador Teste",
                "Prestador",
                "Proposta enviada",
                new BigDecimal("150.00")
        );
    }

    @Test
    void deveSolicitarOrcamentoComSucesso() throws Exception {
        when(orcamentoService.solicitar(any(User.class), any())).thenReturn(criarResponseDtoMock());

        String jsonPayload = """
            {
                "servicoId": 1,
                "descricaoNecessidade": "Necessito de conserto hidraulico",
                "localAtendimento": "Centro",
                "dataOuPeriodoDesejado": "Amanha a tarde"
            }
            """;

        mockMvc.perform(post("/orcamentos")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(clienteAutenticado, null, clienteAutenticado.getAuthorities())
                        ))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isCreated());
    }

    @Test
    void deveListarOrcamentosRecebidosPorPrestador() throws Exception {
        when(orcamentoService.buscarRecebidosPorPrestador(2L))
                .thenReturn(List.of(criarResponseDtoMock()));

        mockMvc.perform(get("/orcamentos/recebidos")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(prestadorAutenticado, null, prestadorAutenticado.getAuthorities())
                        )))
                .andExpect(status().isOk());
    }

    @Test
    void deveListarOrcamentosSolicitadosPorCliente() throws Exception {
        when(orcamentoService.buscarSolicitadosPorCliente(1L))
                .thenReturn(List.of(criarResponseDtoMock()));

        mockMvc.perform(get("/orcamentos/solicitados")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(clienteAutenticado, null, clienteAutenticado.getAuthorities())
                        )))
                .andExpect(status().isOk());
    }

    @Test
    void deveResponderOrcamentoComSucesso() throws Exception {
        when(orcamentoService.responder(eq(1L), any(User.class), any()))
                .thenReturn(criarResponseDtoMock());

        String jsonPayload = """
            {
                "status_resposta": "ACEITO",
                "valor_resposta": 150.00,
                "descricao_resposta": "Orcamento aprovado para execução do serviço"
            }
            """;

        mockMvc.perform(put("/orcamentos/1/responder")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(prestadorAutenticado, null, prestadorAutenticado.getAuthorities())
                        ))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isOk());
    }

    @Test
    void deveAceitarOrcamentoComSucesso() throws Exception {
        when(orcamentoService.aceitar(eq(1L), any(User.class)))
                .thenReturn(criarResponseDtoMock());

        mockMvc.perform(put("/orcamentos/1/aceitar")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(clienteAutenticado, null, clienteAutenticado.getAuthorities())
                        )))
                .andExpect(status().isOk());
    }

    @Test
    void deveRecusarOrcamentoComSucesso() throws Exception {
        when(orcamentoService.recusar(eq(1L), any(User.class)))
                .thenReturn(criarResponseDtoMock());

        mockMvc.perform(put("/orcamentos/1/recusar")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(clienteAutenticado, null, clienteAutenticado.getAuthorities())
                        )))
                .andExpect(status().isOk());
    }
}