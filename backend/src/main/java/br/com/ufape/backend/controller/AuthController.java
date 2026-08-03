package br.com.ufape.backend.controller;

import br.com.ufape.backend.dto.UserRequestDto;
import br.com.ufape.backend.dto.UserResponseDto;
import br.com.ufape.backend.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/cadastro")
    public ResponseEntity<UserResponseDto> register(@RequestBody @Valid UserRequestDto userDTO) {
        UserResponseDto userResponseDto = this.authService.register(userDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(userResponseDto);
    }
}
