// src/pages/UsersPage.jsx
import React, { useState, useEffect } from 'react';
import { Layout, Typography, Button, Flex, Table, Tag, Modal, Form, message } from 'antd';
import { useAuth } from '../context/AuthContext';
import LanguageSwitch from '../components/LanguageSwitch';
import NavigationTab from '../components/NavigationTab';
import AddUserForm from '../components/AddUserForm';
import { LogoutOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import apiClient from '../services/api'; // Импортируем наш API клиент

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function UsersPage() {
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const [userList, setUserList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/users/');
            setUserList(response.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
            message.error(t('usersPage.fetchError', {defaultValue: 'Failed to load users.'}));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const openAddModal = () => {
        setEditingUser(null);
        form.resetFields();
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
                // Режим обновления
                await apiClient.put(`/users/${editingUser.id}`, values);
                message.success(t('usersPage.updateSuccess', {defaultValue: 'User updated successfully'}));
            } else {
                // Режим создания (используем эндпоинт регистрации)
                await apiClient.post('/auth/register', values);
                message.success(t('usersPage.createSuccess', {defaultValue: 'User created successfully'}));
            }
            fetchUsers(); // Обновляем список
            handleCancel();
        } catch (error) {
            console.error("Failed to save user", error);
            const errorMsg = error.response?.data?.detail || 'An unexpected error occurred.';
            message.error(errorMsg);
        }
    };

    const columns = [
        // ... (колонки остаются без изменений) ...
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
                        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
                            {t('usersPage.addUser')}
                        </Button>
                    </Flex>

                    <Table
                        dataSource={userList}
                        columns={columns}
                        rowKey="id" // Используем id в качестве ключа
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