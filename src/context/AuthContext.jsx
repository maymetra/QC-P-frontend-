// src/context/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../services/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // ▼▼▼ 1. Инициализируем состояние из localStorage ▼▼▼
    // Пытаемся получить пользователя из localStorage. Если его там нет, user будет null.
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        try {
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            return null;
        }
    });

    const navigate = useNavigate();

    const login = async (username, password) => {
        try {
            const userData = await loginRequest(username, password);

            // ▼▼▼ 2. Сохраняем пользователя в localStorage после входа ▼▼▼
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            navigate('/projects');
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const logout = () => {
        // ▼▼▼ 3. Очищаем localStorage при выходе ▼▼▼
        localStorage.removeItem('user');

        setUser(null);
        navigate('/login');
    };

    const value = { user, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};