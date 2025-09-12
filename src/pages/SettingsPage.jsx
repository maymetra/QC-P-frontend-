// src/pages/SettingsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Layout, Typography, Divider, Button, Flex, Modal, Form, Input, Transfer, List, Popconfirm } from 'antd';
import { useAuth } from '../context/AuthContext';
import LanguageSwitch from '../components/LanguageSwitch';
import NavigationTab from '../components/NavigationTab';
import { LogoutOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getTemplates, saveTemplate, deleteTemplate, getKnowledgeBaseItems } from '../services/mockData';

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const modalContentRef = useRef(null); // <-- Создаем ref для содержимого модального окна

    // ... (состояния и функции без изменений) ...
    const [templates, setTemplates] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [targetKeys, setTargetKeys] = useState([]);
    const [knowledgeBaseItems, setKnowledgeBaseItems] = useState([]);

    useEffect(() => {
        setTemplates(getTemplates());
        setKnowledgeBaseItems(getKnowledgeBaseItems());
    }, []);

    const refreshTemplates = () => setTemplates(getTemplates());

    const openCreateModal = () => {
        setEditingTemplate(null);
        form.resetFields();
        setTargetKeys([]);
        setIsModalVisible(true);
    };

    const openEditModal = (template) => {
        setEditingTemplate(template);
        form.setFieldsValue({ name: template.name });
        setTargetKeys(template.items);
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingTemplate(null);
    };

    const handleSave = (values) => {
        saveTemplate(values.name, targetKeys);
        refreshTemplates();
        handleCancel();
    };

    const handleDelete = (name) => {
        deleteTemplate(name);
        refreshTemplates();
    };

    const onTransferChange = (newTargetKeys) => {
        setTargetKeys(newTargetKeys);
    };

    const renderTemplateManager = () => (
        <>
            <Flex justify="space-between" align="center">
                <Title level={3}>{t('settingsPage.templates.title')}</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                    {t('settingsPage.templates.create', {defaultValue: 'Create Template'})}
                </Button>
            </Flex>
            <Paragraph>{t('settingsPage.templates.description')}</Paragraph>
            <List
                bordered
                dataSource={templates}
                renderItem={item => (
                    <List.Item
                        actions={[
                            <Button icon={<EditOutlined />} onClick={() => openEditModal(item)} />,
                            <Popconfirm
                                title={t('settingsPage.templates.deleteConfirm', {defaultValue: 'Delete this template?'})}
                                onConfirm={() => handleDelete(item.name)}
                            >
                                <Button danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                        ]}
                    >
                        <List.Item.Meta
                            title={item.name}
                            description={`${item.items.length} items`}
                        />
                    </List.Item>
                )}
            />
            <Modal
                title={editingTemplate ? t('settingsPage.templates.editTitle', {defaultValue: 'Edit Template'}) : t('settingsPage.templates.createTitle', {defaultValue: 'Create New Template'})}
                open={isModalVisible}
                onCancel={handleCancel}
                onOk={() => form.submit()}
                width={1200}
                destroyOnClose
            >
                <div ref={modalContentRef}> {/* <-- Привязываем ref к контейнеру */}
                    <Form form={form} layout="vertical" onFinish={handleSave}>
                        <Form.Item
                            name="name"
                            label={t('settingsPage.templates.name', {defaultValue: 'Template Name'})}
                            rules={[{ required: true }]}
                        >
                            <Input disabled={!!editingTemplate}/>
                        </Form.Item>
                        <Form.Item label={t('settingsPage.templates.items', {defaultValue: 'Inspection Items'})}>
                            <Transfer
                                dataSource={knowledgeBaseItems}
                                targetKeys={targetKeys}
                                onChange={onTransferChange}
                                render={item => item.title}
                                listStyle={{ width: 600, height: 400 }}
                                showSearch
                                getPopupContainer={() => modalContentRef.current}
                            />
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
        </>
    );

    const renderPersonalSettings = () => (
        <>
            <Title level={3}>{t('settingsPage.personal.title')}</Title>
            <Paragraph>{t('settingsPage.personal.description')}</Paragraph>
        </>
    );

    const renderGlobalSettings = () => (
        <>
            <Title level={3}>{t('settingsPage.global.title')}</Title>
            <Paragraph>{t('settingsPage.global.description')}</Paragraph>
        </>
    );

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header className="flex justify-between items-center bg-gray-900 px-6 shadow-sm">
                <h1 className="futuristic text-2xl sm:text-3xl m-0 leading-none">
                    QUALITY CONTROL
                </h1>
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
                    <NavigationTab activeKey="/settings" />
                </Sider>

                <Content className="p-6 bg-gray-50">
                    <Title level={2} className="!mb-6">{t('settingsPage.title')}</Title>

                    {user.role === 'auditor' && renderTemplateManager()}
                    {user.role === 'auditor' && <Divider />}

                    {(user.role === 'admin' || user.role === 'auditor' || user.role === 'manager') && renderPersonalSettings()}

                    {user.role === 'admin' && <Divider />}
                    {user.role === 'admin' && renderGlobalSettings()}
                </Content>
            </Layout>
        </Layout>
    );
}