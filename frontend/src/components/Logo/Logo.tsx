import './Logo.css';
import { Link } from 'react-router-dom';

export default function Logo() {
    return (
    <Link to="/" className="logo-link" aria-label="Ir para a página inicial">
        <div className="platform-brand" aria-label="Freelance">
            <span className="platform-mark" aria-hidden="true">F</span>
            <span className="platform-title">FREELANCE</span>
        </div>
    </Link>
    )
}