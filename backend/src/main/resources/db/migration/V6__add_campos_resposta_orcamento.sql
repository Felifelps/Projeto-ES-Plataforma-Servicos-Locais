ALTER TABLE orcamentos ADD COLUMN valor_resposta NUMERIC(10, 2);
ALTER TABLE orcamentos ADD COLUMN descricao_resposta TEXT;
ALTER TABLE orcamentos ADD COLUMN status_resposta VARCHAR(20) NOT NULL DEFAULT 'PENDENTE';