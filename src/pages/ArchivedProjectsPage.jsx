// src/pages/ArchivedProjectsPage.jsx
import React, { useEffect, useState } from 'react';
import { Layout, Typography, Button, Flex, List, Tag, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { LogoutOutlined } from '@ant-design/icons';
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

    // --- 3. Полностью заменяем useEffect ---
    useEffect(() => {
        const fetchArchivedProjects = async () => {
            setLoading(true);
            try {
                // Запрашиваем ВСЕ проекты, доступные пользователю
                const response = await apiClient.get('/projects/');
                // Фильтруем на стороне фронтенда, оставляя только завершенные
                const finishedProjects = response.data.filter(p => p.status === 'finished');
                setProjects(finishedProjects);
            } catch (error) {
                console.error("Failed to fetch archived projects", error);
                message.error(t('archive.fetchError', { defaultValue: "Failed to load archived projects." }));
            } finally {
                setLoading(false);
            }
        };

        fetchArchivedProjects();
    }, [user]); // Оставляем user в зависимостях, чтобы список обновлялся при смене пользователя

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