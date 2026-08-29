import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFormContext } from 'react-hook-form';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { authService } from '../../../services/auth.service';
import { providerService } from '../../../services/provider.service';
import BecomeProvider from '../BecomeProvider';

// Mocks dos serviços
vi.mock('../../../services/provider.service', () => ({
  providerService: {
    createProviderProfile: vi.fn(),
  },
}));

vi.mock('../../../services/auth.service', () => ({
  authService: {
    setUserRole: vi.fn(),
  },
}));

// Mocks com componentes nomeados com maiúscula para conformidade com regras de Hooks
vi.mock('../components/DynamicList/DynamicList', () => {
  const MockDynamicList = ({ label, fieldName }: { label: string; fieldName: string }) => {
    const { register } = useFormContext();
    return (
      <div>
        <label htmlFor={fieldName}>{label}</label>
        <input id={fieldName} {...register(`${fieldName}.0`)} />
      </div>
    );
  };
  return { default: MockDynamicList };
});

vi.mock('../components/CategoryGrid/CategoryGrid', () => {
  const MockCategoryGrid = () => {
    const { register } = useFormContext();
    return (
      <div>
        <label htmlFor="categories">Categorias</label>
        <input id="categories" value="ELETRECISTA" {...register('categories.0')} />
      </div>
    );
  };
  return { default: MockCategoryGrid };
});

// Mock do hook useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Página BecomeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <BecomeProvider />
      </BrowserRouter>
    );

  test('deve renderizar os campos principais e os botões do formulário', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /tornar-se prestador/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/documento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/telefones para contato/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/categorias/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/áreas de atendimento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descrição dos serviços/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirmar e finalizar/i })).toBeInTheDocument();
  });

  test('deve impedir a submissão ao deixar campos obrigatórios vazios', async () => {
    const user = userEvent.setup();
    renderComponent();

    const btnSubmit = screen.getByRole('button', { name: /confirmar e finalizar/i });
    await user.click(btnSubmit);

    await waitFor(() => {
      expect(providerService.createProviderProfile).not.toHaveBeenCalled();
    });
  });

  test('deve criar o perfil de prestador com sucesso e redirecionar após o timeout', async () => {
    vi.mocked(providerService.createProviderProfile).mockResolvedValueOnce({} as never);

    renderComponent();

    const user = userEvent.setup();

    // Utiliza número limpo compatível com a regex do schema Zod
    await user.type(screen.getByLabelText(/documento/i), '12345678900');
    await user.type(screen.getByLabelText(/telefones para contato/i), '87999999999');
    await user.type(screen.getByLabelText(/áreas de atendimento/i), 'Centro');
    await user.type(
      screen.getByLabelText(/descrição dos serviços/i),
      'Prestação de serviços elétricos em geral.'
    );

    vi.useFakeTimers({ shouldAdvanceTime: true });

    const btnSubmit = screen.getByRole('button', { name: /confirmar e finalizar/i });
    await user.click(btnSubmit);

    await waitFor(() => {
      expect(providerService.createProviderProfile).toHaveBeenCalledWith({
        document: '12345678900',
        phones: ['87999999999'],
        categories: ['ELETRECISTA'],
        serviceAreas: ['Centro'],
        description: 'Prestação de serviços elétricos em geral.',
      });
      expect(authService.setUserRole).toHaveBeenCalledWith('PRESTADOR');
      expect(screen.getByText('Perfil de prestador criado com sucesso!')).toBeInTheDocument();
    });

    vi.advanceTimersByTime(1500);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('deve exibir mensagem de erro retornada pela API quando o envio falhar', async () => {
    const user = userEvent.setup();
    const mockAxiosError = {
      response: { data: { message: 'Documento já cadastrado como prestador.' } },
    };
    vi.mocked(providerService.createProviderProfile).mockRejectedValueOnce(mockAxiosError);

    renderComponent();

    await user.type(screen.getByLabelText(/documento/i), '12345678900');
    await user.type(screen.getByLabelText(/telefones para contato/i), '87999999999');
    await user.type(screen.getByLabelText(/áreas de atendimento/i), 'Centro');
    await user.type(
      screen.getByLabelText(/descrição dos serviços/i),
      'Prestação de serviços em geral.'
    );

    const btnSubmit = screen.getByRole('button', { name: /confirmar e finalizar/i });
    await user.click(btnSubmit);

    await waitFor(() => {
      expect(providerService.createProviderProfile).toHaveBeenCalled();
      expect(
        screen.getByText('Documento já cadastrado como prestador.')
      ).toBeInTheDocument();
    });
  });

  test('deve navegar para a página inicial ao clicar no botão Cancelar', async () => {
    const user = userEvent.setup();
    renderComponent();

    const btnCancelar = screen.getByRole('button', { name: /cancelar/i });
    await user.click(btnCancelar);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});