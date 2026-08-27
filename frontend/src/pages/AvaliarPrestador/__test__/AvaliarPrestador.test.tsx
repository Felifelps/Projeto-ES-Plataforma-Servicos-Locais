import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { ServicoDetalhe } from '../../../models/servico-detalhe.model';
import { avaliacaoService } from '../../../services/avaliacao.service';
import { servicoService } from '../../../services/servico.service';
import AvaliarPrestador from '../AvaliarPrestador';

// Mock do componente SeletorNota
vi.mock('../components/SeletorNota/SeletorNota', () => ({
  default: ({
    value,
    onChange,
    disabled,
  }: {
    value: number;
    onChange: (val: number) => void;
    disabled?: boolean;
  }) => (
    <div>
      <label htmlFor="seletor-nota">Nota</label>
      <input
        id="seletor-nota"
        type="number"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  ),
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

const mockServico: ServicoDetalhe = {
  id: 10,
  titulo: 'Instalação Elétrica',
  descricao: 'Serviço residencial completo de fiação e aterramento.',
  categoria: 'Manutenção Elétrica',
  bairro: 'Centro',
  cidade: 'Arcoverde',
  formaCobranca: 'VALOR_FIXO_TOTAL',
  nomePrestador: 'Carlos Silva',
  telefonePrestador: '87999999999',
  descricaoPrestador: 'Eletricista predial e residencial com 10 anos de experiência.',
};

describe('Página AvaliarPrestador', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderComponent = (servicoId = '10') =>
    render(
      <MemoryRouter initialEntries={[`/avaliar/${servicoId}`]}>
        <Routes>
          <Route path="/avaliar/:id" element={<AvaliarPrestador />} />
        </Routes>
      </MemoryRouter>
    );

  test('deve exibir estado de carregamento e depois renderizar os dados do serviço', async () => {
    vi.spyOn(servicoService, 'buscarPorId').mockResolvedValueOnce(mockServico);

    renderComponent();

    expect(screen.getByRole('status')).toHaveTextContent(/carregando dados do serviço/i);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /avaliar prestador/i })).toBeInTheDocument();
      expect(screen.getByText(/conte como foi sua experiência com carlos silva/i)).toBeInTheDocument();
      expect(screen.getByText('Instalação Elétrica')).toBeInTheDocument();
    });
  });

  test('deve exibir mensagem de erro se o serviço não for encontrado', async () => {
    vi.spyOn(servicoService, 'buscarPorId').mockRejectedValueOnce(new Error('404'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Não foi possível carregar os dados do serviço.'
      );
    });
  });

  test('deve exibir alerta se o ID do serviço na URL for inválido', async () => {
    renderComponent('abc');

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Serviço inválido.');
    });
  });

  test('deve validar e impedir o envio quando nenhuma nota for selecionada', async () => {
    const user = userEvent.setup();
    const spyBuscar = vi.spyOn(servicoService, 'buscarPorId').mockResolvedValueOnce(mockServico);
    const spyAvaliar = vi.spyOn(avaliacaoService, 'avaliar');

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /avaliar prestador/i })).toBeInTheDocument();
    });

    const btnEnviar = screen.getByRole('button', { name: /enviar avaliação/i });
    await user.click(btnEnviar);

    await waitFor(() => {
      expect(
        screen.getByText('Selecione uma nota antes de enviar a avaliação.')
      ).toBeInTheDocument();
    });
    expect(spyBuscar).toHaveBeenCalledWith(10);
    expect(spyAvaliar).not.toHaveBeenCalled();
  });

  test('deve enviar a avaliação com sucesso e atualizar a interface', async () => {
    const user = userEvent.setup();
    vi.spyOn(servicoService, 'buscarPorId').mockResolvedValueOnce(mockServico);
    const spyAvaliar = vi.spyOn(avaliacaoService, 'avaliar').mockResolvedValueOnce({} as never);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /avaliar prestador/i })).toBeInTheDocument();
    });

    const inputNota = screen.getByLabelText('Nota');
    await user.clear(inputNota);
    await user.type(inputNota, '5');

    const inputComentario = screen.getByLabelText(/comentário/i);
    await user.type(inputComentario, 'Atendimento excelente e pontual.');

    const btnEnviar = screen.getByRole('button', { name: /enviar avaliação/i });
    await user.click(btnEnviar);

    await waitFor(() => {
      expect(spyAvaliar).toHaveBeenCalledWith(10, {
        nota: 5,
        comentario: 'Atendimento excelente e pontual.',
      });
      expect(screen.getByRole('status')).toHaveTextContent('Avaliação enviada com sucesso!');
      expect(screen.getByRole('button', { name: /voltar ao serviço/i })).toBeInTheDocument();
    });
  });

  test('deve exibir erro retornado pela API quando o envio da avaliação falhar', async () => {
    const user = userEvent.setup();
    vi.spyOn(servicoService, 'buscarPorId').mockResolvedValueOnce(mockServico);

    const mockAxiosError = {
      isAxiosError: true,
      response: { status: 409, data: { message: 'Você já avaliou este serviço.' } },
    };
    vi.spyOn(avaliacaoService, 'avaliar').mockRejectedValueOnce(mockAxiosError);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /avaliar prestador/i })).toBeInTheDocument();
    });

    const inputNota = screen.getByLabelText('Nota');
    await user.clear(inputNota);
    await user.type(inputNota, '4');

    const btnEnviar = screen.getByRole('button', { name: /enviar avaliação/i });
    await user.click(btnEnviar);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Você já avaliou este serviço.');
    });
  });

  test('deve navegar de volta para a página do serviço ao clicar no botão de voltar', async () => {
    const user = userEvent.setup();
    vi.spyOn(servicoService, 'buscarPorId').mockResolvedValueOnce(mockServico);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /avaliar prestador/i })).toBeInTheDocument();
    });

    const btnVoltar = screen.getByRole('button', { name: /← voltar para o serviço/i });
    await user.click(btnVoltar);

    expect(mockNavigate).toHaveBeenCalledWith('/servicos/10');
  });
});