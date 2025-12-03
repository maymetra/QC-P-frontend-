// src/services/pdfGenerator.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/psi-logo-qcp.png';

export const exportToPDF = async (project, tableData, user, t) => {
    const doc = new jsPDF();

    // --- Шапка документа ---
    try {
        const img = new Image();
        img.src = logo;
        await new Promise(resolve => { img.onload = resolve; });

        const imgWidth = img.width;
        const imgHeight = img.height;
        const desiredWidth = 45;
        const scaleFactor = desiredWidth / imgWidth;
        const desiredHeight = imgHeight * scaleFactor;

        doc.addImage(img, 'PNG', 10, 12, desiredWidth, desiredHeight);

    } catch (e) { console.error("Could not add logo to PDF", e); }

    // Заголовок документа
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('QC-Bericht', 105, 22, { align: 'center' });

    // Линия-разделитель
    doc.line(10, 32, 200, 32);

    // --- Информация о проекте ---
    doc.setFontSize(10);

    // Левая колонка
    doc.setFont(undefined, 'bold');
    doc.text('Projekt:', 14, 40);
    doc.text('Kunde:', 14, 46);
    doc.setFont(undefined, 'normal');
    doc.text(`${project.name}`, 34, 40);
    doc.text(`${project.kunde}`, 34, 46);

    // Правая колонка
    doc.setFont(undefined, 'bold');
    doc.text('Datum:', 160, 40);
    doc.text('Prüfer:', 160, 46);
    doc.setFont(undefined, 'normal');
    doc.text(`${new Date().toLocaleDateString(t('common.locale', { defaultValue: 'de-DE' }))}`, 175, 40);
    doc.text(`${user.name}`, 175, 46);

    // --- Таблица с данными ---
    // Функция для очистки HTML-тегов (если в remarks есть форматирование)
    const stripHtml = (html) => {
        if (!html) return '';
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    autoTable(doc, {
        startY: 55,
        head: [
            [
                t('table.pruefungsgegenstand'),
                t('table.massnahme'),
                t('table.autor'),
                t('table.pruefer'),
                t('table.planTermin'),
                t('table.istTermin'),
                t('table.status'),
                t('table.bemerkungen') // ▼ Добавлен заголовок Remarks
            ],
        ],
        body: tableData.map(row => [
            stripHtml(row.item), // Очищаем от HTML, чтобы в PDF было красиво
            row.action,
            row.author,
            row.reviewer,
            row.planned_date,
            row.closed_date,
            t(`itemStatus.${row.status}`, { defaultValue: row.status }),
            stripHtml(row.comment) // ▼ Добавлено поле Remarks (очищенное от HTML)
        ]),
        theme: 'striped',
        headStyles: { fillColor: [34, 51, 102], textColor: [255, 255, 255] },
        styles: { fontSize: 7, cellPadding: 2, valign: 'middle', overflow: 'linebreak' },
        // ▼ Обновленные ширины колонок, чтобы вместить Remarks
        columnStyles: {
            0: { cellWidth: 30 }, // item
            1: { cellWidth: 30 }, // action
            2: { cellWidth: 18 }, // author
            3: { cellWidth: 18 }, // reviewer
            4: { cellWidth: 18 }, // planned
            5: { cellWidth: 18 }, // actual
            6: { cellWidth: 20 }, // status
            7: { cellWidth: 'auto' } // remarks занимают остальное место
        }
    });

    // --- Подвал для подписи (с двумя полями) ---
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY || 100;
    const signatureY = finalY + 20; // Общая высота для обеих подписей

    doc.setLineWidth(0.2);
    doc.setFontSize(10);

    // Поле для подписи QC (слева)
    doc.line(14, signatureY, 84, signatureY); // Левая линия
    doc.text('Unterschrift QC', 49, signatureY + 5, { align: 'center' });

    // Поле для подписи PM (справа)
    doc.line(126, signatureY, 196, signatureY); // Правая линия
    doc.text('Unterschrift PM', 161, signatureY + 5, { align: 'center' });


    doc.save(`qs-plan-${project?.name || 'report'}.pdf`);
};