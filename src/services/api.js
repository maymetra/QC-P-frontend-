// src/services/api.js
import axios from 'axios';

// Создаем экземпляр axios с базовой конфигурацией
const apiClient = axios.create({
    baseURL: 'http://localhost:8000/api/v1', // Адрес нашего бэкенда
    headers: {
        'Content-Type': 'application/json',
    },
});

// Экспортируем наш настроенный клиент
export default apiClient;