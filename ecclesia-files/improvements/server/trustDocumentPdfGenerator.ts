import PDFDocument from 'pdfkit';
import type { TrustDocument, TrustDocumentSection, TrustDocumentTemplate, TrustTemplateSectionType } from '@shared/schema';

const NAVY = '#1E3A8A';
const GOLD = '#D4AF37';
const DARK_GOLD = '#B8960C';
const BODY_COLOR = '#333333';
const MUTED_COLOR = '#666666';
const LIGHT_MUTED = '#999999';

const MARGIN_LEFT = 60;
const MARGIN_RIGHT = 60;

interface TrustDocumentPdfData {
  /** Document title (e.g. "Declaration of Trust") */
  title: string;
  /** Optional subtitle (e.g. entity name) */
  subtitle?: string | null;
  /** Preamble / introductory text (optional) */
  preamble?: string;
  /** Ordered sections with title + content */
  sections: { title: string; content: string; sortOrder: number }[];
  /** Member full name for signature line */
  memberName: string;
  /** Date string to display */
  dateString: string;
  /** Optional scripture reference for the footer */
  scriptureText?: string;
  scriptureReference?: string;
}

/**
 * Generates a professional trust-document PDF and returns it as a Buffer.
 *
 * Design language matches the certificate generator: royal navy / gold palette,
 * Helvetica built-in fonts, decorative borders and lines.
 */
export async function generateTrustDocumentPDF(data: TrustDocumentPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      layout: 'portrait',
      margins: { top: 72, bottom: 72, left: MARGIN_LEFT, right: MARGIN_RIGHT },
      bufferPages: true,
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - MARGIN_LEFT - MARGIN_RIGHT;

    // ── Helper: draw header + footer on a page ──────────────────────
    function drawPageChrome(page: any, pageNum: number, totalPages: number) {
      // Save current page reference
      doc.switchToPage(pageNum - 1);

      const w = doc.page.width;
      const h = doc.page.height;

      // ── Outer border ──
      doc.save();
      doc.rect(24, 24, w - 48, h - 48)
         .lineWidth(2)
         .strokeColor(GOLD)
         .stroke();
      doc.rect(30, 30, w - 60, h - 60)
         .lineWidth(0.5)
         .strokeColor(NAVY)
         .stroke();
      doc.restore();

      // ── Header ──
      doc.save();
      doc.fontSize(9)
         .fillColor(GOLD)
         .text('ECCLESIA BASILIKOS', MARGIN_LEFT, 36, {
           width: contentWidth,
           align: 'center',
         });
      // Thin gold line under header
      const headerLineY = 50;
      doc.moveTo(MARGIN_LEFT + 60, headerLineY)
         .lineTo(w - MARGIN_RIGHT - 60, headerLineY)
         .lineWidth(0.75)
         .strokeColor(GOLD)
         .stroke();
      doc.restore();

      // ── Footer ──
      doc.save();
      const footerY = h - 50;
      doc.moveTo(MARGIN_LEFT + 60, footerY)
         .lineTo(w - MARGIN_RIGHT - 60, footerY)
         .lineWidth(0.75)
         .strokeColor(GOLD)
         .stroke();

      doc.fontSize(8)
         .fillColor(LIGHT_MUTED)
         .text(
           'A Private Membership Association  |  Ecclesia Basilikos Trust',
           MARGIN_LEFT, footerY + 6,
           { width: contentWidth, align: 'center' }
         );

      doc.fontSize(8)
         .fillColor(LIGHT_MUTED)
         .text(
           `Page ${pageNum} of ${totalPages}`,
           MARGIN_LEFT, footerY + 18,
           { width: contentWidth, align: 'center' }
         );
      doc.restore();
    }

    // ── Title block ─────────────────────────────────────────────────
    doc.y = 72;

    doc.fontSize(10)
       .fillColor(GOLD)
       .text('ECCLESIA BASILIKOS TRUST', MARGIN_LEFT, doc.y, {
         width: contentWidth,
         align: 'center',
       });

    doc.moveDown(0.6);

    doc.fontSize(22)
       .fillColor(NAVY)
       .text(data.title, MARGIN_LEFT, undefined, {
         width: contentWidth,
         align: 'center',
       });

    if (data.subtitle) {
      doc.moveDown(0.3);
      doc.fontSize(12)
         .fillColor(MUTED_COLOR)
         .text(data.subtitle, MARGIN_LEFT, undefined, {
           width: contentWidth,
           align: 'center',
         });
    }

    // Decorative line under title
    doc.moveDown(0.6);
    const titleLineY = doc.y;
    const centerX = pageWidth / 2;
    doc.moveTo(centerX - 160, titleLineY)
       .lineTo(centerX + 160, titleLineY)
       .lineWidth(1.5)
       .strokeColor(GOLD)
       .stroke();

    doc.moveDown(1.2);

    // ── Date ────────────────────────────────────────────────────────
    doc.fontSize(10)
       .fillColor(MUTED_COLOR)
       .text(`Date: ${data.dateString}`, MARGIN_LEFT, undefined, {
         width: contentWidth,
         align: 'right',
       });

    doc.moveDown(0.8);

    // ── Preamble ────────────────────────────────────────────────────
    if (data.preamble) {
      doc.fontSize(10.5)
         .fillColor(BODY_COLOR)
         .text(data.preamble, MARGIN_LEFT, undefined, {
           width: contentWidth,
           align: 'justify',
           lineGap: 3,
         });
      doc.moveDown(1);
    }

    // ── Sections ────────────────────────────────────────────────────
    const sortedSections = [...data.sections].sort((a, b) => a.sortOrder - b.sortOrder);

    for (let i = 0; i < sortedSections.length; i++) {
      const section = sortedSections[i];

      // Section heading
      doc.fontSize(13)
         .fillColor(NAVY)
         .text(`${romanNumeral(i + 1)}. ${section.title}`, MARGIN_LEFT, undefined, {
           width: contentWidth,
         });

      doc.moveDown(0.3);

      // Section content
      doc.fontSize(10.5)
         .fillColor(BODY_COLOR)
         .text(section.content, MARGIN_LEFT, undefined, {
           width: contentWidth,
           align: 'justify',
           lineGap: 2.5,
         });

      doc.moveDown(0.8);
    }

    // ── Scripture reference ─────────────────────────────────────────
    const scriptureText = data.scriptureText || '"But ye are a chosen generation, a royal priesthood, an holy nation, a peculiar people"';
    const scriptureRef = data.scriptureReference || '1 Peter 2:9';

    doc.moveDown(0.5);
    doc.fontSize(9.5)
       .fillColor(DARK_GOLD)
       .text(`${scriptureText} — ${scriptureRef}`, MARGIN_LEFT, undefined, {
         width: contentWidth,
         align: 'center',
       });

    doc.moveDown(1.5);

    // ── Signature block ─────────────────────────────────────────────
    // Check if we have enough room; if not, add a page
    if (doc.y > doc.page.height - 200) {
      doc.addPage();
      doc.y = 72;
    }

    // Member signature
    const sigBlockLeft = MARGIN_LEFT + 20;
    const sigLineWidth = 200;

    doc.fontSize(10)
       .fillColor(BODY_COLOR)
       .text('IN WITNESS WHEREOF, the undersigned has executed this instrument on the date set forth above.', MARGIN_LEFT, undefined, {
         width: contentWidth,
         align: 'left',
         lineGap: 2,
       });

    doc.moveDown(2.5);

    // Left signature: Member
    const sigY = doc.y;
    doc.moveTo(sigBlockLeft, sigY)
       .lineTo(sigBlockLeft + sigLineWidth, sigY)
       .lineWidth(0.75)
       .strokeColor(LIGHT_MUTED)
       .stroke();

    doc.fontSize(10)
       .fillColor(BODY_COLOR)
       .text(data.memberName, sigBlockLeft, sigY + 6, { width: sigLineWidth });

    doc.fontSize(8.5)
       .fillColor(MUTED_COLOR)
       .text('Member', sigBlockLeft, sigY + 20, { width: sigLineWidth });

    // Right signature: Trustee
    const rightSigX = pageWidth - MARGIN_RIGHT - sigLineWidth - 20;
    doc.moveTo(rightSigX, sigY)
       .lineTo(rightSigX + sigLineWidth, sigY)
       .lineWidth(0.75)
       .strokeColor(LIGHT_MUTED)
       .stroke();

    doc.fontSize(10)
       .fillColor(BODY_COLOR)
       .text('____________________', rightSigX, sigY + 6, { width: sigLineWidth });

    doc.fontSize(8.5)
       .fillColor(MUTED_COLOR)
       .text('Trustee, Ecclesia Basilikos Trust', rightSigX, sigY + 20, { width: sigLineWidth });

    doc.moveDown(3);

    // Date line
    const dateLineY = doc.y;
    doc.moveTo(sigBlockLeft, dateLineY)
       .lineTo(sigBlockLeft + sigLineWidth, dateLineY)
       .lineWidth(0.75)
       .strokeColor(LIGHT_MUTED)
       .stroke();

    doc.fontSize(8.5)
       .fillColor(MUTED_COLOR)
       .text('Date', sigBlockLeft, dateLineY + 6, { width: sigLineWidth });

    // ── Apply header/footer chrome to all pages ─────────────────────
    const totalPages = doc.bufferedPageRange().count;
    for (let p = 0; p < totalPages; p++) {
      drawPageChrome(doc, p + 1, totalPages);
    }

    doc.end();
  });
}

