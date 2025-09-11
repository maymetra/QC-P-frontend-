// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProjectsListPage from './pages/ProjectsListPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
// ▼▼▼ Импортируем новые страницы ▼▼▼
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
    return (
        <Routes>
            {/* Публичный роут для логина */}
            <Route path="/login" element={<LoginPage />} />

            {/* ▼▼▼ Защищенная зона ▼▼▼ */}
            <Route element={<ProtectedRoute />}>
                <Route path="/projects" element={<ProjectsListPage />} />
                <Route path="/projects/:projectId" element={<ProjectDetailPage />} />

                {/* ▼▼▼ Добавлены маршруты для новых страниц ▼▼▼ */}
                <Route path="/users" element={<UsersPage />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Редирект с главной на проекты */}
            <Route path="/" element={<Navigate to="/projects" replace />} />

            {/* Страница не найдена */}
            <Route path="*" element={<h2>404 — Page not found</h2>} />
        </Routes>
    );
}
