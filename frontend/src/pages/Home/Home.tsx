import { authService } from '../../services/auth.service';
import './Home.css';
import HomeHeader from './components/HomeHeader/HomeHeader';
import HomeHeroSection from './components/HomeHeroSection/HomeHeroSection';
import HomeCategories from './components/HomeCategories/HomeCategories';

export default function Home() {
  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.getUserRole() || 'USER';

  // Define se o usuário tem privilégio de prestador
  const isProvider = userRole === 'PRESTADOR';

  return (
    <div className="home-container">
      {/* 1. Cabeçalho de Navegação */}
      <HomeHeader isAuthenticated={isAuthenticated} userRole={userRole} />

      {/* 2. Hero / Apresentação */}
      <HomeHeroSection isAuthenticated={isAuthenticated} isProvider={isProvider} />

      {/* 3. Seção de Categorias em Destaque */}
      <HomeCategories />
    </div>
  );
};
