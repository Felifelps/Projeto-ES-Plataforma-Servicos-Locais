import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const userRole = authService.getUserRole() || 'USER';
  const userName = authService.getUserName() || 'Usuário';

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const isProvider = userRole === 'PRESTADOR';

  return (
    <div className="home-container">
      {/* Barra de Navegação Superior */}
      <header className="home-header">
        <div className="brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="brand-mark">F</span>
          <span className="brand-title">FREELANCE</span>
        </div>

        <div className="user-info">
          <span className={`role-badge ${userRole.toLowerCase()}`}>
            {userName} ({userRole})
          </span>
          <button onClick={handleLogout} className="btn-logout">
            Sair
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="home-content">
        <div className="welcome-card">
          <h1>Bem-vindo ao Sistema! 👋</h1>
          <p>
            Olá, <strong>{userName}</strong>. Você está autenticado no sistema.
          </p>

          <div className="status-box">
            <h3>Status da Sua Conta</h3>
            <ul>
              <li>
                <strong>Status:</strong> 🟢 Autenticado
              </li>
              <li>
                <strong>Perfil Atual (Role):</strong> <code>{userRole}</code>
              </li>
              <li>
                <strong>Token de Acesso:</strong>{' '}
                <code>{authService.getToken() ? 'Presente (Ativo)' : 'Ausente'}</code>
              </li>
            </ul>
          </div>

          {isProvider ? (
            <div className="provider-status-card">
              <div className="provider-status-badge">
                <span className="badge-icon">✅</span>
                <div>
                  <h3>Você é um Prestador de Serviços!</h3>
                  <p>Seu perfil de prestador está ativo no sistema. Você pode oferecer serviços e receber solicitações de clientes.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="provider-action">
              <h3>Deseja oferecer seus serviços?</h3>
              <p>Complete seu cadastro como prestador de serviços para divulgar suas especialidades e áreas de atendimento.</p>
              <button onClick={() => navigate('/become-provider')} className="btn-primary">
                Tornar-se Prestador
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}