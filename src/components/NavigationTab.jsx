// src/components/NavigationTab.jsx
import React from 'react';
import { Menu, Badge } from 'antd'; // <-- Импортируем Badge
import {
    AppstoreOutlined,
    UserOutlined,
    InboxOutlined,
    DashboardOutlined,
    SnippetsOutlined,
    IdcardOutlined // <-- Убедитесь, что IdcardOutlined импортирован
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext'; // <-- useAuth

export default function NavigationTab({ activeKey }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    // Получаем пользователя и НОВЫЙ СЧЕТЧИК из контекста
    const { user, notificationCount } = useAuth();
    const isAuditorOrAdmin = user?.role === 'admin' || user?.role === 'auditor';

    const items = [];

    if (isAuditorOrAdmin) {
        items.push({
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: t('menu.dashboard', {defaultValue: 'Dashboard'})
        });
    }

    items.push(
        {
            key: '/projects',
            icon: <AppstoreOutlined />,
            label: t('menu.projects')
        },
        {
            key: '/projects/archive',
            icon: <InboxOutlined />,
            label: t('menu.archive', {defaultValue: 'Archive'})
        }
    );

    if (isAuditorOrAdmin) {
        items.push({
            key: '/templates',
            icon: <SnippetsOutlined />,
            label: t('menu.templates')
        });
    }

    if (user && user.role === 'admin') {
        items.push({
            key: '/users',
            icon: <UserOutlined />,
            // --- Оборачиваем label в Badge ---
            label: (
                <Badge count={notificationCount} size="small" offset={[10, 0]}>
                    {t('menu.users')}
                </Badge>
            )
        });
    }

    items.push({ type: 'divider' });

    items.push({
        key: '/profile',
        icon: <IdcardOutlined />,
        label: t('menu.profile', {defaultValue: 'Profile'})
    });

    const handleClick = ({ key }) => navigate(key);

    return (
        <Menu
            mode="inline"
            selectedKeys={[activeKey]}
            onClick={handleClick}
            items={items}
        />
    );
}