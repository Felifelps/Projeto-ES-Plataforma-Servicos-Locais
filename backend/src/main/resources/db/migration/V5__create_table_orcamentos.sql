CREATE SEQUENCE orcamento_id_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE orcamentos (
    id BIGINT NOT NULL DEFAULT nextval('orcamento_id_seq'),
    descricao_necessidade TEXT NOT NULL,
    local_atendimento VARCHAR(255) NOT NULL,
    data_ou_periodo_desejado VARCHAR(255) NOT NULL,
    servico_id BIGINT NOT NULL,
    provider_profile_id BIGINT NOT NULL,
    solicitante_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_orcamento_servico FOREIGN KEY (servico_id) REFERENCES servicos (id),
    CONSTRAINT fk_orcamento_provider FOREIGN KEY (provider_profile_id) REFERENCES provider_profiles (id),
    CONSTRAINT fk_orcamento_solicitante FOREIGN KEY (solicitante_id) REFERENCES users (id)
);
