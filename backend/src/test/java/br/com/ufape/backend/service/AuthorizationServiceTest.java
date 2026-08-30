package br.com.ufape.backend.service;

import br.com.ufape.backend.enums.UserRole;
import br.com.ufape.backend.model.User;
import br.com.ufape.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthorizationServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthorizationService authorizationService;

    @Test
    void deveCarregarUsuarioQuandoEmailExistir() {
        User user = new User("Ana", "ana@email.com", UserRole.USER, "senha123");
        when(userRepository.findByEmail("ana@email.com")).thenReturn(user);

        var resultado = authorizationService.loadUserByUsername("ana@email.com");

        assertEquals("ana@email.com", resultado.getUsername());
    }

    @Test
    void deveLancarErroQuandoUsuarioNaoExistir() {
        when(userRepository.findByEmail("ana@email.com")).thenReturn(null);

        UsernameNotFoundException exception = assertThrows(
                UsernameNotFoundException.class,
                () -> authorizationService.loadUserByUsername("ana@email.com")
        );

        assertEquals("Usuário não encontrado: ana@email.com", exception.getMessage());
    }
}
