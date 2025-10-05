// src/components/JirasTable.jsx
import React, { useEffect, useMemo, useState, forwardRef } from 'react';
import {
    Table, Tag, Modal, Form, Input, DatePicker, Upload, Space, message, Button, Popconfirm, List, Radio, Select
} from 'antd';
import { useTranslation } from 'react-i18next';
import { LinkOutlined, PlusOutlined, UploadOutlined, PaperClipOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { knowledgeBase } from '../services/mockData';
import apiClient from '../services/api';
import dayjs from 'dayjs';

const { Option } = Select;

const JirasTable = forwardRef(({ items, loading, fetchItems, onLog, isExporting }, ref) => {
    const { t } = useTranslation();
    const { projectId } = useParams();
    const { user } = useAuth();
    const role = user?.role;
    const currentUserName = user?.name;
    const isAuditor = role === 'admin' || role === 'auditor';
    const isManager = role === 'manager';

    // Вся логика состояний для модальных окон сохранена
    const [addOpen, setAddOpen] = useState(false);
    const [addForm] = Form.useForm();
    const [addMode, setAddMode] = useState('new');
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [editOpen, setEditOpen] = useState(false);
    const [editForm] = Form.useForm();
    const [editingItem, setEditingItem] = useState(null);

    const [docUploadOpen, setDocUploadOpen] = useState(false);
    const [docFiles, setDocFiles] = useState([]);

    const [remarksOpen, setRemarksOpen] = useState(false);
    const [remarksForm] = Form.useForm();
    const [files, setFiles] = useState([]);


    // --- ОБРАБОТЧИКИ, АККУРАТНО ПЕРЕВЕДЕННЫЕ НА API ---

    const onAddFinish = async (values) => {
        const itemText = values.addMode === 'new' ? values.newItemText : values.selectedItem;
        if (!itemText) {
            message.error(t('Please select or enter an inspection item.', {defaultValue: 'Please select or enter an inspection item.'}));
            return;
        }

        const payload = {
            item: itemText,
            planned_date: values.plannedDate ? values.plannedDate.format('YYYY-MM-DD') : null,
            status: 'open',
        };

        try {
            await apiClient.post(`/projects/${projectId}/items`, payload);
            message.success(t('Item added successfully'));
            fetchItems(); // Обновляем список через пропс
            setAddOpen(false);
            onLog({ kind: 'add_item', by: currentUserName, message: `${itemText} -> Created` });
        } catch (error) {
            message.error(t('Failed to add item'));
        }
    };

    const handleDelete = async (itemId) => {
        try {
            await apiClient.delete(`/projects/${projectId}/items/${itemId}`);
            message.success(t('Item deleted.', {defaultValue: 'Item deleted.'}));
            fetchItems();
        } catch (error) {
            message.error(t('Failed to delete item'));
        }
    };

    const onEditFinish = async (values) => {
        const payload = {
            action: (values.action || '').trim(),
            author: (values.author || '').trim() || currentUserName,
        };
        try {
            await apiClient.put(`/projects/${projectId}/items/${editingItem.id}`, payload);
            message.success(t('Saved', { defaultValue: 'Saved' }));
            fetchItems();
            setEditOpen(false);
        } catch (error) {
            message.error(t('Failed to save changes'));
        }
    };

    const handleDocUpload = async () => {
        const payload = { documents: docFiles };
        try {
            await apiClient.put(`/projects/${projectId}/items/${editingItem.id}`, payload);
            message.success(t('Documents updated.', {defaultValue: 'Documents updated.'}));
            fetchItems();
            setDocUploadOpen(false);
        } catch (error) {
            message.error(t('Failed to update documents'));
        }
    };

    const handleStatusChange = async (itemId, newStatus) => {
        const payload = {
            status: newStatus,
            reviewer: isAuditor ? currentUserName : undefined,
            // Устанавливаем дату закрытия или сбрасываем ее в null
            closed_date: newStatus === 'approved' ? dayjs().format('YYYY-MM-DD') : (newStatus === 'open' || newStatus === 'rejected') ? null : undefined,
        };
        try {
            await apiClient.put(`/projects/${projectId}/items/${itemId}`, payload);
            fetchItems();
            onLog({ kind: 'item_status', by: currentUserName, message: `Status changed to ${newStatus}` });
        } catch (error) {
            message.error(t('Failed to change status'));
        }
    };

    const onRemarksFinish = async (values) => {
        const payload = {
            comment: values.comment || '',
            attachments: files, // Вложения пока сохраняем как JSON, как и было
        };
        try {
            await apiClient.put(`/projects/${projectId}/items/${editingItem.id}`, payload);
            message.success(t('Saved', { defaultValue: 'Saved' }));
            fetchItems();
            setRemarksOpen(false);
        } catch (error) {
            message.error(t('Failed to save remarks'));
        }
    };

    // --- Функции для открытия модальных окон (сохранены) ---
    const openAdd = () => { addForm.resetFields(); setAddMode('new'); setSelectedCategory(null); setAddOpen(true); };
    const openEdit = (record) => { setEditingItem(record); editForm.setFieldsValue(record); setEditOpen(true); };
    const openDocUpload = (record) => { setEditingItem(record); setDocFiles(record.documents || []); setDocUploadOpen(true); };
    const openRemarks = (record) => {
        if (!isAuditor) return;
        setEditingItem(record);
        remarksForm.setFieldsValue({ comment: record.comment || '' });
        setFiles(record.attachments || []);
        setRemarksOpen(true);
    };

    // --- Вспомогательные функции для Upload (сохранены) ---
    const beforeDocUpload = (file) => {
        const newFile = { uid: file.uid, name: file.name, url: URL.createObjectURL(file) };
        setDocFiles(prev => [...prev, newFile]);
        return false;
    };
    const onRemoveDoc = (file) => {
        setDocFiles(prev => prev.filter(f => f.uid !== file.uid));
    };
    const beforeUpload = (file) => {
        const fileWithUrl = { uid: file.uid, name: file.name, url: URL.createObjectURL(file), originFileObj: file };
        setFiles(prev => [...prev, fileWithUrl]);
        return false;
    };
    const onRemoveFile = (file) => {
        setFiles(prev => prev.filter(f => f.uid !== file.uid));
    };

    const availableItems = useMemo(() => {
        if (!selectedCategory) return [];
        const category = knowledgeBase.find(c => c.category === selectedCategory);
        return category ? category.items : [];
    }, [selectedCategory]);

    // --- КОЛОНКИ ТАБЛИЦЫ (полная версия с исправленными dataIndex) ---
    let columns = [
        { title: t('table.pruefungsgegenstand'), dataIndex: 'item', sorter: (a, b) => (a.item || '').localeCompare(b.item || '') },
        {
            title: t('table.massnahme'), dataIndex: 'action',
            render: (text, record) => (isExporting ? text : <Space><span>{text}</span>{isManager && <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />}</Space>)
        },
        { title: t('table.autor'), dataIndex: 'author', sorter: (a, b) => (a.author || '').localeCompare(b.author || '')},
        { title: t('table.pruefer'), dataIndex: 'reviewer' },
        { title: t('table.planTermin'), dataIndex: 'planned_date', sorter: (a, b) => dayjs(a.planned_date).unix() - dayjs(b.planned_date).unix() },
        { title: t('table.istTermin'), dataIndex: 'closed_date', sorter: (a, b) => dayjs(a.closed_date).unix() - dayjs(b.closed_date).unix() },
        {
            title: t('table.dokument'), dataIndex: 'documents',
            render: (docs, record) => {
                const hasDocs = docs && docs.length > 0;
                if (hasDocs) {
                    return (
                        <div>
                            <List size="small" dataSource={docs} renderItem={(doc) => (<List.Item><a href={doc.url} target="_blank" rel="noopener noreferrer"><LinkOutlined /> {doc.name}</a></List.Item>)} />
                            {isManager && !isExporting && <Button type="dashed" size="small" icon={<EditOutlined />} onClick={() => openDocUpload(record)} style={{marginTop: '8px'}}>{t('Edit', {defaultValue: 'Edit'})}</Button>}
                        </div>
                    );
                }
                if (isManager && !isExporting) return <Button type="dashed" size="small" icon={<UploadOutlined />} onClick={() => openDocUpload(record)}>{t('Upload', {defaultValue: 'Upload'})}</Button>;
                return null;
            }
        },
        {
            title: t('table.status'), dataIndex: 'status',
            render: (status, record) => {
                const text = t(`itemStatus.${status}`, { defaultValue: status });
                if (isExporting) return text;
                const color = status === 'approved' ? 'green' : status === 'pending' ? 'orange' : status === 'rejected' ? 'red' : 'default';
                const tag = <Tag color={color}>{text}</Tag>;
                if (isAuditor) {
                    return <Popconfirm title={t('Change status?', { defaultValue: 'Change status?' })} onConfirm={() => handleStatusChange(record.id, 'approved')} onCancel={() => handleStatusChange(record.id, 'rejected')} okText={t('itemStatus.approved')} cancelText={t('itemStatus.rejected')}><a style={{ cursor: 'pointer' }}>{tag}</a></Popconfirm>;
                }
                if (isManager && (status === 'rejected' || status === 'open')) {
                    return <Popconfirm title={t('Submit for approval?', { defaultValue: 'Submit for approval?' })} onConfirm={() => handleStatusChange(record.id, 'pending')} okText={t('Yes')} cancelText={t('No')}><a style={{ cursor: 'pointer' }}>{tag}</a></Popconfirm>;
                }
                return tag;
            },
            filters: !isExporting ? [{ text: t('itemStatus.approved'), value: 'approved' }, { text: t('itemStatus.rejected'), value: 'rejected' }, { text: t('itemStatus.pending'),  value: 'pending' }, { text: t('itemStatus.open'), value: 'open' }] : null, onFilter: (v, r) => r.status === v
        },
        {
            title: t('table.bemerkungen'), dataIndex: 'comment',
            render: (text, record) => {
                const hasAttachments = record.attachments && record.attachments.length > 0;
                const content = (
                    <div>
                        {text && <span>{text}</span>}
                        {hasAttachments && <List size="small" dataSource={record.attachments} renderItem={(file) => (<List.Item style={{padding: '4px 0'}}><a href={file.url} target="_blank" rel="noopener noreferrer"><PaperClipOutlined /> {file.name}</a></List.Item>)}/>}
                    </div>
                );
                if (isAuditor && !isExporting) {
                    return <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}><div style={{ flex: 1 }}>{content}</div><Button icon={<EditOutlined />} size="small" onClick={() => openRemarks(record)} /></div>;
                }
                return content;
            }
        },
        {
            title: t('Actions', {defaultValue: 'Actions'}), key: 'actions',
            render: (_, record) => {
                if (isAuditor && !isExporting) {
                    return <Popconfirm title={t('Delete this item?', {defaultValue: 'Delete this item?'})} onConfirm={() => handleDelete(record.id)} okText={t('Yes')} cancelText={t('No')}><Button danger icon={<DeleteOutlined />} size="small" /></Popconfirm>;
                }
                return null;
            }
        }
    ];

    if (isExporting) {
        columns = columns.filter(col => col.key !== 'actions');
    }

    return (
        <div ref={ref}>
            {isAuditor && !isExporting && (
                <Button type="primary" icon={<PlusOutlined />} onClick={openAdd} className="!mb-3">
                    {t('Add inspection item', { defaultValue: 'Add inspection item' })}
                </Button>
            )}

            <Table
                columns={columns}
                dataSource={items}
                rowKey="id"
                loading={loading}
                scroll={{ x: true }}
                pagination={false}
            />

            {/* ВСЕ МОДАЛЬНЫЕ ОКНА НА МЕСТЕ, В ПОЛНОЙ КОМПЛЕКТАЦИИ */}
            <Modal title={t('Add inspection item', { defaultValue: 'Add inspection item' })} open={addOpen} onCancel={() => setAddOpen(false)} onOk={addForm.submit} okText={t('common.createOk', { defaultValue: 'Create' })} cancelText={t('common.cancel', { defaultValue: 'Cancel' })}>
                <Form layout="vertical" form={addForm} onFinish={onAddFinish} initialValues={{ addMode: 'new' }}>
                    <Form.Item name="addMode" label={t('Source', {defaultValue: 'Source'})}><Radio.Group onChange={(e) => setAddMode(e.target.value)}><Radio.Button value="new">{t('Create New', {defaultValue: 'Create New'})}</Radio.Button><Radio.Button value="select">{t('Select from KB', {defaultValue: 'Select from KB'})}</Radio.Button></Radio.Group></Form.Item>
                    {addMode === 'new' ? (
                        <Form.Item name="newItemText" label={t('table.pruefungsgegenstand')} rules={[{ required: true, message: t('Please enter item text', {defaultValue: 'Please enter item text'}) }]}><Input.TextArea rows={3} /></Form.Item>
                    ) : (
                        <>
                            <Form.Item name="category" label={t('Category', {defaultValue: 'Category'})} rules={[{ required: true, message: t('Please select a category', {defaultValue: 'Please select a category'})}]}><Select showSearch placeholder={t('Select a category', {defaultValue: 'Select a category'})} onChange={(value) => { setSelectedCategory(value); addForm.resetFields(['selectedItem']); }}>{knowledgeBase.map(c => <Option key={c.category} value={c.category}>{c.category}</Option>)}</Select></Form.Item>
                            <Form.Item name="selectedItem" label={t('table.pruefungsgegenstand')} rules={[{ required: true, message: t('Please select an item', {defaultValue: 'Please select an item'})}]}><Select showSearch placeholder={t('Select an item', {defaultValue: 'Select an item'})} disabled={!selectedCategory}>{availableItems.map(item => <Option key={item} value={item}>{item}</Option>)}</Select></Form.Item>
                        </>
                    )}
                    <Form.Item name="plannedDate" label={t('table.planTermin')} rules={[{ required: true, message: t('Please select planned date', { defaultValue: 'Please select planned date' }) }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
                </Form>
            </Modal>

            <Modal title={t('Edit Measure', { defaultValue: 'Edit Measure' })} open={editOpen} onCancel={() => setEditOpen(false)} onOk={editForm.submit} okText={t('Save', { defaultValue: 'Save' })} cancelText={t('common.cancel', { defaultValue: 'Cancel' })}>
                <Form layout="vertical" form={editForm} onFinish={onEditFinish}>
                    <Form.Item name="action" label={t('table.massnahme')}><Input.TextArea rows={4} /></Form.Item>
                    <Form.Item name="author" label={t('table.autor')}><Input /></Form.Item>
                </Form>
            </Modal>

            <Modal title={t('Manage Documents', {defaultValue: 'Manage Documents'})} open={docUploadOpen} onCancel={() => setDocUploadOpen(false)} onOk={handleDocUpload} okText={t('Save')} cancelText={t('common.cancel')}>
                <Upload multiple fileList={docFiles} beforeUpload={beforeDocUpload} onRemove={onRemoveDoc}><Button icon={<UploadOutlined />}>{t('Add File', {defaultValue: 'Add File'})}</Button></Upload>
            </Modal>

            <Modal title={t('Edit remarks', { defaultValue: 'Edit remarks' })} open={remarksOpen} onCancel={() => { setRemarksOpen(false); setEditingItem(null); setFiles([]); }} onOk={remarksForm.submit} okText={t('Save', { defaultValue: 'Save' })} cancelText={t('common.cancel', { defaultValue: 'Cancel' })}>
                <Form layout="vertical" form={remarksForm} onFinish={onRemarksFinish}>
                    <Form.Item name="comment" label={t('table.bemerkungen')}><Input.TextArea rows={4} /></Form.Item>
                    <Form.Item label={t('Attachments', { defaultValue: 'Attachments' })} valuePropName="fileList">
                        <Upload multiple beforeUpload={beforeUpload} onRemove={onRemoveFile} fileList={files} listType="text"><Button icon={<UploadOutlined />}>{t('Add files', { defaultValue: 'Add files' })}</Button></Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
});

export default JirasTable;