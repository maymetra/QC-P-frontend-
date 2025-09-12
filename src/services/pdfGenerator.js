// src/services/pdfGenerator.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // <-- 1. ИЗМЕНЕНИЕ: Импортируем функцию напрямую
import logo from '../assets/psi-logo.png';

export const exportToPDF = async (project, tableData, user, t) => {
    const doc = new jsPDF();

    // --- Шапка документа ---
    try {
        const img = new Image();
        img.src = logo;
        await new Promise(resolve => {
            img.onload = resolve;
        });
        doc.addImage(img, 'PNG', 14, 12, 50, 16);
    } catch (e) {
        console.error("Could not add logo to PDF", e);
    }

    doc.setFontSize(18);
    doc.setTextColor(34, 51, 102);
    doc.text('Quality Control Report', 105, 20, { align: 'center' });
    doc.line(14, 32, 196, 32);

    // --- Информация о проекте ---
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Project: ${project.name}`, 14, 42);
    doc.text(`Customer: ${project.kunde}`, 14, 49);

    const exportDate = new Date().toLocaleDateString(t('common.locale', { defaultValue: 'de-DE' }));
    doc.text(`Date: ${exportDate}`, 196, 42, { align: 'right' });
    doc.text(`Auditor: ${user.name}`, 196, 49, { align: 'right' });

    // --- Таблица с данными ---
    const head = [
        [
            t('table.pruefungsgegenstand'),
            t('table.massnahme'),
            t('table.autor'),
            t('table.pruefer'),
            t('table.planTermin'),
            t('table.istTermin'),
            t('table.status'),
        ],
    ];

    const body = tableData.map(row => [
        { content: row.item, styles: { cellWidth: 45 } },
        { content: row.action, styles: { cellWidth: 45 } },
        row.author,
        row.reviewer,
        row.plannedDate,
        row.closedDate,
        t(`itemStatus.${row.status}`, { defaultValue: row.status }),
    ]);

    // <-- 2. ИЗМЕНЕНИЕ: Вызываем autoTable как функцию, передавая ей наш 'doc'
    autoTable(doc, {
        startY: 60,
        head: head,
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [34, 51, 102] },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
            0: { cellWidth: 45 },
            1: { cellWidth: 45 },
        }
    });

    // --- Подвал для подписи ---
    // @ts-ignore - убираем ошибку TypeScript, т.к. lastAutoTable добавляется плагином динамически
    const finalY = doc.lastAutoTable.finalY || 100;
    doc.setLineWidth(0.5);
    doc.line(140, finalY + 20, 196, finalY + 20);
    doc.setFontSize(10);
    doc.text('Signature', 168, finalY + 25, { align: 'center' });

    // --- Сохранение файла ---
    doc.save(`qs-plan-${project?.name || 'report'}.pdf`);
};