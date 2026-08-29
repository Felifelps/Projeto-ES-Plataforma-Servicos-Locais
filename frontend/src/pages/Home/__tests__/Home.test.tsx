import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { authService } from '../../../services/auth.service';
import Home from '../Home';

// Mock do serviço de autenticação
vi.mock('../../../services/auth.service', () => ({
  authService: {
    isAuthenticated: vi.fn(),
    getUserRole: vi.fn(),
  },
}));

// Mocks dos subcomponentes do Home para isolar a responsabilidade da página
vi.mock('../components/HomeHeader/HomeHeader', () => ({
  default: ({ isAuthenticated, userRole }: { isAuthenticated: boolean; userRole: string }) => (
    <header data-testid="home-header">
      <span>Header - Auth: {String(isAuthenticated)}</span>
      <span>Role: {userRole}</span>
    </header>
  ),
}));

vi.mock('../components/HomeHeroSection/HomeHeroSection', () => ({
  default: ({ isAuthenticated, isProvider }: { isAuthenticated: boolean; isProvider: boolean }) => (
    <section data-testid="home-hero">
      <span>Hero - Auth: {String(isAuthenticated)}</span>
      <span>Provider: {String(isProvider)}</span>
    </section>
  ),
}));

vi.mock('../components/HomeCategories/HomeCategories', () => ({
  default: () => <section data-testid="home-categories">Categorias</section>,
}));

describe('Página Inicial (Home)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

  test('deve renderizar todos os subcomponentes para um usuário não autenticado', () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(false);
    vi.mocked(authService.getUserRole).mockReturnValue(null);

    renderComponent();

    expect(screen.getByTestId('home-header')).toBeInTheDocument();
    expect(screen.getByTestId('home-hero')).toBeInTheDocument();
    expect(screen.getByTestId('home-categories')).toBeInTheDocument();

    expect(screen.getByText('Header - Auth: false')).toBeInTheDocument();
    expect(screen.getByText('Role: USER')).toBeInTheDocument();
    expect(screen.getByText('Provider: false')).toBeInTheDocument();
  });

  test('deve passar props de prestador corretamente quando o usuário for PRESTADOR', () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);
    vi.mocked(authService.getUserRole).mockReturnValue('PRESTADOR');

    renderComponent();

    expect(screen.getByText('Header - Auth: true')).toBeInTheDocument();
    expect(screen.getByText('Role: PRESTADOR')).toBeInTheDocument();
    expect(screen.getByText('Provider: true')).toBeInTheDocument();
  });

  test('deve indicar que o usuário não é prestador quando sua role for USER', () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);
    vi.mocked(authService.getUserRole).mockReturnValue('USER');

    renderComponent();

    expect(screen.getByText('Header - Auth: true')).toBeInTheDocument();
    expect(screen.getByText('Role: USER')).toBeInTheDocument();
    expect(screen.getByText('Provider: false')).toBeInTheDocument();
  });
});