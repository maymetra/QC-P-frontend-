// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // ... (логика загрузки пользователя из localStorage остается)
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedUser = jwtDecode(token);
                return decodedUser;
            } catch (error) {
                console.error("Failed to decode token", error);
                return null;
            }
        }
        return null;
    });

    // --- НОВОЕ СОСТОЯНИЕ ДЛЯ УВЕДОМЛЕНИЙ ---
    const [notificationCount, setNotificationCount] = useState(0);
    const navigate = useNavigate();

    // --- НОВАЯ ФУНКЦИЯ ДЛЯ ЗАГРУЗКИ СЧЕТЧИКА ---
    const fetchNotificationCount = useCallback(async (currentUser) => {
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'auditor')) {
            setNotificationCount(0);
            return;
        }
        try {
            const response = await apiClient.get('/users/notifications/counts');
            const { unknown_managers, password_resets } = response.data;
            setNotificationCount(unknown_managers + password_resets);
        } catch (error) {
            console.error("Failed to fetch notification count", error);
            // Не показываем ошибку, просто сбрасываем счетчик
            setNotificationCount(0);
        }
    }, []);

    // --- ОБНОВЛЯЕМ LOGIN ---
    const login = async (username, password) => {
        try {
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const response = await apiClient.post('/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            const { access_token } = response.data;
            localStorage.setItem('token', access_token);
            const userData = jwtDecode(access_token);
            setUser(userData);

            // Загружаем счетчик сразу после логина
            fetchNotificationCount(userData);

            if (userData.role === 'admin' || userData.role === 'auditor' || userData.role === 'manager') {
                navigate('/dashboard');
            } else {
                navigate('/projects');
            }
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setNotificationCount(0); // Сбрасываем счетчик при выходе
        navigate('/login');
    };

    // --- НОВЫЙ EFFECT ДЛЯ ОПРОСА ---
    // Опрашиваем бэкенд каждые 30 секунд на наличие новых уведомлений
    useEffect(() => {
        if (user) {
            // Загружаем при первой загрузке страницы с пользователем
            fetchNotificationCount(user);

            const interval = setInterval(() => {
                fetchNotificationCount(user);
            }, 30000); // 30 секунд

            return () => clearInterval(interval); // Очищаем интервал при размонтировании
        }
    }, [user, fetchNotificationCount]);

    // Добавляем notificationCount и fetchNotificationCount в value
    const value = { user, login, logout, notificationCount, fetchNotificationCount };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};