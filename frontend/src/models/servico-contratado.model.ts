export type StatusServicoContratado = 'CONTRATADO' | 'EM_ANDAMENTO' | 'CONCLUIDO';

export interface ServicoContratado {
  id: number;
  titulo: string;
  categoria: string;
  bairro: string;
  cidade: string;
  nomePrestador: string;
  statusAtual: StatusServicoContratado;
}
