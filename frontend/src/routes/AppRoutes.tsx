import { Routes, Route, Navigate } from 'react-router-dom';
import CadastroServico from '../pages/CadastroServico/CadastroServico';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import Home from '../pages/Home/Home';
import PrivateRoute from '../routes/PrivateRoute';
import BecomeProvider from '../pages/BecomeProvider/BecomeProvider';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rotas Protegidas (Todas as rotas filhas exigem autenticação) */}
      <Route element={<PrivateRoute allowedRoles={['USER', 'ADMIN', 'PRESTADOR']} />}>
        <Route path="/become-provider" element={<BecomeProvider />} />
      </Route>

      <Route element={<PrivateRoute allowedRoles={['PRESTADOR']} requireRole />}>
        <Route path="/servicos/cadastrar" element={<CadastroServico />} />
      </Route>

      {/* Redirecionamento para rota não encontrada ou padrão */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
