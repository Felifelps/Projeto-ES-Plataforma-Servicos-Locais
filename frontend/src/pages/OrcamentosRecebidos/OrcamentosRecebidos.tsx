import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { orcamentoService } from '../../services/orcamento.service';
import type { OrcamentoResponse } from '../../models/orcamento-response.model';
import Logo from '../../components/Logo/Logo';
import './OrcamentoRecebidos.css';

// Schema de validação: exige valor OU condições
const respostaSchema = z
  .object({
    valor: z
      .number({ invalid_type_error: 'Informe um valor numérico válido.' })
      .min(0.01, 'O valor deve ser maior que zero.')
      .optional(),
    condicoes: z.string().trim().optional(),
  })
  .refine(
    (data) =>
      (data.valor !== undefined && !Number.isNaN(data.valor)) ||
      Boolean(data.condicoes && data.condicoes.length > 0),
    {
      message: 'Informe o valor e/ou as condições do serviço para enviar a resposta.',
      path: ['condicoes'],
    },
  );

type RespostaFormData = z.infer<typeof respostaSchema>;

export default function OrcamentosRecebidos() {
  const [orcamentos, setOrcamentos] = useState<OrcamentoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Controle de estado do modal de resposta
  const [orcamentoSelecionado, setOrcamentoSelecionado] = useState<OrcamentoResponse | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [sucessoFeedback, setSucessoFeedback] = useState('');
  const [erroFeedback, setErroFeedback] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RespostaFormData>({
    resolver: zodResolver(respostaSchema),
    defaultValues: {
      valor: undefined,
      condicoes: '',
    },
  });

  // Busca inicial sem disparar setState síncrono no effect
  useEffect(() => {
    let ativo = true;

    async function buscarDados() {
      try {
        const dados = await orcamentoService.listarOrcamentosRecebidos();
        if (!ativo) return;
        setOrcamentos(dados);
        setErrorMessage('');
      } catch (err) {
        if (!ativo) return;
        console.error('Erro ao carregar orçamentos:', err);
        setErrorMessage('Não foi possível carregar as solicitações de orçamento. Tente novamente mais tarde.');
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    }

    buscarDados();

    return () => {
      ativo = false;
    };
  }, []);

  const abrirModalResposta = (orcamento: OrcamentoResponse) => {
    setOrcamentoSelecionado(orcamento);
    setSucessoFeedback('');
    setErroFeedback('');
    reset({
      valor: orcamento.valor,
      condicoes: orcamento.condicoes || '',
    });
  };

  const fecharModal = () => {
    setOrcamentoSelecionado(null);
    setSucessoFeedback('');
    setErroFeedback('');
    reset();
  };

  const onSubmitResposta = async (data: RespostaFormData) => {
    if (!orcamentoSelecionado) return;

    try {
      setEnviando(true);
      setErroFeedback('');

      await orcamentoService.responderOrcamento(orcamentoSelecionado.id, {
        valor: data.valor,
        condicoes: data.condicoes || undefined,
      });

      setSucessoFeedback('Orçamento respondido com sucesso!');

      // Atualiza o registro no estado local
      setOrcamentos((prev) =>
        prev.map((item) =>
          item.id === orcamentoSelecionado.id
            ? { ...item, valor: data.valor, condicoes: data.condicoes, respondido: true }
            : item
        )
      );

      setTimeout(() => {
        fecharModal();
      }, 1500);
    } catch (err) {
      console.error('Erro ao responder orçamento:', err);
      setErroFeedback('Não foi possível enviar a resposta. Tente novamente.');
    } finally {
      setEnviando(false);
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
            <h1>Solicitações de Orçamento</h1>
            <p>Visualize as solicitações recebidas e envie o valor ou condições do serviço.</p>
          </header>

          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

          {loading ? (
            <div className="orcamentos-status">Carregando solicitações...</div>
          ) : orcamentos.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma solicitação de orçamento recebida até o momento.</p>
            </div>
          ) : (
            <div className="orcamentos-list">
              {orcamentos.map((orcamento) => (
                <article key={orcamento.id} className="orcamento-card">
                  <header className="orcamento-card-header">
                    <div>
                      <span className="orcamento-badge-servico">{orcamento.tituloServico}</span>
                      <h3>Solicitante: {orcamento.nomeSolicitante}</h3>
                      <p className="orcamento-email">Contato: {orcamento.emailSolicitante}</p>
                    </div>
                  </header>

                  <div className="orcamento-detalhes-grid">
                    <div>
                      <strong>Local de atendimento:</strong>
                      <p>{orcamento.localAtendimento}</p>
                    </div>
                    <div>
                      <strong>Período desejado:</strong>
                      <p>{orcamento.dataOuPeriodoDesejado}</p>
                    </div>
                  </div>

                  <div className="orcamento-descricao">
                    <strong>Descrição da necessidade:</strong>
                    <p>{orcamento.descricaoNecessidade}</p>
                  </div>

                  {(orcamento.valor !== undefined || orcamento.condicoes) && (
                    <div className="orcamento-resposta-box">
                      <strong>Sua resposta:</strong>
                      {orcamento.valor !== undefined && (
                        <p>
                          Valor: {orcamento.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      )}
                      {orcamento.condicoes && <p>Condições: {orcamento.condicoes}</p>}
                    </div>
                  )}

                  <div className="orcamento-card-actions">
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => abrirModalResposta(orcamento)}
                    >
                      {orcamento.valor !== undefined || orcamento.condicoes
                        ? 'Editar resposta'
                        : 'Responder orçamento'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Modal de envio de resposta */}
        {orcamentoSelecionado && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-content">
              <h2>Responder Orçamento</h2>
              <p className="modal-subtitle">
                Solicitante: <strong>{orcamentoSelecionado.nomeSolicitante}</strong> | Serviço:{' '}
                <strong>{orcamentoSelecionado.tituloServico}</strong>
              </p>

              {erroFeedback && <div className="alert alert-danger">{erroFeedback}</div>}
              {sucessoFeedback && <div className="alert alert-success">{sucessoFeedback}</div>}

              <form onSubmit={handleSubmit(onSubmitResposta)} noValidate>
                <div className="form-field">
                  <label htmlFor="valor">Valor proposto (R$)</label>
                  <input
                    id="valor"
                    type="number"
                    step="0.01"
                    placeholder="Ex.: 200.00 (opcional se houver condições)"
                    disabled={enviando}
                    {...register('valor', {
                      setValueAs: (v) =>
                        v === '' || v === null || v === undefined ? undefined : Number(v),
                    })}
                  />
                  {errors.valor && <span className="field-error">{errors.valor.message}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="condicoes">Condições do serviço</label>
                  <textarea
                    id="condicoes"
                    rows={4}
                    placeholder="Ex.: Inclui materiais básicos. Início a partir de segunda-feira."
                    disabled={enviando}
                    {...register('condicoes')}
                  />
                  {errors.condicoes && <span className="field-error">{errors.condicoes.message}</span>}
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={fecharModal}
                    disabled={enviando}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" disabled={enviando}>
                    {enviando ? 'Enviando...' : 'Enviar resposta'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}