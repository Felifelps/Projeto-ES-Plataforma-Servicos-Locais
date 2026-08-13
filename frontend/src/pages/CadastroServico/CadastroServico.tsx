import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { z } from 'zod';
import { CATEGORIAS_SERVICO, FORMAS_COBRANCA } from '../../constants/servico-cadastro-options';
import type { FormaCobranca } from '../../models/servico-cadastro.model';
import { cadastroServicoService } from '../../services/cadastro-servico.service';
import './CadastroServico.css';

const formasCobrancaValidas = FORMAS_COBRANCA.map(({ valor }) => valor);

const cadastroServicoSchema = z.object({
  titulo: z.string().trim().min(1, 'O título é obrigatório.'),
  categoriaId: z.coerce.number({ invalid_type_error: 'Selecione uma categoria válida.' }).pipe(z.number().min(1, 'A categoria é obrigatória.')),
  descricao: z.string().trim().min(1, 'A descrição é obrigatória.'),
  localizacao: z.string().trim().min(1, 'A localização é obrigatória.'),
  areaAtendimento: z.string().trim().min(1, 'A área de atendimento é obrigatória.'),
  formaCobranca: z
    .string()
    .min(1, 'A forma de cobrança é obrigatória.')
    .refine(
      (valor) => formasCobrancaValidas.includes(valor as FormaCobranca),
      'Selecione uma forma de cobrança válida.',
    ),
});

type CadastroServicoFormData = z.infer<typeof cadastroServicoSchema>;

function obterMensagemErro(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const mensagem = error.response?.data?.message;
    if (typeof mensagem === 'string' && mensagem.trim()) {
      return mensagem;
    }
  }

  return 'Não foi possível cadastrar o serviço. Tente novamente.';
}

export default function CadastroServico() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CadastroServicoFormData>({
    resolver: zodResolver(cadastroServicoSchema),
    defaultValues: {
      titulo: '',
      categoriaId: 0,
      descricao: '',
      localizacao: '',
      areaAtendimento: '',
      formaCobranca: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = async (data: CadastroServicoFormData) => {
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await cadastroServicoService.cadastrar({
        ...data,
        formaCobranca: data.formaCobranca as FormaCobranca,
      });
      reset();
      setSuccessMessage('Serviço cadastrado com sucesso!');
      setTimeout(() => {
      navigate('/meus-servicos');
    }, 1500);
    } catch (error: unknown) {
      setErrorMessage(obterMensagemErro(error));
    } finally {
      setLoading(false);
    }
  };

  const onInvalid = () => {
    setSuccessMessage('');
    setErrorMessage('Preencha todos os campos obrigatórios antes de cadastrar.');
  };

  return (
    <main className="service-create-page">
      <section className="service-create-card" aria-labelledby="service-create-title">
        <header className="service-create-header">
          <span className="service-create-eyebrow">Área do prestador</span>
          <h1 id="service-create-title">Cadastrar Serviço</h1>
          <p>Informe os dados do serviço que você deseja oferecer.</p>
        </header>

        {errorMessage && (
          <div className="service-create-alert service-create-alert-error" role="alert">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="service-create-alert service-create-alert-success" role="status">
            {successMessage}
          </div>
        )}

        <form noValidate onSubmit={handleSubmit(onSubmit, onInvalid)}>
          <div className="service-create-field">
            <label htmlFor="titulo">Título</label>
            <input
              id="titulo"
              type="text"
              placeholder="Ex.: Instalação e manutenção elétrica"
              aria-invalid={Boolean(errors.titulo)}
              {...register('titulo')}
            />
            {errors.titulo && <span className="service-create-error">{errors.titulo.message}</span>}
          </div>

          <div className="service-create-grid">
            <div className="service-create-field">
              <label htmlFor="categoriaId">Categoria</label>
              <select
                id="categoriaId"
                aria-invalid={Boolean(errors.categoriaId)}
                {...register('categoriaId')}
              >
                <option value={0}>Selecione uma categoria</option>
                {CATEGORIAS_SERVICO.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
              {errors.categoriaId && (
                <span className="service-create-error">{errors.categoriaId.message}</span>
              )}
            </div>

            <div className="service-create-field">
              <label htmlFor="formaCobranca">Forma de cobrança</label>
              <select
                id="formaCobranca"
                aria-invalid={Boolean(errors.formaCobranca)}
                {...register('formaCobranca')}
              >
                <option value="">Selecione uma forma</option>
                {FORMAS_COBRANCA.map((forma) => (
                  <option key={forma.valor} value={forma.valor}>
                    {forma.rotulo}
                  </option>
                ))}
              </select>
              {errors.formaCobranca && (
                <span className="service-create-error">{errors.formaCobranca.message}</span>
              )}
            </div>
          </div>

          <div className="service-create-field">
            <label htmlFor="descricao">Descrição</label>
            <textarea
              id="descricao"
              rows={5}
              placeholder="Descreva o serviço, sua experiência e os detalhes importantes para o cliente."
              aria-invalid={Boolean(errors.descricao)}
              {...register('descricao')}
            />
            {errors.descricao && (
              <span className="service-create-error">{errors.descricao.message}</span>
            )}
          </div>

          <div className="service-create-grid">
            <div className="service-create-field">
              <label htmlFor="localizacao">Localização</label>
              <input
                id="localizacao"
                type="text"
                placeholder="Ex.: Garanhuns - PE"
                aria-invalid={Boolean(errors.localizacao)}
                {...register('localizacao')}
              />
              {errors.localizacao && (
                <span className="service-create-error">{errors.localizacao.message}</span>
              )}
            </div>

            <div className="service-create-field">
              <label htmlFor="areaAtendimento">Área de atendimento</label>
              <input
                id="areaAtendimento"
                type="text"
                placeholder="Ex.: Centro e bairros próximos"
                aria-invalid={Boolean(errors.areaAtendimento)}
                {...register('areaAtendimento')}
              />
              {errors.areaAtendimento && (
                <span className="service-create-error">{errors.areaAtendimento.message}</span>
              )}
            </div>
          </div>

          <div className="service-create-actions">
            <button
              type="button"
              className="service-create-button-secondary"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="service-create-button-primary" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar serviço'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
