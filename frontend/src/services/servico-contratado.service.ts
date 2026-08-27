import api from './api';
import type { ServicoContratado } from '../models/servico-contratado.model';

class ServicoContratadoService {
  async listar(): Promise<ServicoContratado[]> {
    const response = await api.get<ServicoContratado[]>('/servicos/contratados');
    return response.data;
  }
}

export const servicoContratadoService = new ServicoContratadoService();
