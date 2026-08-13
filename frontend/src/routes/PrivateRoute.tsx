import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from '../services/auth.service';

interface PrivateRouteProps {
    allowedRoles?: string[]; // Lista de roles permitidos para acessar a rota
    requireRole?: boolean;
}

export default function PrivateRoute({ allowedRoles, requireRole = false }: PrivateRouteProps) {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.getUserRole();

  if (!isAuthenticated) {
    // Redireciona para o login salvando a rota que o usuário tentou acessar
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasInvalidRole = Boolean(
    allowedRoles && (userRole ? !allowedRoles.includes(userRole) : requireRole),
  );

  if (hasInvalidRole) {
    // Autenticado, mas não tem a Role exigida pela história 
    return <Navigate to="/" replace />;
  }

  // Renderiza a rota filha protegida
  return <Outlet />;
};
