package br.com.ufape.backend.dto;

import br.com.ufape.backend.enums.UserRole;
import br.com.ufape.backend.model.User;

public record UserResponseDto (
        Long id,
        String name,
        String email,
        UserRole role
) {
    public static UserResponseDto fromEntity(User user) {
        return new UserResponseDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }
}
