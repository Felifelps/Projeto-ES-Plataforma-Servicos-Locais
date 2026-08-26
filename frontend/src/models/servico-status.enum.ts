export type StatusServico = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';

// Mapeamento de rótulos amigáveis para a interface
export const STATUS_SERVICO_LABELS: Record<StatusServico, string> = {
  PENDENTE: 'Pendente',
  EM_ANDAMENTO: 'Em Andamento',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
};

// Mapeamento das transições permitidas para cada status
export const TRANSOES_PERMITIDAS: Record<StatusServico, StatusServico[]> = {
  PENDENTE: ['EM_ANDAMENTO', 'CANCELADO'],
  EM_ANDAMENTO: ['CONCLUIDO', 'CANCELADO'],
  CONCLUIDO: [],
  CANCELADO: [],
};