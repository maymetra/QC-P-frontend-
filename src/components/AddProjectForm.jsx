// src/components/AddProjectForm.jsx
import React from 'react';
import { Form, Input, Select } from 'antd';
import { useTranslation } from 'react-i18next';

const { Option } = Select;

export default function AddProjectForm({ form, onFinish, initialValues }) {
    const { t } = useTranslation();

    return (
        <Form
            form={form}
            layout="vertical"
            name="addProjectForm"
            onFinish={onFinish}
            initialValues={initialValues}
        >
            <Form.Item
                name="name"
                label={t('projects.form.name')}
                rules={[{ required: true, message: t('projects.form.nameMsg') }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="kunde"
                label={t('projects.form.kunde')}
                rules={[{ required: true, message: t('projects.form.kundeMsg') }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="manager"
                label={t('projects.form.manager')}
                rules={[{ required: true, message: t('projects.form.managerMsg') }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="status"
                label={t('projects.form.status')}
                rules={[{ required: true, message: t('projects.form.statusMsg') }]}
            >
                <Select placeholder={t('projects.form.status')}>
                    <Option value="in_progress">{t('projects.status.in_progress')}</Option>
                    <Option value="finished">{t('projects.status.finished')}</Option>
                    <Option value="on_hold">{t('projects.status.on_hold')}</Option>
                </Select>
            </Form.Item>
        </Form>
    );
}
