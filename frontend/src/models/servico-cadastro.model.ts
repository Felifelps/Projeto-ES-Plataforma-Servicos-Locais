export type FormaCobranca =
  | 'POR_HORA'
  | 'DIARIA'
  | 'MENSALIDADE'
  | 'VALOR_FIXO_TOTAL';

export interface ServicoCadastroRequest {
  titulo: string;
  categoriaId: number;
  descricao: string;
  localizacao: string;
  areaAtendimento: string;
  formaCobranca: FormaCobranca;
}

export interface ServicoCadastroResponse {
  id: number;
  titulo: string;
  descricao: string;
  localizacao: string;
  areaAtendimento: string;
  formaCobranca: FormaCobranca;
}
