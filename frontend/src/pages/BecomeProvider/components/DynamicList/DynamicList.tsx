import { useFormContext } from 'react-hook-form';
import type { FieldErrors, FieldNamesMarkedBoolean } from 'react-hook-form';
import type { ProviderFormData } from '../../BecomeProvider';

interface DynamicStringListProps {
  fieldName: 'phones' | 'serviceAreas';
  label: string;
  placeholder: string;
  inputType?: string;
  addButtonText: string;
}

export default function DynamicStringList({
  fieldName,
  label,
  placeholder,
  inputType = 'text',
  addButtonText,
}: DynamicStringListProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors, touchedFields },
  } = useFormContext<ProviderFormData>();

  // Lê os valores dinamicamente com base no nome do campo
  const items = (watch(fieldName) as string[]) || [''];

  const fieldErrors = errors[fieldName] as FieldErrors<string[]>;
  const fieldTouched = touchedFields[fieldName] as FieldNamesMarkedBoolean<string[]>;

  const handleAdd = () => {
    setValue(fieldName, [...items, ''], { shouldValidate: false });
  };

  const handleRemove = (index: number) => {
    if (items.length > 1) {
      const updated = items.filter((_, i) => i !== index);
      setValue(fieldName, updated, { shouldValidate: true, shouldTouch: true });
    }
  };

  return (
    <div className="form-group">
      <label>{label}</label>

      {items.map((_, index) => {
        const hasError = Boolean(fieldErrors?.[index] && fieldTouched?.[index]);

        return (
          <div key={index} className="field-array-row">
            <input
              type={inputType}
              placeholder={placeholder}
              className={hasError ? 'invalid' : ''}
              {...register(`${fieldName}.${index}` as const)}
            />
            <button
              type="button"
              className="btn-secondary btn-remove"
              onClick={() => handleRemove(index)}
              disabled={items.length <= 1}
            >
              Remover
            </button>
          </div>
        );
      })}

      {/* Erro geral da lista */}
      {typeof errors[fieldName]?.message === 'string' && (
        <span className="error-text">{errors[fieldName]?.message as string}</span>
      )}

      <button type="button" className="btn-secondary" onClick={handleAdd}>
        {addButtonText}
      </button>
    </div>
  );
}