import type { FormaCobranca } from '../models/servico-cadastro.model';

export const CATEGORIAS_SERVICO = [
  { id: 1, nome: 'Eletricista' },
  { id: 2, nome: 'Encanador' },
  { id: 3, nome: 'Diarista' },
  { id: 4, nome: 'Pintor' },
  { id: 5, nome: 'Jardineiro' },
  { id: 6, nome: 'Marceneiro' },
  { id: 7, nome: 'Pedreiro' },
  { id: 8, nome: 'Chaveiro' },
  { id: 9, nome: 'Técnico de Informática' },
  { id: 10, nome: 'Professor Particular' },
] as const;

export const FORMAS_COBRANCA: ReadonlyArray<{
  valor: FormaCobranca;
  rotulo: string;
}> = [
  { valor: 'POR_HORA', rotulo: 'Por hora' },
  { valor: 'DIARIA', rotulo: 'Diária' },
  { valor: 'MENSALIDADE', rotulo: 'Mensalidade' },
  { valor: 'VALOR_FIXO_TOTAL', rotulo: 'Valor fixo total' },
];
