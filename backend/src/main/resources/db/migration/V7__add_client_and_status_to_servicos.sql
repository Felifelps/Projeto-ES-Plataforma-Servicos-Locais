ALTER TABLE servicos
    ADD COLUMN client_user_id BIGINT,
    ADD COLUMN status VARCHAR(50);

UPDATE servicos
SET status = 'DISPONIVEL'
WHERE status IS NULL;

ALTER TABLE servicos
    ALTER COLUMN status SET NOT NULL;

ALTER TABLE servicos
    ADD CONSTRAINT fk_servico_client
        FOREIGN KEY (client_user_id) REFERENCES users (id);
