// src/components/AddUserForm.jsx
import React from 'react';
import { Form, Input, Select } from 'antd';
import { useTranslation } from 'react-i18next';

const { Option } = Select;

export default function AddUserForm({ form, onFinish, isEditing = false }) {
    const { t } = useTranslation();

    return (
        <Form form={form} layout="vertical" name="addUserForm" onFinish={onFinish}>
            <Form.Item
                name="name"
                label={t('usersPage.addUserModal.name')}
                rules={[{ required: true, message: t('usersPage.addUserModal.nameMsg') }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="username"
                label={t('usersPage.addUserModal.username')}
                rules={[{ required: true, message: t('usersPage.addUserModal.usernameMsg') }]}
            >
                <Input disabled={isEditing} />
            </Form.Item>

            <Form.Item
                name="password"
                label={t('usersPage.addUserModal.password')}
                rules={[{ required: true, message: t('usersPage.addUserModal.passwordMsg') }]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item
                name="role"
                label={t('usersPage.addUserModal.role')}
                rules={[{ required: true, message: t('usersPage.addUserModal.roleMsg') }]}
            >
                <Select placeholder={t('usersPage.addUserModal.roleMsg')}>
                    <Option value="admin">{t('usersPage.addUserModal.admin')}</Option>
                    <Option value="auditor">{t('usersPage.addUserModal.auditor')}</Option>
                    <Option value="manager">{t('usersPage.addUserModal.manager')}</Option>
                </Select>
            </Form.Item>
        </Form>
    );
}
