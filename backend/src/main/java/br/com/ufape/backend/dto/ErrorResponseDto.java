package br.com.ufape.backend.dto;

import java.time.LocalDateTime;

public record ErrorResponseDto(
        int status,
        String error,
        String message
) {
    public static ErrorResponseDto of(int status, String error, String message) {
        return new ErrorResponseDto(
                status,
                error,
                message
        );
    }
}