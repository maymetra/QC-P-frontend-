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
import { Pie } from '@ant-design/charts';

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

    const [stats, setStats] = useState({
        pending_items: [],
        overdue_items: [],
        pending_items_count: 0,
        overdue_items_count: 0,
        status_counts: { open: 0, approved: 0, rejected: 0, pending: 0 },
    });
    const [loading, setLoading] = useState(true);
    const [isPendingModalVisible, setIsPendingModalVisible] = useState(false);
    const [isOverdueModalVisible, setIsOverdueModalVisible] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get('/dashboard/statistics');
                // --- ИЗМЕНЕНИЕ ЗДЕСЬ: Безопасное обновление state ---
                // Мы сохраняем дефолтную структуру, на случай если API не вернет
                // какое-то из полей (например, status_counts)
                console.log('Dashboard statistics response:', response.data);
                setStats(prevStats => ({
                    ...prevStats,
                    ...response.data
                }));
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
                message.error("Failed to load dashboard statistics.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);


// Преобразуем объект status_counts в массив, понятный для диаграмм
    const chartData = Object.entries(stats.status_counts || {})
        .map(([statusKey, rawValue]) => {
            const value = Number(rawValue) || 0;

            return {
                type: t(`itemStatus.${statusKey}`, { defaultValue: statusKey }), // подпись
                value,                                                           // число тикетов
            };
        })
        .filter((item) => item.value > 0);

    const totalTickets = chartData.reduce((acc, curr) => acc + (curr.value || 0), 0);
// Конфигурация для круговой диаграммы
    const pieConfig = {
        data: chartData,
        angleField: 'value',
        colorField: 'type',
        radius: 0.9,
        innerRadius: 0.5,      // обычный "пирог", не донат
        autoFit: true,
        height: 260,         // явная высота, чтобы точно было место
        label: {
            text: 'value', // В G2 v5 просто указываем имя поля
            style: {
                fontSize: 14,
                fontWeight: 'bold',
                textAlign: 'center',
                fill: '#fff', // Белый цвет текста для контраста на сегментах
            },
            position: 'inside',
        },
        legend: { position: 'bottom' },
        annotations: [
            {
                type: 'text',
                style: {
                    text: String(totalTickets), // Отображаем общее число
                    x: '50%',
                    y: '50%',
                    textAlign: 'center',
                    fontSize: 32,
                    fontWeight: 'bold',
                    fill: '#1f2937', // Темно-серый цвет
                },
                tooltip: false, // Отключаем тултип для текста
            },
        ],
    };

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

                    <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                        <Col xs={24} lg={12}>
                            <Card title={t('dashboard.charts.pieTitle', {defaultValue: 'Ticket Status Overview'})} loading={loading}>
                                {/* --- ИЗМЕНЕНИЕ ЗДЕСЬ --- */}
                                {chartData.length > 0 ? (
                                    <div style={{ width: '100%', height: 260 }}>
                                        <Pie {...pieConfig} />
                                    </div>
                                ) : (
                                    !loading && (
                                        <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                            {t('dashboard.charts.noData', {
                                                defaultValue: 'No status data available.',
                                            })}
                                        </div>
                                    )
                                )}
                                {/* --- КОНЕЦ ИЗМЕНЕНИЯ --- */}
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