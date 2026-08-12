import { useNavigate } from 'react-router-dom';
import './HomeCategories.css'

// Lista de categorias de serviços em destaque
const CATEGORIES = [
  { id: 'eletrica', name: 'Elétrica', icon: '⚡' },
  { id: 'hidraulica', name: 'Encanamento', icon: '🚰' },
  { id: 'pintura', name: 'Pintura', icon: '🎨' },
  { id: 'limpeza', name: 'Limpeza', icon: '🧹' },
  { id: 'jardinagem', name: 'Jardinagem', icon: '🌱' },
  { id: 'reformas', name: 'Reformas Geral', icon: '🔨' },
];

export default function HomeCategories() {
    const navigate = useNavigate();

     const handleCategoryClick = (categoryId: string) => {
     navigate(`/servicos?categoria=${categoryId}`);
  };

    return (
        <section className="categories-section">
        <h2>Categorias em Destaque</h2>
        <p>Clique em uma categoria para filtrar os serviços disponíveis</p>

        <div className="categories-grid">
          {CATEGORIES.map((cat) => (
            <div 
              key={cat.id} 
              className="category-card"
              onClick={() => handleCategoryClick(cat.id)}
            >
              <span className="category-icon">{cat.icon}</span>
              <span className="category-name">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>
    )
}