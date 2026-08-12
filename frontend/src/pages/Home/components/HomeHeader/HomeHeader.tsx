import { Link, useNavigate } from "react-router-dom"
import Logo from "../../../../components/Logo/Logo"
import { authService } from "../../../../services/auth.service"
import './HomeHeader.css'

interface HeaderSectionProps {
  isAuthenticated: boolean;
  userRole: string;
}

export default function HomeHeader({ isAuthenticated, userRole }: HeaderSectionProps) {
    const navigate = useNavigate();
    const userName = authService.getUserName() || 'Usuário';


    const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

    return (
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
    )

}