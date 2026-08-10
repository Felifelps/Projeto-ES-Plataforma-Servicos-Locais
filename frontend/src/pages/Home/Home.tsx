import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import './Home.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const userRole = authService.getUserRole() || 'USER';

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  return (
    <div className="home-container">
      {/* Barra de Navegação Superior */}
      <header className="home-header">
        <div className="brand">
          <span className="brand-mark">F</span>
          <span className="brand-title">FREELANCE</span>
        </div>

        <div className="user-info">
          <span className={`role-badge ${userRole.toLowerCase()}`}>
            {userRole}
          </span>
          <button onClick={handleLogout} className="btn-logout">
            Sair
          </button>
        </div>
      </header>

      {/* Conteúdo Principal para Testes */}
      <main className="home-content">
        <div className="welcome-card">
          <h1>Bem-vindo ao Sistema! 👋</h1>
          <p>
            Você está autenticado em uma <strong>Rota Protegida</strong>.
          </p>

          <div className="status-box">
            <h3>Status da Autenticação</h3>
            <ul>
              <li>
                <strong>Status:</strong> 🟢 Autenticado
              </li>
              <li>
                <strong>Perfil (Role):</strong> <code>{userRole}</code>
              </li>
              <li>
                <strong>Token no LocalStorage:</strong>{' '}
                <code>{authService.getToken() ? 'Presente' : 'Ausente'}</code>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;