import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cadastroServicoService } from '../../../services/cadastro-servico.service';
import CadastroServico from '../CadastroServico';

// Mock do serviço de cadastro de serviços
vi.mock('../../../services/cadastro-servico.service', () => ({
  cadastroServicoService: {
    cadastrar: vi.fn(),
  },
}));

// Mock das constantes de opções
vi.mock('../../../constants/servico-cadastro-options', () => ({
  CATEGORIAS_SERVICO: [
    { id: 1, nome: 'Manutenção Elétrica' },
    { id: 2, nome: 'Pintura' },
  ],
  FORMAS_COBRANCA: [
    { valor: 'VALOR_FIXO_TOTAL', rotulo: 'Valor fixo total' },
    { valor: 'POR_HORA', rotulo: 'Por hora' },
  ],
}));

// Mock do hook useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Página CadastroServico', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <CadastroServico />
      </BrowserRouter>
    );

  test('deve renderizar os campos do formulário e os botões de ação', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /cadastrar serviço/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/forma de cobrança/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/localização/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/área de atendimento/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cadastrar serviço/i })).toBeInTheDocument();
  });

  test('deve exibir mensagem de erro genérica ao tentar submeter o formulário em branco', async () => {
    const user = userEvent.setup();
    renderComponent();

    const btnSubmit = screen.getByRole('button', { name: /cadastrar serviço/i });
    await user.click(btnSubmit);

    await waitFor(() => {
      expect(
        screen.getByText('Preencha todos os campos obrigatórios antes de cadastrar.')
      ).toBeInTheDocument();
    });
    expect(cadastroServicoService.cadastrar).not.toHaveBeenCalled();
  });

  test('deve submeter o formulário com sucesso e redirecionar para /meus-servicos após o timeout', async () => {
    vi.mocked(cadastroServicoService.cadastrar).mockResolvedValueOnce({} as never);

    renderComponent();

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/título/i), 'Instalação Elétrica Residencial');
    await user.selectOptions(screen.getByLabelText(/categoria/i), '1');
    await user.selectOptions(screen.getByLabelText(/forma de cobrança/i), 'VALOR_FIXO_TOTAL');
    await user.type(screen.getByLabelText(/descrição/i), 'Serviço completo de fiação e quadros.');
    await user.type(screen.getByLabelText(/localização/i), 'Arcoverde - PE');
    await user.type(screen.getByLabelText(/área de atendimento/i), 'Centro e zona rural');

    // Ativa fake timers apenas para controlar a chamada do setTimeout de redirecionamento
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const btnSubmit = screen.getByRole('button', { name: /cadastrar serviço/i });
    await user.click(btnSubmit);

    await waitFor(() => {
      expect(cadastroServicoService.cadastrar).toHaveBeenCalledWith({
        titulo: 'Instalação Elétrica Residencial',
        categoriaId: 1,
        formaCobranca: 'VALOR_FIXO_TOTAL',
        descricao: 'Serviço completo de fiação e quadros.',
        localizacao: 'Arcoverde - PE',
        areaAtendimento: 'Centro e zona rural',
      });
      expect(screen.getByRole('status')).toHaveTextContent('Serviço cadastrado com sucesso!');
    });

    vi.advanceTimersByTime(1500);

    expect(mockNavigate).toHaveBeenCalledWith('/meus-servicos');
  });

  test('deve exibir mensagem de erro retornada pela API quando o cadastro falhar', async () => {
    const user = userEvent.setup();
    const mockAxiosError = {
      isAxiosError: true,
      response: { data: { message: 'Você já possui um serviço cadastrado com este título.' } },
    };
    vi.mocked(cadastroServicoService.cadastrar).mockRejectedValueOnce(mockAxiosError);

    renderComponent();

    await user.type(screen.getByLabelText(/título/i), 'Instalação Elétrica');
    await user.selectOptions(screen.getByLabelText(/categoria/i), '1');
    await user.selectOptions(screen.getByLabelText(/forma de cobrança/i), 'VALOR_FIXO_TOTAL');
    await user.type(screen.getByLabelText(/descrição/i), 'Descrição do serviço');
    await user.type(screen.getByLabelText(/localização/i), 'Arcoverde');
    await user.type(screen.getByLabelText(/área de atendimento/i), 'Toda a cidade');

    const btnSubmit = screen.getByRole('button', { name: /cadastrar serviço/i });
    await user.click(btnSubmit);

    await waitFor(() => {
      expect(cadastroServicoService.cadastrar).toHaveBeenCalled();
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Você já possui um serviço cadastrado com este título.'
      );
    });
  });

  test('deve navegar para a página inicial ao clicar em Cancelar', async () => {
    const user = userEvent.setup();
    renderComponent();

    const btnCancelar = screen.getByRole('button', { name: /cancelar/i });
    await user.click(btnCancelar);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});