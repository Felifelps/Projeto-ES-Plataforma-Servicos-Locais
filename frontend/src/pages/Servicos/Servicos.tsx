import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { servicoService } from '../../services/servico.service';
import type { ServicoResumo } from '../../models/servico-resumo.model';
import type { ServicoFiltro } from '../../models/servico-filtro.model';
import ServiceFilters from '../../components/ServiceFilters/ServiceFilters';
import Logo from '../../components/Logo/Logo';
import './Servicos.css';

export default function Servicos() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const filtrosAtuais: ServicoFiltro = useMemo(
    () => ({
      categoria: searchParams.get('categoria') || undefined,
      cidade: searchParams.get('cidade') || undefined,
      bairro: searchParams.get('bairro') || undefined,
    }),
    [searchParams],
  );

  const [servicos, setServicos] = useState<ServicoResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let ativo = true;

    servicoService
      .buscar(filtrosAtuais)
      .then((resultados) => {
        if (!ativo) return;
        setServicos(resultados);
        setErrorMessage('');
      })
      .catch(() => {
        if (!ativo) return;
        setServicos([]);
        setErrorMessage('Não foi possível carregar os serviços. Tente novamente mais tarde.');
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });

    return () => {
      ativo = false;
    };
  }, [filtrosAtuais]);

  const handleSearch = (filtros: ServicoFiltro) => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (filtros.categoria) params.categoria = filtros.categoria;
    if (filtros.cidade) params.cidade = filtros.cidade;
    if (filtros.bairro) params.bairro = filtros.bairro;
    setSearchParams(params);
  };

  return (
    <>
      <header className="servicos-topbar">
        <Logo />
      </header>

      <main className="servicos-page">
        <section className="servicos-header">
          <h1>Buscar Serviços</h1>
          <p>Encontre profissionais qualificados filtrando por categoria, cidade e bairro.</p>
        </section>

        <ServiceFilters
          key={searchParams.toString()}
          initialValues={filtrosAtuais}
          onSearch={handleSearch}
          loading={loading}
        />

        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

        {loading ? (
          <div className="servicos-status">Carregando serviços...</div>
        ) : !errorMessage && servicos.length === 0 ? (
          <div className="servicos-status">Nenhum resultado encontrado.</div>
        ) : (
          <div className="servicos-grid">
            {servicos.map((servico) => (
              <button
                key={servico.id}
                type="button"
                className="servico-card"
                onClick={() => navigate(`/servicos/${servico.id}`)}
              >
                <span className="servico-categoria">{servico.categoria}</span>
                <h3>{servico.titulo}</h3>
                <p className="servico-local">
                  {servico.bairro}, {servico.cidade}
                </p>
                <p className="servico-prestador">Prestador: {servico.nomePrestador}</p>
              </button>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
