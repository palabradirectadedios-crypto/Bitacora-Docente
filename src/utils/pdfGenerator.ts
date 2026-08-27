/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { Estudiante, InformeEstudiante, InformeExtra } from '../types';
import { getHeaderRenderInfo } from './headerRenderer';
import { HeaderImageInfo } from './logoStorage';

/**
 * Draws the official institutional header image on any page of the PDF.
 * Adapts dynamically to wide banners (letterheads) as well as square/vertical emblems.
 */
function drawOfficialHeader(
  doc: jsPDF, 
  headerInfo: HeaderImageInfo, 
  pageWidth: number, 
  marginX: number, 
  startY: number = 8
): number {
  const contentWidth = pageWidth - (marginX * 2); // 180mm

  if (headerInfo.aspectRatio >= 2.2) {
    // Wide banner header (like the official Colegio Militar Almirante Colón letterhead banner)
    const calculatedHeight = contentWidth / headerInfo.aspectRatio;
    const headerHeight = Math.min(Math.max(calculatedHeight, 22), 44);

    try {
      doc.addImage(headerInfo.dataUrl, 'PNG', marginX, startY, contentWidth, headerHeight, undefined, 'FAST');
    } catch {
      try {
        doc.addImage(headerInfo.dataUrl, marginX, startY, contentWidth, headerHeight);
      } catch (err) {
        console.error('Failed to draw wide header image:', err);
      }
    }

    // Bottom gold accent line below banner
    doc.setDrawColor(212, 175, 55); // #D4AF37 Gold
    doc.setLineWidth(0.6);
    doc.line(marginX, startY + headerHeight + 1.5, pageWidth - marginX, startY + headerHeight + 1.5);

    return startY + headerHeight + 3.5;
  } else {
    // Square or compact emblem logo: draw logo on the left, typography on the right
    const logoHeight = 28;
    const logoWidth = Math.min(logoHeight * headerInfo.aspectRatio, 45);
    const logoX = marginX + 2;

    try {
      doc.addImage(headerInfo.dataUrl, 'PNG', logoX, startY, logoWidth, logoHeight, undefined, 'FAST');
    } catch {
      try {
        doc.addImage(headerInfo.dataUrl, logoX, startY, logoWidth, logoHeight);
      } catch (err) {
        console.error('Failed to draw emblem logo:', err);
      }
    }

    // Text column beside the logo
    const textX = logoX + logoWidth + 7;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('Colegio Militar Almirante Colón', textX, startY + 8);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text('“Educar la Voluntad y Formar la Personalidad”', textX, startY + 14.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text('Cereté – Córdoba', textX, startY + 20.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('INFORME DE SEGUIMIENTO COMPORTAMENTAL Y ACADÉMICO', textX, startY + 26.5);

    // Bottom gold accent line below header
    doc.setDrawColor(212, 175, 55); // #D4AF37 Gold
    doc.setLineWidth(0.6);
    doc.line(marginX, startY + logoHeight + 2, pageWidth - marginX, startY + logoHeight + 2);

    return startY + logoHeight + 4;
  }
}

/**
 * Draws the official page footer with page count and institutional subtitle
 */
function drawOfficialFooter(doc: jsPDF, pageNum: number, totalPages: number, pageWidth: number, pageHeight: number, marginX: number) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  
  // Footer divider line
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.4);
  doc.line(marginX, pageHeight - 13, pageWidth - marginX, pageHeight - 13);

  // Footer text
  doc.text('Colegio Militar Almirante Colón (Cereté – Córdoba) • Bitácora Psicóloga Milena', marginX, pageHeight - 8);
  doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - marginX - 22, pageHeight - 8);
}

/**
 * Generates and downloads the complete student PDF report with the official institutional header on every page.
 */
