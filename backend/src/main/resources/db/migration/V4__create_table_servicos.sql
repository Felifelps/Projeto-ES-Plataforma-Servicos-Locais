CREATE SEQUENCE servico_id_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE servicos (
    id BIGINT NOT NULL DEFAULT nextval('servico_id_seq'),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    localizacao VARCHAR(255) NOT NULL,
    area_atendimento VARCHAR(255) NOT NULL,
    forma_cobranca VARCHAR(50) NOT NULL,
    service_category_id BIGINT NOT NULL,
    provider_profile_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_servico_category FOREIGN KEY (service_category_id) REFERENCES service_categories (id),
    CONSTRAINT fk_servico_provider FOREIGN KEY (provider_profile_id) REFERENCES provider_profiles (id)
);