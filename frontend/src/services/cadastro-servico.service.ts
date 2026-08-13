import api from './api';
import type {
  ServicoCadastroRequest,
  ServicoCadastroResponse,
} from '../models/servico-cadastro.model';

class CadastroServicoService {
  async cadastrar(data: ServicoCadastroRequest): Promise<ServicoCadastroResponse> {
    const response = await api.post<ServicoCadastroResponse>('/servicos', data);
    return response.data;
  }
}

export const cadastroServicoService = new CadastroServicoService();
