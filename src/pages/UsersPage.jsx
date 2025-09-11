// src/pages/UsersPage.jsx
import React, { useState } from 'react';
import { Layout, Typography, Button, Flex, Table, Tag, Modal, Form } from 'antd';
import { useAuth } from '../context/AuthContext';
import LanguageSwitch from '../components/LanguageSwitch';
import NavigationTab from '../components/NavigationTab';
import AddUserForm from '../components/AddUserForm';
import { LogoutOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { mockUsers } from '../services/mockData';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function UsersPage() {
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const [form] = Form.useForm();

    // список пользователей
    const [userList, setUserList] = useState(Object.values(mockUsers));
    // состояние модалки
    const [isModalVisible, setIsModalVisible] = useState(false);
    // режим редактирования
    const [editingUser, setEditingUser] = useState(null); // null => создаём

    // открыть модалку на создание
    const openAddModal = () => {
        setEditingUser(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    // открыть модалку на редактирование
    const openEditModal = (record) => {
        setEditingUser(record);
        form.setFieldsValue(record);     // префилл формы данными строки
        setIsModalVisible(true);
    };

    // общий submit: create или update
    const handleSubmit = (values) => {
        if (editingUser) {
            // обновляем по username (username в форме при редактировании мы заблокируем)
            setUserList(prev =>
                prev.map(u => (u.username === editingUser.username ? { ...u, ...values } : u))
            );
        } else {
            // добавление (у вас раньше был синтаксический баг со спредом)
            setUserList(prev => [...prev, { ...values }]);
        }
        setIsModalVisible(false);
        setEditingUser(null);
        form.resetFields();
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingUser(null);
        form.resetFields();
    };

    const columns = [
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

                    <Table dataSource={userList} columns={columns} rowKey="username" />
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
