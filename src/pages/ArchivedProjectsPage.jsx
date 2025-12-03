// src/pages/ArchivedProjectsPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Layout, Typography, Button, Flex, Table, Tag, message, Popconfirm, Input, Space } from 'antd';
import { LogoutOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitch from '../components/LanguageSwitch';
import NavigationTab from '../components/NavigationTab';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import dayjs from 'dayjs';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function ArchivedProjectsPage() {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/projects/');
            // Фильтруем только завершенные
            const finishedProjects = response.data.filter(p => p.status === 'finished');
            setProjects(finishedProjects);
        } catch (error) {
            console.error("Failed to fetch archived projects", error);
            message.error(t('archive.fetchError', { defaultValue: "Failed to load archived projects." }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [user]);

    const handleDelete = async (projectId) => {
        try {
            await apiClient.delete(`/projects/${projectId}`);
            message.success(t('projects.deleteSuccess', { defaultValue: 'Project deleted successfully' }));
            fetchProjects();
        } catch (error) {
            console.error("Failed to delete project", error);
            message.error(t('projects.deleteError', { defaultValue: 'Failed to delete project' }));
        }
    };

    // --- Конфигурация колонок таблицы ---
    const columns = [
        {
            title: t('projects.form.name', { defaultValue: 'Project Name' }),
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: t('projects.form.kunde', { defaultValue: 'Customer' }),
            dataIndex: 'kunde',
            key: 'kunde',
            sorter: (a, b) => (a.kunde || '').localeCompare(b.kunde || ''),
        },
        {
            title: t('projects.manager', { defaultValue: 'Manager' }),
            dataIndex: 'manager',
            key: 'manager',
            sorter: (a, b) => (a.manager || '').localeCompare(b.manager || ''),
            responsive: ['md'], // Скрывать на мобильных
        },
        {
            title: 'Archived Date', // Можно добавить ключ в i18n
            dataIndex: 'archived_at',
            key: 'archived_at',
            sorter: (a, b) => {
                const dateA = a.archived_at ? dayjs(a.archived_at).unix() : 0;
                const dateB = b.archived_at ? dayjs(b.archived_at).unix() : 0;
                return dateA - dateB;
            },
            render: (date) => date ? dayjs(date).format('DD.MM.YYYY') : '—',
        },
        {
            title: t('usersPage.table.action', { defaultValue: 'Action' }),
            key: 'action',
            width: 100,
            render: (_, record) => (
                <Space onClick={(e) => e.stopPropagation()}>
                    {user.role === 'admin' && (
                        <Popconfirm
                            title={t('projects.deleteConfirmTitle', { defaultValue: 'Delete?' })}
                            onConfirm={() => handleDelete(record.id)}
                            okText={t('common.yes')}
                            cancelText={t('common.no')}
                        >
                            <Button danger type="text" icon={<DeleteOutlined />} />
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    // Фильтрация данных на клиенте
    const filteredProjects = useMemo(() => {
        if (!searchText) return projects;
        const lowerSearch = searchText.toLowerCase();
        return projects.filter(p =>
            p.name.toLowerCase().includes(lowerSearch) ||
            (p.kunde && p.kunde.toLowerCase().includes(lowerSearch)) ||
            (p.manager && p.manager.toLowerCase().includes(lowerSearch))
        );
    }, [projects, searchText]);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header className="flex justify-between items-center bg-gray-900 px-6 shadow-sm">
                <h1 className="futuristic text-2xl sm:text-3xl m-0 leading-none">QUALITY CONTROL</h1>
                <Flex align="center" gap="middle">
                    <Text style={{ color: 'white' }}>{user?.name}</Text>
                    <LanguageSwitch />
                    <Button ghost icon={<LogoutOutlined />} onClick={logout}>{t('logout')}</Button>
                </Flex>
            </Header>

            <Layout>
                <Sider width={220} className="bg-white shadow-sm">
                    <NavigationTab activeKey="/projects/archive" />
                </Sider>

                <Content className="p-6 bg-gray-50">
                    <Flex justify="space-between" align="center" className="!mb-6">
                        <Title level={2} className="!m-0">{t('menu.archive', {defaultValue: 'Archive'})}</Title>
                        <Input
                            placeholder={t('projects.filters.search', { defaultValue: 'Search...' })}
                            prefix={<SearchOutlined />}
                            style={{ width: 300 }}
                            onChange={e => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Flex>

                    <Table
                        columns={columns}
                        dataSource={filteredProjects}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                        onRow={(record) => ({
                            onClick: () => navigate(`/projects/${record.id}`),
                            style: { cursor: 'pointer' }
                        })}
                    />
                </Content>
            </Layout>
        </Layout>
    );
}