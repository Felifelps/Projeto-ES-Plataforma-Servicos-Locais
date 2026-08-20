CREATE SEQUENCE avaliacao_id_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE avaliacoes (
    id BIGINT NOT NULL DEFAULT nextval('avaliacao_id_seq'),
    servico_id BIGINT NOT NULL,
    provider_profile_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    nota INTEGER NOT NULL,
    comentario TEXT,
    created_at TIMESTAMP NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_avaliacao_servico FOREIGN KEY (servico_id) REFERENCES servicos (id),
    CONSTRAINT fk_avaliacao_provider FOREIGN KEY (provider_profile_id) REFERENCES provider_profiles (id),
    CONSTRAINT fk_avaliacao_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT uk_avaliacao_servico_usuario UNIQUE (servico_id, user_id)
);
