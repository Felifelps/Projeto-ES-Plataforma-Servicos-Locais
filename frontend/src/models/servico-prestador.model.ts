import type { ServicoDetalhe } from './servico-detalhe.model';
import type { StatusServico } from './servico-status.enum';

export interface ServicoPrestadorItem extends ServicoDetalhe {
  status: StatusServico;
  nomeCliente?: string;
  telefoneCliente?: string;
  dataSolicitacao?: string;
}