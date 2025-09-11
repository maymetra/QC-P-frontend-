import React, { useEffect, useMemo, useState, forwardRef } from 'react';
import {
    Table, Tag, Modal, Form, Input, DatePicker, Upload, Space, message, Button, Popconfirm, List, Radio, Select
} from 'antd';
import { useTranslation } from 'react-i18next';
import { LinkOutlined, PlusOutlined, UploadOutlined, PaperClipOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { knowledgeBase } from '../services/mockData';

const { Option } = Select;

const JirasTable = forwardRef(({ onLog, isExporting }, ref) => { // <-- Принимаем isExporting
    const { t } = useTranslation();
    const { projectId } = useParams();
    const { user } = useAuth();
    const role = user?.role;
    const currentUserName = user?.name;
    const isAuditor = role === 'admin' || role === 'auditor';
    const isManager = role === 'manager';

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
            documents: [{ uid: 'doc1', name: 'Projektplan_final_v1.pdf', url: 'https://example.com/docs/projektplan_final.pdf' }],
            status: 'approved', // 'approved', 'rejected', 'pending'
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
            documents: [],
            status: 'rejected',
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

    // ... (весь код до определения колонок остается без изменений)
    // -------- Add/Edit/Delete Item Logic --------
    const [addOpen, setAddOpen] = useState(false);
    const [addForm] = Form.useForm();
    const [addMode, setAddMode] = useState('new');
    const [selectedCategory, setSelectedCategory] = useState(null);

    const openAdd = () => {
        addForm.resetFields();
        setAddMode('new');
        setSelectedCategory(null);
        setAddOpen(true);
    };

    const handleAdd = () => addForm.submit();

    const onAddFinish = (values) => {
        const itemText = values.addMode === 'new' ? values.newItemText : values.selectedItem;
        if (!itemText) {
            message.error(t('Please select or enter an inspection item.', {defaultValue: 'Please select or enter an inspection item.'}));
            return;
        }

        const planned = values.plannedDate ? values.plannedDate.format('YYYY-MM-DD') : '';
        const next = {
            key: `i-${Date.now()}`,
            item: itemText,
            action: '',
            author: '',
            reviewer: '',
            plannedDate: planned,
            closedDate: '',
            documents: [],
            status: 'rejected',
            comment: '',
            attachments: [],
        };
        setData(prev => [next, ...prev]);
        setAddOpen(false);

        if (typeof onLog === 'function') {
            onLog({
                kind: 'add_item',
                by: currentUserName,
                ts: new Date().toISOString(),
                message: `${next.item} -> Created by ${currentUserName} (planned ${planned})`
            });
        }
    };

    const handleDelete = (key) => {
        setData(prev => prev.filter(item => item.key !== key));
        message.success(t('Item deleted.', {defaultValue: 'Item deleted.'}));
    };

    // -------- Edit measure, Document Upload, Status change, Remarks, etc. --------
    // -------- Edit measure --------
    const [editOpen, setEditOpen] = useState(false);
    const [editForm] = Form.useForm();
    const [editingKey, setEditingKey] = useState(null);

    const openEdit = (record) => {
        setEditingKey(record.key);
        editForm.setFieldsValue({
            action: record.action,
            author: record.author,
        });
        setEditOpen(true);
    };

    const handleEdit = () => editForm.submit();

    const onEditFinish = (values) => {
        const author = (values.author || '').trim() || currentUserName;
        setData(prev =>
            prev.map(r =>
                r.key === editingKey
                    ? { ...r, action: (values.action || '').trim(), author }
                    : r
            )
        );
        setEditOpen(false);
        setEditingKey(null);
        editForm.resetFields();
        message.success(t('Saved', { defaultValue: 'Saved' }));
    };

    // -------- Document Upload --------
    const [docUploadOpen, setDocUploadOpen] = useState(false);
    const [docFiles, setDocFiles] = useState([]);

    const openDocUpload = (record) => {
        setEditingKey(record.key);
        setDocFiles(record.documents || []);
        setDocUploadOpen(true);
    };

    const handleDocUpload = () => {
        setData(prev =>
            prev.map(r =>
                r.key === editingKey
                    ? { ...r, documents: docFiles }
                    : r
            )
        );
        setDocUploadOpen(false);
        setDocFiles([]);
        setEditingKey(null);
        message.success(t('Documents updated.', {defaultValue: 'Documents updated.'}));
    };

    const beforeDocUpload = (file) => {
        const newFile = {
            uid: file.uid,
            name: file.name,
            url: URL.createObjectURL(file)
        };
        setDocFiles(prev => [...prev, newFile]);
        return false;
    };

    const onRemoveDoc = (file) => {
        setDocFiles(prev => prev.filter(f => f.uid !== file.uid));
    };

    // -------- Status change --------
    const isoToday = () => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const handleStatusChange = (key, newStatus) => {
        const today = isoToday();
        setData(prev =>
            prev.map(r => {
                if (r.key !== key) return r;
                return {
                    ...r,
                    status: newStatus,
                    reviewer: isAuditor ? (currentUserName || r.reviewer) : r.reviewer,
                    closedDate: newStatus === 'approved' ? today : ''
                };
            })
        );

        if (typeof onLog === 'function') {
            const record = data.find(r => r.key === key);
            onLog({
                kind: 'item_status',
                by: currentUserName,
                ts: new Date().toISOString(),
                message: `${record.item} -> Status changed to ${newStatus} by ${currentUserName}`
            });
        }
    };


    // -------- Remarks (+ attachments) --------
    const [remarksOpen, setRemarksOpen] = useState(false);
    const [remarksForm] = Form.useForm();
    const [files, setFiles] = useState([]);

    const openRemarks = (record) => {
        if (!isAuditor) return; // Only auditors can open remarks modal
        setEditingKey(record.key);
        remarksForm.setFieldsValue({ comment: record.comment || '' });
        setFiles(record.attachments || []);
        setRemarksOpen(true);
    };

    const beforeUpload = (file) => {
        const fileWithUrl = {
            uid: file.uid,
            name: file.name,
            url: URL.createObjectURL(file), // Create a temporary URL for preview
            originFileObj: file, // Keep original file object for potential upload
        };
        setFiles(prev => [...prev, fileWithUrl]);
        return false; // Prevent default upload behavior
    };
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

    const availableItems = useMemo(() => {
        if (!selectedCategory) return [];
        const category = knowledgeBase.find(c => c.category === selectedCategory);
        return category ? category.items : [];
    }, [selectedCategory]);

    // -------- Columns --------
    let columns = [
        { title: t('table.pruefungsgegenstand'), dataIndex: 'item',
            sorter: (a, b) => (a.item || '').localeCompare(b.item || '') },
        { title: t('table.massnahme'), dataIndex: 'action',
            render: (text, record) => {
                if (isExporting) return text; // <-- Режим экспорта
                return (
                    <Space>
                        <span>{text}</span>
                        {isManager && <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />}
                    </Space>
                );
            }
        },
        { title: t('table.autor'), dataIndex: 'author',
            sorter: (a, b) => (a.author || '').localeCompare(b.author || '')},
        { title: t('table.pruefer'), dataIndex: 'reviewer',
            filters: !isExporting ? [ // <-- Скрываем фильтры при экспорте
                { text: t('filter.lamine'), value: 'Lamine' },
                { text: t('filter.judith'), value: 'Judith' },
                { text: t('filter.artem'),  value: 'Artem' },
            ] : null, onFilter: (v, r) => r.reviewer === v },
        { title: t('table.planTermin'), dataIndex: 'plannedDate',
            sorter: (a, b) => new Date(a.plannedDate || 0) - new Date(b.plannedDate || 0) },
        { title: t('table.istTermin'), dataIndex: 'closedDate',
            sorter: (a, b) => new Date(a.closedDate || 0) - new Date(b.closedDate || 0) },
        {
            title: t('table.dokument'), dataIndex: 'documents',
            render: (docs, record) => {
                // ... (логика отображения документов остается прежней)
                const hasDocs = docs && docs.length > 0;
                if (hasDocs) {
                    return (
                        <div>
                            <List
                                size="small"
                                dataSource={docs}
                                renderItem={(doc) => (
                                    <List.Item>
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                            <LinkOutlined /> {doc.name}
                                        </a>
                                    </List.Item>
                                )}
                            />
                            {isManager && !isExporting && (
                                <Button
                                    type="dashed"
                                    size="small"
                                    icon={<EditOutlined />}
                                    onClick={() => openDocUpload(record)}
                                    style={{marginTop: '8px'}}
                                >
                                    {t('Edit', {defaultValue: 'Edit'})}
                                </Button>
                            )}
                        </div>
                    );
                }
                if (isManager && !isExporting) {
                    return (
                        <Button
                            type="dashed"
                            size="small"
                            icon={<UploadOutlined />}
                            onClick={() => openDocUpload(record)}
                        >
                            {t('Upload', {defaultValue: 'Upload'})}
                        </Button>
                    );
                }
                return null;
            }
        },
        { title: t('table.status'), dataIndex: 'status',
            render: (status, record) => {
                const text = t(`itemStatus.${status}`, { defaultValue: status });
                if (isExporting) return text; // <-- Режим экспорта: просто текст

                const color = status === 'approved' ? 'green' : status === 'pending' ? 'orange' : 'red';
                const tag = <Tag color={color}>{text}</Tag>;

                if (isAuditor) {
                    return (
                        <Popconfirm
                            title={t('Change status?', { defaultValue: 'Change status?' })}
                            onConfirm={() => handleStatusChange(record.key, 'approved')}
                            onCancel={() => handleStatusChange(record.key, 'rejected')}
                            okText={t('itemStatus.approved')}
                            cancelText={t('itemStatus.rejected')}
                        >
                            <a style={{ cursor: 'pointer' }}>{tag}</a>
                        </Popconfirm>
                    );
                }

                if (isManager && status === 'rejected') {
                    return (
                        <Popconfirm
                            title={t('Submit for approval?', { defaultValue: 'Submit for approval?' })}
                            onConfirm={() => handleStatusChange(record.key, 'pending')}
                            okText={t('Yes')}
                            cancelText={t('No')}
                        >
                            <a style={{ cursor: 'pointer' }}>{tag}</a>
                        </Popconfirm>
                    );
                }
                return tag;
            },
            filters: !isExporting ? [ // <-- Скрываем фильтры при экспорте
                { text: t('itemStatus.approved'), value: 'approved' },
                { text: t('itemStatus.rejected'), value: 'rejected' },
                { text: t('itemStatus.pending'),  value: 'pending' },
            ] : null, onFilter: (v, r) => r.status === v },
        { title: t('table.bemerkungen'), dataIndex: 'comment',
            render: (text, record) => {
                // ... (логика отображения ремарков остается прежней)
                const hasAttachments = record.attachments && record.attachments.length > 0;

                const content = (
                    <div>
                        {text && <span>{text}</span>}
                        {hasAttachments && (
                            <List
                                size="small"
                                dataSource={record.attachments}
                                renderItem={(file) => (
                                    <List.Item style={{padding: '4px 0'}}>
                                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                                            <PaperClipOutlined /> {file.name}
                                        </a>
                                    </List.Item>
                                )}
                            />
                        )}
                    </div>
                );

                if (isAuditor && !isExporting) {
                    return (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}>
                            <div style={{ flex: 1 }}>{content}</div>
                            <Button icon={<EditOutlined />} size="small" onClick={() => openRemarks(record)} />
                        </div>
                    );
                }
                return content;
            }
        },
        {
            title: t('Actions', {defaultValue: 'Actions'}),
            key: 'actions',
            render: (_, record) => {
                if (isAuditor && !isExporting) { // <-- Скрываем при экспорте
                    return (
                        <Popconfirm
                            title={t('Delete this item?', {defaultValue: 'Delete this item?'})}
                            onConfirm={() => handleDelete(record.key)}
                            okText={t('Yes')}
                            cancelText={t('No')}
                        >
                            <Button danger icon={<DeleteOutlined />} size="small" />
                        </Popconfirm>
                    );
                }
                return null;
            }
        }
    ];

    if (isExporting) {
        columns = columns.filter(col => col.key !== 'actions'); // <-- Убираем колонку Actions при экспорте
    }

    return (
        <div ref={ref}>
            {isAuditor && !isExporting && ( // <-- Скрываем кнопку при экспорте
                <Button type="primary" icon={<PlusOutlined />} onClick={openAdd} className="!mb-3">
                    {t('Add inspection item', { defaultValue: 'Add inspection item' })}
                </Button>
            )}

            <Table columns={columns} dataSource={data} rowKey="key" scroll={{ x: true }} pagination={false} />

            {/* ... (модальные окна без изменений) ... */}
            {/* Add item Modal */}
            <Modal
                title={t('Add inspection item', { defaultValue: 'Add inspection item' })}
                open={addOpen}
                onCancel={() => setAddOpen(false)}
                onOk={handleAdd}
                okText={t('common.createOk', { defaultValue: 'Create' })}
                cancelText={t('common.cancel', { defaultValue: 'Cancel' })}
            >
                <Form layout="vertical" form={addForm} onFinish={onAddFinish} initialValues={{ addMode: 'new' }}>
                    <Form.Item name="addMode" label={t('Source', {defaultValue: 'Source'})}>
                        <Radio.Group onChange={(e) => setAddMode(e.target.value)}>
                            <Radio.Button value="new">{t('Create New', {defaultValue: 'Create New'})}</Radio.Button>
                            <Radio.Button value="select">{t('Select from KB', {defaultValue: 'Select from KB'})}</Radio.Button>
                        </Radio.Group>
                    </Form.Item>

                    {addMode === 'new' ? (
                        <Form.Item
                            name="newItemText"
                            label={t('table.pruefungsgegenstand')}
                            rules={[{ required: true, message: t('Please enter item text', {defaultValue: 'Please enter item text'}) }]}
                        >
                            <Input.TextArea rows={3} />
                        </Form.Item>
                    ) : (
                        <>
                            <Form.Item
                                name="category"
                                label={t('Category', {defaultValue: 'Category'})}
                                rules={[{ required: true, message: t('Please select a category', {defaultValue: 'Please select a category'})}]}
                            >
                                <Select
                                    showSearch
                                    placeholder={t('Select a category', {defaultValue: 'Select a category'})}
                                    onChange={(value) => {
                                        setSelectedCategory(value);
                                        addForm.resetFields(['selectedItem']);
                                    }}
                                >
                                    {knowledgeBase.map(c => <Option key={c.category} value={c.category}>{c.category}</Option>)}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="selectedItem"
                                label={t('table.pruefungsgegenstand')}
                                rules={[{ required: true, message: t('Please select an item', {defaultValue: 'Please select an item'})}]}
                            >
                                <Select
                                    showSearch
                                    placeholder={t('Select an item', {defaultValue: 'Select an item'})}
                                    disabled={!selectedCategory}
                                >
                                    {availableItems.map(item => <Option key={item} value={item}>{item}</Option>)}
                                </Select>
                            </Form.Item>
                        </>
                    )}
                    <Form.Item
                        name="plannedDate"
                        label={t('table.planTermin')}
                        rules={[{ required: true, message: t('Please select planned date', { defaultValue: 'Please select planned date' }) }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit measure Modal */}
            <Modal
                title={t('Edit Measure', { defaultValue: 'Edit Measure' })}
                open={editOpen}
                onCancel={() => setEditOpen(false)}
                onOk={handleEdit}
                okText={t('Save', { defaultValue: 'Save' })}
                cancelText={t('common.cancel', { defaultValue: 'Cancel' })}
            >
                <Form layout="vertical" form={editForm} onFinish={onEditFinish}>
                    <Form.Item name="action" label={t('table.massnahme')}>
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item name="author" label={t('table.autor')}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Upload Document Modal */}
            <Modal
                title={t('Manage Documents', {defaultValue: 'Manage Documents'})}
                open={docUploadOpen}
                onCancel={() => setDocUploadOpen(false)}
                onOk={handleDocUpload}
                okText={t('Save')}
                cancelText={t('common.cancel')}
            >
                <Upload
                    multiple
                    fileList={docFiles}
                    beforeUpload={beforeDocUpload}
                    onRemove={onRemoveDoc}
                >
                    <Button icon={<UploadOutlined />}>{t('Add File', {defaultValue: 'Add File'})}</Button>
                </Upload>
            </Modal>


            {/* Edit remarks Modal */}
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
        </div>
    );
});

export default JirasTable;