// src/pages/ArchivedProjectsPage.jsx
import React, { useEffect, useState } from 'react';
import { Layout, Typography, Button, Flex, List, Tag, message, Popconfirm } from 'antd';
import { LogoutOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitch from '../components/LanguageSwitch';
import NavigationTab from '../components/NavigationTab';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api'; // <-- 1. Импортируем наш API-клиент

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function ArchivedProjectsPage() {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false); // <-- 2. Добавляем состояние загрузки
    const handleDelete = async (projectId) => {
        try {
            await apiClient.delete(`/projects/${projectId}`);
            message.success(t('projects.deleteSuccess', { defaultValue: 'Project deleted successfully' }));
            // Нам нужна функция fetch, чтобы ее здесь вызвать
            // Давайте переименуем ее и вынесем наружу useEffect
            fetchProjects();
        } catch (error) {
            console.error("Failed to delete project", error);
            message.error(t('projects.deleteError', { defaultValue: 'Failed to delete project' }));
        }
    };

    // --- 3. Полностью заменяем useEffect ---
    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/projects/');
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
                    <Flex justify="space-between" align="center" className="!mb-4">
                        <Title level={2} className="!m-0">{t('menu.archive', {defaultValue: 'Archive'})}</Title>
                    </Flex>

                    <List
                        loading={loading} // <-- 4. Используем состояние загрузки
                        itemLayout="vertical"
                        dataSource={projects}
                        rowKey={(item) => item.id}
                        renderItem={(item) => (
                            <List.Item
                                onClick={() => navigate(`/projects/${item.id}`)}
                                style={{ cursor: 'pointer' }}
                                actions={[
                                    <Tag key="kunde">{item.kunde || '—'}</Tag>,
                                    <Tag key="status" color="green">
                                        {t(`projects.status.${item.status}`, { defaultValue: item.status })}
                                    </Tag>,
                                    user.role === 'admin' && ( // Показываем кнопку только админам
                                        <Popconfirm
                                            key="delete"
                                            title={t('projects.deleteConfirmTitle', { defaultValue: 'Delete the project?' })}
                                            description={t('projects.deleteConfirmDesc', { defaultValue: 'Are you sure you want to delete this project?' })}
                                            onConfirm={(e) => {
                                                e.stopPropagation();
                                                handleDelete(item.id);
                                            }}
                                            onCancel={(e) => e.stopPropagation()}
                                            okText={t('common.yes', { defaultValue: 'Yes' })}
                                            cancelText={t('common.no', { defaultValue: 'No' })}
                                        >
                                            <Button
                                                danger
                                                icon={<DeleteOutlined />}
                                                size="small"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </Popconfirm>
                                    )
                                ]}
                            >
                                <List.Item.Meta
                                    title={item.name}
                                    description={`${t('projects.manager', { defaultValue: 'Manager' })}: ${item.manager || '—'}`}
                                />
                            </List.Item>
                        )}
                    />
                </Content>
            </Layout>
        </Layout>
    );
}