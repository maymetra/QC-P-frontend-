// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { Layout, Typography, Card, Col, Row, Statistic, List, Flex, Button, Tag, Modal, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { ExclamationCircleOutlined, FieldTimeOutlined, LogoutOutlined } from '@ant-design/icons';
import NavigationTab from '../components/NavigationTab';
import LanguageSwitch from '../components/LanguageSwitch';
import { useNavigate, Navigate } from 'react-router-dom';
import apiClient from '../services/api';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function DashboardPage() {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const isAuthorized = user?.role === 'admin' || user?.role === 'auditor';
    if (!isAuthorized) {
        return <Navigate to="/projects" replace />;
    }

    // 1. Инициализируем state с дефолтной структурой, чтобы избежать ошибок
    const [stats, setStats] = useState({
        pending_items: [],
        overdue_items: [],
        pending_items_count: 0,
        overdue_items_count: 0,
    });
    const [loading, setLoading] = useState(true);
    const [isPendingModalVisible, setIsPendingModalVisible] = useState(false);
    const [isOverdueModalVisible, setIsOverdueModalVisible] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get('/dashboard/statistics');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
                message.error("Failed to load dashboard statistics.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // 2. Убираем полноэкранный Spin. Компонент теперь всегда рендерит основной Layout.

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
                            <Card hoverable onClick={() => !loading && stats.pending_items_count > 0 && setIsPendingModalVisible(true)}>
                                {/* 3. Добавляем пропс `loading` прямо в компонент Statistic */}
                                <Statistic
                                    title={t('itemStatus.pending')}
                                    value={stats.pending_items_count}
                                    prefix={<FieldTimeOutlined />}
                                    loading={loading}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Card hoverable onClick={() => !loading && stats.overdue_items_count > 0 && setIsOverdueModalVisible(true)}>
                                {/* 3. Добавляем пропс `loading` и сюда */}
                                <Statistic
                                    title={t('itemStatus.overdue')}
                                    value={stats.overdue_items_count}
                                    prefix={<ExclamationCircleOutlined />}
                                    valueStyle={{ color: stats.overdue_items_count > 0 ? '#cf1322' : undefined }}
                                    loading={loading}
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
                    dataSource={stats.pending_items}
                    renderItem={item => (
                        <List.Item
                            actions={[<Button onClick={() => navigate(`/projects/${item.project.id}`)}>{t('Go to project')}</Button>]}
                        >
                            <List.Item.Meta
                                title={item.item}
                                description={<Tag>{item.project.name}</Tag>}
                            />
                        </List.Item>
                    )}
                />
            </Modal>

            <Modal
                title={t('itemStatus.overdue')}
                open={isOverdueModalVisible}
                onCancel={() => setIsOverdueModalVisible(false)}
                footer={null}
            >
                <List
                    dataSource={stats.overdue_items}
                    renderItem={item => (
                        <List.Item
                            actions={[<Button onClick={() => navigate(`/projects/${item.project.id}`)}>{t('Go to project')}</Button>]}
                        >
                            <List.Item.Meta
                                title={<span style={{color: '#cf1322'}}>{item.item}</span>}
                                description={
                                    <>
                                        <Tag>{item.project.name}</Tag>
                                        <Text type="danger">{t('Planned Date')}: {item.planned_date}</Text>
                                    </>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Modal>
        </Layout>
    );
}