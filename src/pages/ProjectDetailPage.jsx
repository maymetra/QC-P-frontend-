// src/pages/ProjectDetailPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout, Typography, Button, Space, Tag, Modal, List, Radio, message, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import NavigationTab from '../components/NavigationTab';
import JirasTable from '../components/JirasTable';
import LanguageSwitch from '../components/LanguageSwitch';
import { useAuth } from '../context/AuthContext';
import { LogoutOutlined, HistoryOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { exportToPDF } from '../services/pdfGenerator';
import apiClient from '../services/api';
import { logGlobalEvent } from '../services/mockData';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function ProjectDetailPage() {
    const { projectId } = useParams();
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const tableRef = useRef(null);

    // --- ИЗМЕНЕНИЯ ЗДЕСЬ ---
    const [project, setProject] = useState(null);
    const [loadingProject, setLoadingProject] = useState(true);
    // -------------------------

    const [items, setItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Вся логика для статуса проекта, истории и модальных окон остается без изменений
    const [projStatus, setProjStatus] = useState('in_progress');
    const canChangeProjectStatus = user?.role === 'admin' || user?.role === 'auditor';
    const statusColor = projStatus === 'finished' ? 'green' : projStatus === 'in_progress' ? 'geekblue' : 'gold';
    const [historyOpen, setHistoryOpen] = useState(false);
    const [events, setEvents] = useState([]);
    const [statusModal, setStatusModal] = useState(false);
    const [statusDraft, setStatusDraft] = useState(projStatus);

    const logEvent = useCallback((evt) => {
        const fullEvent = { ...evt, ts: new Date().toISOString(), projectName: project?.name };
        setEvents(prev => [fullEvent, ...prev]);
        logGlobalEvent(fullEvent);
    }, [project?.name]);

    // --- ИЗМЕНЕНИЯ ЗДЕСЬ: Загружаем данные о проекте ---
    useEffect(() => {
        const fetchProject = async () => {
            if (!projectId) return;
            setLoadingProject(true);
            try {
                const response = await apiClient.get(`/projects/${projectId}`);
                setProject(response.data);
                setProjStatus(response.data.status); // Устанавливаем статус проекта
            } catch (error) {
                console.error("Failed to fetch project", error);
                message.error("Project not found.");
                navigate('/projects'); // Если проект не найден, возвращаем на список
            } finally {
                setLoadingProject(false);
            }
        };

        fetchProject();
    }, [projectId, navigate]);
    // ----------------------------------------------------

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

    const openStatusModal = () => { setStatusDraft(projStatus); setStatusModal(true); };

    const saveStatus = async () => {
        try {
            // Теперь обновляем статус и на бэкенде!
            const response = await apiClient.put(`/projects/${project.id}`, { ...project, status: statusDraft });
            const updatedProject = response.data;

            const prev = projStatus;
            setProject(updatedProject);
            setProjStatus(updatedProject.status);
            setStatusModal(false);

            logEvent({
                kind: 'project_status', by: user?.name,
                message: `Project status: ${t(`projects.status.${prev}`)} → ${t(`projects.status.${updatedProject.status}`)}`
            });
            message.success('Project status updated!');
        } catch (error) {
            message.error('Failed to update project status.');
        }
    };

    const handleExportPDF = async () => {
        if (!project || !items) return;
        setIsExporting(true);
        await exportToPDF(project, items, user, t);
        setIsExporting(false);
    };

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
                                <Button icon={<HistoryOutlined />} onClick={() => setHistoryOpen(true)}>
                                    {t('History', { defaultValue: 'History' })}
                                </Button>
                                {canChangeProjectStatus && <Button type="primary" onClick={openStatusModal}>{t('Change project status')}</Button>}
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
                        fetchItems={fetchItems}
                        onLog={logEvent}
                        isExporting={isExporting}
                    />

                    <Modal title={t('Change project status')} open={statusModal} onCancel={() => setStatusModal(false)} onOk={saveStatus} okText={t('Save')} cancelText={t('common.cancel')}>
                        <Radio.Group value={statusDraft} onChange={(e) => setStatusDraft(e.target.value)}>
                            <Space direction="vertical">
                                <Radio value="in_progress">{t('projects.status.in_progress')}</Radio>
                                <Radio value="finished">{t('projects.status.finished')}</Radio>
                                <Radio value="on_hold">{t('projects.status.on_hold')}</Radio>
                            </Space>
                        </Radio.Group>
                    </Modal>
                    <Modal title={t('History')} open={historyOpen} onCancel={() => setHistoryOpen(false)} footer={null}>
                        <List
                            dataSource={events}
                            renderItem={(item) => (
                                <List.Item>
                                    <Text>
                                        <Text type="secondary">{new Date(item.ts).toLocaleString()} - {item.by}: </Text>
                                        {item.message}
                                    </Text>
                                </List.Item>
                            )}
                            locale={{ emptyText: 'No history yet' }}
                        />
                    </Modal>
                </Content>
            </Layout>
        </Layout>
    );
}