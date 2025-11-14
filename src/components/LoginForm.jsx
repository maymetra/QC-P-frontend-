// src/components/LoginForm.jsx
import React, { useState } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Flex, Alert, Modal, message } from 'antd'; // <-- Modal, message
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api'; // <-- API client

export default function LoginForm() {
    const { t } = useTranslation();
    const { login } = useAuth();
    const [error, setError] = useState('');

    // Состояния для модалки забытого пароля
    const [isForgotOpen, setIsForgotOpen] = useState(false);
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotForm] = Form.useForm();

    const onFinish = async (values) => {
        setError('');
        try {
            await login(values.username, values.password);
        } catch (err) {
            setError(t('login.invalidCredentials'));
        }
    };

    // Обработчик отправки запроса на сброс
    const handleForgotSubmit = async (values) => {
        setForgotLoading(true);
        try {
            await apiClient.post('/auth/forgot-password', { username: values.username });
            message.success(t('login.requestSent'));
            setIsForgotOpen(false);
            forgotForm.resetFields();
        } catch (error) {
            message.error("Failed to send request or user not found.");
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <>
            <Form
                name="login"
                initialValues={{ remember: true }}
                style={{ maxWidth: 360, width: '100%' }}
                onFinish={onFinish}
            >
                {/* ... Username и Password поля остаются теми же ... */}
                <Form.Item name="username" rules={[{ required: true, message: t('login.usernameMsg') }]}>
                    <Input prefix={<UserOutlined />} placeholder={t('login.username')} />
                </Form.Item>
                <Form.Item name="password" rules={[{ required: true, message: t('login.passwordMsg') }]}>
                    <Input prefix={<LockOutlined />} type="password" placeholder={t('login.password')} />
                </Form.Item>

                {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}

                <Form.Item>
                    <Flex justify="space-between" align="center">
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox>{t('login.remember')}</Checkbox>
                        </Form.Item>
                        {/* Кнопка вызывает модалку */}
                        <a onClick={(e) => { e.preventDefault(); setIsForgotOpen(true); }} href="#">
                            {t('login.forgot')}
                        </a>
                    </Flex>
                </Form.Item>

                <Form.Item>
                    <Button block type="primary" htmlType="submit">
                        {t('login.login')}
                    </Button>
                </Form.Item>
            </Form>

            {/* Модальное окно */}
            <Modal
                title={t('login.forgotModalTitle')}
                open={isForgotOpen}
                onCancel={() => setIsForgotOpen(false)}
                onOk={() => forgotForm.submit()}
                confirmLoading={forgotLoading}
                okText={t('login.submitRequest')}
                cancelText={t('common.cancel')}
            >
                <p>{t('login.forgotDesc')}</p>
                <Form form={forgotForm} layout="vertical" onFinish={handleForgotSubmit}>
                    <Form.Item
                        name="username"
                        label={t('login.username')}
                        rules={[{ required: true, message: t('login.usernameMsg') }]}
                    >
                        <Input prefix={<UserOutlined />} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}