// src/pages/ProjectsListPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Layout, Typography, Button, Flex, List, Tag, Modal, Form, Input, Select, message, Popconfirm } from 'antd';
import { PlusOutlined, LogoutOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitch from '../components/LanguageSwitch';
import NavigationTab from '../components/NavigationTab';
import AddProjectForm from '../components/AddProjectForm';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api'; // Импортируем наш API клиент
import { mockUsers } from '../services/mockData';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

export default function ProjectsListPage() {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [projects, setProjects] = useState([]);
    const [templates, setTemplates] = useState([]); // Это состояние остается
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const handleDelete = async (projectId) => {
        try {
            await apiClient.delete(`/projects/${projectId}`);
            message.success(t('projects.deleteSuccess', { defaultValue: 'Project deleted successfully' }));
            fetchProjects(); // Обновляем список проектов
        } catch (error) {
            console.error("Failed to delete project", error);
            message.error(t('projects.deleteError', { defaultValue: 'Failed to delete project' }));
        }
    };

    // Получаем список менеджеров по-старому, пока у нас нет для этого эндпоинта
    const managers = useMemo(() =>
            Object.values(mockUsers).filter(u => u.role === 'manager').map(m => m.name)
        , []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/projects/');
            setProjects(response.data);
        } catch (error) {
            console.error("Failed to fetch projects", error);
            message.error(t('projects.fetchError', { defaultValue: "Failed to load projects." }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            fetchProjects(); // Загружаем проекты

            // Загружаем шаблоны с API
            try {
                const templatesResponse = await apiClient.get('/templates/');
                setTemplates(templatesResponse.data);
            } catch (error) {
                console.error("Failed to fetch templates", error);
                message.error("Failed to load templates.");
            }
        };

        fetchInitialData();
    }, [user]); // Зависимость user остается

    const activeProjects = useMemo(() => {
        return projects.filter(p => p.status !== 'finished');
    }, [projects]);

    // Логика фильтрации остается без изменений
    const [filters, setFilters] = useState({ q: '', kunde: 'all', status: 'all' });
    const kundeOptions = useMemo(() => {
        const set = new Set(activeProjects.map(p => p.kunde).filter(Boolean));
        return ['all', ...Array.from(set)];
    }, [activeProjects]);
    const filtered = useMemo(() => {
        return activeProjects.filter(p => {
            const byQ = !filters.q || p.name.toLowerCase().includes(filters.q.toLowerCase()) || (p.kunde || '').toLowerCase().includes(filters.q.toLowerCase());
            const byKunde = filters.kunde === 'all' || p.kunde === filters.kunde;
            const byStatus = filters.status === 'all' || p.status === filters.status;
            return byQ && byKunde && byStatus;
        });
    }, [activeProjects, filters]);


    const canCreate = user?.role === 'auditor' || user?.role === 'admin';

    const openCreate = () => {
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleCreate = async (values) => {
        try {
            await apiClient.post('/projects/', values);
            message.success(t('projects.createSuccess', { defaultValue: 'Project created successfully!' }));
            setIsModalVisible(false);
            fetchProjects(); // Перезагружаем список проектов
        } catch (error) {
            console.error("Failed to create project", error);
            const errorMsg = error.response?.data?.detail || 'An unexpected error occurred.';
            message.error(errorMsg);
        }
    };

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
                    <NavigationTab activeKey="/projects" />
                </Sider>

                <Content className="p-6 bg-gray-50">
                    <Flex justify="space-between" align="center" className="!mb-4">
                        <Title level={2} className="!m-0">{t('projects.allProjects')}</Title>
                        {canCreate && (
                            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                                {t('projects.create')}
                            </Button>
                        )}
                    </Flex>

                    {/* Фильтры остаются без изменений */}
                    <Flex wrap="wrap" gap="small" className="!mb-4">
                        <Input allowClear placeholder={t('projects.filters.search')} value={filters.q} onChange={e => setFilters(f => ({ ...f, q: e.target.value }))} style={{ maxWidth: 240 }}/>
                        <Select value={filters.kunde} onChange={v => setFilters(f => ({ ...f, kunde: v }))} style={{ width: 200 }}>
                            {kundeOptions.map(k => (<Option key={k} value={k}>{k === 'all' ? t('projects.filters.kundeAll') : k}</Option>))}
                        </Select>
                        <Select value={filters.status} onChange={v => setFilters(f => ({ ...f, status: v }))} style={{ width: 200 }}>
                            <Option value="all">{t('projects.filters.statusAll')}</Option>
                            <Option value="in_progress">{t('projects.status.in_progress')}</Option>
                            <Option value="on_hold">{t('projects.status.on_hold')}</Option>
                        </Select>
                        <Button onClick={() => setFilters({ q: '', kunde: 'all', status: 'all' })}>{t('projects.filters.reset')}</Button>
                    </Flex>

                    <List
                        loading={loading} // Добавляем индикатор загрузки
                        itemLayout="vertical"
                        dataSource={filtered}
                        rowKey={(item) => item.id}
                        renderItem={(item) => (
                            <List.Item
                                onClick={() => navigate(`/projects/${item.id}`)}
                                style={{ cursor: 'pointer' }}
                                actions={[
                                    <Tag key="kunde">{item.kunde || '—'}</Tag>,
                                    <Tag key="status" color={item.status === 'in_progress' ? 'geekblue' : 'gold'}>{t(`projects.status.${item.status}`, { defaultValue: item.status })}</Tag>,
                                    user.role === 'admin' && ( // Показываем кнопку только админам
                                        <Popconfirm
                                            key="delete"
                                            title={t('projects.deleteConfirmTitle', { defaultValue: 'Delete the project?' })}
                                            description={t('projects.deleteConfirmDesc', { defaultValue: 'Are you sure you want to delete this project?' })}
                                            onConfirm={(e) => {
                                                e.stopPropagation(); // Останавливаем клик, чтобы не перейти на страницу проекта
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
                                                onClick={(e) => e.stopPropagation()} // Останавливаем клик и здесь
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

                    <Modal
                        title={t('projects.create')}
                        open={isModalVisible}
                        onCancel={() => setIsModalVisible(false)}
                        onOk={() => form.submit()}
                        okText={t('common.createOk', { defaultValue: 'Create' })}
                        cancelText={t('common.cancel', { defaultValue: 'Cancel' })}
                    >
                        <AddProjectForm form={form} onFinish={handleCreate} managers={managers} templates={templates} />
                    </Modal>
                </Content>
            </Layout>
        </Layout>
    );
}