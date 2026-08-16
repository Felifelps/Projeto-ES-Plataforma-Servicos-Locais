package br.com.ufape.backend.service;

import br.com.ufape.backend.dto.OrcamentoRequestDto;
import br.com.ufape.backend.dto.OrcamentoResponseDto;
import br.com.ufape.backend.model.*;
import br.com.ufape.backend.repository.OrcamentoRepository;
import br.com.ufape.backend.repository.ServicoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrcamentoServiceTest {

    @Mock
    private OrcamentoRepository orcamentoRepository;

    @Mock
    private ServicoRepository servicoRepository;

    @InjectMocks
    private OrcamentoService orcamentoService;

    private User solicitante;
    private ProviderProfile prestador;
    private Servico servico;

    private void configurarServicoValido() {
        User usuarioPrestador = new User();
        usuarioPrestador.setName("Rafael Prestador");

        prestador = new ProviderProfile();
        prestador.setUser(usuarioPrestador);
        ReflectionTestUtils.setField(prestador, "id", 5L);

        servico = new Servico();
        ReflectionTestUtils.setField(servico, "id", 10L);
        servico.setTitulo("Instalação Elétrica");
        servico.setPrestador(prestador);

        solicitante = new User();
        solicitante.setName("Cliente Teste");
        solicitante.setEmail("cliente@teste.com");
    }

    @Test
    void deveSolicitarOrcamentoComSucesso() {
        configurarServicoValido();

        OrcamentoRequestDto dto = new OrcamentoRequestDto(
                10L,
                "Preciso trocar o quadro elétrico",
                "Rua das Flores, 123",
                "Próxima semana"
        );

        when(servicoRepository.findById(10L)).thenReturn(Optional.of(servico));
        when(orcamentoRepository.save(any(Orcamento.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrcamentoResponseDto resultado = orcamentoService.solicitar(solicitante, dto);

        assertNotNull(resultado);
        assertEquals("Preciso trocar o quadro elétrico", resultado.descricaoNecessidade());
        assertEquals("Rua das Flores, 123", resultado.localAtendimento());
        assertEquals("Próxima semana", resultado.dataOuPeriodoDesejado());
        assertEquals(10L, resultado.servicoId());
        assertEquals("Instalação Elétrica", resultado.tituloServico());
        assertEquals("Rafael Prestador", resultado.nomePrestador());
        assertEquals("Cliente Teste", resultado.nomeSolicitante());
        assertEquals("cliente@teste.com", resultado.emailSolicitante());

        ArgumentCaptor<Orcamento> captor = ArgumentCaptor.forClass(Orcamento.class);
        org.mockito.Mockito.verify(orcamentoRepository).save(captor.capture());
        assertEquals(servico, captor.getValue().getServico());
        assertEquals(prestador, captor.getValue().getPrestador());
        assertEquals(solicitante, captor.getValue().getSolicitante());
    }

    @Test
    void deveLancarErro404QuandoServicoNaoExistir() {
        OrcamentoRequestDto dto = new OrcamentoRequestDto(
                99L,
                "Descrição",
                "Local",
                "Amanhã"
        );

        when(servicoRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> orcamentoService.solicitar(new User(), dto)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void deveListarOrcamentosRecebidosPeloPrestador() {
        configurarServicoValido();

        Orcamento orcamento = new Orcamento();
        ReflectionTestUtils.setField(orcamento, "id", 1L);
        orcamento.setDescricaoNecessidade("Descrição");
        orcamento.setLocalAtendimento("Local");
        orcamento.setDataOuPeriodoDesejado("Amanhã");
        orcamento.setServico(servico);
        orcamento.setPrestador(prestador);
        orcamento.setSolicitante(solicitante);

        when(orcamentoRepository.findByPrestadorUserId(7L)).thenReturn(List.of(orcamento));

        List<OrcamentoResponseDto> resultado = orcamentoService.buscarRecebidosPorPrestador(7L);

        assertEquals(1, resultado.size());
        assertEquals("Cliente Teste", resultado.get(0).nomeSolicitante());
    }
}
