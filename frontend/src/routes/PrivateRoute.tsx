import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from '../services/auth.service';

interface PrivateRouteProps {
    allowedRoles?: string[]; // Lista de roles permitidos para acessar a rota
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.getUserRole();

  if (!isAuthenticated) {
    // Redireciona para o login salvando a rota que o usuário tentou acessar
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // 2. Autenticado, mas não tem a Role exigida pela história 
    return <Navigate to="/home" replace />;
  }

  // Renderiza a rota filha protegida
  return <Outlet />;
};