export async function generateStudentReportPDF(estudiante: Estudiante, reports: InformeEstudiante[]) {
  // Pre-render the official header image with natural aspect ratio
  const headerInfo = await getHeaderRenderInfo();

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 15;
  let y = 8;

  // 1. Draw header on the first page
  y = drawOfficialHeader(doc, headerInfo, pageWidth, marginX, 8);
  y += 2; // small gap

  // 2. Student details summary box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(marginX, y, pageWidth - (marginX * 2), 36, 'F');
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.4);
  doc.rect(marginX, y, pageWidth - (marginX * 2), 36, 'S');

  // Left decorative stripe
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(marginX, y, 2.5, 36, 'F');

  // Student info texts
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`ALUMNO: ${estudiante.nombre.toUpperCase()}`, marginX + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85); // slate-700
  doc.text('Grado Escolar:', marginX + 6, y + 15);
  doc.setFont('helvetica', 'bold');
  doc.text(`${estudiante.grado} Grado`, marginX + 30, y + 15);

  doc.setFont('helvetica', 'normal');
  doc.text('Fecha de Expedición:', marginX + 105, y + 15);
  doc.setFont('helvetica', 'bold');
  doc.text(
    new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
    marginX + 143,
    y + 15
  );

  // Stats summary inside details box
  const totalReportsCount = reports.length;
  const excelenteCount = reports.filter(r => r.estado === 'excelente').length;
  const buenoCount = reports.filter(r => r.estado === 'bueno').length;
  const regularCount = reports.filter(r => r.estado === 'regular').length;
  const atencionCount = reports.filter(r => r.estado === 'atencion_requerida').length;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Resumen de Registros Evaluativos:', marginX + 6, y + 23);

  // Miniature stats pills
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  
  // Total
  doc.setFillColor(226, 232, 240); // slate-200
  doc.rect(marginX + 6, y + 26, 24, 6, 'F');
  doc.setTextColor(15, 23, 42);
  doc.text(`Total: ${totalReportsCount}`, marginX + 8, y + 30.5);

  // Excelente
  doc.setFillColor(209, 250, 229); // emerald-100
  doc.rect(marginX + 33, y + 26, 27, 6, 'F');
  doc.setTextColor(5, 150, 105); // emerald-600
  doc.text(`Excelente: ${excelenteCount}`, marginX + 35, y + 30.5);

  // Adecuado (Bueno)
  doc.setFillColor(219, 234, 254); // blue-100
  doc.rect(marginX + 63, y + 26, 27, 6, 'F');
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text(`Adecuado: ${buenoCount}`, marginX + 65, y + 30.5);

  // Regular
  doc.setFillColor(254, 243, 199); // amber-100
  doc.rect(marginX + 93, y + 26, 25, 6, 'F');
  doc.setTextColor(217, 119, 6); // amber-600
  doc.text(`Regular: ${regularCount}`, marginX + 95, y + 30.5);

  // Alerta
  doc.setFillColor(254, 226, 226); // red-100
  doc.rect(marginX + 121, y + 26, 25, 6, 'F');
  doc.setTextColor(220, 38, 38); // red-600
  doc.text(`Alerta: ${atencionCount}`, marginX + 123, y + 30.5);

  y += 42;

  // Title for chronological section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('REGISTRO CRONOLÓGICO DE SEGUIMIENTO Y OBSERVACIONES', marginX, y);
  
  doc.setDrawColor(212, 175, 55); // Gold
  doc.setLineWidth(0.6);
  doc.line(marginX, y + 2, marginX + 115, y + 2);
  
  y += 8;

  if (reports.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('No hay registros de informes registrados actualmente para este estudiante.', marginX, y + 6);
  } else {
    reports.forEach((rep) => {
      const dateText = new Date(rep.fecha).toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      let statusLabel = 'ADECUADO';
      let badgeBg = [219, 234, 254]; // blue-100
      let badgeText = [37, 99, 235]; // blue-600
      if (rep.estado === 'excelente') {
        statusLabel = 'EXCELENTE';
        badgeBg = [209, 250, 229]; // emerald-100
        badgeText = [5, 150, 105]; // emerald-600
      } else if (rep.estado === 'regular') {
        statusLabel = 'REGULAR';
        badgeBg = [254, 243, 199]; // amber-100
        badgeText = [217, 119, 6]; // amber-600
      } else if (rep.estado === 'atencion_requerida') {
        statusLabel = 'ALERTA / ATENCIÓN';
        badgeBg = [254, 226, 226]; // red-100
        badgeText = [220, 38, 38]; // red-600
      }

      // Format multiline advance text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const splitText: string[] = doc.splitTextToSize(rep.avance, pageWidth - (marginX * 2) - 10);
      const textHeight = splitText.length * 4.6; // ~4.6mm per line
      const blockHeight = 14 + textHeight + 4; // header + inner box + spacing

      // Check if page overflows available area (footer at bottom)
      if (y + blockHeight > pageHeight - 20) {
        doc.addPage();
        
        // DRAW OFFICIAL HEADER ON NEW PAGE AS WELL!
        y = drawOfficialHeader(doc, headerInfo, pageWidth, marginX, 8);
        y += 2;

        // Continuation banner
        doc.setFillColor(241, 245, 249); // slate-100
        doc.rect(marginX, y, pageWidth - (marginX * 2), 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        doc.text(
          `CONTINUACIÓN DEL EXPEDIENTE: ${estudiante.nombre.toUpperCase()} (${estudiante.grado} GRADO)`,
          marginX + 4,
          y + 4.8
        );

        y += 11;
      }

      // Draw card frame for this report
      doc.setFillColor(252, 252, 253);
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.3);
      doc.rect(marginX, y, pageWidth - (marginX * 2), blockHeight - 3, 'FD');

      // Left status color vertical indicator
      doc.setFillColor(badgeText[0], badgeText[1], badgeText[2]);
      doc.rect(marginX, y, 2, blockHeight - 3, 'F');

      // Report Date Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(dateText.toUpperCase(), marginX + 5, y + 6);

      // Status Badge pill
      doc.setFillColor(badgeBg[0], badgeBg[1], badgeBg[2]);
      doc.rect(pageWidth - marginX - 42, y + 2, 38, 5, 'F');
      doc.setTextColor(badgeText[0], badgeText[1], badgeText[2]);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text(statusLabel, pageWidth - marginX - 39, y + 5.5);

      // Inner content box
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(241, 245, 249);
      doc.rect(marginX + 5, y + 9, pageWidth - (marginX * 2) - 10, textHeight + 2, 'FD');

      // Draw the report content text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85); // slate-700
      doc.text(splitText, marginX + 7, y + 13.5);

      y += blockHeight;
    });
  }

  // Final document page-count stamping and footer stamping on all pages
  const totalPagesCount = doc.getNumberOfPages();
  for (let i = 1; i <= totalPagesCount; i++) {
    doc.setPage(i);
    drawOfficialFooter(doc, i, totalPagesCount, pageWidth, pageHeight, marginX);
  }

  // Save and download PDF file
  const fileName = `Informe_${estudiante.nombre.replace(/\s+/g, '_')}_Colegio_Militar.pdf`;
  doc.save(fileName);
}

