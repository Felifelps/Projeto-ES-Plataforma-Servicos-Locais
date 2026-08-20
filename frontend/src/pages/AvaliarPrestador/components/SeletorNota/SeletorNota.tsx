import './SeletorNota.css';

interface SeletorNotaProps {
  value: number;
  onChange: (nota: number) => void;
  onBlur: () => void;
  name: string;
  disabled?: boolean;
  describedBy?: string;
}

const NOTAS = [1, 2, 3, 4, 5];

export default function SeletorNota({
  value,
  onChange,
  onBlur,
  name,
  disabled = false,
  describedBy,
}: SeletorNotaProps) {
  return (
    <fieldset className="seletor-nota" aria-describedby={describedBy}>
      <legend>
        Nota <span aria-hidden="true">*</span>
      </legend>

      <div className="seletor-nota-opcoes">
        {NOTAS.map((nota) => (
          <label
            key={nota}
            className={nota <= value ? 'seletor-nota-opcao selecionada' : 'seletor-nota-opcao'}
          >
            <input
              type="radio"
              name={name}
              value={nota}
              checked={value === nota}
              onChange={() => onChange(nota)}
              onBlur={onBlur}
              disabled={disabled}
            />
            <span className="seletor-nota-estrela" aria-hidden="true">
              ★
            </span>
            <span className="seletor-nota-sr-only">
              {nota} {nota === 1 ? 'estrela' : 'estrelas'}
            </span>
          </label>
        ))}
      </div>

      <span className="seletor-nota-resultado" aria-live="polite">
        {value === 0
          ? 'Nenhuma nota selecionada'
          : `${value} de 5 ${value === 1 ? 'estrela' : 'estrelas'}`}
      </span>
    </fieldset>
  );
}
