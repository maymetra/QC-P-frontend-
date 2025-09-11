// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
    const { user } = useAuth();

    if (!user) {
        // Если пользователя нет в контексте, перенаправляем на страницу логина
        return <Navigate to="/login" replace />;
    }

    // Если пользователь есть, показываем вложенный роут (страницу)
    return <Outlet />;
}