/**
 * Generates and downloads a single Extra Situation Report PDF with the official institutional header
 */
export async function generateExtraReportPDF(report: InformeExtra, estudiantes: Estudiante[]) {
  const headerInfo = await getHeaderRenderInfo();

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 15;
  let y = 8;

  // Draw official header
  y = drawOfficialHeader(doc, headerInfo, pageWidth, marginX, 8);
  y += 4;

  // Title Box
  doc.setFillColor(248, 250, 252);
  doc.rect(marginX, y, pageWidth - (marginX * 2), 24, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(marginX, y, pageWidth - (marginX * 2), 24, 'S');
  doc.setFillColor(234, 88, 12); // orange-600
  doc.rect(marginX, y, 2.5, 24, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`INFORME DE SITUACIÓN: ${report.titulo.toUpperCase()}`, marginX + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Fecha del Evento: ${new Date(report.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, marginX + 6, y + 16);
  doc.text(`Categoría: ${report.categoria.toUpperCase()}`, marginX + 115, y + 16);

  y += 30;

  // Involved students
  if (report.participantesIds.length > 0) {
    const studentNames = report.participantesIds.map(id => {
      const e = estudiantes.find(est => est.id === id);
      return e ? `${e.nombre} (${e.grado})` : 'Estudiante';
    }).join(', ');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('Estudiantes Involucrados:', marginX, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const splitStudents = doc.splitTextToSize(studentNames, pageWidth - (marginX * 2));
    doc.text(splitStudents, marginX, y);
    y += (splitStudents.length * 5) + 4;
  }

  // Description section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Descripción Detallada de los Hechos:', marginX, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const splitDesc = doc.splitTextToSize(report.descripcion, pageWidth - (marginX * 2) - 8);
  const descHeight = (splitDesc.length * 5) + 8;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(marginX, y, pageWidth - (marginX * 2), descHeight, 'FD');
  doc.text(splitDesc, marginX + 4, y + 6);

  // Footer on all pages
  const totalPagesCount = doc.getNumberOfPages();
  for (let i = 1; i <= totalPagesCount; i++) {
    doc.setPage(i);
    drawOfficialFooter(doc, i, totalPagesCount, pageWidth, pageHeight, marginX);
  }

  const fileName = `Informe_Situacion_${report.titulo.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}

/**
 * Generates an immediate 1-page sample preview PDF to test header/logo quality
 */
export async function generateSampleTestPDF() {
  const sampleEst: Estudiante = {
    id: 'sample-test',
    nombre: 'Estudiante de Demostración',
    grado: '5°',
    createdAt: new Date().toISOString()
  };

  const sampleReport: InformeEstudiante[] = [
    {
      id: 'sample-rep-1',
      estudianteId: 'sample-test',
      fecha: new Date().toISOString().split('T')[0],
      avance: 'Esta es una página de prueba generada para comprobar la nitidez, alineación y visualización del encabezado y logotipo institucional en los documentos PDF de la Bitácora.',
      estado: 'excelente',
      createdAt: new Date().toISOString()
    }
  ];

  await generateStudentReportPDF(sampleEst, sampleReport);
}
