import api from './api';
import type { AvaliacaoRequest } from '../models/avaliacao-request.model';
import type { AvaliacaoResponse } from '../models/avaliacao-response.model';

class AvaliacaoService {
  async avaliar(servicoId: number, data: AvaliacaoRequest): Promise<AvaliacaoResponse> {
    const response = await api.post<AvaliacaoResponse>(
      `/servicos/${servicoId}/avaliacoes`,
      data,
    );
    return response.data;
  }
}

export const avaliacaoService = new AvaliacaoService();
