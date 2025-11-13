// src/pages/TemplatesPage.jsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { Layout, Typography, Divider, Button, Flex, Modal, Form, Input, Transfer, List, Popconfirm, message, AutoComplete } from 'antd';
import { useAuth } from '../context/AuthContext';
import LanguageSwitch from '../components/LanguageSwitch';
import NavigationTab from '../components/NavigationTab';
import { LogoutOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import apiClient from '../services/api';

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function TemplatesPage() {
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const [templateForm] = Form.useForm();
    const [kbForm] = Form.useForm(); // <-- ВОССТАНОВЛЕНО
    const modalContentRef = useRef(null);
    const isAuthorized = user?.role === 'admin' || user?.role === 'auditor';
    if (!isAuthorized) {
        // Если роль не совпадает, перенаправляем на главную страницу проектов
        return <Navigate to="/projects" replace />;
    }
    // Состояния для Шаблонов
    const [templates, setTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [targetKeys, setTargetKeys] = useState([]);

    // Состояния для Базы Знаний
    const [knowledgeBaseItems, setKnowledgeBaseItems] = useState([]);
    const [loadingKB, setLoadingKB] = useState(false);
    const [isKbModalVisible, setIsKbModalVisible] = useState(false); // <-- ВОССТАНОВЛЕНО

    const fetchTemplates = async () => {
        setLoadingTemplates(true);
        try {
            const response = await apiClient.get('/templates/');
            setTemplates(response.data);
        } catch (error) {
            console.error("Failed to fetch templates", error);
            message.error('Failed to load templates.');
        } finally {
            setLoadingTemplates(false);
        }
    };

    const fetchKnowledgeBase = async () => {
        setLoadingKB(true);
        try {
            const kbResponse = await apiClient.get('/knowledge-base/');
            const formattedItems = kbResponse.data.map(item => ({
                key: item.item,
                title: item.item,
                category: item.category,
            }));
            setKnowledgeBaseItems(formattedItems);
        } catch (error) {
            console.error("Failed to fetch knowledge base", error);
            message.error("Failed to load knowledge base items.");
        } finally {
            setLoadingKB(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
        fetchKnowledgeBase();
    }, []);

    // --- Логика для модалки ШАБЛОНОВ ---
    const openCreateTemplateModal = () => {
        setEditingTemplate(null);
        templateForm.resetFields();
        setTargetKeys([]);
        setIsTemplateModalVisible(true);
    };

    const openEditTemplateModal = (template) => {
        setEditingTemplate(template);
        templateForm.setFieldsValue({ name: template.name });
        setTargetKeys(template.items);
        setIsTemplateModalVisible(true);
    };

    const handleTemplateCancel = () => {
        setIsTemplateModalVisible(false);
        setEditingTemplate(null);
    };

    const handleTemplateSave = async (values) => {
        const payload = {
            name: values.name,
            items: targetKeys,
        };

        try {
            if (editingTemplate) {
                await apiClient.put(`/templates/${editingTemplate.id}`, payload);
                message.success(`Template "${values.name}" updated successfully!`);
            } else {
                await apiClient.post('/templates/', payload);
                message.success(`Template "${values.name}" created successfully!`);
            }
            fetchTemplates();
            handleTemplateCancel();
        } catch (error) {
            console.error("Failed to save template", error);
            message.error(error.response?.data?.detail || 'Failed to save template.');
        }
    };

    const handleTemplateDelete = async (template) => {
        try {
            await apiClient.delete(`/templates/${template.id}`);
            message.success(`Template "${template.name}" deleted.`);
            fetchTemplates();
        } catch (error) {
            console.error("Failed to delete template", error);
            message.error('Failed to delete template.');
        }
    };

    const onTransferChange = (newTargetKeys) => {
        setTargetKeys(newTargetKeys);
    };

    // --- Логика для модалки БАЗЫ ЗНАНИЙ (ВОССТАНОВЛЕНО) ---
    const openKbModal = () => {
        kbForm.resetFields();
        setIsKbModalVisible(true);
    };

    const handleKbCancel = () => {
        setIsKbModalVisible(false);
    };

    const handleKbSave = async (values) => {
        try {
            await apiClient.post('/knowledge-base/', values);
            message.success('New item added to Knowledge Base!');
            handleKbCancel();
            fetchKnowledgeBase(); // Обновляем список КБ
        } catch (error) {
            console.error("Failed to add KB item", error);
            message.error(error.response?.data?.detail || "Failed to add item.");
        }
    };

    const existingCategoryOptions = useMemo(() => {
        const categories = new Set(knowledgeBaseItems.map(item => item.category));
        return Array.from(categories).sort().map(cat => ({ value: cat }));
    }, [knowledgeBaseItems]);


    const renderTemplateManager = () => (
        <>
            <Flex justify="space-between" align="center">
                <Title level={3}>{t('settingsPage.templates.title')}</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreateTemplateModal}>
                    {t('settingsPage.templates.create')}
                </Button>
            </Flex>
            <Paragraph>{t('settingsPage.templates.description')}</Paragraph>
            <List
                bordered
                loading={loadingTemplates}
                dataSource={templates}
                renderItem={item => (
                    <List.Item
                        actions={[
                            <Button icon={<EditOutlined />} onClick={() => openEditTemplateModal(item)} />,
                            <Popconfirm
                                title={t('settingsPage.templates.deleteConfirm')}
                                onConfirm={() => handleTemplateDelete(item)}
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
        </>
    );

    // --- ФУНКЦИЯ ВОССТАНОВЛЕНА ---
    const renderKnowledgeBaseManager = () => (
        <>
            <Flex justify="space-between" align="center">
                <Title level={3}>{t('settingsPage.kb.title')}</Title>
                <Button icon={<PlusOutlined />} onClick={openKbModal}>
                    {t('settingsPage.kb.addItem')}
                </Button>
            </Flex>
            <Paragraph>{t('settingsPage.kb.description')}</Paragraph>
        </>
    );

    // --- ЭТИ ФУНКЦИИ УДАЛЕНЫ ---
    // const renderPersonalSettings = () => (...)
    // const renderGlobalSettings = () => (...)

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
                    <NavigationTab activeKey="/templates" />
                </Sider>

                <Content className="p-6 bg-gray-50">
                    <Title level={2} className="!mb-6">{t('settingsPage.title')}</Title>

                    {(user.role === 'admin' || user.role === 'auditor') && (
                        <>
                            {renderTemplateManager()}
                            <Divider /> {/* <-- ВОССТАНОВЛЕНО */}
                            {renderKnowledgeBaseManager()} {/* <-- ВОССТАНОВЛЕНО */}
                        </>
                    )}

                    {/* --- СЕКЦИИ УДАЛЕНЫ --- */}

                </Content>
            </Layout>

            <Modal
                title={editingTemplate ? t('settingsPage.templates.editTitle') : t('settingsPage.templates.createTitle')}
                open={isTemplateModalVisible}
                onCancel={handleTemplateCancel}
                onOk={() => templateForm.submit()}
                width={1200}
                destroyOnClose
            >
                <div ref={modalContentRef}>
                    <Form form={templateForm} layout="vertical" onFinish={handleTemplateSave}>
                        <Form.Item
                            name="name"
                            label={t('settingsPage.templates.name')}
                            rules={[{ required: true }]}
                        >
                            <Input disabled={!!editingTemplate}/>
                        </Form.Item>
                        <Form.Item label={t('settingsPage.templates.items')}>
                            <Transfer
                                dataSource={knowledgeBaseItems}
                                targetKeys={targetKeys}
                                onChange={onTransferChange}
                                render={item => item.title}
                                listStyle={{ width: 550, height: 400 }}
                                showSearch
                                loading={loadingKB}
                                getPopupContainer={() => modalContentRef.current}
                            />
                        </Form.Item>
                    </Form>
                </div>
            </Modal>

            {/* --- МОДАЛЬНОЕ ОКНО КБ ВОССТАНОВЛЕНО --- */}
            <Modal
                title={t('settingsPage.kb.modalTitle')}
                open={isKbModalVisible}
                onCancel={handleKbCancel}
                onOk={() => kbForm.submit()}
                okText={t('settingsPage.kb.addItem')}
                destroyOnClose
            >
                <Form form={kbForm} layout="vertical" onFinish={handleKbSave}>
                    <Form.Item
                        name="category"
                        label={t('settingsPage.kb.categoryLabel')}
                        rules={[{ required: true, message: t('settingsPage.kb.categoryMsg') }]}
                    >
                        <AutoComplete
                            options={existingCategoryOptions}
                            style={{ width: '100%' }}
                            placeholder={t('settingsPage.kb.categoryPlaceholder')}
                            filterOption={(inputValue, option) =>
                                option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        name="item"
                        label={t('settingsPage.kb.itemLabel')}
                        rules={[{ required: true, message: t('settingsPage.kb.itemMsg')}]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
}