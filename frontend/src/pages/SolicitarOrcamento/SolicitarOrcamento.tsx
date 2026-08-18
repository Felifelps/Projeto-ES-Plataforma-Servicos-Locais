import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { z } from 'zod';
import Logo from '../../components/Logo/Logo';
import type { ServicoDetalhe } from '../../models/servico-detalhe.model';
import { orcamentoService } from '../../services/orcamento.service';
import { servicoService } from '../../services/servico.service';
import './SolicitarOrcamento.css';

const solicitarOrcamentoSchema = z.object({
  descricaoNecessidade: z
    .string()
    .trim()
    .min(1, 'A descrição da necessidade é obrigatória.'),
  localAtendimento: z
    .string()
    .trim()
    .min(1, 'O local de atendimento é obrigatório.')
    .max(255, 'O local de atendimento deve ter no máximo 255 caracteres.'),
  dataOuPeriodoDesejado: z
    .string()
    .trim()
    .min(1, 'A data ou período desejado é obrigatório.')
    .max(255, 'A data ou período desejado deve ter no máximo 255 caracteres.'),
});

type SolicitarOrcamentoFormData = z.infer<typeof solicitarOrcamentoSchema>;

function obterMensagemErro(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const mensagem = error.response?.data?.message;
    if (typeof mensagem === 'string' && mensagem.trim()) {
      return mensagem;
    }
  }

  return 'Não foi possível enviar a solicitação de orçamento. Tente novamente.';
}

export default function SolicitarOrcamento() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const servicoId = Number(id);
  const servicoIdValido = Number.isInteger(servicoId) && servicoId > 0;

  const [servico, setServico] = useState<ServicoDetalhe | null>(null);
  const [carregandoServico, setCarregandoServico] = useState(servicoIdValido);
  const [enviando, setEnviando] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SolicitarOrcamentoFormData>({
    resolver: zodResolver(solicitarOrcamentoSchema),
    defaultValues: {
      descricaoNecessidade: '',
      localAtendimento: '',
      dataOuPeriodoDesejado: '',
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (!servicoIdValido) return;

    let ativo = true;

    servicoService
      .buscarPorId(servicoId)
      .then((data) => {
        if (!ativo) return;
        setServico(data);
        setErrorMessage('');
      })
      .catch(() => {
        if (ativo) setErrorMessage('Não foi possível carregar os dados do serviço.');
      })
      .finally(() => {
        if (ativo) setCarregandoServico(false);
      });

    return () => {
      ativo = false;
    };
  }, [servicoId, servicoIdValido]);

  const onSubmit = async (data: SolicitarOrcamentoFormData) => {
    if (!servicoIdValido || !servico) {
      setErrorMessage('Não foi possível identificar o serviço solicitado.');
      return;
    }

    setEnviando(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await orcamentoService.solicitar({
        servicoId,
        ...data,
      });
      reset();
      setSuccessMessage('Solicitação de orçamento enviada com sucesso!');
    } catch (error: unknown) {
      setErrorMessage(obterMensagemErro(error));
    } finally {
      setEnviando(false);
    }
  };

  const onInvalid = () => {
    setSuccessMessage('');
    setErrorMessage('Preencha todos os campos obrigatórios antes de enviar.');
  };

  const voltarParaServico = () => {
    navigate(servicoIdValido ? `/servicos/${servicoId}` : '/servicos');
  };

  return (
    <>
      <header className="orcamento-topbar">
        <Logo />
      </header>

      <main className="orcamento-page">
        <button
          type="button"
          className="orcamento-back-button"
          onClick={voltarParaServico}
        >
          ← Voltar para o serviço
        </button>

        {carregandoServico && (
          <div className="orcamento-status" role="status">
            Carregando dados do serviço...
          </div>
        )}

        {!carregandoServico && !servico && (
          <div className="orcamento-alert orcamento-alert-error" role="alert">
            {!servicoIdValido ? 'Serviço inválido.' : errorMessage || 'Serviço não encontrado.'}
          </div>
        )}

        {!carregandoServico && servico && (
          <section className="orcamento-card" aria-labelledby="orcamento-title">
            <header className="orcamento-header">
              <span className="orcamento-eyebrow">Solicitação para {servico.nomePrestador}</span>
              <h1 id="orcamento-title">Solicitar orçamento</h1>
              <p>Explique o que você precisa para que o prestador possa preparar uma proposta.</p>
            </header>

            <aside className="orcamento-servico-resumo" aria-label="Serviço selecionado">
              <span>Serviço selecionado</span>
              <strong>{servico.titulo}</strong>
              <p>
                {servico.categoria} · {servico.bairro}, {servico.cidade}
              </p>
            </aside>

            {errorMessage && (
              <div className="orcamento-alert orcamento-alert-error" role="alert">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="orcamento-alert orcamento-alert-success" role="status">
                {successMessage}
              </div>
            )}

            <form noValidate onSubmit={handleSubmit(onSubmit, onInvalid)}>
              <div className="orcamento-field">
                <label htmlFor="descricaoNecessidade">Descrição da necessidade</label>
                <textarea
                  id="descricaoNecessidade"
                  rows={6}
                  placeholder="Descreva o serviço necessário e os detalhes que podem ajudar o prestador."
                  aria-invalid={Boolean(errors.descricaoNecessidade)}
                  aria-describedby={
                    errors.descricaoNecessidade ? 'descricaoNecessidade-error' : undefined
                  }
                  disabled={enviando}
                  {...register('descricaoNecessidade')}
                />
                {errors.descricaoNecessidade && (
                  <span id="descricaoNecessidade-error" className="orcamento-error">
                    {errors.descricaoNecessidade.message}
                  </span>
                )}
              </div>

              <div className="orcamento-field">
                <label htmlFor="localAtendimento">Local do atendimento</label>
                <input
                  id="localAtendimento"
                  type="text"
                  maxLength={255}
                  placeholder="Ex.: Rua das Flores, 123, Centro"
                  aria-invalid={Boolean(errors.localAtendimento)}
                  aria-describedby={errors.localAtendimento ? 'localAtendimento-error' : undefined}
                  disabled={enviando}
                  {...register('localAtendimento')}
                />
                {errors.localAtendimento && (
                  <span id="localAtendimento-error" className="orcamento-error">
                    {errors.localAtendimento.message}
                  </span>
                )}
              </div>

              <div className="orcamento-field">
                <label htmlFor="dataOuPeriodoDesejado">Data ou período desejado</label>
                <input
                  id="dataOuPeriodoDesejado"
                  type="text"
                  maxLength={255}
                  placeholder="Ex.: Próxima semana, preferencialmente pela manhã"
                  aria-invalid={Boolean(errors.dataOuPeriodoDesejado)}
                  aria-describedby={
                    errors.dataOuPeriodoDesejado ? 'dataOuPeriodoDesejado-error' : undefined
                  }
                  disabled={enviando}
                  {...register('dataOuPeriodoDesejado')}
                />
                {errors.dataOuPeriodoDesejado && (
                  <span id="dataOuPeriodoDesejado-error" className="orcamento-error">
                    {errors.dataOuPeriodoDesejado.message}
                  </span>
                )}
              </div>

              <div className="orcamento-actions">
                <button
                  type="button"
                  className="orcamento-button-secondary"
                  onClick={voltarParaServico}
                  disabled={enviando}
                >
                  Cancelar
                </button>
                <button type="submit" className="orcamento-button-primary" disabled={enviando}>
                  {enviando ? 'Enviando...' : 'Enviar solicitação'}
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </>
  );
}
