import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import './Home.css';
import Logo from '../../components/Logo/Logo';

// Lista de categorias de serviços em destaque
const CATEGORIES = [
  { id: 'eletrica', name: 'Elétrica', icon: '⚡' },
  { id: 'hidraulica', name: 'Encanamento', icon: '🚰' },
  { id: 'pintura', name: 'Pintura', icon: '🎨' },
  { id: 'limpeza', name: 'Limpeza', icon: '🧹' },
  { id: 'jardinagem', name: 'Jardinagem', icon: '🌱' },
  { id: 'reformas', name: 'Reformas Geral', icon: '🔨' },
];

export default function Home() {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.getUserRole() || 'USER';
  const userName = authService.getUserName() || 'Usuário';

  // Define se o usuário tem privilégio de prestador
  const isWorker = userRole.toUpperCase() === 'PRESTADOR' || userRole.toUpperCase() === 'WORKER';

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/servicos?categoria=${categoryId}`);
  };

  return (
    <div className="home-container">
      {/* 1. Cabeçalho de Navegação */}
      <header className="home-header">
          
          <Logo />

        <nav className="header-actions">
          {isAuthenticated ? (
            <div className="user-profile-nav">
              <span className="user-greeting">Olá, <strong>{userName}</strong></span>
              <span className={`role-badge ${userRole.toLowerCase()}`}>{userRole}</span>
              <button onClick={handleLogout} className="btn-logout">
                Sair
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-secondary">Entrar</Link>
              <Link to="/register" className="btn-primary">Cadastrar-se</Link>
            </div>
          )}
        </nav>
      </header>

      {/* 2. Hero / Apresentação */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Encontre os melhores profissionais para sua casa e serviço local</h1>
          <p className="hero-subtitle">
            Conectamos moradores da região a prestadores de serviços qualificados com rapidez e segurança.
          </p>

          <div className="hero-ctas">
            <button 
              className="btn-hero-primary" 
              onClick={() => navigate('/servicos')}
            >
              🔍 Buscar Serviços
            </button>

            {/* Atalho exclusivo para prestadores autenticados */}
            {isAuthenticated && isWorker && (
              <button 
                className="btn-hero-worker" 
                onClick={() => navigate('/meus-servicos')}
              >
                🛠️ Gerenciar Meus Serviços
              </button>
            )}

            {isAuthenticated && (
              <Link to="/register" className="btn-hero-secondary">
                Quero prestar serviços
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 3. Seção de Categorias em Destaque */}
      <section className="categories-section">
        <h2>Categorias em Destaque</h2>
        <p>Clique em uma categoria para filtrar os serviços disponíveis</p>

        <div className="categories-grid">
          {CATEGORIES.map((cat) => (
            <div 
              key={cat.id} 
              className="category-card"
              onClick={() => handleCategoryClick(cat.id)}
            >
              <span className="category-icon">{cat.icon}</span>
              <span className="category-name">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
