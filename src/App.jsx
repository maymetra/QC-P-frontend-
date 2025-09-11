// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProjectsListPage from './pages/ProjectsListPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import ArchivedProjectsPage from './pages/ArchivedProjectsPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
    return (
        <Routes>
            {/* Публичный роут для логина */}
            <Route path="/login" element={<LoginPage />} />

            {/* ▼▼▼ Защищенная зона ▼▼▼ */}
            <Route element={<ProtectedRoute />}>
                {/* Убираем вложенный роутинг, защита будет внутри самого компонента */}
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/projects" element={<ProjectsListPage />} />
                <Route path="/projects/archive" element={<ArchivedProjectsPage />} />
                <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Редирект с главной (остается прежним) */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Страница не найдена */}
            <Route path="*" element={<h2>404 — Page not found</h2>} />
        </Routes>
    );
}