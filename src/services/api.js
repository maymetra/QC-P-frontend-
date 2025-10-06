// src/services/api.js
import axios from 'axios';

// 1. Выносим базовый URL в константу, чтобы использовать его в других местах
export const API_BASE_URL = 'http://localhost:8000/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


// Это "перехватчик" (interceptor). Он будет выполняться перед КАЖДЫМ запросом.
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Если токен есть, добавляем его в заголовок Authorization
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;