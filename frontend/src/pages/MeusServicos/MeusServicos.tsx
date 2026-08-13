import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cadastroServicoService } from '../../services/cadastro-servico.service';
import type { ServicoCadastroResponse } from '../../models/servico-cadastro.model';
import './MeusServicos.css';
import Logo from '../../components/Logo/Logo';

export default function MeusServicos() {
  const navigate = useNavigate();
  const [servicos, setServicos] = useState<ServicoCadastroResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function carregarServicos() {
      try {
        setLoading(true);
        // Calls the backend to retrieve the list:
        const dados = await cadastroServicoService.listarMeusServicos();
        setServicos(dados);
      } catch (error) {
        console.error('Erro ao buscar serviços do prestador:', error);
        setErrorMessage('Não foi possível carregar a lista de serviços.');
      } finally {
        setLoading(false);
      }
    }

    carregarServicos();
  }, []);

  return (
    <main className="my-services-page">
      <section className="my-services-container">
        <header className="my-services-header">
            <Logo />
          <div>
            <h1>Meus Serviços</h1>
            <p>Gerencie os serviços oferecidos por você.</p>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate('/servicos/cadastrar')}
          >
            + Novo Serviço
          </button>
        </header>

        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

        {loading ? (
          <p>Carregando serviços...</p>
        ) : servicos.length === 0 ? (
          <div className="empty-state">
            <p>Você ainda não possui serviços cadastrados.</p>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/servicos/cadastrar')}
            >
              Cadastrar meu primeiro serviço
            </button>
          </div>
        ) : (
          <div className="services-grid">
            {servicos.map((servico) => (
              <div key={servico.id} className="service-card" onClick={() => navigate(`/servicos/${servico.id}`)}>
                <h3>{servico.titulo}</h3>
                <p>{servico.descricao}</p>
                <div className="service-details">
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}