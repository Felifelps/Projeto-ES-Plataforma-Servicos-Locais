INSERT INTO users (id, name, email, role, password) VALUES
(101, 'João Carlos Silva', 'joao.eletrica@email.com', 'PRESTADOR', '123456'),
(102, 'Marina Ferreira', 'marina.limpeza@email.com', 'PRESTADOR', '123456'),
(103, 'Roberto Alves', 'roberto.manutencao@email.com', 'PRESTADOR', '123456'),
(104, 'Camila Santos', 'camila.aulas@email.com', 'PRESTADOR', '123456');

INSERT INTO servicos (titulo, descricao, forma_cobranca, localizacao, area_atendimento, service_category_id, provider_id) VALUES
('Instalação e Reparo de Chuveiros', 'Troca de resistência, fiação elétrica e instalação de chuveiros novos.', 'VALOR_FIXO_TOTAL', 'Centro', 'São Paulo - SP', 1, 101),
('Manutenção de Quadro de Energia', 'Revisão completa, troca de disjuntores e balanceamento de carga.', 'POR_HORA', 'Pinheiros', 'São Paulo e ABC', 1, 101),
('Limpeza Pesada Pós-Obra', 'Limpeza completa com produtos especializados para remoção de tinta e cimento.', 'POR_HORA', 'Savassi', 'Belo Horizonte e Região', 3, 102),
('Pintura Interna de Apartamento', 'Acabamento fino, pintura de portas, janelas e paredes com massa corrida.', 'VALOR_FIXO_TOTAL', 'Lourdes', 'Belo Horizonte (Zona Sul)', 4, 102),
('Paisagismo e Poda de Árvores', 'Manutenção mensal de jardins residenciais e corte de grama.', 'POR_HORA', 'Batel', 'Curitiba Metropolitana', 5, 103),
('Instalação de Torneiras e Pias', 'Reparos hidráulicos rápidos, desentupimento e troca de sifão.', 'VALOR_FIXO_TOTAL', 'Centro', 'Curitiba', 2, 103),
('Montagem de Móveis Planejados', 'Montagem de guarda-roupas, estantes e painéis de TV.', 'VALOR_FIXO_TOTAL', 'Boa Viagem', 'Recife e Jaboatão', 6, 103),
('Abertura de Portas e Cofres', 'Troca de miolos, conserto de fechaduras e chaves reserva.', 'VALOR_FIXO_TOTAL', 'Pina', 'Recife e Olinda', 8, 103),
('Aulas de Matemática para Concursos', 'Resolução de provas, reforço de lógica e acompanhamento semanal.', 'POR_HORA', 'Trindade', 'Florianópolis (Ilha)', 10, 104),
('Formatação e Limpeza de Computadores', 'Backup de arquivos, instalação de Windows e otimização de SSD.', 'VALOR_FIXO_TOTAL', 'Centro', 'Florianópolis', 9, 104);