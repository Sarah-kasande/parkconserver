import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';

interface PrintDownloadTableProps {
  tableId: string;
  title: string;
  filename: string;
}

export const PrintDownloadTable: React.FC<PrintDownloadTableProps> = ({ tableId, title, filename }) => {
  const tableRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = document.getElementById(tableId);
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { text-align: center; color: #1a202c; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
              th { background-color: #2d3748; color: white; }
              tr:nth-child(even) { background-color: #f7fafc; }
              @media print {
                body { margin: 0; }
                table { font-size: 12px; }
                th, td { padding: 6px; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            ${printContent.outerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    const element = document.getElementById(tableId);
    if (!element) return;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${filename}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    // Clone the element to avoid modifying the original
    const clonedElement = element.cloneNode(true) as HTMLElement;
    const wrapper = document.createElement('div');
    wrapper.style.padding = '20px';
    wrapper.style.fontFamily = 'Arial, sans-serif';

    const titleElement = document.createElement('h1');
    titleElement.style.textAlign = 'center';
    titleElement.style.color = '#1a202c';
    titleElement.style.marginBottom = '20px';
    titleElement.textContent = title;
    wrapper.appendChild(titleElement);

    clonedElement.querySelectorAll('.no-print').forEach(el => el.remove());
    wrapper.appendChild(clonedElement);

    html2pdf().set(opt).from(wrapper).save();
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handlePrint} className="flex items-center gap-2">
        <Printer className="h-4 w-4" /> Print
      </Button>
      <Button onClick={handleDownload} className="flex items-center gap-2">
        <Download className="h-4 w-4" /> Download PDF
      </Button>
    </div>
  );
};