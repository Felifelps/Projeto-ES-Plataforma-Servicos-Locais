import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { ServicoDetalhe } from '../../../models/servico-detalhe.model';
import { orcamentoService } from '../../../services/orcamento.service';
import { servicoService } from '../../../services/servico.service';
import SolicitarOrcamento from '../SolicitarOrcamento';

// Mock dos serviços
vi.mock('../../../services/servico.service', () => ({
  servicoService: {
    buscarPorId: vi.fn(),
  },
}));

vi.mock('../../../services/orcamento.service', () => ({
  orcamentoService: {
    solicitar: vi.fn(),
  },
}));

// Mock do useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockServicoDetalhe: ServicoDetalhe = {
  id: 1,
  titulo: 'Pintura de Parede',
  descricao: 'Pintura de apartamento completo',
  categoria: 'PINTURA',
  cidade: 'Arcoverde',
  bairro: 'Centro',
  formaCobranca: 'VALOR_FIXO_TOTAL',
  nomePrestador: 'Carlos Pintor',
  telefonePrestador: '819819819819',
  descricaoPrestador: 'humano'
} as ServicoDetalhe;

describe('Página SolicitarOrcamento', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (path = '/servicos/1/orcamento') =>
    render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/servicos/:id/orcamento" element={<SolicitarOrcamento />} />
          <Route path="/servicos" element={<SolicitarOrcamento />} />
        </Routes>
      </MemoryRouter>
    );

  test('deve exibir mensagem de erro se o ID do serviço na URL for inválido', async () => {
    renderComponent('/servicos/abc/orcamento');

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Serviço inválido.');
    });
    expect(servicoService.buscarPorId).not.toHaveBeenCalled();
  });

  test('deve carregar e exibir o resumo do serviço com sucesso', async () => {
    vi.mocked(servicoService.buscarPorId).mockResolvedValueOnce(mockServicoDetalhe);

    renderComponent();

    expect(screen.getByText('Carregando dados do serviço...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Pintura de Parede')).toBeInTheDocument();
      expect(screen.getByText('Solicitação para Carlos Pintor')).toBeInTheDocument();
    });
  });

  test('deve exibir mensagem de alerta ao tentar enviar o formulário com campos vazios', async () => {
    const user = userEvent.setup();
    vi.mocked(servicoService.buscarPorId).mockResolvedValueOnce(mockServicoDetalhe);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Pintura de Parede')).toBeInTheDocument();
    });

    const btnEnviar = screen.getByRole('button', { name: /enviar solicitação/i });
    await user.click(btnEnviar);

    await waitFor(() => {
      expect(
        screen.getByText('Preencha todos os campos obrigatórios antes de enviar.')
      ).toBeInTheDocument();
    });
    expect(orcamentoService.solicitar).not.toHaveBeenCalled();
  });

  test('deve enviar a solicitação de orçamento com sucesso', async () => {
    const user = userEvent.setup();
    vi.mocked(servicoService.buscarPorId).mockResolvedValueOnce(mockServicoDetalhe);
    vi.mocked(orcamentoService.solicitar).mockResolvedValueOnce({} as never);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Pintura de Parede')).toBeInTheDocument();
    });

    await user.type(
      screen.getByLabelText(/descrição da necessidade/i),
      'Preciso pintar 3 quartos e 1 sala.'
    );
    await user.type(screen.getByLabelText(/local do atendimento/i), 'Rua Principal, 100');
    await user.type(screen.getByLabelText(/data ou período desejado/i), 'Próxima segunda-feira');

    const btnEnviar = screen.getByRole('button', { name: /enviar solicitação/i });
    await user.click(btnEnviar);

    await waitFor(() => {
      expect(orcamentoService.solicitar).toHaveBeenCalledWith({
        servicoId: 1,
        descricaoNecessidade: 'Preciso pintar 3 quartos e 1 sala.',
        localAtendimento: 'Rua Principal, 100',
        dataOuPeriodoDesejado: 'Próxima segunda-feira',
      });
      expect(
        screen.getByText('Solicitação de orçamento enviada com sucesso!')
      ).toBeInTheDocument();
    });
  });

  test('deve exibir mensagem de erro retornada pela API quando falhar a solicitação', async () => {
    const user = userEvent.setup();
    vi.mocked(servicoService.buscarPorId).mockResolvedValueOnce(mockServicoDetalhe);

    const mockAxiosError = {
      isAxiosError: true,
      response: { data: { message: 'Você já possui uma solicitação pendente para este serviço.' } },
    };
    vi.mocked(orcamentoService.solicitar).mockRejectedValueOnce(mockAxiosError);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Pintura de Parede')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/descrição da necessidade/i), 'Serviço residencial');
    await user.type(screen.getByLabelText(/local do atendimento/i), 'Centro');
    await user.type(screen.getByLabelText(/data ou período desejado/i), 'Amanhã');

    await user.click(screen.getByRole('button', { name: /enviar solicitação/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Você já possui uma solicitação pendente para este serviço.')
      ).toBeInTheDocument();
    });
  });

  test('deve navegar de volta para a página do serviço ao clicar no botão voltar', async () => {
    const user = userEvent.setup();
    vi.mocked(servicoService.buscarPorId).mockResolvedValueOnce(mockServicoDetalhe);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Pintura de Parede')).toBeInTheDocument();
    });

    const btnVoltar = screen.getByRole('button', { name: /← voltar para o serviço/i });
    await user.click(btnVoltar);

    expect(mockNavigate).toHaveBeenCalledWith('/servicos/1');
  });
});