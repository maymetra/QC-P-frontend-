import React, { useState } from 'react';
import { Layout, Typography, Button, Space, Tag, Modal, List, Radio } from 'antd';
import { useParams } from 'react-router-dom';
import NavigationTab from '../components/NavigationTab';
import JirasTable from '../components/JirasTable';
import LanguageSwitch from '../components/LanguageSwitch';
import { mockProjects } from '../services/mockData';
import { useAuth } from '../context/AuthContext';
import { LogoutOutlined, HistoryOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function ProjectDetailPage() {
    const { projectId } = useParams();
    const { user, logout } = useAuth();
    const { t } = useTranslation();

    const project = mockProjects.find(p => p.id === projectId);

    // локальный статус проекта (для UI)
    const [projStatus, setProjStatus] = useState(project?.status || 'in_progress');
    const canAdminAudit = user?.role === 'admin' || user?.role === 'auditor';

    const statusColor =
        projStatus === 'finished' ? 'green' :
            projStatus === 'in_progress' ? 'geekblue' : 'gold';

    // ------- История -------
    const [historyOpen, setHistoryOpen] = useState(false);
    const [events, setEvents] = useState([]);
    const logEvent = (evt) => setEvents(prev => [{ ...evt }, ...prev]);

    // ------- Смена статуса проекта -------
    const [statusModal, setStatusModal] = useState(false);
    const [statusDraft, setStatusDraft] = useState(projStatus);

    const openStatusModal = () => {
        setStatusDraft(projStatus);
        setStatusModal(true);
    };

    const saveStatus = () => {
        const prev = projStatus;
        setProjStatus(statusDraft);
        setStatusModal(false);
        // лог с готовой строкой для истории
        logEvent({
            kind: 'project_status',
            by: user?.name,
            ts: new Date().toISOString(),
            message: `Project status: ${t(`projects.status.${prev}`)} → ${t(`projects.status.${statusDraft}`)}`
        });
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header className="flex justify-between items-center bg-gray-900 px-6 shadow-sm">
                <h1 className="futuristic text-2xl sm:text-3xl m-0 leading-none">
                    QUALITY CONTROL
                </h1>
                <Space>
                    <Text className="!text-white">{user?.name}</Text>
                    <LanguageSwitch />
                    <Button ghost icon={<LogoutOutlined />} onClick={logout}>
                        {t('logout')}
                    </Button>
                </Space>
            </Header>

            <Layout>
                <Sider width={220} className="bg-white shadow-sm">
                    <NavigationTab activeKey="/projects" />
                </Sider>

                <Content className="p-6 bg-gray-50">
                    <Space align="center" className="!w-full !justify-between !mb-2">
                        <Title level={2} className="!mb-0">
                            QS-Plan: {project ? project.name : t('projects.notFound')}
                        </Title>

                        {canAdminAudit && project && (
                            <Space>
                                <Button icon={<HistoryOutlined />} onClick={() => setHistoryOpen(true)}>
                                    {t('History', { defaultValue: 'History' })}
                                </Button>
                                <Button type="primary" onClick={openStatusModal}>
                                    {t('Change project status', { defaultValue: 'Change project status' })}
                                </Button>
                            </Space>
                        )}
                    </Space>

                    {project && (
                        <Space size="middle" className="!mb-6">
                            <Text>
                                <strong>{t('projects.form.kunde', { defaultValue: 'Customer (Kunde)' })}:</strong>{' '}
                                {project.kunde || '—'}
                            </Text>
                            <Text>
                                <strong>{t('projects.manager', { defaultValue: 'Manager' })}:</strong>{' '}
                                {project.manager || '—'}
                            </Text>
                            <Tag color={statusColor}>
                                {t(`projects.status.${projStatus}`, { defaultValue: projStatus })}
                            </Tag>
                        </Space>
                    )}

                    {/* Передаём логгер в таблицу, чтобы туда прилетали Item-события */}
                    <JirasTable onLog={logEvent} />

                    {/* Модалка смены статуса проекта */}
                    <Modal
                        title={t('Change project status', { defaultValue: 'Change project status' })}
                        open={statusModal}
                        onCancel={() => setStatusModal(false)}
                        onOk={saveStatus}
                        okText={t('Save', { defaultValue: 'Save' })}
                        cancelText={t('common.cancel', { defaultValue: 'Cancel' })}
                    >
                        <Radio.Group
                            value={statusDraft}
                            onChange={(e) => setStatusDraft(e.target.value)}
                        >
                            <Space direction="vertical">
                                <Radio value="in_progress">{t('projects.status.in_progress')}</Radio>
                                <Radio value="finished">{t('projects.status.finished')}</Radio>
                                <Radio value="on_hold">{t('projects.status.on_hold')}</Radio>
                            </Space>
                        </Radio.Group>
                    </Modal>

                    {/* История */}
                    <Modal
                        title={t('History', { defaultValue: 'History' })}
                        open={historyOpen}
                        onCancel={() => setHistoryOpen(false)}
                        footer={null}
                    >
                        <List
                            size="small"
                            dataSource={events}
                            locale={{ emptyText: t('No events yet', { defaultValue: 'No events yet' }) }}
                            renderItem={(e) => {
                                const when = new Date(e.ts || Date.now()).toLocaleString();
                                return (
                                    <List.Item>
                                        <Space direction="vertical" size={0}>
                                            <Text type="secondary">{when} — {e.by || '—'}</Text>
                                            <Text>{e.message || e.kind}</Text>
                                        </Space>
                                    </List.Item>
                                );
                            }}
                        />
                    </Modal>
                </Content>
            </Layout>
        </Layout>
    );
}
