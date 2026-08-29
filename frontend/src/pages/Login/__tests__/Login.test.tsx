import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { authService } from '../../../services/auth.service';
import Login from '../Login';

// Mock do serviço de autenticação
vi.mock('../../../services/auth.service', () => ({
  authService: {
    login: vi.fn(),
  },
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

describe('Página de Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

  test('deve renderizar o título, inputs de e-mail/senha e o botão de login', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /acesse sua conta/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  test('deve exibir erros de validação ao desfocar (onTouched) de campos inválidos', async () => {
    const user = userEvent.setup();
    renderComponent();

    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);

    // Toca no e-mail e digita um formato inválido
    await user.type(emailInput, 'emailinvalido');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Informe um e-mail válido.')).toBeInTheDocument();
    });

    // Foca na senha e limpa/sai sem digitar
    fireEvent.focus(passwordInput);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('A senha é obrigatória.')).toBeInTheDocument();
    });
  });

  test('deve realizar login com sucesso e navegar para a página inicial', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.login).mockResolvedValueOnce({} as never);

    renderComponent();

    await user.type(screen.getByLabelText(/e-mail/i), 'usuario@exemplo.com');
    await user.type(screen.getByLabelText(/senha/i), 'senha123');

    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'usuario@exemplo.com',
        password: 'senha123',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('deve exibir mensagem de erro quando a API retornar credenciais inválidas', async () => {
    const user = userEvent.setup();
    const mockAxiosError = {
      isAxiosError: true,
      response: { data: { message: 'Email ou senha incorretos.' } },
    };

    vi.mocked(authService.login).mockRejectedValueOnce(mockAxiosError);

    renderComponent();

    await user.type(screen.getByLabelText(/e-mail/i), 'errado@exemplo.com');
    await user.type(screen.getByLabelText(/senha/i), 'senhaErrada');

    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Email ou senha incorretos.');
    });
  });

  test('deve desabilitar o botão enquanto a requisição estiver em andamento (loading)', async () => {
    const user = userEvent.setup();
    // Promise pendente para simular latência de rede
    vi.mocked(authService.login).mockImplementationOnce(() => new Promise(() => {}));

    renderComponent();

    await user.type(screen.getByLabelText(/e-mail/i), 'usuario@exemplo.com');
    await user.type(screen.getByLabelText(/senha/i), 'senha123');

    const submitBtn = screen.getByRole('button', { name: /entrar/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /entrando.../i })).toBeDisabled();
    });
  });
});