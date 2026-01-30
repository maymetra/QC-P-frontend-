// src/pages/TemplatesPage.jsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { Layout, Typography, Divider, Button, Flex, Modal, Form, Input, Transfer, List, Popconfirm, message, AutoComplete, Card, Tag, Table, Space } from 'antd';
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
                key: item.id, // Используем ID как ключ
                id: item.id,  // Сохраняем ID для действий
                title: item.item,
                category: item.category,
            }));
            console.log("Fetched KB Items:", formattedItems);
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
        // --- FIX: The backend expects a list of STRINGS (item texts), but targetKeys are now IDs.
        // We must map the IDs back to the item strings.
        const selectedItemTexts = targetKeys.map(key => {
            const kbItem = knowledgeBaseItems.find(i => i.key === key);
            return kbItem ? kbItem.title : null;
        }).filter(item => item !== null);

        const payload = {
            name: values.name,
            items: selectedItemTexts,
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


    // --- Новая логика отрисовки --
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- Логика для управления элементами КБ (Manage Items) ---
    // Используем уже существующие state isKbModalVisible, но теперь модалка будет другой
    const [kbSearchTerm, setKbSearchTerm] = useState('');
    const [editingKbItem, setEditingKbItem] = useState(null);

    const openManageItemsModal = () => {
        setIsKbModalVisible(true);
        fetchKnowledgeBase();
    };

    const handleKbDelete = async (id) => {
        try {
            await apiClient.delete(`/knowledge-base/${id}`);
            message.success(t('settingsPage.kb.itemDeleted'));
            fetchKnowledgeBase();
        } catch (error) {
            console.error("Failed to delete KB item", error);
            message.error(error.response?.data?.detail || t('settingsPage.kb.failedToDelete'));
        }
    };

    const handleKbEdit = (item) => {
        setEditingKbItem(item);
        kbForm.setFieldsValue({
            category: item.category,
            item: item.item
        });
        // Для редактирования можно использовать отдельную маленькую модалку или переключать режим в текущей
        // Для простоты сделаем режим редактирования прямо в форме добавления в этой же модалке?
        // Или лучше отдельная модалка "Add/Edit Item". 
        // Давайте сделаем отдельное состояние layout внутри модалки, или простую форму сверху списка.
    };

    // Состояние для ВНУТРЕННЕЙ модалки добавления/редактирования элемента
    const [isItemFormVisible, setIsItemFormVisible] = useState(false);

    const openItemForm = (item = null) => {
        setEditingKbItem(item);
        if (item) {
            kbForm.setFieldsValue({ category: item.category, item: item.item });
        } else {
            kbForm.resetFields();
        }
        setIsItemFormVisible(true);
    }

    const handleItemFormSave = async (values) => {
        console.log("Saving Item:", values, "Editing ID:", editingKbItem?.id);
        try {
            if (editingKbItem) {
                await apiClient.put(`/knowledge-base/item/${editingKbItem.id}`, values);
                message.success(t('settingsPage.kb.itemUpdated'));
            } else {
                await apiClient.post('/knowledge-base/', values);
                message.success(t('settingsPage.kb.itemCreated'));
            }
            setIsItemFormVisible(false);
            setEditingKbItem(null);
            fetchKnowledgeBase();
        } catch (error) {
            console.error("Failed to save item", error);
            message.error(error.response?.data?.detail || t('settingsPage.kb.failedToSave'));
        }
    }


    const renderWorkPanel = () => (
        <Card className="mb-6 shadow-sm border-gray-200" style={{ marginBottom: '24px' }}>
            <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                <div>
                    <Title level={4} style={{ margin: 0 }}>{t('settingsPage.templates.title')}</Title>
                    <Text type="secondary">{t('settingsPage.templates.description')}</Text>
                </div>
                <Flex gap="small">
                    <Button onClick={openManageItemsModal}>
                        {t('settingsPage.kb.manageItems')}
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={openCreateTemplateModal}>
                        {t('settingsPage.templates.create')}
                    </Button>
                </Flex>
            </Flex>
            <Divider style={{ margin: '16px 0' }} />
            <Input.Search
                placeholder={t('settingsPage.projects.filters.search', { defaultValue: 'Search templates...' })}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ maxWidth: 400 }}
                allowClear
            />
        </Card>
    );

    const columns = [
        {
            title: t('settingsPage.templates.name'),
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: t('settingsPage.templates.items'),
            key: 'items',
            render: (_, record) => (
                <Text>{record.items.length} {t('settingsPage.templates.items', { defaultValue: 'items' })}</Text>
            ),
        },
        {
            title: t('usersPage.table.action'),
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button type="link" icon={<EditOutlined />} onClick={() => openEditTemplateModal(record)} />
                    <Popconfirm
                        title={t('settingsPage.templates.deleteConfirm')}
                        onConfirm={() => handleTemplateDelete(record)}
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const renderTemplatesGrid = () => (
        <Table
            dataSource={filteredTemplates}
            columns={columns}
            rowKey="id"
            loading={loadingTemplates}
            pagination={{ pageSize: 12 }}
            className="shadow-sm bg-white rounded-md"
        />
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
                            {renderWorkPanel()}
                            {renderTemplatesGrid()}
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
                            <Input disabled={!!editingTemplate} />
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

            {/* --- МОДАЛКА УПРАВЛЕНИЯ КБ --- */}
            <Modal
                title={t('settingsPage.kb.manageItems')}
                open={isKbModalVisible}
                onCancel={() => setIsKbModalVisible(false)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <Flex justify="space-between" className="mb-4">
                    <Input.Search
                        placeholder="Search items..."
                        style={{ maxWidth: 300 }}
                        onChange={e => setKbSearchTerm(e.target.value)}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openItemForm(null)}>
                        {t('settingsPage.kb.addNewItem')}
                    </Button>
                </Flex>

                <List
                    itemLayout="horizontal"
                    dataSource={knowledgeBaseItems.filter(item =>
                        item.title.toLowerCase().includes(kbSearchTerm.toLowerCase()) ||
                        item.category.toLowerCase().includes(kbSearchTerm.toLowerCase())
                    )}
                    pagination={{ pageSize: 10 }}
                    loading={loadingKB}
                    renderItem={item => (
                        <List.Item
                            actions={[
                                <Button type="link" icon={<EditOutlined />} onClick={() => {
                                    console.log("Opening edit for:", item);
                                    openItemForm({ id: item.id, category: item.category, item: item.title });
                                }} />,
                                <Popconfirm title={t('settingsPage.kb.deleteItemConfirm')} onConfirm={() => handleKbDelete(item.id)}>
                                    <Button type="text" danger icon={<DeleteOutlined />} />
                                </Popconfirm>
                            ]}
                        >
                            <List.Item.Meta
                                title={item.title}
                                description={<Tag>{item.category}</Tag>}
                            />
                        </List.Item>
                    )}
                />

                {/* Вложенная модалка для создания/редактирования */}
                <Modal
                    title={editingKbItem ? t('settingsPage.kb.editItem') : t('settingsPage.kb.addNewItem')}
                    open={isItemFormVisible}
                    onCancel={() => setIsItemFormVisible(false)}
                    onOk={() => kbForm.submit()}
                    destroyOnClose
                >
                    <Form form={kbForm} layout="vertical" onFinish={handleItemFormSave}>
                        <Form.Item
                            name="category"
                            label={t('settingsPage.kb.categoryLabel')}
                            rules={[{ required: true, message: t('settingsPage.kb.categoryMsg') }]}
                        >
                            <AutoComplete
                                options={existingCategoryOptions}
                                placeholder={t('settingsPage.kb.categoryPlaceholder')}
                                filterOption={(inputValue, option) =>
                                    option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                                }
                            />
                        </Form.Item>
                        <Form.Item
                            name="item"
                            label={t('settingsPage.kb.itemLabel')}
                            rules={[{ required: true, message: t('settingsPage.kb.itemMsg') }]}
                        >
                            <Input.TextArea rows={4} />
                        </Form.Item>
                    </Form>
                </Modal>
            </Modal>
        </Layout>
    );
}