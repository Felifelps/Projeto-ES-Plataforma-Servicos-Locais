import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../../services/auth.service';
import './Login.css';

// Schema do Zod equivalente aos Validators do Angular
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'O e-mail é obrigatório.')
    .email('Informe um e-mail válido.'),
  password: z.string().min(1, 'A senha é obrigatória.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched', 
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setErrorMessage('');

    try {
      await authService.login({
        email: data.email,
        password: data.password,
      });

      navigate('/home');
    } catch (err) {
      console.error('Erro no login:', err);

      if (axios.isAxiosError(err)) {
        setErrorMessage(
          err.response?.data?.message || 'Email ou senha inválidos.'
        );
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Email ou senha inválidos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-container">
      <div className="platform-brand" aria-label="Freelance">
        <span className="platform-mark" aria-hidden="true">F</span>
        <span>FREELANCE</span>
      </div>

      <section className="login-card" aria-labelledby="login-title">
        <h1 id="login-title">Acesse sua Conta</h1>
        <p className="subtitle">Informe seus dados para continuar.</p>

        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Campo E-mail */}
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              placeholder="seu.email@exemplo.com"
              autoComplete="email"
              className={errors.email && touchedFields.email ? 'invalid' : ''}
              {...register('email')}
            />
            {errors.email && touchedFields.email && (
              <span className="error-text">{errors.email.message}</span>
            )}
          </div>

          {/* Campo Senha */}
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              autoComplete="current-password"
              className={
                errors.password && touchedFields.password ? 'invalid' : ''
              }
              {...register('password')}
            />
            {errors.password && touchedFields.password && (
              <span className="error-text">{errors.password.message}</span>
            )}
          </div>

          {/* Botão Submit */}
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="footer-links">
          <p>
            Não possui uma conta? <Link to="/register">Cadastre-se</Link>
          </p>
        </div>
      </section>
    </main>
  );
};
