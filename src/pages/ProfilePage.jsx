import React from 'react';
import { Layout, Typography, Form, Input, Button, Card, message, Flex } from 'antd';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import apiClient from '../services/api';
import NavigationTab from '../components/NavigationTab';
import LanguageSwitch from '../components/LanguageSwitch';
import { LogoutOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function ProfilePage() {
    const { user, logout, fetchNotificationCount } = useAuth();
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        try {
            const payload = {
                name: values.name,
                // Если пароль не введен, не отправляем его
                password: values.password || undefined,
            };
            await apiClient.put('/users/me', payload);
            message.success(t('profile.success'));
            form.setFieldValue('password', '');
            form.setFieldValue('confirm', '');
            fetchNotificationCount(user);
        } catch (error) {
            console.error("Update failed", error);
            message.error("Failed to update profile");
        }
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
                    <NavigationTab activeKey="/profile" />
                </Sider>

                <Content className="p-6 bg-gray-50">
                    <Title level={2} className="!mb-6">{t('profile.title')}</Title>

                    <Card style={{ maxWidth: 600 }}>
                        <Form
                            form={form}
                            layout="vertical"
                            initialValues={{ name: user?.name }}
                            onFinish={onFinish}
                        >
                            <Form.Item
                                name="name"
                                label={t('profile.name')}
                                rules={[{ required: true }]}
                            >
                                <Input prefix={<UserOutlined />} />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label={t('profile.password')}
                                help="Leave empty to keep current password"
                            >
                                <Input.Password prefix={<LockOutlined />} />
                            </Form.Item>

                            <Form.Item
                                name="confirm"
                                label={t('profile.confirmPassword')}
                                dependencies={['password']}
                                rules={[
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error(t('profile.mismatch')));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password prefix={<LockOutlined />} />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    {t('profile.update')}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Content>
            </Layout>
        </Layout>
    );
}