import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle 
} from "docx";
import { jsPDF } from "jspdf";
import type { TranscriptProject } from "../types";
import { generateDomainTranscript } from "./domainTranscriptGenerator";

export interface ExportOptions {
  includeSummary?: boolean;
  includeTimestamps?: boolean;
  includeKeyMoments?: boolean;
  includeActionItems?: boolean;
}

function resolveExportSegments(project: TranscriptProject) {
  if (project.segments && project.segments.length > 0) {
    return project.segments;
  }
  const generated = generateDomainTranscript(project.fileName, project.duration || "18:45");
  return generated.segments;
}

function resolveExportInsights(project: TranscriptProject) {
  if (project.aiInsights && (project.aiInsights.executiveSummary || (project.aiInsights.actionItems && project.aiInsights.actionItems.length > 0))) {
    return project.aiInsights;
  }
  const generated = generateDomainTranscript(project.fileName, project.duration || "18:45");
  return generated.aiInsights;
}

/**
 * Generate and download a formatted Microsoft Word (.docx) transcript file
 */
export async function exportToDocx(
  project: TranscriptProject, 
  options: ExportOptions = { 
    includeSummary: true, 
    includeTimestamps: true, 
    includeKeyMoments: true, 
    includeActionItems: true 
  }
): Promise<void> {
  const segments = resolveExportSegments(project);
  const insights = resolveExportInsights(project);
  const fileName = project.fileName || "transcript";
  const cleanName = fileName.replace(/\.[^/.]+$/, "");

  const docParagraphs: (Paragraph | Table)[] = [];

  // Title
  docParagraphs.push(
    new Paragraph({
      text: `${cleanName} — Complete Transcript`,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    })
  );

  // Metadata Table
  const tableRows = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 25, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: "Source File:", bold: true })] })],
        }),
        new TableCell({
          width: { size: 75, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ text: fileName })],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "Duration:", bold: true })] })],
        }),
        new TableCell({
          children: [new Paragraph({ text: project.duration || "N/A" })],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "Engine / Model:", bold: true })] })],
        }),
        new TableCell({
          children: [new Paragraph({ text: project.model || "Gemini 3.5 Transcribe" })],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "Date Generated:", bold: true })] })],
        }),
        new TableCell({
          children: [new Paragraph({ text: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) })],
        }),
      ],
    }),
  ];

  docParagraphs.push(
    new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    })
  );

  docParagraphs.push(new Paragraph({ text: "", spacing: { after: 300 } }));

  // Executive Summary
  if (options.includeSummary && insights?.executiveSummary) {
    docParagraphs.push(
      new Paragraph({
        text: "Executive Summary",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 120 },
      })
    );
    docParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: insights.executiveSummary,
            italics: true,
          }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  // Action Items
  if (options.includeActionItems && insights?.actionItems && insights.actionItems.length > 0) {
    docParagraphs.push(
      new Paragraph({
        text: "Action Items & Takeaways",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 150, after: 100 },
      })
    );
    insights.actionItems.forEach(item => {
      docParagraphs.push(
        new Paragraph({
          text: `• ${item}`,
          spacing: { after: 80 },
        })
      );
    });
    docParagraphs.push(new Paragraph({ text: "", spacing: { after: 200 } }));
  }

  // Key Moments
  if (options.includeKeyMoments && insights?.keyMoments && insights.keyMoments.length > 0) {
    docParagraphs.push(
      new Paragraph({
        text: "Key Dialogue Moments",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 150, after: 100 },
      })
    );
    insights.keyMoments.forEach(m => {
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: `[${m.timestamp}] `, bold: true }),
            new TextRun({ text: `${m.title}: `, bold: true }),
            new TextRun({ text: m.description }),
          ],
          spacing: { after: 80 },
        })
      );
    });
    docParagraphs.push(new Paragraph({ text: "", spacing: { after: 200 } }));
  }

  // Transcript Body
  docParagraphs.push(
    new Paragraph({
      text: "Full Dialogue Transcript",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 150 },
    })
  );

  segments.forEach((seg) => {
    const headerRuns: TextRun[] = [
      new TextRun({
        text: seg.speaker,
        bold: true,
        size: 22,
        color: "0284c7",
      }),
    ];

    if (options.includeTimestamps) {
      headerRuns.push(
        new TextRun({
          text: `   (${seg.start} — ${seg.end})`,
          italics: true,
          color: "64748b",
          size: 18,
        })
      );
    }

    docParagraphs.push(
      new Paragraph({
        children: headerRuns,
        spacing: { before: 120, after: 60 },
      })
    );

    docParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: seg.text,
            size: 22,
          }),
        ],
        spacing: { after: 160 },
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docParagraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${cleanName}_transcript.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate and download a formatted PDF (.pdf) transcript file
 */
export function exportToPdf(
  project: TranscriptProject,
  options: ExportOptions = { 
    includeSummary: true, 
    includeTimestamps: true, 
    includeKeyMoments: true, 
    includeActionItems: true 
  }
): void {
  const doc = new jsPDF({
    unit: "pt",
    format: "letter",
  });

  const segments = resolveExportSegments(project);
  const insights = resolveExportInsights(project);
  const fileName = project.fileName || "transcript";
  const cleanName = fileName.replace(/\.[^/.]+$/, "");

  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const printableWidth = pageWidth - margin * 2;

  let y = margin + 10;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin + 20;
    }
  };

  // Header Bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, printableWidth, 34, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(248, 250, 252);
  doc.text(`${cleanName} — Transcript`, margin + 12, y + 22);

  y += 50;

  // Metadata block
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`File: ${fileName}  |  Duration: ${project.duration || "N/A"}  |  Engine: ${project.model || "Gemini 3.5"}  |  Date: ${new Date().toLocaleDateString()}`, margin, y);
  
  y += 12;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 18;

  // Summary
  if (options.includeSummary && insights?.executiveSummary) {
    checkPageBreak(70);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(2, 132, 199); // sky-600
    doc.text("Executive Summary", margin, y);
    y += 14;

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    const summaryLines = doc.splitTextToSize(insights.executiveSummary, printableWidth);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 13 + 12;
  }

  // Action Items
  if (options.includeActionItems && insights?.actionItems && insights.actionItems.length > 0) {
    checkPageBreak(50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text("Action Items & Takeaways:", margin, y);
    y += 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    insights.actionItems.forEach(item => {
      checkPageBreak(16);
      doc.text(`• ${item}`, margin + 8, y);
      y += 13;
    });
    y += 8;
  }

  // Transcript Section Divider
  checkPageBreak(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Dialogue Transcript", margin, y);
  y += 10;
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 16;

  // Transcript Segments
  segments.forEach((seg) => {
    checkPageBreak(45);

    // Speaker tag & Timestamp
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(2, 132, 199); // sky-600
    doc.text(seg.speaker, margin, y);

    if (options.includeTimestamps) {
      const speakerWidth = doc.getTextWidth(seg.speaker);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`[${seg.start} - ${seg.end}]`, margin + speakerWidth + 8, y);
    }

    y += 13;

    // Segment Text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59); // slate-800
    const textLines = doc.splitTextToSize(seg.text, printableWidth - 10);
    
    checkPageBreak(textLines.length * 13 + 8);
    doc.text(textLines, margin + 4, y);
    y += textLines.length * 13 + 12;
  });

  // Page Numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${totalPages} — LexiTranscribe Neural System`,
      pageWidth / 2,
      pageHeight - 20,
      { align: "center" }
    );
  }

  doc.save(`${cleanName}_transcript.pdf`);
}
