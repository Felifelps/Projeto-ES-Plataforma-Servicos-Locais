import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { providerService } from '../../services/provider.service';
import { authService } from '../../services/auth.service';
import './BecomeProvider.css';

const providerSchema = z.object({
  document: z
    .string()
    .min(1, 'O documento é obrigatório.')
    .regex(/^[0-9.-/]+$/, 'Documento em formato inválido.'),
  phones: z
    .array(z.string().min(1, 'O telefone é obrigatório.'))
    .min(1, 'Pelo menos um telefone é obrigatório.'),
  categories: z
    .array(z.string().min(1, 'A categoria é obrigatória.'))
    .min(1, 'Pelo menos uma categoria é obrigatória.'),
  serviceAreas: z
    .array(z.string().min(1, 'A área de atendimento é obrigatória.'))
    .min(1, 'Pelo menos uma área de atendimento é obrigatória.'),
  description: z
    .string()
    .min(1, 'A descrição é obrigatória.')
    .max(1000, 'A descrição deve ter no máximo 1000 caracteres.'),
});

type ProviderFormData = z.infer<typeof providerSchema>;

const defaultCategories = [
  'Eletricista',
  'Encanador',
  'Diarista',
  'Pintor',
  'Jardineiro',
  'Marceneiro',
  'Pedreiro',
  'Chaveiro',
  'Técnico de Informática',
  'Professor Particular',
];

export default function BecomeProvider() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors, touchedFields },
  } = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      document: '',
      phones: [''],
      categories: [],
      serviceAreas: [''],
      description: '',
    },
    mode: 'onTouched',
  });

  const phoneFieldArray = useFieldArray({ control, name: 'phones' as never });
  const serviceAreaFieldArray = useFieldArray({ control, name: 'serviceAreas' as never });

  const selectedCategories = watch('categories') || [];

  const toggleCategory = (categoryName: string) => {
    const current = getValues('categories') || [];
    let updated: string[];
    if (current.includes(categoryName)) {
      updated = current.filter((c) => c !== categoryName);
    } else {
      updated = [...current, categoryName];
    }
    setValue('categories', updated, { shouldValidate: true, shouldTouch: true });
  };

  const onSubmit = async (data: ProviderFormData) => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await providerService.createProviderProfile({
        document: data.document,
        phones: data.phones.filter(Boolean),
        categories: data.categories,
        serviceAreas: data.serviceAreas.filter(Boolean),
        description: data.description,
      });

      authService.setUserRole('PRESTADOR');
      setSuccessMessage('Perfil de prestador criado com sucesso!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setErrorMessage(
        apiError?.response?.data?.message ||
          'Ocorreu um erro ao enviar o perfil. Verifique os campos e tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="provider-page">
      <section className="provider-card">
        <h1>Tornar-se Prestador</h1>
        <p>Complete seu cadastro enviando seus dados de prestador para começar a atender clientes.</p>

        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="document">Documento (CPF/CNPJ)</label>
            <input
              id="document"
              type="text"
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              className={errors.document && touchedFields.document ? 'invalid' : ''}
              {...register('document')}
            />
            {errors.document && touchedFields.document && (
              <span className="error-text">{errors.document.message}</span>
            )}
          </div>

          <div className="form-group">
            <label>Telefones para Contato</label>
            {phoneFieldArray.fields.map((field, index) => (
              <div key={field.id} className="field-array-row">
                <input
                  type="tel"
                  placeholder="(XX) XXXXX-XXXX"
                  className={
                    errors.phones?.[index] && touchedFields.phones?.[index]
                      ? 'invalid'
                      : ''
                  }
                  {...register(`phones.${index}` as const)}
                />
                <button
                  type="button"
                  className="btn-secondary btn-remove"
                  onClick={() => phoneFieldArray.remove(index)}
                  disabled={phoneFieldArray.fields.length <= 1}
                >
                  Remover
                </button>
              </div>
            ))}

            {errors.phones && !Array.isArray(errors.phones) && (
              <span className="error-text">{errors.phones.message}</span>
            )}
            <button
              type="button"
              className="btn-secondary"
              onClick={() => phoneFieldArray.append('')}
            >
              + Adicionar telefone
            </button>
          </div>

          <div className="form-group">
            <label>Categorias de Atuação</label>
            <p className="field-hint">Selecione uma ou mais categorias:</p>
            <div className="categories-grid">
              {defaultCategories.map((category) => {
                const isSelected = selectedCategories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    className={`category-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleCategory(category)}
                  >
                    <span className="chip-icon">{isSelected ? '✓' : '+'}</span>
                    {category}
                  </button>
                );
              })}
            </div>
            {errors.categories && (
              <span className="error-text">{errors.categories.message}</span>
            )}
          </div>

          <div className="form-group">
            <label>Áreas de Atendimento</label>
            {serviceAreaFieldArray.fields.map((field, index) => (
              <div key={field.id} className="field-array-row">
                <input
                  placeholder="Bairro ou cidade (ex: Boa Viagem, Recife)"
                  className={
                    errors.serviceAreas?.[index] && touchedFields.serviceAreas?.[index]
                      ? 'invalid'
                      : ''
                  }
                  {...register(`serviceAreas.${index}` as const)}
                />
                <button
                  type="button"
                  className="btn-secondary btn-remove"
                  onClick={() => serviceAreaFieldArray.remove(index)}
                  disabled={serviceAreaFieldArray.fields.length <= 1}
                >
                  Remover
                </button>
              </div>
            ))}

            {errors.serviceAreas && !Array.isArray(errors.serviceAreas) && (
              <span className="error-text">{errors.serviceAreas.message}</span>
            )}
            <button
              type="button"
              className="btn-secondary"
              onClick={() => serviceAreaFieldArray.append('')}
            >
              + Adicionar área
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição dos Serviços</label>
            <textarea
              id="description"
              rows={4}
              placeholder="Conte um pouco sobre sua experiência, especialidades e horário de atendimento..."
              className={errors.description && touchedFields.description ? 'invalid' : ''}
              {...register('description')}
            />
            {errors.description && touchedFields.description && (
              <span className="error-text">{errors.description.message}</span>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Confirmar e Finalizar'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
