import axios from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import './Register.css';
import Logo from '../../components/Logo/Logo';

// Esquema de validação equivalente aos Validators do Angular
const registerSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.').min(3, 'O nome deve ter no mínimo 3 caracteres.'),
  email: z.string().min(1, 'O e-mail é obrigatório.').email('Informe um e-mail válido.'),
  password: z.string().min(1, 'A senha é obrigatória.').min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  confirmPassword: z.string().min(1, 'A confirmação de senha é obrigatória.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem.',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched', // Simula o comportamento do Angular (touched/dirty)
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'USER',
      });

      setLoading(false);
      setSuccessMessage('Cadastro realizado com sucesso! Redirecionando...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setLoading(false);
      if (axios.isAxiosError(err)) {
      // Se for um erro retornado pelo Axios (como 400, 404, 500)
        setErrorMessage(
        err.response?.data?.message || 'Erro ao realizar cadastro. Tente novamente.'
    );
  }   else if (err instanceof Error) {
      // Se for um erro do JavaScript
        setErrorMessage(err.message);
  }   else {
      // Caso ocorra algo inesperado
        setErrorMessage('Erro ao realizar cadastro. Tente novamente.');
  }
    }
  };

  return (
    <div className="register-container">

      <Logo />

      <div className="register-card">
        <h2>Criar Conta</h2>
        <p className="subtitle">Preencha os dados abaixo para se cadastrar</p>

        {errorMessage && (
          <div className="alert alert-danger">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Campo Nome */}
          <div className="form-group">
            <label htmlFor="name">Nome Completo</label>
            <input
              id="name"
              type="text"
              placeholder="Seu nome completo"
              className={errors.name && touchedFields.name ? 'invalid' : ''}
              {...register('name')}
            />
            {errors.name && touchedFields.name && (
              <span className="error-text">{errors.name.message}</span>
            )}
          </div>

          {/* Campo E-mail */}
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              placeholder="seu.email@exemplo.com"
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
              placeholder="Mínimo de 6 caracteres"
              className={errors.password && touchedFields.password ? 'invalid' : ''}
              {...register('password')}
            />
            {errors.password && touchedFields.password && (
              <span className="error-text">{errors.password.message}</span>
            )}
          </div>

          {/* Campo Confirmação de Senha */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Senha</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Repita sua senha"
              className={errors.confirmPassword && touchedFields.confirmPassword ? 'invalid' : ''}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && touchedFields.confirmPassword && (
              <span className="error-text">{errors.confirmPassword.message}</span>
            )}
          </div>

          {/* Botão Submit */}
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Carregando...' : 'Cadastrar'}
          </button>
        </form>

        <div className="footer-links">
          <p>
            Já possui uma conta? <Link to="/login">Faça Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};