package br.com.ufape.backend.service;

import br.com.ufape.backend.dto.UserRequestDto;
import br.com.ufape.backend.dto.UserResponseDto;
import br.com.ufape.backend.enums.UserRole;
import br.com.ufape.backend.model.User;
import br.com.ufape.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @Test
    void shouldRegisterUserWithProvidedRole() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserRequestDto request = new UserRequestDto(
                "Ana",
                "ana@email.com",
                "senha123",
                UserRole.ADMIN
        );

        UserResponseDto response = authService.register(request);

        assertEquals(UserRole.ADMIN, response.role());
    }
}
