// src/services/pdfGenerator.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

        const imgWidth = img.width;
        const imgHeight = img.height;
        const desiredWidth = 50;
        const scaleFactor = desiredWidth / imgWidth;
        const desiredHeight = imgHeight * scaleFactor;

        doc.addImage(img, 'PNG', 14, 12, desiredWidth, desiredHeight);

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
        row.item,
        row.action,
        row.author,
        row.reviewer,
        row.plannedDate,
        row.closedDate,
        t(`itemStatus.${row.status}`, { defaultValue: row.status }),
    ]);

    // <-- ИЗМЕНЕНИЯ ЗДЕСЬ
    autoTable(doc, {
        startY: 60,
        head: head,
        body: body,
        theme: 'striped',
        headStyles: {
            fillColor: [34, 51, 102],
            textColor: [255, 255, 255]
        },
        styles: {
            fontSize: 7, // Уменьшаем шрифт
            cellPadding: 2,
            valign: 'middle'
        },
        // Пересчитанная ширина колонок (сумма = 182мм, что вписывается в страницу)
        columnStyles: {
            0: { cellWidth: 35 }, // Prüfungsgegenstand
            1: { cellWidth: 35 }, // Maßnahme
            2: { cellWidth: 22 }, // Autor
            3: { cellWidth: 22 }, // Prüfer
            4: { cellWidth: 22 }, // Plan-Termin
            5: { cellWidth: 22 }, // Ist-Termin
            6: { cellWidth: 24 }, // Status
        }
    });

    // --- Подвал для подписи ---
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY || 100;
    doc.setLineWidth(0.5);
    doc.line(140, finalY + 20, 196, finalY + 20);
    doc.setFontSize(10);
    doc.text('Signature', 168, finalY + 25, { align: 'center' });

    doc.save(`qs-plan-${project?.name || 'report'}.pdf`);
};