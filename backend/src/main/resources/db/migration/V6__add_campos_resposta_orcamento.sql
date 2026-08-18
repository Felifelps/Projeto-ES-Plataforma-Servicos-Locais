ALTER TABLE orcamentos 
ADD COLUMN valor_resposta NUMERIC(10, 2),
ADD COLUMN descricao_resposta TEXT,
ADD COLUMN status_resposta VARCHAR(20) NOT NULL DEFAULT 'PENDENTE';