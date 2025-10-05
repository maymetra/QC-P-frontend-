// src/context/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api'; // <-- 1. Импортируем наш API-клиент
import { jwtDecode } from 'jwt-decode'; // <-- 2. Импортируем декодер токенов

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Если токен есть, декодируем его, чтобы получить данные пользователя
                const decodedUser = jwtDecode(token);
                return decodedUser;
            } catch (error) {
                console.error("Failed to decode token", error);
                return null;
            }
        }
        return null;
    });

    const navigate = useNavigate();

    // --- 3. Полностью заменяем функцию login ---
    const login = async (username, password) => {
        try {
            // FastAPI ожидает данные в формате `application/x-www-form-urlencoded`
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const response = await apiClient.post('/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            const { access_token } = response.data;

            // Сохраняем токен в localStorage
            localStorage.setItem('token', access_token);

            // Декодируем токен, чтобы получить данные о пользователе
            const userData = jwtDecode(access_token);
            setUser(userData);

            // Логика перенаправления
            if (userData.role === 'admin' || userData.role === 'auditor') {
                navigate('/dashboard');
            } else {
                navigate('/projects');
            }
        } catch (error) {
            console.error("Login failed", error);
            throw error; // Пробрасываем ошибку, чтобы компонент LoginForm мог ее показать
        }
    };

    const logout = () => {
        localStorage.removeItem('token'); // Удаляем токен
        setUser(null);
        navigate('/login');
    };

    const value = { user, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};