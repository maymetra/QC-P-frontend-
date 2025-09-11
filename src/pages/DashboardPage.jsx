// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { Layout, Typography, Card, Col, Row, Statistic, List, Flex, Button, Tag, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { ExclamationCircleOutlined, FieldTimeOutlined, LogoutOutlined } from '@ant-design/icons';
import NavigationTab from '../components/NavigationTab';
import LanguageSwitch from '../components/LanguageSwitch';
import { getGlobalEvents, mockProjects as allProjects } from '../services/mockData';
import { useNavigate, Navigate } from 'react-router-dom'; // <-- Добавляем Navigate

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function DashboardPage() {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // <-- **ВОТ НОВАЯ ЛОГИКА ЗАЩИТЫ** -->
    // Если роль не подходит, просто перенаправляем на проекты
    const isAuthorized = user?.role === 'admin' || user?.role === 'auditor';
    if (!isAuthorized) {
        return <Navigate to="/projects" replace />;
    }

    // ... (остальной код компонента остается без изменений)
    const [pendingItems, setPendingItems] = useState([]);
    const [overdueItems, setOverdueItems] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [isPendingModalVisible, setIsPendingModalVisible] = useState(false);
    const [isOverdueModalVisible, setIsOverdueModalVisible] = useState(false);

    useEffect(() => {
        let allPendingItems = [];
        let allOverdueItems = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        allProjects.forEach(project => {
            try {
                const itemsRaw = localStorage.getItem(`jiraItems:${project.id}`);
                if (itemsRaw) {
                    const items = JSON.parse(itemsRaw);
                    items.forEach(item => {
                        const itemWithProjectInfo = { ...item, projectId: project.id, projectName: project.name };

                        if (item.status === 'pending') {
                            allPendingItems.push(itemWithProjectInfo);
                        }

                        const isOverdue = item.plannedDate && new Date(item.plannedDate) < today;
                        const isNegativeStatus = item.status === 'rejected' || item.status === 'open';

                        if (isOverdue && isNegativeStatus) {
                            allOverdueItems.push(itemWithProjectInfo);
                        }
                    });
                }
            } catch (e) { console.error(e); }
        });

        setPendingItems(allPendingItems);
        setOverdueItems(allOverdueItems);
        setRecentActivity(getGlobalEvents());
    }, [user]);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header className="flex justify-between items-center bg-gray-900 px-6 shadow-sm">
                <h1 className="futuristic text-2xl sm:text-3xl m-0 leading-none">QUALITY CONTROL</h1>
                <Flex align="center" gap="middle">
                    <Text style={{ color: 'white' }}>{user?.name}</Text>
                    <LanguageSwitch />
                    <Button ghost icon={<LogoutOutlined />} onClick={logout}>{t('logout')}</Button>
                </Flex>
            </Header>

            <Layout>
                <Sider width={220} className="bg-white shadow-sm">
                    <NavigationTab activeKey="/dashboard" />
                </Sider>

                <Content className="p-6 bg-gray-50">
                    <Title level={2} className="!mb-6">{t('menu.dashboard', {defaultValue: 'Dashboard'})}</Title>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <Card hoverable onClick={() => setIsPendingModalVisible(true)}>
                                <Statistic title={t('itemStatus.pending')} value={pendingItems.length} prefix={<FieldTimeOutlined />} />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Card hoverable onClick={() => setIsOverdueModalVisible(true)}>
                                <Statistic
                                    title={t('itemStatus.overdue')}
                                    value={overdueItems.length}
                                    prefix={<ExclamationCircleOutlined />}
                                    valueStyle={{ color: overdueItems.length > 0 ? '#cf1322' : undefined }}
                                />
                            </Card>
                        </Col>

                        <Col xs={24}>
                            <Card title={t('Recent Activity', {defaultValue: 'Recent Activity'})}>
                                <List
                                    size="small"
                                    dataSource={recentActivity}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <Text>
                                                <Text type="secondary">
                                                    {new Date(item.ts).toLocaleString()} - {item.by}:
                                                </Text>
                                                {item.projectName && <Tag style={{marginLeft: 8}}>{item.projectName}</Tag>}
                                                {item.message}
                                            </Text>
                                        </List.Item>
                                    )}
                                    locale={{ emptyText: t('No recent activity', {defaultValue: 'No recent activity'})}}
                                />
                            </Card>
                        </Col>
                    </Row>
                </Content>
            </Layout>

            <Modal
                title={t('itemStatus.pending')}
                open={isPendingModalVisible}
                onCancel={() => setIsPendingModalVisible(false)}
                footer={null}
            >
                <List
                    dataSource={pendingItems}
                    renderItem={item => (
                        <List.Item
                            actions={[<Button onClick={() => navigate(`/projects/${item.projectId}`)}>{t('Go to project', {defaultValue: 'Go to project'})}</Button>]}
                        >
                            <List.Item.Meta
                                title={item.item}
                                description={<Tag>{item.projectName}</Tag>}
                            />
                        </List.Item>
                    )}
                    locale={{ emptyText: t('No pending items', {defaultValue: 'No pending items'})}}
                />
            </Modal>

            <Modal
                title={t('itemStatus.overdue')}
                open={isOverdueModalVisible}
                onCancel={() => setIsOverdueModalVisible(false)}
                footer={null}
            >
                <List
                    dataSource={overdueItems}
                    renderItem={item => (
                        <List.Item
                            actions={[<Button onClick={() => navigate(`/projects/${item.projectId}`)}>{t('Go to project', {defaultValue: 'Go to project'})}</Button>]}
                        >
                            <List.Item.Meta
                                title={<span style={{color: '#cf1322'}}>{item.item}</span>}
                                description={
                                    <>
                                        <Tag>{item.projectName}</Tag>
                                        <Text type="danger">{t('Planned Date', {defaultValue: 'Planned Date'})}: {item.plannedDate}</Text>
                                    </>
                                }
                            />
                        </List.Item>
                    )}
                    locale={{ emptyText: t('No overdue items', {defaultValue: 'No overdue items'})}}
                />
            </Modal>
        </Layout>
    );
}