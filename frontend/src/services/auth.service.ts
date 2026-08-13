import api from './api';
import type { RegisterRequest } from '../models/register-request.model';
import type { RegisterResponse } from '../models/register-response.model';
import type { LoginRequest } from '../models/login-request.model';
import type { LoginResponse } from '../models/login-response.model';

class AuthService {
  private readonly tokenKey = 'auth_token';
  private readonly roleKey = 'user_role';

  // 1. Cadastrar
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/auth/register', data);
    return response.data;
  }

  // 2. Login - LER A ROLE DO NOVO JWT
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', data);
    this.storeToken(response.data.token);

    // Decodifica o token recebido no login e salva a role formatada
    const payload = this.decodeToken(response.data.token);
    const rawRole = payload?.role || payload?.roles?.[0] || payload?.authorities?.[0];
    const formattedRole = this.normalizeRole(rawRole);

    if (formattedRole) {
      this.setUserRole(formattedRole);
    } else {
      this.clearUserRole();
    }

    return response.data;
  }

  // 3. Obter token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // 4. Obter Role do usuário
  getUserRole(): string | null {
    const storedRole = localStorage.getItem(this.roleKey);
    if (storedRole) {
      return this.normalizeRole(storedRole);
    }

    const token = this.getToken();
    if (!token) return null;

    const payload = this.decodeToken(token);
    const rawRole = payload?.role || payload?.roles?.[0] || payload?.authorities?.[0];

    return this.normalizeRole(rawRole);
  }

  setUserRole(role: string): void {
    localStorage.setItem(this.roleKey, this.normalizeRole(role) || role);
  }

  clearUserRole(): void {
    localStorage.removeItem(this.roleKey);
  }

  // Helper para remover o prefixo 'ROLE_' do Spring Security caso ele exista
  private normalizeRole(role: string | undefined | null): string | null {
    if (!role) return null;
    return role.replace(/^ROLE_/, '');
  }

  // 5. Validar autenticação
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const payload = this.decodeToken(token);
    const exp = payload?.exp;

    if (!exp) {
      this.clearToken();
      this.clearUserRole();
      return false;
    }

    const isValid = exp * 1000 > Date.now();
    if (!isValid) {
      this.clearToken();
      this.clearUserRole();
    }

    return isValid;
  }

  getUserName(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = this.decodeToken(token);
    return payload?.name || null;
  }

  // 6. Logout
  async logout(): Promise<void> {
    const token = this.getToken();

    try {
      if (token) {
        await api.post('/auth/logout', {});
      }
    } catch (error) {
      console.error('Erro ao realizar logout no servidor:', error);
    } finally {
      this.clearToken();
      this.clearUserRole();
    }
  }

  // Auxiliares privados
  private storeToken(token: string): void {
    if (!token) {
      throw new Error('O servidor não retornou um token de autenticação.');
    }
    localStorage.setItem(this.tokenKey, token);
  }

  private clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  private decodeToken(
    token: string,
  ): { exp?: number; role?: string; roles?: string[]; authorities?: string[]; name?: string } | null {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();