// ===== PDF Report Generation Service =====
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateReportPDF = (report, patient, doctor, prescription, vitals) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // ─── Header ─────────────────────────────────────────────
    doc.setFillColor(30, 30, 50);
    doc.rect(0, 0, pageWidth, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('TetherX Health', 15, 18);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('AI-Powered Healthcare Platform', 15, 25);

    doc.setFontSize(10);
    doc.text('MEDICAL REPORT', pageWidth - 15, 18, { align: 'right' });
    doc.text(`Report ID: ${report.id}`, pageWidth - 15, 25, { align: 'right' });
    doc.text(`Generated: ${new Date(report.generatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - 15, 31, { align: 'right' });

    y = 55;

    // ─── Report Title ───────────────────────────────────────
    doc.setTextColor(40, 40, 80);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(report.title, 15, y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 120);
    doc.text(`Type: ${report.type}`, 15, y);
    y += 10;

    // ─── Patient Information ────────────────────────────────
    doc.setFillColor(240, 242, 255);
    doc.rect(15, y - 5, pageWidth - 30, 36, 'F');

    doc.setTextColor(40, 40, 80);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Information', 20, y + 2);
    y += 9;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 80);

    const patientInfo = [
        [`Name: ${patient.name}`, `Patient ID: ${patient.id}`],
        [`Age: ${patient.age} years | Gender: ${patient.gender}`, `Blood Group: ${patient.bloodGroup}`],
        [`Contact: ${patient.phone}`, `Email: ${patient.email}`],
    ];

    patientInfo.forEach(row => {
        doc.text(row[0], 20, y);
        doc.text(row[1], pageWidth / 2 + 10, y);
        y += 6;
    });
    y += 6;

    // ─── Doctor Information ─────────────────────────────────
    doc.setTextColor(40, 40, 80);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Attending Physician', 15, y);
    y += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 80);
    doc.text(`${doctor.name} — ${doctor.specialization || doctor.department}`, 15, y);
    y += 5;
    doc.text(`License: ${doctor.licenseNo || 'N/A'}`, 15, y);
    y += 10;

    // ─── Diagnosis ──────────────────────────────────────────
    doc.setTextColor(40, 40, 80);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Diagnosis', 15, y);
    y += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 80);
    const diagLines = doc.splitTextToSize(report.diagnosis, pageWidth - 30);
    doc.text(diagLines, 15, y);
    y += diagLines.length * 5 + 5;

    // ─── Clinical Findings ──────────────────────────────────
    if (report.findings) {
        doc.setTextColor(40, 40, 80);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Clinical Findings', 15, y);
        y += 7;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 80);
        const findLines = doc.splitTextToSize(report.findings, pageWidth - 30);
        doc.text(findLines, 15, y);
        y += findLines.length * 5 + 5;
    }

    // ─── Latest Vitals ─────────────────────────────────────
    if (vitals && vitals.length > 0) {
        const latestVitals = vitals[0];
        doc.setTextColor(40, 40, 80);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Latest Vitals', 15, y);
        y += 3;

        doc.autoTable({
            startY: y,
            margin: { left: 15, right: 15 },
            head: [['Parameter', 'Value', 'Parameter', 'Value']],
            body: [
                ['Temperature', `${latestVitals.temperature}°F`, 'Heart Rate', `${latestVitals.heartRate} bpm`],
                ['Blood Pressure', `${latestVitals.bloodPressureSystolic}/${latestVitals.bloodPressureDiastolic} mmHg`, 'SpO2', `${latestVitals.oxygenSaturation}%`],
                ['Respiratory Rate', `${latestVitals.respiratoryRate}/min`, 'Weight', `${latestVitals.weight} kg`],
                ['Blood Sugar (F)', `${latestVitals.bloodSugarFasting} mg/dL`, 'Blood Sugar (PP)', `${latestVitals.bloodSugarPP} mg/dL`],
            ],
            styles: { fontSize: 8, cellPadding: 3 },
            headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 247, 255] },
        });

        y = doc.lastAutoTable.finalY + 8;
    }

    // Check if we need a new page
    if (y > 240) {
        doc.addPage();
        y = 20;
    }

    // ─── Prescription ───────────────────────────────────────
    if (prescription) {
        doc.setTextColor(40, 40, 80);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Prescription', 15, y);
        y += 3;

        const medRows = prescription.medicines.map((m, i) => [
            `${i + 1}`,
            m.name,
            m.dosage,
            m.frequency,
            m.duration,
            m.instructions,
        ]);

        doc.autoTable({
            startY: y,
            margin: { left: 15, right: 15 },
            head: [['#', 'Medicine', 'Dosage', 'Frequency', 'Duration', 'Instructions']],
            body: medRows,
            styles: { fontSize: 7.5, cellPadding: 2.5 },
            headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [240, 253, 244] },
            columnStyles: {
                0: { cellWidth: 8 },
                1: { cellWidth: 35 },
                5: { cellWidth: 35 },
            },
        });

        y = doc.lastAutoTable.finalY + 8;
    }

    // Check page break
    if (y > 240) {
        doc.addPage();
        y = 20;
    }

    // ─── Recommendations ────────────────────────────────────
    if (report.recommendations) {
        doc.setTextColor(40, 40, 80);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Recommendations', 15, y);
        y += 7;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 80);
        const recLines = doc.splitTextToSize(report.recommendations, pageWidth - 30);
        doc.text(recLines, 15, y);
        y += recLines.length * 4.5 + 8;
    }

    // ─── Footer ─────────────────────────────────────────────
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(240, 242, 255);
        doc.rect(0, doc.internal.pageSize.getHeight() - 20, pageWidth, 20, 'F');

        doc.setFontSize(7);
        doc.setTextColor(120, 120, 140);
        doc.text('This report was generated by TetherX AI Health Platform. For medical emergencies, call 112.', 15, doc.internal.pageSize.getHeight() - 10);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 15, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
    }

    // Save
    const fileName = `${report.title.replace(/[^a-zA-Z0-9]/g, '_')}_${patient.name.replace(/\s/g, '_')}_${report.id}.pdf`;
    doc.save(fileName);
    return fileName;
};
