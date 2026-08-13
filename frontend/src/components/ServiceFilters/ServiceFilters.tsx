import { useState, type FormEvent } from 'react';
import type { ServicoFiltro } from '../../models/servico-filtro.model';
import { SERVICE_CATEGORIES } from '../../constants/categories';
import './ServiceFilters.css';

interface ServiceFiltersProps {
  initialValues: ServicoFiltro;
  onSearch: (filtros: ServicoFiltro) => void;
  loading?: boolean;
}

// Componente é remontado (via prop `key`) pelo pai sempre que os filtros
// da URL mudam externamente, então o estado local só precisa ser
// inicializado uma vez a partir das props.
export default function ServiceFilters({ initialValues, onSearch, loading }: ServiceFiltersProps) {
  const [categoria, setCategoria] = useState(initialValues.categoria || '');
  const [cidade, setCidade] = useState(initialValues.cidade || '');
  const [bairro, setBairro] = useState(initialValues.bairro || '');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSearch({
      categoria: categoria || undefined,
      cidade: cidade || undefined,
      bairro: bairro || undefined,
    });
  };

  const handleClear = () => {
    setCategoria('');
    setCidade('');
    setBairro('');
    onSearch({});
  };

  return (
    <form className="service-filters" onSubmit={handleSubmit}>
      <div className="filter-field">
        <label htmlFor="filtro-categoria">Categoria</label>
        <select
          id="filtro-categoria"
          value={categoria}
          onChange={(event) => setCategoria(event.target.value)}
        >
          <option value="">Todas as categorias</option>
          {SERVICE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="filtro-cidade">Cidade</label>
        <input
          id="filtro-cidade"
          type="text"
          placeholder="Ex: Recife"
          value={cidade}
          onChange={(event) => setCidade(event.target.value)}
        />
      </div>

      <div className="filter-field">
        <label htmlFor="filtro-bairro">Bairro</label>
        <input
          id="filtro-bairro"
          type="text"
          placeholder="Ex: Boa Viagem"
          value={bairro}
          onChange={(event) => setBairro(event.target.value)}
        />
      </div>

      <div className="filter-actions">
        <button type="button" className="btn-secondary" onClick={handleClear} disabled={loading}>
          Limpar
        </button>
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
    </form>
  );
}
