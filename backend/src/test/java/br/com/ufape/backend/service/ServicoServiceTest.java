package br.com.ufape.backend.service;

import br.com.ufape.backend.dto.ServicoContratadoResponseDto;
import br.com.ufape.backend.dto.ServicoDetalheResponseDto;
import br.com.ufape.backend.dto.ServicoRequestDto;
import br.com.ufape.backend.enums.StatusServico;
import br.com.ufape.backend.exception.ServicoNotFoundException;
import br.com.ufape.backend.model.*;
import br.com.ufape.backend.repository.ProviderProfileRepository;
import br.com.ufape.backend.repository.ServiceCategoryRepository;
import br.com.ufape.backend.repository.ServicoRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import br.com.ufape.backend.enums.FormaCobranca;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ServicoServiceTest {

    @Mock
    private ServicoRepository servicoRepository;

    @Mock
    private ProviderProfileRepository providerProfileRepository;

    @Mock
    private ServiceCategoryRepository categoryRepository;

    @InjectMocks
    private ServicoService servicoService;

    private User usuarioMock;

    @BeforeEach
    void setUp() {
        usuarioMock = new User();
        usuarioMock.setEmail("rafael@teste.com");

        Authentication authentication = Mockito.mock(Authentication.class);
        Mockito.lenient().when(authentication.getPrincipal()).thenReturn(usuarioMock);

        SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        Mockito.lenient().when(securityContext.getAuthentication()).thenReturn(authentication);

        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void deveCadastrarServicoComSucesso() {
        ServicoRequestDto dto = new ServicoRequestDto(
                "Instalação de Fiação", 
                "Descricao", 
                "Local", 
                "Area", 
                1L, 
                FormaCobranca.VALOR_FIXO_TOTAL
        );

        ProviderProfile perfil = new ProviderProfile();
        perfil.setUser(usuarioMock);

        ServiceCategory categoria = new ServiceCategory("Eletricista");

        when(providerProfileRepository.findByUser(usuarioMock)).thenReturn(Optional.of(perfil));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(categoria));

        Servico servicoSalvo = new Servico();
        servicoSalvo.setTitulo(dto.titulo());
        servicoSalvo.setCategoria(categoria);
        servicoSalvo.setPrestador(perfil);
        servicoSalvo.setStatus(StatusServico.DISPONIVEL);

        when(servicoRepository.save(any(Servico.class))).thenReturn(servicoSalvo);

        Servico resultado = servicoService.cadastrarServico(dto);

        assertNotNull(resultado);
        assertEquals("Instalação de Fiação", resultado.getTitulo());
        assertEquals("Eletricista", resultado.getCategoria().getName());
        assertEquals(perfil, resultado.getPrestador());
        assertEquals(StatusServico.DISPONIVEL, resultado.getStatus());
    }


    @Test
    void deveRetornarDetalhesDoServicoQuandoIdExistir() {
        Long idBusca = 1L;
        ProviderProfile perfil = new ProviderProfile();
        User usuario = new User();
        usuario.setName("Rafael Teste");
        perfil.setUser(usuario);
        perfil.setPhones(java.util.List.of("81999999999"));

        ServiceCategory categoria = new ServiceCategory("Eletricista");
        
        Servico servicoMock = new Servico();
        ReflectionTestUtils.setField(servicoMock, "id", idBusca);
        servicoMock.setTitulo("Instalação de Fiação");
        servicoMock.setCategoria(categoria);
        servicoMock.setPrestador(perfil);
        servicoMock.setFormaCobranca(FormaCobranca.VALOR_FIXO_TOTAL);

        when(servicoRepository.findById(idBusca)).thenReturn(Optional.of(servicoMock));

        ServicoDetalheResponseDto resultado = servicoService.buscarPorId(idBusca);

        assertNotNull(resultado);
        assertEquals("Instalação de Fiação", resultado.titulo());
        assertEquals("Rafael Teste", resultado.nomePrestador());
        assertEquals("81999999999", resultado.telefonePrestador());
    }

    @Test
    void deveRetornarTelefoneNaoInformadoQuandoPrestadorNaoTiverTelefone() {
        Long idBusca = 1L;
        ProviderProfile perfil = new ProviderProfile();
        User usuario = new User();
        usuario.setName("Rafael Teste");
        perfil.setUser(usuario);

        ServiceCategory categoria = new ServiceCategory("Eletricista");

        Servico servicoMock = new Servico();
        ReflectionTestUtils.setField(servicoMock, "id", idBusca);
        servicoMock.setTitulo("Instalação de Fiação");
        servicoMock.setCategoria(categoria);
        servicoMock.setPrestador(perfil);
        servicoMock.setFormaCobranca(FormaCobranca.VALOR_FIXO_TOTAL);

        when(servicoRepository.findById(idBusca)).thenReturn(Optional.of(servicoMock));

        ServicoDetalheResponseDto resultado = servicoService.buscarPorId(idBusca);

        assertEquals("Não informado", resultado.telefonePrestador());
    }

    @Test
    void deveLancarErro404QuandoServicoNaoExistir() {
        Long idInexistente = 99L;
        when(servicoRepository.findById(idInexistente)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class, 
            () -> servicoService.buscarPorId(idInexistente)
        );
        
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void deveBuscarServicosContratadosPorCliente() {
        Long clienteId = 10L;

        User cliente = new User();
        cliente.setId(clienteId);

        User prestadorUser = new User();
        prestadorUser.setName("Carlos Prestador");

        ProviderProfile perfil = new ProviderProfile();
        perfil.setUser(prestadorUser);

        ServiceCategory categoria = new ServiceCategory("Eletricista");

        Servico servico = new Servico();
        ReflectionTestUtils.setField(servico, "id", 1L);
        servico.setTitulo("Instalação Elétrica");
        servico.setCategoria(categoria);
        servico.setLocalizacao("Boa Viagem");
        servico.setAreaAtendimento("Recife");
        servico.setPrestador(perfil);
        servico.setCliente(cliente);
        servico.setStatus(StatusServico.CONTRATADO);

        when(servicoRepository.findContratadosByClienteId(
                eq(clienteId),
                eq(List.of(StatusServico.CONTRATADO, StatusServico.EM_ANDAMENTO, StatusServico.REALIZADO))
        )).thenReturn(List.of(servico));

        List<ServicoContratadoResponseDto> resultado = servicoService.buscarContratadosPorCliente(clienteId);

        assertEquals(1, resultado.size());
        assertEquals(1L, resultado.get(0).id());
        assertEquals("Instalação Elétrica", resultado.get(0).titulo());
        assertEquals("Eletricista", resultado.get(0).categoria());
        assertEquals("Boa Viagem", resultado.get(0).bairro());
        assertEquals("Recife", resultado.get(0).cidade());
        assertEquals("Carlos Prestador", resultado.get(0).nomePrestador());
        assertEquals(StatusServico.CONTRATADO, resultado.get(0).statusAtual());
    }

    @Test
    void deveRetornarStatusAtualAoBuscarServicosContratadosPorCliente() {
        Long clienteId = 20L;

        User prestadorUser = new User();
        prestadorUser.setName("Marcos Pintor");

        ProviderProfile perfil = new ProviderProfile();
        perfil.setUser(prestadorUser);

        ServiceCategory categoria = new ServiceCategory("Pintor");

        Servico servico = new Servico();
        ReflectionTestUtils.setField(servico, "id", 2L);
        servico.setTitulo("Pintura Residencial");
        servico.setCategoria(categoria);
        servico.setLocalizacao("Casa Amarela");
        servico.setAreaAtendimento("Recife");
        servico.setPrestador(perfil);
        servico.setStatus(StatusServico.EM_ANDAMENTO);

        when(servicoRepository.findContratadosByClienteId(
                eq(clienteId),
                eq(List.of(StatusServico.CONTRATADO, StatusServico.EM_ANDAMENTO, StatusServico.REALIZADO))
        )).thenReturn(List.of(servico));

        List<ServicoContratadoResponseDto> resultado = servicoService.buscarContratadosPorCliente(clienteId);

        assertEquals(1, resultado.size());
        assertEquals(StatusServico.EM_ANDAMENTO, resultado.get(0).statusAtual());
    }

    @Test
    void deveRetornarStatusRealizadoAoBuscarServicosContratadosPorCliente() {
        Long clienteId = 40L;

        User prestadorUser = new User();
        prestadorUser.setName("Joao Prestador");

        ProviderProfile perfil = new ProviderProfile();
        perfil.setUser(prestadorUser);

        ServiceCategory categoria = new ServiceCategory("Pedreiro");

        Servico servico = new Servico();
        ReflectionTestUtils.setField(servico, "id", 3L);
        servico.setTitulo("Reforma de Muro");
        servico.setCategoria(categoria);
        servico.setLocalizacao("Ipsep");
        servico.setAreaAtendimento("Recife");
        servico.setPrestador(perfil);
        servico.setStatus(StatusServico.REALIZADO);

        when(servicoRepository.findContratadosByClienteId(
                eq(clienteId),
                eq(List.of(StatusServico.CONTRATADO, StatusServico.EM_ANDAMENTO, StatusServico.REALIZADO))
        )).thenReturn(List.of(servico));

        List<ServicoContratadoResponseDto> resultado = servicoService.buscarContratadosPorCliente(clienteId);

        assertEquals(1, resultado.size());
        assertEquals(StatusServico.REALIZADO, resultado.get(0).statusAtual());
    }

    @Test
    void deveRetornarListaVaziaQuandoClienteNaoPossuirServicosContratados() {
        Long clienteId = 30L;
        when(servicoRepository.findContratadosByClienteId(
                eq(clienteId),
                eq(List.of(StatusServico.CONTRATADO, StatusServico.EM_ANDAMENTO, StatusServico.REALIZADO))
        )).thenReturn(List.of());

        List<ServicoContratadoResponseDto> resultado = servicoService.buscarContratadosPorCliente(clienteId);

        assertNotNull(resultado);
        assertTrue(resultado.isEmpty());
    }
}
