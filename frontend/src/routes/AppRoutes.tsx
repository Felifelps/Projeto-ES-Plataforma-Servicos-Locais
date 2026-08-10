import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Login/Login';
import { Register } from '../pages/Register/Register';
import { Home } from '../pages/Home/home';
import { PrivateRoute } from '../routes/PrivateRoute';

export const AppRoutes: React.FC = () => {
  return (
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rotas Protegidas (Todas as rotas filhas exigem autenticação) */}
        <Route element={<PrivateRoute allowedRoles={['USER', 'ADMIN']} />}>
          <Route path="/home" element={<Home />} />
        </Route>

        {/* Redirecionamento para rota não encontrada ou padrão */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
  );
};

export default AppRoutes;