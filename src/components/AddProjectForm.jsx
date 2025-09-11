// src/components/AddProjectForm.jsx
import React from 'react';
import { Form, Input, Select, DatePicker } from 'antd'; // <-- Добавлен DatePicker
import { useTranslation } from 'react-i18next';

const { Option } = Select;

export default function AddProjectForm({ form, onFinish, initialValues, managers = [], templates = [] }) {
    const { t } = useTranslation();

    const selectedTemplate = Form.useWatch('template', form); // Следим за изменением выбранного шаблона

    return (
        <Form
            form={form}
            layout="vertical"
            name="addProjectForm"
            onFinish={onFinish}
            initialValues={initialValues}
        >
            <Form.Item
                name="template"
                label={t('settingsPage.templates.title', {defaultValue: 'Template'})}
            >
                <Select allowClear placeholder={t('settingsPage.templates.select', {defaultValue: 'Optional: Select a template to pre-fill items'})}>
                    {templates.map(t => <Option key={t.name} value={t.name}>{t.name}</Option>)}
                </Select>
            </Form.Item>

            {/* <-- НОВОЕ ПОЛЕ: Базовая дата для шаблона --> */}
            {selectedTemplate && ( // Показываем это поле только если выбран шаблон
                <Form.Item
                    name="basePlannedDate"
                    label={t('projects.form.basePlannedDate', {defaultValue: 'Base Planned Date for Template Items'})}
                    rules={[{ required: true, message: t('projects.form.basePlannedDateMsg', {defaultValue: 'Please select a base planned date'}) }]}
                >
                    <DatePicker style={{ width: '100%' }} />
                </Form.Item>
            )}

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
                <Select showSearch placeholder={t('projects.form.managerMsg')}>
                    {managers.map(name => (
                        <Option key={name} value={name}>
                            {name}
                        </Option>
                    ))}
                </Select>
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