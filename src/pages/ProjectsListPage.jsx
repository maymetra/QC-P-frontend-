// src/pages/ProjectsListPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Layout, Typography, Button, Flex, List, Tag, Modal, Form, Input, Select, message, Popconfirm, DatePicker, Space } from 'antd';
import { PlusOutlined, LogoutOutlined, DeleteOutlined, CalendarOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons'; // Добавили иконки
import dayjs from 'dayjs'; // Импорт dayjs для работы с датами
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitch from '../components/LanguageSwitch';
import NavigationTab from '../components/NavigationTab';
import AddProjectForm from '../components/AddProjectForm';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function ProjectsListPage() {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [projects, setProjects] = useState([]);
    const [managers, setManagers] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

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
            fetchProjects();

            try {
                const templatesResponse = await apiClient.get('/templates/');
                setTemplates(templatesResponse.data);
            } catch (error) {
                console.error("Failed to fetch templates", error);
                message.error("Failed to load templates.");
            }

            // Загружаем список менеджеров
            if (user?.role === 'admin' || user?.role === 'auditor') {
                try {
                    const managersResponse = await apiClient.get('/users/managers');
                    setManagers(managersResponse.data.map(m => m.name));
                } catch (error) {
                    console.error("Failed to fetch managers", error);
                    message.error("Failed to load managers list.");
                }
            }
        };

        fetchInitialData();
    }, [user]);

    const activeProjects = useMemo(() => {
        return projects.filter(p => p.status !== 'finished');
    }, [projects]);

    const [filters, setFilters] = useState({
        q: '',
        kunde: 'all',
        status: 'all',
        sortBy: 'name_asc',
        dateRange: null
    });

    const kundeOptions = useMemo(() => {
        const set = new Set(activeProjects.map(p => p.kunde).filter(Boolean));
        return ['all', ...Array.from(set)];
    }, [activeProjects]);

    const filtered = useMemo(() => {
        let result = activeProjects.filter(p => {
            const byQ = !filters.q || p.name.toLowerCase().includes(filters.q.toLowerCase()) || (p.kunde || '').toLowerCase().includes(filters.q.toLowerCase());
            const byKunde = filters.kunde === 'all' || p.kunde === filters.kunde;
            const byStatus = filters.status === 'all' || p.status === filters.status;

            // Фильтр по дате (если задан диапазон)
            let byDate = true;
            if (filters.dateRange && p.planned_end_date) {
                const start = filters.dateRange[0];
                const end = filters.dateRange[1];
                const pDate = dayjs(p.planned_end_date);
                byDate = (pDate.isSame(start, 'day') || pDate.isAfter(start, 'day')) &&
                    (pDate.isSame(end, 'day') || pDate.isBefore(end, 'day'));
            } else if (filters.dateRange && !p.planned_end_date) {
                // Если фильтр есть, а даты у проекта нет — скрываем (или показываем, зависит от логики)
                byDate = false;
            }

            return byQ && byKunde && byStatus && byDate;
        });

        // Сортировка
        result.sort((a, b) => {
            if (filters.sortBy === 'name_asc') return a.name.localeCompare(b.name);
            if (filters.sortBy === 'name_desc') return b.name.localeCompare(a.name);

            if (filters.sortBy === 'date_asc') {
                if (!a.planned_end_date) return 1; // Без даты — в конец
                if (!b.planned_end_date) return -1;
                return dayjs(a.planned_end_date).unix() - dayjs(b.planned_end_date).unix();
            }
            if (filters.sortBy === 'date_desc') {
                if (!a.planned_end_date) return 1;
                if (!b.planned_end_date) return -1;
                return dayjs(b.planned_end_date).unix() - dayjs(a.planned_end_date).unix();
            }
            return 0;
        });

        return result;
    }, [activeProjects, filters]);

    const canCreate = user?.role === 'auditor' || user?.role === 'admin';

    const openCreate = () => {
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleCreate = async (values) => {
        const payload = {
            ...values,
            basePlannedDate: values.basePlannedDate ? values.basePlannedDate.format('YYYY-MM-DD') : null,
        };

        try {
            await apiClient.post('/projects/', payload);
            message.success(t('projects.createSuccess', { defaultValue: 'Project created successfully!' }));
            setIsModalVisible(false);
            fetchProjects();
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

                    <Flex wrap="wrap" gap="small" className="!mb-4" align="center">
                        <Input
                            allowClear
                            placeholder={t('projects.filters.search')}
                            value={filters.q}
                            onChange={e => setFilters(f => ({ ...f, q: e.target.value }))}
                            style={{ maxWidth: 200 }}
                        />
                        <Select
                            value={filters.kunde}
                            onChange={v => setFilters(f => ({ ...f, kunde: v }))}
                            style={{ width: 160 }}
                        >
                            {kundeOptions.map(k => (<Option key={k} value={k}>{k === 'all' ? t('projects.filters.kundeAll') : k}</Option>))}
                        </Select>
                        <Select
                            value={filters.status}
                            onChange={v => setFilters(f => ({ ...f, status: v }))}
                            style={{ width: 140 }}
                        >
                            <Option value="all">{t('projects.filters.statusAll')}</Option>
                            <Option value="in_progress">{t('projects.status.in_progress')}</Option>
                            <Option value="on_hold">{t('projects.status.on_hold')}</Option>
                        </Select>

                        {/* Сортировка */}
                        <Select
                            value={filters.sortBy}
                            onChange={v => setFilters(f => ({ ...f, sortBy: v }))}
                            style={{ width: 180 }}
                            options={[
                                { value: 'name_asc', label: 'Name (A-Z)' },
                                { value: 'name_desc', label: 'Name (Z-A)' },
                                { value: 'date_asc', label: 'Date (Earliest)' },
                                { value: 'date_desc', label: 'Date (Latest)' },
                            ]}
                        />

                        {/* Фильтр по дате */}
                        <RangePicker
                            onChange={(dates) => setFilters(f => ({ ...f, dateRange: dates }))}
                            style={{ maxWidth: 240 }}
                            placeholder={['Start', 'End']}
                        />

                        <Button onClick={() => setFilters({ q: '', kunde: 'all', status: 'all', sortBy: 'name_asc', dateRange: null })}>
                            {t('projects.filters.reset')}
                        </Button>
                    </Flex>

                    <List
                        loading={loading}
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
                                    item.planned_end_date && (
                                        <Tag key="date" icon={<CalendarOutlined />} color="cyan">
                                            {dayjs(item.planned_end_date).format('DD.MM.YYYY')}
                                        </Tag>
                                    ),
                                    user.role === 'admin' && (
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
                                    title={<Space>
                                        {item.name}
                                        {/* Можно добавить индикатор, если дата просрочена */}
                                        {item.planned_end_date && dayjs(item.planned_end_date).isBefore(dayjs(), 'day') && item.status !== 'finished' && (
                                            <Tag color="error">
                                                {t('projects.overdue', { defaultValue: 'Overdue' })}
                                            </Tag>
                                        )}
                                    </Space>}
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