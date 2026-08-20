import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { z } from 'zod';
import Logo from '../../components/Logo/Logo';
import type { ServicoDetalhe } from '../../models/servico-detalhe.model';
import { avaliacaoService } from '../../services/avaliacao.service';
import { servicoService } from '../../services/servico.service';
import SeletorNota from './components/SeletorNota/SeletorNota';
import './AvaliarPrestador.css';

const avaliarPrestadorSchema = z.object({
  nota: z
    .number()
    .int()
    .min(1, 'Selecione uma nota para o prestador.')
    .max(5, 'A nota deve estar entre 1 e 5.'),
  comentario: z
    .string()
    .trim()
    .optional(),
});

type AvaliarPrestadorFormData = z.infer<typeof avaliarPrestadorSchema>;

function obterMensagemErro(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const mensagem = error.response?.data?.message;
    if (typeof mensagem === 'string' && mensagem.trim()) {
      return mensagem;
    }

    if (error.response?.status === 403) {
      return 'Este serviço ainda não pode ser avaliado ou não pertence a você.';
    }

    if (error.response?.status === 404) {
      return 'O serviço informado não foi encontrado.';
    }

    if (error.response?.status === 409) {
      return 'Você já avaliou este serviço.';
    }
  }

  return 'Não foi possível enviar a avaliação. Tente novamente.';
}

export default function AvaliarPrestador() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const servicoId = Number(id);
  const servicoIdValido = Number.isInteger(servicoId) && servicoId > 0;

  const [servico, setServico] = useState<ServicoDetalhe | null>(null);
  const [carregandoServico, setCarregandoServico] = useState(servicoIdValido);
  const [enviando, setEnviando] = useState(false);
  const [avaliacaoEnviada, setAvaliacaoEnviada] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AvaliarPrestadorFormData>({
    resolver: zodResolver(avaliarPrestadorSchema),
    defaultValues: {
      nota: 0,
      comentario: '',
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

  const onSubmit = async (data: AvaliarPrestadorFormData) => {
    if (!servicoIdValido || !servico) {
      setErrorMessage('Não foi possível identificar o serviço avaliado.');
      return;
    }

    setEnviando(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await avaliacaoService.avaliar(servicoId, {
        nota: data.nota,
        comentario: data.comentario?.trim() || undefined,
      });
      setAvaliacaoEnviada(true);
      setSuccessMessage('Avaliação enviada com sucesso!');
    } catch (error: unknown) {
      setErrorMessage(obterMensagemErro(error));
    } finally {
      setEnviando(false);
    }
  };

  const onInvalid = () => {
    setSuccessMessage('');
    setErrorMessage('Selecione uma nota antes de enviar a avaliação.');
  };

  const voltarParaServico = () => {
    navigate(servicoIdValido ? `/servicos/${servicoId}` : '/servicos');
  };

  return (
    <>
      <header className="avaliacao-topbar">
        <Logo />
      </header>

      <main className="avaliacao-page">
        <button
          type="button"
          className="avaliacao-back-button"
          onClick={voltarParaServico}
        >
          ← Voltar para o serviço
        </button>

        {carregandoServico && (
          <div className="avaliacao-status" role="status">
            Carregando dados do serviço...
          </div>
        )}

        {!carregandoServico && !servico && (
          <div className="avaliacao-alert avaliacao-alert-error" role="alert">
            {!servicoIdValido ? 'Serviço inválido.' : errorMessage || 'Serviço não encontrado.'}
          </div>
        )}

        {!carregandoServico && servico && (
          <section className="avaliacao-card" aria-labelledby="avaliacao-title">
            <header className="avaliacao-header">
              <span className="avaliacao-eyebrow">Avaliação de atendimento</span>
              <h1 id="avaliacao-title">Avaliar prestador</h1>
              <p>Conte como foi sua experiência com {servico.nomePrestador}.</p>
            </header>

            <aside className="avaliacao-servico-resumo" aria-label="Serviço avaliado">
              <span>Serviço avaliado</span>
              <strong>{servico.titulo}</strong>
              <p>
                {servico.categoria} · {servico.bairro}, {servico.cidade}
              </p>
            </aside>

            {errorMessage && (
              <div className="avaliacao-alert avaliacao-alert-error" role="alert">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="avaliacao-alert avaliacao-alert-success" role="status">
                {successMessage}
              </div>
            )}

            <form noValidate onSubmit={handleSubmit(onSubmit, onInvalid)}>
              <div className="avaliacao-field">
                <Controller
                  name="nota"
                  control={control}
                  render={({ field }) => (
                    <SeletorNota
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      disabled={enviando || avaliacaoEnviada}
                      describedBy={errors.nota ? 'nota-error' : undefined}
                    />
                  )}
                />
                {errors.nota && (
                  <span id="nota-error" className="avaliacao-error">
                    {errors.nota.message}
                  </span>
                )}
              </div>

              <div className="avaliacao-field">
                <label htmlFor="comentario">
                  Comentário <span className="avaliacao-opcional">(opcional)</span>
                </label>
                <textarea
                  id="comentario"
                  rows={6}
                  placeholder="Conte o que mais gostou ou o que poderia ter sido melhor no atendimento."
                  aria-invalid={Boolean(errors.comentario)}
                  aria-describedby={errors.comentario ? 'comentario-error' : 'comentario-ajuda'}
                  disabled={enviando || avaliacaoEnviada}
                  {...register('comentario')}
                />
                <span id="comentario-ajuda" className="avaliacao-ajuda">
                  Você pode enviar apenas a nota, se preferir.
                </span>
                {errors.comentario && (
                  <span id="comentario-error" className="avaliacao-error">
                    {errors.comentario.message}
                  </span>
                )}
              </div>

              <div className="avaliacao-actions">
                <button
                  type="button"
                  className="avaliacao-button-secondary"
                  onClick={voltarParaServico}
                  disabled={enviando}
                >
                  {avaliacaoEnviada ? 'Voltar ao serviço' : 'Cancelar'}
                </button>
                {!avaliacaoEnviada && (
                  <button type="submit" className="avaliacao-button-primary" disabled={enviando}>
                    {enviando ? 'Enviando...' : 'Enviar avaliação'}
                  </button>
                )}
              </div>
            </form>
          </section>
        )}
      </main>
    </>
  );
}
