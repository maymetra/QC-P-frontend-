// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { Layout, Typography, Card, Col, Row, Statistic, List, Flex, Button, Tag } from 'antd'; // <-- Добавлен Tag
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { SyncOutlined, PauseCircleOutlined, FieldTimeOutlined, LogoutOutlined } from '@ant-design/icons';
import NavigationTab from '../components/NavigationTab';
import LanguageSwitch from '../components/LanguageSwitch';
import { filterProjectsForUser, getGlobalEvents, mockProjects as allProjects } from '../services/mockData';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function DashboardPage() {
    const { t } = useTranslation();
    const { user, logout } = useAuth();

    const [stats, setStats] = useState({ inProgress: 0, onHold: 0, finished: 0 });
    const [pendingItemsCount, setPendingItemsCount] = useState(0);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        const userProjects = filterProjectsForUser(user);

        // 1. Статистика по проектам
        const newStats = userProjects.reduce((acc, p) => {
            if (p.status === 'in_progress') acc.inProgress++;
            else if (p.status === 'on_hold') acc.onHold++;
            return acc;
        }, { inProgress: 0, onHold: 0 });
        setStats(newStats);

        // 2. Количество items, ожидающих проверки
        let pendingCount = 0;
        allProjects.forEach(p => {
            try {
                const itemsRaw = localStorage.getItem(`jiraItems:${p.id}`);
                if (itemsRaw) {
                    const items = JSON.parse(itemsRaw);
                    pendingCount += items.filter(item => item.status === 'pending').length;
                }
            } catch (e) { console.error(e); }
        });
        setPendingItemsCount(pendingCount);

        // 3. Последние действия
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
                        <Col xs={24} sm={12} md={8}>
                            <Card>
                                <Statistic title={t('projects.status.in_progress')} value={stats.inProgress} prefix={<SyncOutlined spin />} />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Card>
                                <Statistic title={t('projects.status.on_hold')} value={stats.onHold} prefix={<PauseCircleOutlined />} />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Card>
                                <Statistic title={t('itemStatus.pending')} value={pendingItemsCount} prefix={<FieldTimeOutlined />} />
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
        </Layout>
    );
}