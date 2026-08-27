import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { authService } from '../../../services/auth.service';
import Register from '../Register';

// Mock do serviço de autenticação
vi.mock('../../../services/auth.service', () => ({
  authService: {
    register: vi.fn(),
  },
}));

// Mock do useNavigate do React Router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Página de Registro (Register)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

  test('deve renderizar os campos do formulário e o botão de cadastro', () => {
    renderComponent();

    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cadastrar/i })).toBeInTheDocument();
  });

  test('deve exibir mensagens de erro de validação ao interagir com campos inválidos', async () => {
    const user = userEvent.setup();
    renderComponent();

    const nameInput = screen.getByLabelText(/nome completo/i);
    const passwordInput = screen.getByLabelText(/^senha$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);

    // Digita nome curto e sai do campo (onTouched)
    await user.type(nameInput, 'Jo');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('O nome deve ter no mínimo 3 caracteres.')).toBeInTheDocument();
    });

    // Digita senhas divergentes
    await user.type(passwordInput, '123456');
    await user.type(confirmPasswordInput, '654321');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('As senhas não coincidem.')).toBeInTheDocument();
    });
  });

  test('deve submeter o formulário com sucesso e redirecionar para o login', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.register).mockResolvedValueOnce({} as never);

    renderComponent();

    await user.type(screen.getByLabelText(/nome completo/i), 'Joran Lage');
    await user.type(screen.getByLabelText(/e-mail/i), 'joran@exemplo.com');
    await user.type(screen.getByLabelText(/^senha$/i), 'senha123');
    await user.type(screen.getByLabelText(/confirmar senha/i), 'senha123');

    await user.click(screen.getByRole('button', { name: /cadastrar/i }));

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        name: 'Joran Lage',
        email: 'joran@exemplo.com',
        password: 'senha123',
        role: 'USER',
      });
      expect(
        screen.getByText('Cadastro realizado com sucesso! Redirecionando...')
      ).toBeInTheDocument();
    });

    // Verifica o redirecionamento após o timeout
    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      },
      { timeout: 2500 }
    );
  });

  test('deve exibir mensagem de erro retornada pela API quando o registro falhar', async () => {
    const user = userEvent.setup();
    const mockApiError = {
      isAxiosError: true,
      response: { data: { message: 'E-mail já cadastrado no sistema.' } },
    };

    vi.mocked(authService.register).mockRejectedValueOnce(mockApiError);

    renderComponent();

    await user.type(screen.getByLabelText(/nome completo/i), 'Joran Lage');
    await user.type(screen.getByLabelText(/e-mail/i), 'existente@exemplo.com');
    await user.type(screen.getByLabelText(/^senha$/i), 'senha123');
    await user.type(screen.getByLabelText(/confirmar senha/i), 'senha123');

    await user.click(screen.getByRole('button', { name: /cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByText('E-mail já cadastrado no sistema.')).toBeInTheDocument();
    });
  });
});