import { useEffect, useState } from 'react';
import Logo from '../../components/Logo/Logo';
import type { ServicoPrestadorItem } from '../../models/servico-prestador.model';
import type { StatusServico } from '../../models/servico-status.enum';
import { servicoService } from '../../services/servico.service';
import ServicoPrestadorCard from './components/ServicoPrestadorCard';
import './MeusServicosContratados.css';

export default function MeusServicosContratados() {
  const [servicos, setServicos] = useState<ServicoPrestadorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [sucessoMessage, setSucessoMessage] = useState('');
  const [processandoId, setProcessandoId] = useState<number | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregarServicos() {
      try {
        // Método atualizado para buscarServicosPrestador()
        const dados = await servicoService.buscarServicosPrestador();
        if (!ativo) return;
        setServicos(dados as unknown as ServicoPrestadorItem[]);
        setErrorMessage('');
      } catch {
        if (!ativo) return;
        setErrorMessage('Não foi possível carregar seus serviços contratados.');
      } finally {
        if (ativo) setLoading(false);
      }
    }

    carregarServicos();

    return () => {
      ativo = false;
    };
  }, []);

  const handleAtualizarStatus = async (id: number, novoStatus: StatusServico) => {
    const confirmacao = window.confirm('Deseja realmente alterar o status deste serviço?');
    if (!confirmacao) return;

    try {
      setProcessandoId(id);
      setErrorMessage('');
      setSucessoMessage('');

      await servicoService.atualizarStatus(id, novoStatus);

      // Atualiza o estado localmente após sucesso
      setServicos((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: novoStatus } : item))
      );
      setSucessoMessage('Status atualizado com sucesso!');
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      const msg =
        errorResponse?.response?.data?.message ||
        'Erro ao atualizar status. Transição inválida ou indisponível.';
      setErrorMessage(msg);
    } finally {
      setProcessandoId(null);
    }
  };

  return (
    <>
      <header className="servicos-topbar">
        <Logo />
      </header>

      <main className="servicos-prestador-page">
        <div className="container">
          <header className="page-header">
            <h1>Serviços Sob Minha Responsabilidade</h1>
            <p>Gerencie o progresso e atualize os status dos serviços contratados.</p>
          </header>

          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
          {sucessoMessage && <div className="alert alert-success">{sucessoMessage}</div>}

          {loading && <div className="status-loading">Carregando serviços...</div>}

          {!loading && servicos.length === 0 && (
            <div className="empty-state">
              <p>Você não possui serviços contratados no momento.</p>
            </div>
          )}

          {!loading && servicos.length > 0 && (
            <div className="servicos-grid">
              {servicos.map((servico) => (
                <ServicoPrestadorCard
                  key={servico.id}
                  servico={servico}
                  processandoId={processandoId}
                  onAtualizarStatus={handleAtualizarStatus}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}