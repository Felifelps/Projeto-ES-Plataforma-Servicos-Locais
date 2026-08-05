package br.com.ufape.backend.controller;

import br.com.ufape.backend.dto.AuthDTO;
import br.com.ufape.backend.dto.LoginResponseDTO;
import br.com.ufape.backend.model.User;
import br.com.ufape.backend.dto.UserRequestDto;
import br.com.ufape.backend.dto.UserResponseDto;
import br.com.ufape.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import br.com.ufape.backend.service.TokenService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    private AuthenticationManager manager;

    @Autowired
    private TokenService tokenService;


    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/cadastro")
    public ResponseEntity<UserResponseDto> register(@RequestBody @Valid UserRequestDto userDTO) {
        UserResponseDto userResponseDto = this.authService.register(userDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(userResponseDto);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.replace("Bearer ", "");
            tokenService.invalidateToken(token);
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> efetuarLogin(@RequestBody @Valid AuthDTO dados) {
        var authenticationToken = new UsernamePasswordAuthenticationToken(dados.email(), dados.password ());

        var authentication = manager.authenticate(authenticationToken);

        var tokenJWT = tokenService.gerarToken((User) authentication.getPrincipal());

        return ResponseEntity.ok(new LoginResponseDTO(tokenJWT));
    }
}
