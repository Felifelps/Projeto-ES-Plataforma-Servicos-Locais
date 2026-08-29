package br.com.ufape.backend.dto;


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