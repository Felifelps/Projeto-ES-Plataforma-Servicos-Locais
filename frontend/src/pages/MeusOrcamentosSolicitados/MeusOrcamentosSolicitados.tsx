import { useEffect, useState } from 'react';
import { orcamentoService } from '../../services/orcamento.service';
import type { OrcamentoResponse } from '../../models/orcamento-response.model';
import Logo from '../../components/Logo/Logo';
import './MeusOrcamentosSolicitados.css';

export default function MeusOrcamentosSolicitados() {
  const [orcamentos, setOrcamentos] = useState<OrcamentoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [processandoId, setProcessandoId] = useState<number | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      try {
        const dados = await orcamentoService.listarOrcamentosSolicitados();
        if (!ativo) return;
        setOrcamentos(dados);
        setErrorMessage('');
      } catch (err) {
        if (!ativo) return;
        console.error('Erro ao buscar orçamentos do cliente:', err);
        setErrorMessage('Não foi possível carregar suas solicitações de orçamento.');
      } finally {
        if (ativo) setLoading(false);
      }
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, []);

  const handleDecisao = async (id: number, acao: 'aceitar' | 'recusar') => {
    const confirmacao = window.confirm(
      acao === 'aceitar'
        ? 'Deseja aceitar a proposta deste prestador?'
        : 'Tem certeza que deseja recusar este orçamento?'
    );
    if (!confirmacao) return;

    try {
      setProcessandoId(id);
      if (acao === 'aceitar') {
        await orcamentoService.aceitarOrcamento(id);
      } else {
        await orcamentoService.recusarOrcamento(id);
      }

      setOrcamentos((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status_resposta: acao === 'aceitar' ? 'ACEITO' : 'RECUSADO' }
            : item
        )
      );
    } catch (err) {
      console.error(`Erro ao ${acao} orçamento:`, err);
      alert(`Não foi possível ${acao} o orçamento. Tente novamente.`);
    } finally {
      setProcessandoId(null);
    }
  };

  const formatarStatus = (status: string) => {
    switch (status) {
      case 'RESPONDIDO':
        return 'Respondido';
      case 'ACEITO':
        return 'Proposta Aceita';
      case 'RECUSADO':
        return 'Proposta Recusada';
      default:
        return 'Pendente';
    }
  };

  return (
    <>
      <header className="servicos-topbar">
        <Logo />
      </header>

      <main className="orcamentos-page">
        <div className="orcamentos-container">
          <header className="orcamentos-header">
            <h1>Minhas Solicitações de Orçamento</h1>
            <p>Acompanhe o andamento dos orçamentos que você pediu aos prestadores.</p>
          </header>

          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

          {loading ? (
            <div className="orcamentos-status">Carregando solicitações...</div>
          ) : orcamentos.length === 0 ? (
            <div className="empty-state">
              <p>Você ainda não solicitou nenhum orçamento.</p>
            </div>
          ) : (
            <div className="orcamentos-list">
              {orcamentos.map((orcamento) => {
                const temResposta =
                  orcamento.valor_resposta !== undefined || Boolean(orcamento.descricao_resposta);
                const status =
                  orcamento.status_resposta || (temResposta ? 'RESPONDIDO' : 'PENDENTE');

                return (
                  <article key={orcamento.id} className="orcamento-card">
                    <header className="orcamento-card-header">
                      <div>
                        <span className="orcamento-badge-servico">{orcamento.tituloServico}</span>
                        <h3>Prestador: {orcamento.nomePrestador}</h3>
                      </div>
                      {/* Badge com suporte a todos os status */}
                      <span className={`badge-status status-${status.toLowerCase()}`}>
                        {formatarStatus(status)}
                      </span>
                    </header>

                    <div className="orcamento-detalhes-grid">
                      <div>
                        <strong>Local informado:</strong>
                        <p>{orcamento.localAtendimento}</p>
                      </div>
                      <div>
                        <strong>Período desejado:</strong>
                        <p>{orcamento.dataOuPeriodoDesejado}</p>
                      </div>
                    </div>

                    <div className="orcamento-descricao">
                      <strong>Sua solicitação:</strong>
                      <p>{orcamento.descricaoNecessidade}</p>
                    </div>

                    {/* Proposta enviada pelo prestador */}
                    {temResposta && (
                      <div className="orcamento-proposta-box">
                        <h4>Proposta do Prestador</h4>
                        {orcamento.valor_resposta !== null && orcamento.valor_resposta !== undefined && (
                            <p className="proposta-valor">
                                Valor:{' '}
                                <strong>
                                {Number(orcamento.valor_resposta).toLocaleString('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                })}
                                </strong>
                            </p>
                            )}
                        {orcamento.descricao_resposta && (
                          <p className="proposta-condicoes">
                            <strong>Condições / Detalhes:</strong> {orcamento.descricao_resposta}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Botões de Ação (Apenas enquanto estiver RESPONDIDO) */}
                    {status === 'RESPONDIDO' && (
                      <div className="orcamento-card-actions">
                        <button
                          type="button"
                          className="btn-recusar"
                          disabled={processandoId === orcamento.id}
                          onClick={() => handleDecisao(orcamento.id, 'recusar')}
                        >
                          Recusar Proposta
                        </button>
                        <button
                          type="button"
                          className="btn-aceitar"
                          disabled={processandoId === orcamento.id}
                          onClick={() => handleDecisao(orcamento.id, 'aceitar')}
                        >
                          {processandoId === orcamento.id ? 'Processando...' : 'Aceitar Proposta'}
                        </button>
                      </div>
                    )}

                    {/* Feedback visual quando já foi aceito ou recusado */}
                    {status === 'ACEITO' && (
                      <div className="status-feedback status-feedback-aceito">
                        ✓ Você aceitou esta proposta.
                      </div>
                    )}
                    {status === 'RECUSADO' && (
                      <div className="status-feedback status-feedback-recusado">
                        ✕ Você recusou esta proposta.
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}