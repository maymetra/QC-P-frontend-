// src/components/NavigationTab.jsx
import React from 'react';
import { Menu } from 'antd';
import {
    AppstoreOutlined,
    UserOutlined,
    SettingOutlined,
    InboxOutlined,
    DashboardOutlined, SnippetsOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function NavigationTab({ activeKey }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuth();
    const isAuditorOrAdmin = user?.role === 'admin' || user?.role === 'auditor';

    const items = [];

    // Показываем дашборд только админу или аудитору
    if (isAuditorOrAdmin) {
        items.push({
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: t('menu.dashboard', {defaultValue: 'Dashboard'})
        });
    }

    // --- ИЗМЕНЕН ПОРЯДОК И КЛЮЧИ ---
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
    // ---------------------------------

    if (user && user.role === 'admin') {
        items.push({
            key: '/users',
            icon: <UserOutlined />,
            label: t('menu.users')
        });
    }

    // Удалена старая вкладка "Settings" отсюда

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