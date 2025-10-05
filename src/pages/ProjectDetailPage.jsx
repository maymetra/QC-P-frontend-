// src/pages/ProjectDetailPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout, Typography, Button, Space, Tag, Modal, List, Radio, message } from 'antd';
import { useParams } from 'react-router-dom';
import NavigationTab from '../components/NavigationTab';
import JirasTable from '../components/JirasTable';
import LanguageSwitch from '../components/LanguageSwitch';
import { useAuth } from '../context/AuthContext';
import { LogoutOutlined, HistoryOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { exportToPDF } from '../services/pdfGenerator';
import apiClient from '../services/api';
import { mockProjects, updateProject, logGlobalEvent } from '../services/mockData';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function ProjectDetailPage() {
    const { projectId } = useParams();
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const tableRef = useRef(null); // ref для PDF экспорта остается

    // Данные самого проекта пока берем из моков
    const project = mockProjects.find(p => p.id === projectId);

    const [items, setItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Вся логика для статуса проекта, истории и модальных окон остается без изменений
    const [projStatus, setProjStatus] = useState(project?.status || 'in_progress');
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

    // --- ИНТЕГРАЦИЯ: Новая логика загрузки Items с бэкенда ---
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

    // --- Все функции-обработчики остаются на месте ---
    const openStatusModal = () => { setStatusDraft(projStatus); setStatusModal(true); };
    const saveStatus = () => {
        const prev = projStatus;
        setProjStatus(statusDraft);
        updateProject(projectId, { status: statusDraft });
        setStatusModal(false);
        logEvent({
            kind: 'project_status', by: user?.name,
            message: `Project status: ${t(`projects.status.${prev}`)} → ${t(`projects.status.${statusDraft}`)}`
        });
    };
    const handleExportPDF = async () => { /* ... эта функция не меняется ... */ };


    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Шапка и навигация остаются прежними */}
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
                    {/* Верхняя часть страницы с кнопками остается прежней */}
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

                    {/* Передаем в JirasTable все необходимые пропсы */}
                    <JirasTable
                        ref={tableRef}
                        items={items}
                        loading={loadingItems}
                        fetchItems={fetchItems} // Функция для обновления
                        onLog={logEvent}
                        isExporting={isExporting}
                    />

                    {/* Все модальные окна остаются на месте */}
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
                        <List /* ... */ />
                    </Modal>
                </Content>
            </Layout>
        </Layout>
    );
}