import { useNavigate } from "react-router-dom"
import './HomeHeroSection.css'

interface HeroSectionProps {
  isAuthenticated: boolean;
  isProvider: boolean;
}

export default function HomeHeroSection({ isAuthenticated, isProvider }: HeroSectionProps) {
    const navigate = useNavigate();

    return (
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
            {isAuthenticated && isProvider && (
              <button 
                className="btn-hero-worker" 
                onClick={() => navigate('/meus-servicos')}
              >
                🛠️ Gerenciar Meus Serviços
              </button>
            )}
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
          ) : isAuthenticated && (
            <div className="provider-action">
              <h3>Deseja oferecer seus serviços?</h3>
              <p>Complete seu cadastro como prestador de serviços para divulgar suas especialidades e áreas de atendimento.</p>
              <button onClick={() => navigate('/become-provider')} className="btn-become-provider">
                Tornar-se Prestador
              </button>
            </div>
          )}
        </div>
      </section>
    )
}