package br.com.ufape.backend.service;

import br.com.ufape.backend.model.User;
import br.com.ufape.backend.model.InvalidatedToken;
import br.com.ufape.backend.repository.InvalidatedTokenRepository;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
public class TokenService {

    @Value("${api.security.token.secret}")
    private String secret;

    private final InvalidatedTokenRepository invalidatedTokenRepository;

    public TokenService(InvalidatedTokenRepository invalidatedTokenRepository) {
        this.invalidatedTokenRepository = invalidatedTokenRepository;
    }

    public String gerarToken(User user){
        try{
            Algorithm algorithm = Algorithm.HMAC256(this.secret);
            return JWT.create()
                    .withIssuer("housing")
                    .withSubject(user.getEmail())
                    .withClaim("name", user.getName())
                    .withClaim("role", user.getRole().name())
                    .withExpiresAt(LocalDateTime.now().plusHours(2).toInstant(ZoneOffset.of("-03:00")))
                    .sign(algorithm);
        }catch (JWTCreationException exception){
            throw new RuntimeException("Erro ao gerar token JWT", exception);
        }
    }

    public String validateToken(String token) {
        try {
            if (isTokenInvalidated(token)) {
                return "";
            }

            Algorithm algorithm = Algorithm.HMAC256(this.secret);
            return JWT.require(algorithm)
                    .withIssuer("housing")
                    .build()
                    .verify(token)
                    .getSubject();
        } catch (JWTVerificationException exception) {
            return "";
        }
    }

    public boolean isTokenInvalidated(String token) {
        return invalidatedTokenRepository.existsByToken(token);
    }

    public void invalidateToken(String token) {
        invalidatedTokenRepository.save(new InvalidatedToken(token));
    }
}