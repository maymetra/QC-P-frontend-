// src/pages/ArchivedProjectsPage.jsx
import React, {useEffect, useMemo, useState} from 'react';
import { Layout, Typography, Button, Flex, List, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import LanguageSwitch from '../components/LanguageSwitch';
import NavigationTab from '../components/NavigationTab';
import { filterProjectsForUser } from '../services/mockData';
import { useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function ArchivedProjectsPage() {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    useEffect(() => {
        // Фильтруем проекты, оставляя только завершенные
        const allProjects = filterProjectsForUser(user);
        setProjects(allProjects.filter(p => p.status === 'finished'));
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
                    <NavigationTab activeKey="/projects/archive" />
                </Sider>

                <Content className="p-6 bg-gray-50">
                    <Flex justify="space-between" align="center" className="!mb-4">
                        <Title level={2} className="!m-0">{t('menu.archive', {defaultValue: 'Archive'})}</Title>
                    </Flex>

                    {/* Список проектов */}
                    <List
                        itemLayout="vertical"
                        dataSource={projects}
                        rowKey={(item) => item.id}
                        renderItem={(item) => (
                            <List.Item
                                onClick={() => navigate(`/projects/${item.id}`)}
                                style={{ cursor: 'pointer' }}
                                actions={[
                                    <Tag key="kunde">{item.kunde || '—'}</Tag>,
                                    <Tag key="status" color="green">
                                        {t(`projects.status.${item.status}`, { defaultValue: item.status })}
                                    </Tag>,
                                ]}
                            >
                                <List.Item.Meta
                                    title={item.name}
                                    description={`${t('projects.manager', { defaultValue: 'Manager' })}: ${item.manager || '—'}`}
                                />
                            </List.Item>
                        )}
                    />
                </Content>
            </Layout>
        </Layout>
    );
}