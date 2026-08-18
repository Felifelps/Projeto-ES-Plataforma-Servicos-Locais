import api from './api';
import type { OrcamentoRequest } from '../models/orcamento-request.model';
import type { OrcamentoResponse } from '../models/orcamento-response.model';

class OrcamentoService {
  async solicitar(data: OrcamentoRequest): Promise<OrcamentoResponse> {
    const response = await api.post<OrcamentoResponse>('/orcamentos', data);
    return response.data;
  }
}

export const orcamentoService = new OrcamentoService();
