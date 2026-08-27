import api from './api';
import type { ServicoResumo } from '../models/servico-resumo.model';
import type { ServicoDetalhe } from '../models/servico-detalhe.model';
import type { ServicoFiltro } from '../models/servico-filtro.model';
import type { StatusServico } from '../models/servico-status.enum';

export interface StatusUpdatePayload {
  status: StatusServico;
}

class ServicoService {
  async buscar(filtros: ServicoFiltro = {}): Promise<ServicoResumo[]> {
    const params: Record<string, string> = {};
    if (filtros.categoria) params.categoria = filtros.categoria;
    if (filtros.cidade) params.cidade = filtros.cidade;
    if (filtros.bairro) params.bairro = filtros.bairro;

    const response = await api.get<ServicoResumo[]>('/servicos', { params });
    return response.data;
  }

  async buscarPorId(id: string | number): Promise<ServicoDetalhe> {
    const response = await api.get<ServicoDetalhe>(`/servicos/${id}`);
    return response.data;
  }

  // Lista os serviços contratados sob responsabilidade do prestador autenticado
  async buscarServicosPrestador(): Promise<ServicoDetalhe[]> {
    const response = await api.get<ServicoDetalhe[]>('/servicos/prestador');
    return response.data;
  }

  // Consome PUT /api/servicos/{id}/status
  async atualizarStatus(id: string | number, status: StatusServico): Promise<ServicoDetalhe> {
    const payload: StatusUpdatePayload = { status };
    const response = await api.put<ServicoDetalhe>(`/servicos/${id}/status`, payload);
    return response.data;
  }
}

export const servicoService = new ServicoService();