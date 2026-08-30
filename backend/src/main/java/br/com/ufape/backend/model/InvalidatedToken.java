package br.com.ufape.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "invalidated_tokens")
public class InvalidatedToken {

    @Id
    @SequenceGenerator(name = "invalidated_token_id_seq", allocationSize = 1)
    @GeneratedValue(generator = "invalidated_token_id_seq", strategy = GenerationType.SEQUENCE)
    @Column(name = "id", updatable = false)
    private Long id;

    @Column(nullable = false, unique = true, length = 512)
    private String token;

    @Column(nullable = false)
    private LocalDateTime invalidatedAt;

    public InvalidatedToken() {}

    public InvalidatedToken(String token) {
        this.token = token;
        this.invalidatedAt = LocalDateTime.now(ZoneOffset.UTC);
    }

    public Long getId() { return id; }
    public String getToken() { return token; }
    public LocalDateTime getInvalidatedAt() { return invalidatedAt; }
}