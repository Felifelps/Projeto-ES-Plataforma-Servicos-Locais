package br.com.ufape.backend.service;

import br.com.ufape.backend.dto.ServicoRequestDto;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import br.com.ufape.backend.enums.FormaCobranca;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
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
        when(authentication.getPrincipal()).thenReturn(usuarioMock);

        SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);

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

        when(servicoRepository.save(any(Servico.class))).thenReturn(servicoSalvo);

        Servico resultado = servicoService.cadastrarServico(dto);

        assertNotNull(resultado);
        assertEquals("Instalação de Fiação", resultado.getTitulo());
        assertEquals("Eletricista", resultado.getCategoria().getName());
        assertEquals(perfil, resultado.getPrestador());
    }
}