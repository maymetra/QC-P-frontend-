// src/pages/ProjectDetailPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout, Typography, Button, Space, Tag, Modal, List, Radio, message, Spin, AutoComplete, Select } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import NavigationTab from '../components/NavigationTab';
// --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
import JirasTable from '../components/JirasTable'; // <-- Без фигурных скобок
import LanguageSwitch from '../components/LanguageSwitch';
import { useAuth } from '../context/AuthContext';
import { LogoutOutlined, HistoryOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { exportToPDF } from '../services/pdfGenerator';
import apiClient from '../services/api';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

export default function ProjectDetailPage() {
    const { projectId } = useParams();
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const tableRef = useRef(null);

    const [project, setProject] = useState(null);
    const [loadingProject, setLoadingProject] = useState(true);
    const [items, setItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Управление менеджерами
    const [managers, setManagers] = useState([]);
    const [loadingManagers, setLoadingManagers] = useState(false);

    // Управление историей
    const [historyOpen, setHistoryOpen] = useState(false);
    const [historyEvents, setHistoryEvents] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Управление модалкой статуса
    const [projStatus, setProjStatus] = useState('in_progress');
    const canChangeProjectStatus = user?.role === 'admin' || user?.role === 'auditor';
    const statusColor = projStatus === 'finished' ? 'green' : projStatus === 'in_progress' ? 'geekblue' : 'gold';
    const [statusModal, setStatusModal] = useState(false);
    const [statusDraft, setStatusDraft] = useState({ status: projStatus, manager: '' });

    // Загрузка проекта
    useEffect(() => {
        const fetchProject = async () => {
            if (!projectId) return;
            setLoadingProject(true);
            try {
                const response = await apiClient.get(`/projects/${projectId}`);
                setProject(response.data);
                setProjStatus(response.data.status);
            } catch (error) {
                console.error("Failed to fetch project", error);
                message.error("Project not found.");
                navigate('/projects');
            } finally {
                setLoadingProject(false);
            }
        };

        fetchProject();
    }, [projectId, navigate]);

    // Загрузка айтемов
    const fetchItems = useCallback(async () => {
        if (!projectId) return;
        setLoadingItems(true);
        try {
            const response = await apiClient.get(`/projects/${projectId}/items`);
            setItems(response.data);
        } catch (error) {
            console.error("Failed to fetch items", error);
            message.error("Failed to load items for the project.");
        } finally {
            setLoadingItems(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // Загрузка менеджеров
    const fetchManagers = async () => {
        if (canChangeProjectStatus) {
            setLoadingManagers(true);
            try {
                const res = await apiClient.get('/users/managers');
                setManagers(res.data.map(m => m.name));
            } catch (e) {
                console.error("Failed to load managers", e);
            } finally {
                setLoadingManagers(false);
            }
        }
    };

    // Загрузка истории
    const fetchHistory = async () => {
        if (!projectId) return;
        setHistoryLoading(true);
        try {
            const response = await apiClient.get(`/projects/${projectId}/history`);
            setHistoryEvents(response.data);
        } catch (error) {
            console.error("Failed to fetch history", error);
            message.error("Failed to load project history.");
        } finally {
            setHistoryLoading(false);
        }
    };

    // Открываем модалку статуса
    const openStatusModal = () => {
        if (managers.length === 0) fetchManagers();
        setStatusDraft({
            status: project.status,
            manager: project.manager
        });
        setStatusModal(true);
    };

    // Сохраняем статус И менеджера
    const saveStatus = async () => {
        try {
            const payload = {
                status: statusDraft.status,
                manager: statusDraft.manager,
            };
            const response = await apiClient.put(`/projects/${project.id}`, payload);
            const updatedProject = response.data;

            setProject(updatedProject);
            setProjStatus(updatedProject.status);
            setStatusModal(false);

            message.success('Project updated!');

            fetchHistory();
        } catch (error) {
            message.error('Failed to update project.');
        }
    };

    // Открываем модалку истории
    const openHistoryModal = () => {
        setHistoryOpen(true);
        fetchHistory();
    };

    const handleExportPDF = async () => {
        if (!project || !items) return;
        setIsExporting(true);
        await exportToPDF(project, items, user, t);
        setIsExporting(false);
    };

    // Обновляем JirasTable и историю, когда айтемы меняются
    const handleItemsUpdate = () => {
        fetchItems();
        fetchHistory();
    }

    // --- ХЕЛПЕР-ФУНКЦИЯ ДЛЯ РЕНДЕРА ИСТОРИИ ---
    const renderHistoryEvent = (item) => {
        const { event_type, details } = item;

        try {
            const data = JSON.parse(details);

            if (typeof data !== 'object' || data === null) {
                throw new Error("Not an object");
            }

            if (event_type === 'project_status_updated') {
                const from = t(`projects.status.${data.from}`, { defaultValue: data.from });
                const to = t(`projects.status.${data.to}`, { defaultValue: data.to });
                return `Project status changed from '${from}' to '${to}'.`;
            }

            if (event_type === 'item_status_updated') {
                const from = t(`itemStatus.${data.from}`, { defaultValue: data.from });
                const to = t(`itemStatus.${data.to}`, { defaultValue: data.to });
                return `Item '${data.item_name}' status changed from '${from}' to '${to}'.`;
            }

            return details;

        } catch (e) {
            return details;
        }
    };
    // ---


    if (loadingProject) {
        return (
            <Layout style={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
                <Spin size="large" />
            </Layout>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header className="flex justify-between items-center bg-gray-900 px-6 shadow-sm">
                <h1 className="futuristic text-2xl sm:text-3xl m-0 leading-none">QUALITY CONTROL</h1>
                <Space>
                    <Text className="!text-white">{user?.name}</Text>
                    <LanguageSwitch />
                    <Button ghost icon={<LogoutOutlined />} onClick={logout}>{t('logout')}</Button>
                </Space>
            </Header>
            <Layout>
                <Sider width={220} className="bg-white shadow-sm"><NavigationTab activeKey="/projects" /></Sider>
                <Content className="p-6 bg-gray-50">
                    <Space align="center" className="!w-full !justify-between !mb-2">
                        <Title level={2} className="!mb-0">QS-Plan: {project ? project.name : t('projects.notFound')}</Title>
                        {project && (
                            <Space>
                                <Button icon={<FilePdfOutlined />} onClick={handleExportPDF} loading={isExporting}>
                                    {t('Export to PDF', { defaultValue: 'Export to PDF' })}
                                </Button>
                                <Button icon={<HistoryOutlined />} onClick={openHistoryModal}>
                                    {t('History', { defaultValue: 'History' })}
                                </Button>
                                {canChangeProjectStatus && <Button type="primary" onClick={openStatusModal}>{t('Change project settings')}</Button>}
                            </Space>
                        )}
                    </Space>
                    {project && (
                        <Space size="middle" className="!mb-6">
                            <Text><strong>{t('projects.form.kunde')}:</strong> {project.kunde || '—'}</Text>
                            <Text><strong>{t('projects.manager')}:</strong> {project.manager || '—'}</Text>
                            <Tag color={statusColor}>{t(`projects.status.${projStatus}`)}</Tag>
                        </Space>
                    )}

                    <JirasTable
                        ref={tableRef}
                        items={items}
                        loading={loadingItems}
                        fetchItems={handleItemsUpdate}
                        isExporting={isExporting}
                    />

                    <Modal
                        title={t('Change project settings')}
                        open={statusModal}
                        onCancel={() => setStatusModal(false)}
                        onOk={saveStatus}
                        okText={t('Save')}
                        cancelText={t('common.cancel')}
                    >
                        <Space direction="vertical" style={{width: '100%'}}>
                            <Text strong>{t('projects.form.status')}</Text>
                            <Radio.Group
                                value={statusDraft.status}
                                onChange={(e) => setStatusDraft(s => ({ ...s, status: e.target.value }))}
                            >
                                <Space direction="vertical">
                                    <Radio value="in_progress">{t('projects.status.in_progress')}</Radio>
                                    <Radio value="finished">{t('projects.status.finished')}</Radio>
                                    <Radio value="on_hold">{t('projects.status.on_hold')}</Radio>
                                </Space>
                            </Radio.Group>

                            <Text strong style={{marginTop: 16}}>{t('projects.manager')}</Text>
                            <AutoComplete
                                value={statusDraft.manager}
                                options={managers.map(name => ({ value: name }))}
                                style={{ width: '100%' }}
                                onChange={(value) => setStatusDraft(s => ({ ...s, manager: value }))}
                                placeholder={t('projects.form.managerMsg')}
                                filterOption={(inputValue, option) =>
                                    option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                                }
                                loading={loadingManagers}
                            />
                        </Space>
                    </Modal>

                    <Modal title={t('History')} open={historyOpen} onCancel={() => setHistoryOpen(false)} footer={null} width={600}>
                        <Spin spinning={historyLoading}>
                            <List
                                dataSource={historyEvents}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={renderHistoryEvent(item)}
                                            description={`${new Date(item.timestamp).toLocaleString(t('common.locale', { defaultValue: 'de-DE' }))} - ${item.user_name} (${t(`historyEvent.${item.event_type}`, { defaultValue: item.event_type })})`}
                                        />
                                    </List.Item>
                                )}
                                locale={{ emptyText: 'No history yet' }}
                                style={{maxHeight: '60vh', overflowY: 'auto'}}
                            />
                        </Spin>
                    </Modal>
                </Content>
            </Layout>
        </Layout>
    );
}