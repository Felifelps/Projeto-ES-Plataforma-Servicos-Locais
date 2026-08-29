import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { ServicoFiltro } from '../../../models/servico-filtro.model';
import type { ServicoResumo } from '../../../models/servico-resumo.model';
import { servicoService } from '../../../services/servico.service';
import Servicos from '../Servicos';

// Mock do serviço de serviços
vi.mock('../../../services/servico.service', () => ({
  servicoService: {
    buscar: vi.fn(),
  },
}));

// Mock do componente ServiceFilters para simplificar a interacao de filtros
vi.mock('../../../components/ServiceFilters/ServiceFilters', () => ({
  default: ({
    onSearch,
    loading,
  }: {
    onSearch: (filtros: ServicoFiltro) => void;
    loading: boolean;
  }) => (
    <div data-testid="service-filters">
      <button
        type="button"
        disabled={loading}
        onClick={() => onSearch({ categoria: 'PINTURA', cidade: 'Arcoverde' })}
      >
        Filtrar Pintura
      </button>
    </div>
  ),
}));

const mockServicos: ServicoResumo[] = [
  {
    id: 1,
    titulo: 'Pintura de Parede Residencial',
    categoria: 'PINTURA',
    cidade: 'Arcoverde',
    bairro: 'Centro',
    nomePrestador: 'Carlos Silva',
  },
  {
    id: 2,
    titulo: 'Instalação Elétrica',
    categoria: 'ELETRICA',
    cidade: 'Arcoverde',
    bairro: 'São Cristóvão',
    nomePrestador: 'Ana Souza',
  },
];

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Página de Serviços (Servicos)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (initialEntries = ['/servicos']) =>
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/servicos" element={<Servicos />} />
        </Routes>
      </MemoryRouter>
    );

  test('deve exibir o estado de carregamento e depois listar os serviços retornados', async () => {
    vi.mocked(servicoService.buscar).mockResolvedValueOnce(mockServicos);

    renderComponent();

    expect(screen.getByText('Carregando serviços...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Pintura de Parede Residencial')).toBeInTheDocument();
      expect(screen.getByText('Instalação Elétrica')).toBeInTheDocument();
      expect(screen.getByText('Prestador: Carlos Silva')).toBeInTheDocument();
    });
  });

  test('deve exibir mensagem de estado vazio quando a busca retornar array vazio', async () => {
    vi.mocked(servicoService.buscar).mockResolvedValueOnce([]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Nenhum resultado encontrado.')).toBeInTheDocument();
    });
  });

  test('deve exibir mensagem de erro quando a chamada da API falhar', async () => {
    vi.mocked(servicoService.buscar).mockRejectedValueOnce(new Error('Erro de conexão'));

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText('Não foi possível carregar os serviços. Tente novamente mais tarde.')
      ).toBeInTheDocument();
    });
  });

  test('deve passar os parametros da URL como filtro inicial para a API', async () => {
    vi.mocked(servicoService.buscar).mockResolvedValueOnce([mockServicos[0]]);

    // Renderiza com query params na URL
    renderComponent(['/servicos?categoria=PINTURA&cidade=Arcoverde']);

    await waitFor(() => {
      expect(servicoService.buscar).toHaveBeenCalledWith({
        categoria: 'PINTURA',
        cidade: 'Arcoverde',
        bairro: undefined,
      });
    });
  });

  test('deve navegar para a página de detalhes do serviço ao clicar no card', async () => {
    const user = userEvent.setup();
    vi.mocked(servicoService.buscar).mockResolvedValueOnce(mockServicos);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Pintura de Parede Residencial')).toBeInTheDocument();
    });

    const cardPintura = screen.getByRole('button', {
      name: /pintura de parede residencial/i,
    });
    await user.click(cardPintura);

    expect(mockNavigate).toHaveBeenCalledWith('/servicos/1');
  });

  test('deve atualizar os parametros de busca ao acionar a função handleSearch', async () => {
    const user = userEvent.setup();
    vi.mocked(servicoService.buscar).mockResolvedValue(mockServicos);

    renderComponent();

    await waitFor(() => {
      expect(servicoService.buscar).toHaveBeenCalledTimes(1);
    });

    const btnFiltrar = screen.getByRole('button', { name: /filtrar pintura/i });
    await user.click(btnFiltrar);

    await waitFor(() => {
      expect(servicoService.buscar).toHaveBeenCalledWith({
        categoria: 'PINTURA',
        cidade: 'Arcoverde',
        bairro: undefined,
      });
    });
  });
});