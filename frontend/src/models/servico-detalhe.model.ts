export type FormaCobranca = 'POR_HORA' | 'DIARIA' | 'MENSALIDADE' | 'VALOR_FIXO_TOTAL';

export interface ServicoDetalhe {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  bairro: string;
  cidade: string;
  formaCobranca: FormaCobranca;
  nomePrestador: string;
  telefonePrestador: string;
  descricaoPrestador: string;
}
