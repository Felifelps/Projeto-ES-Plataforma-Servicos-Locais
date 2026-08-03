export interface RegisterResponse {
  id?: number;
  name: string;
  email: string;
  token?: string; // Esperar o back terminar para ver se o spring retorna o JWT
}