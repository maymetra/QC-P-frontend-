// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import 'antd/dist/reset.css';
import './index.css';
import './i18n';
import { AuthProvider } from './context/AuthContext.jsx'; // <-- Импорт

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            {/* ▼▼▼ Оборачиваем App в AuthProvider ▼▼▼ */}
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);