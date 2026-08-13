import api from './api';
import type {
  ServicoCadastroRequest,
  ServicoCadastroResponse,
} from '../models/servico-cadastro.model';

class CadastroServicoService {
  // 1. Cadastrar um novo serviço
  async cadastrar(data: ServicoCadastroRequest): Promise<ServicoCadastroResponse> {
    const response = await api.post<ServicoCadastroResponse>('/servicos', data);
    return response.data;
  }

  // 2. Buscar a lista de serviços do prestador logado
  async listarMeusServicos(): Promise<ServicoCadastroResponse[]> {
    const response = await api.get<ServicoCadastroResponse[]>('/servicos/meus-servicos');
    return response.data;
  }
}

export const cadastroServicoService = new CadastroServicoService();