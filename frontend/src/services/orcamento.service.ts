import api from './api';
import type { OrcamentoRequest } from '../models/orcamento-request.model';
import type { OrcamentoResponse } from '../models/orcamento-response.model';
import type { OrcamentoRespostaRequest } from '../models/orcamento-resposta-request.model';

class OrcamentoService {
  async solicitar(data: OrcamentoRequest): Promise<OrcamentoResponse> {
    const response = await api.post<OrcamentoResponse>('/orcamentos', data);
    return response.data;
  }

  //1. Listar orçamentos recebidos
  async listarOrcamentosRecebidos(): Promise<OrcamentoResponse[]> {
    const response = await api.get<OrcamentoResponse[]>('/orcamentos/recebidos');
    return response.data;
  }

  //2. Responder a um orçamento
  async responderOrcamento(id: number, data: OrcamentoRespostaRequest): Promise<OrcamentoResponse> {
    const response = await api.put<OrcamentoResponse>(`/orcamentos/${id}/responder`, data);
    return response.data;
  }
}

export const orcamentoService = new OrcamentoService();
