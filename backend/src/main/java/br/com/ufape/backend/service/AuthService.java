package br.com.ufape.backend.service;

import br.com.ufape.backend.dto.UserRequestDto;
import br.com.ufape.backend.dto.UserResponseDto;
import br.com.ufape.backend.enums.UserRole;
import br.com.ufape.backend.exception.EmailAlreadyExistsException;
import br.com.ufape.backend.model.User;
import br.com.ufape.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponseDto register(UserRequestDto userDto) {
        validateEmailNotUsed(userDto.email());

        UserRole role = userDto.role() != null ? userDto.role() : UserRole.USER;

        User user = new User(
                userDto.name(),
                userDto.email(),
                role,
                encryptPassword(userDto.password())
        );

        user = userRepository.save(user);

        return UserResponseDto.fromEntity(user);
    }

    private void validateEmailNotUsed(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException(email);
        }
    }

    private String encryptPassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }
}
