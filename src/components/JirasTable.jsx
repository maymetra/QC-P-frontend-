import React, { useEffect, useMemo, useState } from 'react';
import {
    Table, Tag, Modal, Form, Input, DatePicker, Upload, Space, message, Button, Popconfirm
} from 'antd';
import { useTranslation } from 'react-i18next';
import { LinkOutlined, PlusOutlined, UploadOutlined, PaperClipOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function JirasTable({ onLog }) {
    const { t } = useTranslation();
    const { projectId } = useParams();
    const { user } = useAuth();
    const role = user?.role;
    const currentUserName = user?.name;
    const canEdit = role === 'admin' || role === 'auditor';

    const storageKey = useMemo(() => `jiraItems:${projectId || 'global'}`, [projectId]);

    const defaultData = [
        {
            key: '1',
            item: 'Projektplan',
            action: 'Projektplan erstellen und vom Lenkungsausschuss genehmigen lassen',
            author: 'Projektmanager 1',
            reviewer: 'Lamine',
            plannedDate: '2025-08-20',
            closedDate: '2025-08-19',
            document: { name: 'Projektplan_final_v1.pdf', url: 'https://example.com/docs/projektplan_final.pdf' },
            status: true,
            comment: 'Plan genehmigt. Alle Ressourcen sind bestätigt.',
            attachments: [],
        },
        {
            key: '2',
            item: 'Risikoanalyse',
            action: 'Risikobewertung durchführen und ein Risikoregister erstellen',
            author: 'Projektmanager 2',
            reviewer: 'Judith',
            plannedDate: '2025-08-25',
            closedDate: '',
            document: null,
            status: false,
            comment: 'In Bearbeitung. Warten auf Informationen von der Rechtsabteilung.',
            attachments: [],
        },
    ];

    const [data, setData] = useState(() => {
        try {
            const raw = localStorage.getItem(storageKey);
            return raw ? JSON.parse(raw) : defaultData;
        } catch {
            return defaultData;
        }
    });

    useEffect(() => {
        try { localStorage.setItem(storageKey, JSON.stringify(data)); } catch { /* empty */ }
    }, [data, storageKey]);

    // -------- Add item --------
    const [addOpen, setAddOpen] = useState(false);
    const [addForm] = Form.useForm();

    const openAdd = () => { addForm.resetFields(); setAddOpen(true); };
    const handleAdd = () => addForm.submit();

    const onAddFinish = (values) => {
        const planned = values.plannedDate ? values.plannedDate.format('YYYY-MM-DD') : '';
        const next = {
            key: `i-${Date.now()}`,
            item: (values.item || '').trim(),
            action: '',
            author: '',
            reviewer: '',
            plannedDate: planned,
            closedDate: '',
            document: null,
            status: false,
            comment: '',
            attachments: [],
        };
        setData(prev => [next, ...prev]);
        setAddOpen(false);
        addForm.resetFields();

        if (typeof onLog === 'function') {
            onLog({
                kind: 'add_item',
                by: currentUserName,
                ts: new Date().toISOString(),
                message: `${next.item} -> Created by ${currentUserName} (planned ${planned})`
            });
        }
    };

    // -------- Status change (approve/reject) --------
    const isoToday = () => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const approve = (record) => {
        const today = isoToday();
        setData(prev =>
            prev.map(r =>
                r.key === record.key
                    ? { ...r, status: true, reviewer: currentUserName || r.reviewer, closedDate: today }
                    : r
            )
        );
        if (typeof onLog === 'function') {
            onLog({
                kind: 'item_status',
                by: currentUserName,
                ts: new Date().toISOString(),
                message: `${record.item} -> Status changed to approved by ${currentUserName} on ${today}`
            });
        }
        message.success(t('Approved', { defaultValue: 'Approved' }));
    };

    const reject = (record) => {
        const today = isoToday();
        setData(prev =>
            prev.map(r =>
                r.key === record.key
                    ? { ...r, status: false, reviewer: currentUserName || r.reviewer, closedDate: '' }
                    : r
            )
        );
        if (typeof onLog === 'function') {
            onLog({
                kind: 'item_status',
                by: currentUserName,
                ts: new Date().toISOString(),
                message: `${record.item} -> Status changed to rejected by ${currentUserName} on ${today}`
            });
        }
        message.info(t('Rejected', { defaultValue: 'Rejected' }));
    };

    // -------- Remarks (+ attachments) --------
    const [remarksOpen, setRemarksOpen] = useState(false);
    const [remarksForm] = Form.useForm();
    const [editingKey, setEditingKey] = useState(null);
    const [files, setFiles] = useState([]);

    const openRemarks = (record) => {
        if (!canEdit) return;
        setEditingKey(record.key);
        remarksForm.setFieldsValue({ comment: record.comment || '' });
        setFiles(record.attachments || []);
        setRemarksOpen(true);
    };

    const beforeUpload = (file) => { setFiles(prev => [...prev, file]); return false; };
    const onRemoveFile = (file) => { setFiles(prev => prev.filter(f => f.uid !== file.uid)); };
    const submitRemarks = () => remarksForm.submit();

    const onRemarksFinish = (values) => {
        const old = data.find(r => r.key === editingKey);
        setData(prev => prev.map(r =>
            r.key === editingKey ? { ...r, comment: values.comment || '', attachments: files } : r
        ));
        setRemarksOpen(false);
        setEditingKey(null);
        setFiles([]);
        remarksForm.resetFields();
        message.success(t('Saved', { defaultValue: 'Saved' }));

        if (typeof onLog === 'function' && old) {
            onLog({
                kind: 'remarks_change',
                by: currentUserName,
                ts: new Date().toISOString(),
                message: `${old.item} -> Remarks updated by ${currentUserName}`
            });
        }
    };

    // -------- Columns --------
    const columns = [
        { title: t('table.pruefungsgegenstand'), dataIndex: 'item',
            sorter: (a, b) => (a.item || '').localeCompare(b.item || '') },
        { title: t('table.massnahme'), dataIndex: 'action' },
        { title: t('table.autor'), dataIndex: 'author',
            sorter: (a, b) => (a.author || '').localeCompare(b.author || ''),
            filters: [
                { text: 'Projektmanager 1', value: 'Projektmanager 1' },
                { text: 'Projektmanager 2', value: 'Projektmanager 2' },
                { text: 'Projektmanager 3', value: 'Projektmanager 3' },
            ], onFilter: (v, r) => r.author === v },
        { title: t('table.pruefer'), dataIndex: 'reviewer',
            filters: [
                { text: t('filter.lamine'), value: 'Lamine' },
                { text: t('filter.judith'), value: 'Judith' },
                { text: t('filter.artem'),  value: 'Artem' },
            ], onFilter: (v, r) => r.reviewer === v },
        { title: t('table.planTermin'), dataIndex: 'plannedDate',
            sorter: (a, b) => new Date(a.plannedDate || 0) - new Date(b.plannedDate || 0) },
        { title: t('table.istTermin'), dataIndex: 'closedDate',
            sorter: (a, b) => new Date(a.closedDate || 0) - new Date(b.closedDate || 0) },
        { title: t('table.dokument'), dataIndex: 'document',
            render: (doc) =>
                doc && doc.url ? (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <LinkOutlined style={{ marginRight: 8 }} />
                        {doc.name}
                    </a>
                ) : null },
        { title: t('table.status'), dataIndex: 'status',
            render: (s, record) => {
                const tag = <Tag color={s ? 'green' : 'red'}>{s ? '✓' : '✗'}</Tag>;
                if (!canEdit) return tag;
                return (
                    <Popconfirm
                        title={t('Confirm approval?', { defaultValue: 'Confirm approval?' })}
                        okText={t('Yes', { defaultValue: 'Yes' })}
                        cancelText={t('No', { defaultValue: 'No' })}
                        onConfirm={() => approve(record)}
                        onCancel={() => reject(record)}
                    >
                        <a style={{ cursor: 'pointer' }}>{tag}</a>
                    </Popconfirm>
                );
            },
            filters: [
                { text: t('filter.closed'), value: true },
                { text: t('filter.open'),   value: false },
            ], onFilter: (v, r) => r.status === v },
        { title: t('table.bemerkungen'), dataIndex: 'comment',
            render: (text, record) => {
                const hasFiles = (record.attachments?.length || 0) > 0;
                const content = (
                    <Space size="small">
                        {hasFiles && <PaperClipOutlined />}
                        <span>{text || ''}</span>
                    </Space>
                );
                return canEdit
                    ? <Button type="link" onClick={() => openRemarks(record)}>{content}</Button>
                    : content;
            } },
    ];

    return (
        <>
            {canEdit && (
                <Button type="primary" icon={<PlusOutlined />} onClick={openAdd} className="!mb-3">
                    {t('Add inspection item', { defaultValue: 'Add inspection item' })}
                </Button>
            )}

            <Table columns={columns} dataSource={data} rowKey="key" scroll={{ x: true }} />

            {/* Add item */}
            <Modal
                title={t('Create inspection item', { defaultValue: 'Create inspection item' })}
                open={addOpen}
                onCancel={() => setAddOpen(false)}
                onOk={handleAdd}
                okText={t('common.createOk', { defaultValue: 'Create' })}
                cancelText={t('common.cancel', { defaultValue: 'Cancel' })}
            >
                <Form layout="vertical" form={addForm} onFinish={onAddFinish}>
                    <Form.Item
                        name="item"
                        label={t('table.pruefungsgegenstand')}
                        rules={[{ required: true, message: t('Please enter inspection item', { defaultValue: 'Please enter inspection item' }) }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="plannedDate"
                        label={t('table.planTermin')}
                        rules={[{ required: true, message: t('Please select planned date', { defaultValue: 'Please select planned date' }) }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit remarks */}
            <Modal
                title={t('Edit remarks', { defaultValue: 'Edit remarks' })}
                open={remarksOpen}
                onCancel={() => { setRemarksOpen(false); setEditingKey(null); setFiles([]); }}
                onOk={submitRemarks}
                okText={t('Save', { defaultValue: 'Save' })}
                cancelText={t('common.cancel', { defaultValue: 'Cancel' })}
            >
                <Form layout="vertical" form={remarksForm} onFinish={onRemarksFinish}>
                    <Form.Item name="comment" label={t('table.bemerkungen')}>
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item label={t('Attachments', { defaultValue: 'Attachments' })} valuePropName="fileList">
                        <Upload multiple beforeUpload={beforeUpload} onRemove={onRemoveFile} fileList={files} listType="text">
                            <Button icon={<UploadOutlined />}>{t('Add files', { defaultValue: 'Add files' })}</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}
