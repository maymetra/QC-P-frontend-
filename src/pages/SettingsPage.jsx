// src/pages/SettingsPage.jsx
import React from 'react';
import { Layout, Typography, Divider, Button, Flex } from 'antd';
import { useAuth } from '../context/AuthContext';
import LanguageSwitch from '../components/LanguageSwitch';
import NavigationTab from '../components/NavigationTab';
import { LogoutOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const { t } = useTranslation();

    const renderPersonalSettings = () => (
        <>
            <Title level={3}>{t('settingsPage.personal.title')}</Title>
            <Paragraph>{t('settingsPage.personal.description')}</Paragraph>
        </>
    );

    const renderTemplateManager = () => (
        <>
            <Title level={3}>{t('settingsPage.templates.title')}</Title>
            <Paragraph>{t('settingsPage.templates.description')}</Paragraph>
        </>
    );

    const renderGlobalSettings = () => (
        <>
            <Title level={3}>{t('settingsPage.global.title')}</Title>
            <Paragraph>{t('settingsPage.global.description')}</Paragraph>
        </>
    );

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
                    <NavigationTab activeKey="/settings" />
                </Sider>

                <Content className="p-6 bg-gray-50">
                    <Title level={2} className="!mb-6">{t('settingsPage.title')}</Title>

                    {(user.role === 'admin' || user.role === 'auditor' || user.role === 'manager') && renderPersonalSettings()}

                    {user.role === 'auditor' && <Divider />}
                    {user.role === 'auditor' && renderTemplateManager()}

                    {user.role === 'admin' && <Divider />}
                    {user.role === 'admin' && renderGlobalSettings()}
                </Content>
            </Layout>
        </Layout>
    );
}
