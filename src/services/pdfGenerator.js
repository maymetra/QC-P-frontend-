// src/services/pdfGenerator.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/psi-logo.png';

export const exportToPDF = async (project, tableData, user, t) => {
    const doc = new jsPDF();

    // --- Шапка документа (полностью исправленная верстка) ---
    try {
        const img = new Image();
        img.src = logo;
        await new Promise(resolve => { img.onload = resolve; });

        const imgWidth = img.width;
        const imgHeight = img.height;
        const desiredWidth = 45;
        const scaleFactor = desiredWidth / imgWidth;
        const desiredHeight = imgHeight * scaleFactor;

        doc.addImage(img, 'PNG', 0, 5, desiredWidth, desiredHeight);

    } catch (e) { console.error("Could not add logo to PDF", e); }

    // Заголовок документа
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('QS-Bericht', 105, 22, { align: 'center' });

    // Линия-разделитель (ниже логотипа и заголовка)
    doc.line(10, 32, 200, 32);

    // --- Информация о проекте (ниже линии-разделителя) ---
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
    autoTable(doc, {
        startY: 55, // Таблица начинается ниже всей шапки
        head: [
            [
                t('table.pruefungsgegenstand'), t('table.massnahme'), t('table.autor'),
                t('table.pruefer'), t('table.planTermin'), t('table.istTermin'), t('table.status'),
            ],
        ],
        body: tableData.map(row => [
            row.item, row.action, row.author, row.reviewer, row.plannedDate,
            row.closedDate, t(`itemStatus.${row.status}`, { defaultValue: row.status }),
        ]),
        theme: 'striped',
        headStyles: { fillColor: [34, 51, 102], textColor: [255, 255, 255] },
        styles: { fontSize: 7, cellPadding: 2, valign: 'middle' },
        columnStyles: {
            0: { cellWidth: 35 }, 1: { cellWidth: 35 }, 2: { cellWidth: 22 },
            3: { cellWidth: 22 }, 4: { cellWidth: 22 }, 5: { cellWidth: 22 },
            6: { cellWidth: 24 },
        }
    });

    // --- Подвал для подписи ---
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY || 100;

    // <-- ИЗМЕНЕНИЕ: Толщина линии уменьшена
    doc.setLineWidth(0.2);
    doc.line(140, finalY + 20, 196, finalY + 20);
    doc.setFontSize(10);
    doc.text('Unterschrift', 168, finalY + 25, { align: 'center' });

    doc.save(`qs-plan-${project?.name || 'report'}.pdf`);
};