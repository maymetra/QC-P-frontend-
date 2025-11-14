// src/pages/UsersPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Typography, Button, Flex, Table, Tag, Modal, Form, message, Alert, Space } from 'antd';
import { useAuth } from '../context/AuthContext';
import LanguageSwitch from '../components/LanguageSwitch';
import NavigationTab from '../components/NavigationTab';
import AddUserForm from '../components/AddUserForm';
import { LogoutOutlined, PlusOutlined, UserAddOutlined, ExclamationCircleOutlined, } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import apiClient from '../services/api';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function UsersPage() {
    const { user, logout, fetchNotificationCount } = useAuth();
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const [userList, setUserList] = useState([]);
    const [projects, setProjects] = useState([]); // Добавляем состояние для проектов
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Загружаем и пользователей, и проекты параллельно
            const [usersRes, projectsRes] = await Promise.all([
                apiClient.get('/users/'),
                apiClient.get('/projects/')
            ]);
            setUserList(usersRes.data);
            setProjects(projectsRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
            message.error(t('usersPage.fetchError', {defaultValue: 'Failed to load data.'}));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Вычисляем "неизвестных" менеджеров
    const unknownManagers = useMemo(() => {
        const existingNames = new Set(userList.map(u => u.name));
        // Получаем список уникальных имен менеджеров из проектов
        const projectManagers = new Set(projects.map(p => p.manager).filter(Boolean));

        // Фильтруем тех, кого нет в списке пользователей
        const unknown = [];
        projectManagers.forEach(mgr => {
            if (!existingNames.has(mgr)) {
                unknown.push(mgr);
            }
        });
        return unknown;
    }, [userList, projects]);

    const openAddModal = (prefilledName = '') => {
        setEditingUser(null);
        form.resetFields();
        if (prefilledName) {
            form.setFieldsValue({ name: prefilledName, role: 'manager' });
        }
        setIsModalVisible(true);
    };

    const openEditModal = (record) => {
        setEditingUser(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingUser(null);
    };

    const handleSubmit = async (values) => {
        try {
            if (editingUser) {
                await apiClient.put(`/users/${editingUser.id}`, values);
                message.success(t('usersPage.updateSuccess', {defaultValue: 'User updated successfully'}));
            } else {
                await apiClient.post('/auth/register', values);
                message.success(t('usersPage.createSuccess', {defaultValue: 'User created successfully'}));
            }
            fetchData(); // Обновляем данные
            handleCancel();
            fetchNotificationCount(user);
        } catch (error) {
            console.error("Failed to save user", error);
            const errorMsg = error.response?.data?.detail || 'An unexpected error occurred.';
            message.error(errorMsg);
        }
    };

    const columns = [
        {
            title: t('usersPage.table.name'),
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {text}
                    {/* Показываем иконку, если requested reset */}
                    {record.password_reset_needed && (
                        <Tooltip title={t('usersPage.resetRequested', {defaultValue: 'Password Reset Requested'})}>
                            <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '16px' }} />
                        </Tooltip>
                    )}
                </div>
            )
        },
        { title: t('usersPage.table.name'), dataIndex: 'name', key: 'name' },
        { title: t('usersPage.table.username'), dataIndex: 'username', key: 'username' },
        {
            title: t('usersPage.table.role'),
            dataIndex: 'role',
            key: 'role',
            render: role => {
                let color = 'geekblue';
                if (role === 'admin') color = 'volcano';
                if (role === 'auditor') color = 'green';
                return <Tag color={color}>{role?.toUpperCase?.() || role}</Tag>;
            }
        },
        {
            title: t('usersPage.table.action'),
            key: 'action',
            render: (_, record) => (
                <Button size="small" onClick={() => openEditModal(record)}>
                    {t('usersPage.table.edit')}
                </Button>
            ),
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header className="flex justify-between items-center bg-gray-900 px-6 shadow-sm">
                <h1 className="futuristic text-2xl sm:text-3xl m-0 leading-none">QUALITY CONTROL</h1>
                <Flex align="center" gap="middle">
                    <Text style={{ color: 'white' }}>{user?.name}</Text>
                    <LanguageSwitch />
                    <Button ghost icon={<LogoutOutlined />} onClick={logout}>
                        {t('logout')}
                    </Button>
                </Flex>
            </Header>

            <Layout>
                <Sider width={220} className="bg-white shadow-sm">
                    <NavigationTab activeKey="/users" />
                </Sider>

                <Content className="p-6 bg-gray-50">
                    <Flex justify="space-between" align="center" className="!mb-6">
                        <Title level={2} className="!m-0">{t('usersPage.title')}</Title>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => openAddModal()}>
                            {t('usersPage.addUser')}
                        </Button>
                    </Flex>

                    {/* Блок уведомлений о неизвестных менеджерах */}
                    {unknownManagers.length > 0 && (
                        <Alert
                            message="Pending Manager Profiles"
                            description={
                                <div style={{ marginTop: 8 }}>
                                    <Text>The following managers are assigned to projects but do not have a user profile:</Text>
                                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {unknownManagers.map(name => (
                                            <Flex key={name} justify="space-between" align="center" style={{ background: '#fff', padding: '8px 12px', borderRadius: 4, border: '1px solid #d9d9d9' }}>
                                                <Text strong>{name}</Text>
                                                <Button
                                                    size="small"
                                                    type="primary"
                                                    ghost
                                                    icon={<UserAddOutlined />}
                                                    onClick={() => openAddModal(name)}
                                                >
                                                    Create Profile
                                                </Button>
                                            </Flex>
                                        ))}
                                    </div>
                                </div>
                            }
                            type="warning"
                            showIcon
                            style={{ marginBottom: 24 }}
                        />
                    )}

                    <Table
                        dataSource={userList}
                        columns={columns}
                        rowKey="id"
                        loading={loading}
                    />
                </Content>
            </Layout>

            <Modal
                title={editingUser ? t('usersPage.addUserModal.editTitle') : t('usersPage.addUserModal.title')}
                open={isModalVisible}
                onCancel={handleCancel}
                onOk={() => form.submit()}
                okText={editingUser ? t('usersPage.addUserModal.save') : t('usersPage.addUserModal.create')}
                cancelText={t('usersPage.addUserModal.cancel')}
            >
                <AddUserForm form={form} onFinish={handleSubmit} isEditing={!!editingUser} />
            </Modal>
        </Layout>
    );
}