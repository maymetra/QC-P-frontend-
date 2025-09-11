// src/components/LoginForm.jsx
import React, { useState } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Flex, Alert } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function LoginForm() {
    const { t } = useTranslation();
    const { login } = useAuth();
    const [error, setError] = useState('');

    const onFinish = async (values) => {
        setError('');
        try {
            await login(values.username, values.password);
        } catch (err) {
            setError(t('login.invalidCredentials'));
        }
    };

    return (
        <Form
            name="login"
            initialValues={{ remember: true }}
            style={{ maxWidth: 360, width: '100%' }}
            onFinish={onFinish}
        >
            {/* ——— "Username" ——— */}
            <Form.Item
                name="username"
                rules={[{ required: true, message: t('login.usernameMsg') }]} // <-- ИЗМЕНЕНО
            >
                <Input
                    prefix={<UserOutlined />}
                    placeholder={t('login.username')} // <-- ИЗМЕНЕНО
                />
            </Form.Item>

            {/* ——— "Password" ——— */}
            <Form.Item
                name="password"
                rules={[{ required: true, message: t('login.passwordMsg') }]} // <-- ИЗМЕНЕНО
            >
                <Input
                    prefix={<LockOutlined />}
                    type="password"
                    placeholder={t('login.password')} // <-- ИЗМЕНЕНО
                />
            </Form.Item>

            {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}

            {/* ——— checkbox + link——— */}
            <Form.Item>
                <Flex justify="space-between" align="center">
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox>{t('login.remember')}</Checkbox> {/* <-- ИЗМЕНЕНО */}
                    </Form.Item>
                    <a href="#">{t('login.forgot')}</a> {/* <-- ИЗМЕНЕНО */}
                </Flex>
            </Form.Item>

            {/* ——— login button ——— */}
            <Form.Item>
                <Button block type="primary" htmlType="submit">
                    {t('login.login')} {/* <-- ИЗМЕНЕНО */}
                </Button>
            </Form.Item>
        </Form>
    );
}