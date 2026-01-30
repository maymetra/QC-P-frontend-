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
                label={t('settingsPage.templates.title', { defaultValue: 'Template' })}
            >
                <Select allowClear placeholder={t('settingsPage.templates.select', { defaultValue: 'Optional: Select a template to pre-fill items' })}>
                    {templates.map(t => <Option key={t.name} value={t.name}>{t.name}</Option>)}
                </Select>
            </Form.Item>

            {selectedTemplate && (
                <Form.Item
                    name="basePlannedDate"
                    label={t('projects.form.basePlannedDate', { defaultValue: 'Base Planned Date for Template Items' })}
                    rules={[{ required: true, message: t('projects.form.basePlannedDateMsg', { defaultValue: 'Please select a base planned date' }) }]}
                >
                    <DatePicker style={{ width: '100%' }} />
                </Form.Item>
            )}

            <Form.Item
                name="kunde"
                label={t('projects.form.kunde', { defaultValue: 'Customer' })}
                rules={[{ required: true, message: t('projects.form.kundeMsg') }]}
            >
                <Input placeholder="E.ON" />
            </Form.Item>

            <Form.Item
                name="projectId"
                label={t('projects.form.projectId', { defaultValue: 'Project Name/Number/ID' })}
                rules={[{ required: true, message: t('projects.form.projectIdMsg', { defaultValue: 'Please enter project ID' }) }]}
            >
                <Input placeholder="001" />
            </Form.Item>

            <div style={{ display: 'flex', gap: '16px' }}>
                <Form.Item
                    name="quarter"
                    label={t('projects.form.quarter', { defaultValue: 'Quarter' })}
                    rules={[{ required: true, message: t('projects.form.quarterMsg', { defaultValue: 'Select quarter' }) }]}
                    style={{ flex: 1 }}
                >
                    <Select placeholder="Q1">
                        <Option value="Q1">Q1</Option>
                        <Option value="Q2">Q2</Option>
                        <Option value="Q3">Q3</Option>
                        <Option value="Q4">Q4</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="year"
                    label={t('projects.form.year', { defaultValue: 'Year' })}
                    rules={[{ required: true, message: t('projects.form.yearMsg', { defaultValue: 'Enter year' }) }]}
                    style={{ flex: 1 }}
                    initialValue={new Date().getFullYear().toString()}
                >
                    <Input placeholder="2026" />
                </Form.Item>
            </div>

            <Form.Item
                name="department"
                label={t('projects.form.department', { defaultValue: 'Department' })}
                rules={[{ required: true, message: t('projects.form.departmentMsg', { defaultValue: 'Please enter department' }) }]}
            >
                <Input placeholder="Produktentwicklung" />
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