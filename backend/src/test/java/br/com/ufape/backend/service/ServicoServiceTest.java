package br.com.ufape.backend.service;

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

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
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
    void deveAtualizarStatusDeContratadoParaEmAndamento() {
        Servico servico = new Servico();
        servico.setStatus(StatusServico.CONTRATADO);
        
        User dono = new User();
        dono.setId(1L);
        ProviderProfile perfil = new ProviderProfile();
        perfil.setUser(dono);
        servico.setPrestador(perfil);

        when(servicoRepository.findById(1L)).thenReturn(Optional.of(servico));

        servicoService.atualizarStatus(1L, StatusServico.EM_ANDAMENTO, 1L);

        assertEquals(StatusServico.EM_ANDAMENTO, servico.getStatus());
        verify(servicoRepository).save(servico);
    }

    @Test
    void deveAtualizarStatusDeEmAndamentoParaRealizado() {
        Servico servico = new Servico();
        servico.setStatus(StatusServico.EM_ANDAMENTO);
        
        User dono = new User();
        dono.setId(1L);
        ProviderProfile perfil = new ProviderProfile();
        perfil.setUser(dono);
        servico.setPrestador(perfil);

        when(servicoRepository.findById(1L)).thenReturn(Optional.of(servico));

        servicoService.atualizarStatus(1L, StatusServico.REALIZADO, 1L);

        assertEquals(StatusServico.REALIZADO, servico.getStatus());
        verify(servicoRepository).save(servico);
    }

    @Test
    void deveLancarErro400QuandoTentarPularEtapaDeDisponivelParaRealizado() {
        Servico servico = new Servico();
        servico.setStatus(StatusServico.DISPONIVEL); // Status inicial
        
        User dono = new User();
        dono.setId(1L);
        ProviderProfile perfil = new ProviderProfile();
        perfil.setUser(dono);
        servico.setPrestador(perfil);

        when(servicoRepository.findById(1L)).thenReturn(Optional.of(servico));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            servicoService.atualizarStatus(1L, StatusServico.REALIZADO, 1L); // Tentando pular etapas
        });

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verify(servicoRepository, never()).save(any()); // Garante que não salvou no banco
    }

    @Test
    void deveLancarErro403AoTentarAtualizarServicoQueNaoLhePertence() {
        Servico servico = new Servico();
        servico.setStatus(StatusServico.CONTRATADO);
        
        User donoReal = new User();
        donoReal.setId(1L); // Dono do serviço é o ID 1
        ProviderProfile perfil = new ProviderProfile();
        perfil.setUser(donoReal);
        servico.setPrestador(perfil);

        when(servicoRepository.findById(1L)).thenReturn(Optional.of(servico));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            servicoService.atualizarStatus(1L, StatusServico.EM_ANDAMENTO, 999L); // Quem faz a requisição é o ID 999
        });

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        verify(servicoRepository, never()).save(any());
    }

    @Test
    void deveLancarErro404AoAtualizarStatusDeServicoInexistente() {
        when(servicoRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            servicoService.atualizarStatus(99L, StatusServico.EM_ANDAMENTO, 1L);
        });

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }
}
