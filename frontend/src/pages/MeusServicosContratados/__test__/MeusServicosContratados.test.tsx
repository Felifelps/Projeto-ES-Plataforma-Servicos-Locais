import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { ServicoPrestadorItem } from '../../../models/servico-prestador.model';
import type { StatusServico } from '../../../models/servico-status.enum';
import { servicoService } from '../../../services/servico.service';
import MeusServicosContratados from '../MeusServicosContratados';

// Mock do serviço de serviços
vi.mock('../../../services/servico.service', () => ({
  servicoService: {
    buscarServicosPrestador: vi.fn(),
    atualizarStatus: vi.fn(),
  },
}));

// Mock do card de serviço do prestador
vi.mock('../components/ServicoPrestadorCard', () => ({
  default: ({
    servico,
    processandoId,
    onAtualizarStatus,
  }: {
    servico: ServicoPrestadorItem;
    processandoId: number | null;
    onAtualizarStatus: (id: number, novoStatus: StatusServico) => void;
  }) => (
    <div data-testid="servico-prestador-card">
      <h3>{servico.titulo}</h3>
      <span>Status: {servico.status}</span>
      <button
        type="button"
        disabled={processandoId === servico.id}
        onClick={() => onAtualizarStatus(servico.id, 'EM_ANDAMENTO' as StatusServico)}
      >
        Mudar para Em Andamento
      </button>
    </div>
  ),
}));

const mockServicosPrestador: ServicoPrestadorItem[] = [
  {
    id: 1,
    titulo: 'Manutenção Preventiva de Ar Condicionado',
    descricao: 'Higienização e recarga de gás',
    categoria: 'CLIMATIZACAO',
    bairro: 'Centro',
    cidade: 'Arcoverde',
    formaCobranca: 'VALOR_FIXO_TOTAL',
    nomePrestador: 'Joran Lage',
    telefonePrestador: '87999999999',
    descricaoPrestador: 'Técnico certificado',
    status: 'PENDENTE' as StatusServico,
    nomeCliente: 'Maria Clara',
  },
];

describe('Página MeusServicosContratados (Prestador)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <MeusServicosContratados />
      </BrowserRouter>
    );

  test('deve exibir o estado de carregamento e listar os serviços do prestador', async () => {
    vi.mocked(servicoService.buscarServicosPrestador).mockResolvedValueOnce(
      mockServicosPrestador as unknown as never
    );

    renderComponent();

    expect(screen.getByText('Carregando serviços...')).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText('Manutenção Preventiva de Ar Condicionado')
      ).toBeInTheDocument();
      expect(screen.getByTestId('servico-prestador-card')).toBeInTheDocument();
    });
  });

  test('deve exibir o estado vazio quando o prestador não possuir serviços sob sua responsabilidade', async () => {
    vi.mocked(servicoService.buscarServicosPrestador).mockResolvedValueOnce([] as never);

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText('Você não possui serviços contratados no momento.')
      ).toBeInTheDocument();
    });
  });

  test('deve exibir mensagem de erro se o carregamento dos serviços falhar', async () => {
    vi.mocked(servicoService.buscarServicosPrestador).mockRejectedValueOnce(
      new Error('Erro ao carregar')
    );

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText('Não foi possível carregar seus serviços contratados.')
      ).toBeInTheDocument();
    });
  });

  test('deve atualizar o status do serviço com sucesso após confirmação do usuário', async () => {
    const user = userEvent.setup();
    vi.mocked(servicoService.buscarServicosPrestador).mockResolvedValueOnce(
      mockServicosPrestador as unknown as never
    );
    vi.mocked(servicoService.atualizarStatus).mockResolvedValueOnce({} as never);

    // Simula confirmação do modal de janela
    vi.spyOn(window, 'confirm').mockReturnValueOnce(true);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Status: PENDENTE')).toBeInTheDocument();
    });

    const btnAtualizar = screen.getByRole('button', {
      name: /mudar para em andamento/i,
    });
    await user.click(btnAtualizar);

    await waitFor(() => {
      expect(servicoService.atualizarStatus).toHaveBeenCalledWith(1, 'EM_ANDAMENTO');
      expect(screen.getByText('Status atualizado com sucesso!')).toBeInTheDocument();
      expect(screen.getByText('Status: EM_ANDAMENTO')).toBeInTheDocument();
    });
  });

  test('não deve chamar a API de atualização de status se o usuário cancelar o confirm', async () => {
    const user = userEvent.setup();
    vi.mocked(servicoService.buscarServicosPrestador).mockResolvedValueOnce(
      mockServicosPrestador as unknown as never
    );

    // Simula cancelamento no window.confirm
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false);

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText('Manutenção Preventiva de Ar Condicionado')
      ).toBeInTheDocument();
    });

    const btnAtualizar = screen.getByRole('button', {
      name: /mudar para em andamento/i,
    });
    await user.click(btnAtualizar);

    expect(servicoService.atualizarStatus).not.toHaveBeenCalled();
  });

  test('deve exibir mensagem de erro retornada pela API ao falhar transição de status', async () => {
    const user = userEvent.setup();
    vi.mocked(servicoService.buscarServicosPrestador).mockResolvedValueOnce(
      mockServicosPrestador as unknown as never
    );

    const mockAxiosError = {
      response: { data: { message: 'Transição de status não permitida.' } },
    };
    vi.mocked(servicoService.atualizarStatus).mockRejectedValueOnce(mockAxiosError);

    vi.spyOn(window, 'confirm').mockReturnValueOnce(true);

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText('Manutenção Preventiva de Ar Condicionado')
      ).toBeInTheDocument();
    });

    const btnAtualizar = screen.getByRole('button', {
      name: /mudar para em andamento/i,
    });
    await user.click(btnAtualizar);

    await waitFor(() => {
      expect(screen.getByText('Transição de status não permitida.')).toBeInTheDocument();
    });
  });
});