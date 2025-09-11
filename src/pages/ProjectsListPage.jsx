// src/pages/ProjectsListPage.jsx
import React, {useEffect, useMemo, useState} from 'react';
import { Layout, Typography, Button, Flex, List, Tag, Modal, Form, Input, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { PlusOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import LanguageSwitch from '../components/LanguageSwitch';
import NavigationTab from '../components/NavigationTab';
import AddProjectForm from '../components/AddProjectForm';
import { createProject, filterProjectsForUser } from '../services/mockData';
import { useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

export default function ProjectsListPage() {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const navigate = useNavigate(); // <-- ПЕРЕНЕСЕНО СЮДА

    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [projects, setProjects] = useState([]);
    useEffect(() => {
        setProjects(filterProjectsForUser(user));
        }, [user]);
    const [filters, setFilters] = useState({ q: '', kunde: 'all', status: 'all' });

    const kundeOptions = useMemo(() => {
        const set = new Set(projects.map(p => p.kunde).filter(Boolean));
        return ['all', ...Array.from(set)];
    }, [projects]);

    const filtered = useMemo(() => {
        return projects.filter(p => {
            const byQ =
                !filters.q ||
                p.name.toLowerCase().includes(filters.q.toLowerCase()) ||
                (p.kunde || '').toLowerCase().includes(filters.q.toLowerCase());
            const byKunde = filters.kunde === 'all' || p.kunde === filters.kunde;
            const byStatus = filters.status === 'all' || p.status === filters.status;
            return byQ && byKunde && byStatus;
        });
    }, [projects, filters]);

    const canCreate = user?.role === 'auditor' || user?.role === 'admin';

    const openCreate = () => {
        form.resetFields();
        setIsModalVisible(true);
    };
    const closeCreate = () => setIsModalVisible(false);

    const handleCreate = values => {
        const newProject = createProject(values);
        setProjects(filterProjectsForUser(user));
        setIsModalVisible(false);
        form.resetFields();
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

                    {/* Фильтры */}
                    <Flex wrap="wrap" gap="small" className="!mb-4">
                        <Input
                            allowClear
                            placeholder={t('projects.filters.search')}
                            value={filters.q}
                            onChange={e => setFilters(f => ({ ...f, q: e.target.value }))}
                            style={{ maxWidth: 240 }}
                        />
                        <Select
                            value={filters.kunde}
                            onChange={v => setFilters(f => ({ ...f, kunde: v }))}
                            style={{ width: 200 }}
                        >
                            {kundeOptions.map(k => (
                                <Option key={k} value={k}>
                                    {k === 'all' ? t('projects.filters.kundeAll') : k}
                                </Option>
                            ))}
                        </Select>
                        <Select
                            value={filters.status}
                            onChange={v => setFilters(f => ({ ...f, status: v }))}
                            style={{ width: 200 }}
                        >
                            <Option value="all">{t('projects.filters.statusAll')}</Option>
                            <Option value="in_progress">{t('projects.status.in_progress')}</Option>
                            <Option value="finished">{t('projects.status.finished')}</Option>
                            <Option value="on_hold">{t('projects.status.on_hold')}</Option>
                        </Select>
                        <Button onClick={() => setFilters({ q: '', kunde: 'all', status: 'all' })}>
                            {t('projects.filters.reset')}
                        </Button>
                    </Flex>

                    {/* Список проектов */}
                    <List
                        itemLayout="vertical"
                        dataSource={filtered}
                        rowKey={(item) => item.id}
                        renderItem={(item) => (
                            <List.Item
                                onClick={() => navigate(`/projects/${item.id}`)}
                                style={{ cursor: 'pointer' }}
                                actions={[
                                    <Tag key="kunde">{item.kunde || '—'}</Tag>,
                                    <Tag
                                        key="status"
                                        color={
                                            item.status === 'finished'
                                                ? 'green'
                                                : item.status === 'in_progress'
                                                    ? 'geekblue'
                                                    : 'gold'
                                        }
                                    >
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

                    {/* Модалка создания */}
                    <Modal
                        title={t('projects.create')}
                        open={isModalVisible}
                        onCancel={closeCreate}
                        onOk={() => form.submit()}
                        okText={t('common.createOk', { defaultValue: t('projects.create') })}
                        cancelText={t('common.cancel', { defaultValue: 'Cancel' })}
                    >
                        <AddProjectForm form={form} onFinish={handleCreate} />
                    </Modal>
                </Content>
            </Layout>
        </Layout>
    );
}