/**
 * Build TrustDocumentPdfData from a persisted trust document (with sections)
 * and user info.
 */
export function buildPdfDataFromDocument(
  trustDoc: { title: string; subtitle?: string | null; sections: { title: string; content: string; sortOrder: number | null }[] },
  memberName: string,
): TrustDocumentPdfData {
  return {
    title: trustDoc.title,
    subtitle: trustDoc.subtitle,
    sections: trustDoc.sections.map(s => ({
      title: s.title,
      content: s.content,
      sortOrder: s.sortOrder ?? 0,
    })),
    memberName,
    dateString: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };
}

/**
 * Build TrustDocumentPdfData from a template (with sections) and user info.
 * Template variable placeholders like {{ENTITY_NAME}} are left as-is since
 * this path is for users who don't have a generated document yet.
 */
export function buildPdfDataFromTemplate(
  template: { name: string; description?: string | null; sections: { title: string; contentTemplate: string; sortOrder: number | null }[] },
  memberName: string,
): TrustDocumentPdfData {
  return {
    title: template.name,
    subtitle: template.description,
    preamble: undefined,
    sections: template.sections.map(s => ({
      title: s.title,
      content: s.contentTemplate,
      sortOrder: s.sortOrder ?? 0,
    })),
    memberName,
    dateString: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };
}

// ── Utilities ──────────────────────────────────────────────────────

function romanNumeral(n: number): string {
  const numerals: [number, string][] = [
    [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let result = '';
  let remaining = n;
  for (const [value, symbol] of numerals) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }
  return result;
}
