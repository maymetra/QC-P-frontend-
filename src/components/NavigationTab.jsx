// src/components/NavigationTab.jsx
import React from 'react';
import { Menu } from 'antd';
import {
    AppstoreOutlined,
    UserOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function NavigationTab({ activeKey }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuth();

    const items = [
        {
            key: '/projects',
            icon: <AppstoreOutlined />,
            label: t('menu.projects') // <-- Используем новый ключ
        },
    ];

    if (user && user.role === 'admin') {
        items.push({
            key: '/users',
            icon: <UserOutlined />,
            label: t('menu.users')
        });
    }

    items.push({
        key: '/settings',
        icon: <SettingOutlined />,
        label: t('menu.settings')
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
