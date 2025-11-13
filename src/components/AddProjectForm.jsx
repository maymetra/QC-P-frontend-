// src/components/AddProjectForm.jsx
import React from 'react';
import { Form, Input, Select, DatePicker, AutoComplete } from 'antd';
import { useTranslation } from 'react-i18next';

const { Option } = Select;

export default function AddProjectForm({ form, onFinish, initialValues, managers = [], templates = [] }) {
    const { t } = useTranslation();

    const selectedTemplate = Form.useWatch('template', form);

    // Преобразуем список менеджеров для AutoComplete
    const managerOptions = managers.map(name => ({ value: name }));

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

            {selectedTemplate && (
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

            {/* Используем AutoComplete, чтобы можно было ввести новое имя */}
            <Form.Item
                name="manager"
                label={t('projects.form.manager')}
                rules={[{ required: true, message: t('projects.form.managerMsg') }]}
            >
                <AutoComplete
                    options={managerOptions}
                    placeholder={t('projects.form.managerMsg')}
                    filterOption={(inputValue, option) =>
                        option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                    }
                />
            </Form.Item>

            {/* Поле Status удалено, теперь оно выставляется автоматически на бэкенде */}
        </Form>
    );
}