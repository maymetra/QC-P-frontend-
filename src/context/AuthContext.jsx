// src/context/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../services/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
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
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            // <-- ИЗМЕНЕНО: Логика перенаправления в зависимости от роли -->
            if (userData.role === 'admin' || userData.role === 'auditor') {
                navigate('/dashboard');
            } else {
                navigate('/projects');
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const logout = () => {
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