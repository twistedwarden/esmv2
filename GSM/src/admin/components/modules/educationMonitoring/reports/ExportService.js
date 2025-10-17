/**
 * Export Service - PDF, Excel, and CSV export functionality
 */

// Dynamic imports for better Vite compatibility
let jsPDF, XLSX;

// Initialize imports
const initializeImports = async () => {
  if (!jsPDF) {
    const jsPDFModule = await import('jspdf');
    jsPDF = jsPDFModule.default;
    await import('jspdf-autotable');
  }
  if (!XLSX) {
    const XLSXModule = await import('xlsx');
    XLSX = XLSXModule;
  }
};

/**
 * Export data to PDF
 */
export const exportToPDF = async (reportData, reportType, options = {}) => {
  await initializeImports();
  const doc = new jsPDF();
  const {
    title = 'Education Report',
    subtitle = '',
    includeCharts = false,
    orientation = 'portrait'
  } = options;

  // Set document properties
  doc.setProperties({
    title: title,
    subject: 'Education Monitoring Report',
    author: 'GSM Education System',
    creator: 'GoServePH'
  });

  // Add header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, 30);

  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 20, 40);
  }

  // Add generation date
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 50);

  let yPosition = 60;

  // Add summary section
  if (reportData.summary) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    Object.entries(reportData.summary).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 20, yPosition);
      yPosition += 6;
    });
    yPosition += 10;
  }

  // Add data tables
  if (reportData.tables && reportData.tables.length > 0) {
    reportData.tables.forEach((table, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(table.title || `Table ${index + 1}`, 20, yPosition);
      yPosition += 10;

      // Convert data to array format for jsPDF
      const tableData = table.data.map(row => 
        table.columns.map(col => row[col.key] || '')
      );

      doc.autoTable({
        head: [table.columns.map(col => col.header)],
        body: tableData,
        startY: yPosition,
        styles: {
          fontSize: 8,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [59, 130, 246], // Blue color
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251] // Light gray
        }
      });

      yPosition = doc.lastAutoTable.finalY + 10;
    });
  }

  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width - 30,
      doc.internal.pageSize.height - 10
    );
    doc.text(
      'GoServePH Education Monitoring System',
      20,
      doc.internal.pageSize.height - 10
    );
  }

  // Save the PDF
  const fileName = `${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

/**
 * Export data to Excel
 */
export const exportToExcel = async (reportData, reportType, options = {}) => {
  await initializeImports();
  const {
    title = 'Education Report',
    includeCharts = false
  } = options;

  const workbook = XLSX.utils.book_new();

  // Create summary sheet
  if (reportData.summary) {
    const summaryData = Object.entries(reportData.summary).map(([key, value]) => [key, value]);
    const summarySheet = XLSX.utils.aoa_to_sheet([
      [title],
      ['Generated on:', new Date().toLocaleDateString()],
      [''],
      ['Summary'],
      ...summaryData
    ]);
    
    // Style the title
    summarySheet['!cols'] = [{ width: 20 }, { width: 30 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  }

  // Create data sheets
  if (reportData.tables && reportData.tables.length > 0) {
    reportData.tables.forEach((table, index) => {
      const sheetName = table.title || `Data ${index + 1}`;
      const sheetData = [
        table.columns.map(col => col.header),
        ...table.data.map(row => 
          table.columns.map(col => row[col.key] || '')
        )
      ];
      
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
      
      // Set column widths
      worksheet['!cols'] = table.columns.map(() => ({ width: 15 }));
      
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });
  }

  // Create charts sheet if requested
  if (includeCharts && reportData.charts) {
    const chartsData = reportData.charts.map(chart => [
      ['Chart Type', chart.type],
      ['Title', chart.title],
      ['Data', JSON.stringify(chart.data)]
    ]).flat();
    
    const chartsSheet = XLSX.utils.aoa_to_sheet([
      ['Charts and Visualizations'],
      [''],
      ...chartsData
    ]);
    
    XLSX.utils.book_append_sheet(workbook, chartsSheet, 'Charts');
  }

  // Save the Excel file
  const fileName = `${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

/**
 * Export data to CSV
 */
export const exportToCSV = (reportData, reportType, options = {}) => {
  const {
    tableIndex = 0,
    includeHeaders = true
  } = options;

  if (!reportData.tables || !reportData.tables[tableIndex]) {
    throw new Error('No table data available for CSV export');
  }

  const table = reportData.tables[tableIndex];
  const csvData = [];

  // Add headers
  if (includeHeaders) {
    csvData.push(table.columns.map(col => col.header));
  }

  // Add data rows
  table.data.forEach(row => {
    csvData.push(table.columns.map(col => {
      const value = row[col.key] || '';
      // Escape commas and quotes in CSV
      return typeof value === 'string' && (value.includes(',') || value.includes('"'))
        ? `"${value.replace(/"/g, '""')}"`
        : value;
    }));
  });

  // Convert to CSV string
  const csvString = csvData.map(row => row.join(',')).join('\n');

  // Create and download file
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generate report data structure
 */
export const generateReportData = (metrics, reportType, options = {}) => {
  const baseData = {
    summary: {
      'Total Students': metrics.totalStudents || 0,
      'Active Students': metrics.activeStudents || 0,
      'Average GPA': metrics.averageGPA?.toFixed(2) || '0.00',
      'Graduation Rate': `${metrics.graduationRate?.toFixed(1) || '0.0'}%`,
      'Programs': metrics.programStats?.length || 0,
      'Schools': metrics.schoolStats?.length || 0
    },
    generatedAt: new Date().toISOString(),
    reportType
  };

  switch (reportType) {
    case 'academic-performance':
      return {
        ...baseData,
        tables: [
          {
            title: 'Program Performance',
            columns: [
              { key: 'name', header: 'Program Name' },
              { key: 'totalStudents', header: 'Total Students' },
              { key: 'averageGPA', header: 'Average GPA' },
              { key: 'completionRate', header: 'Completion Rate (%)' }
            ],
            data: metrics.programStats || []
          },
          {
            title: 'GPA Distribution',
            columns: [
              { key: 'grade', header: 'Grade Range' },
              { key: 'count', header: 'Number of Students' },
              { key: 'percentage', header: 'Percentage' }
            ],
            data: Object.entries(metrics.gpaDistribution || {}).map(([grade, count]) => ({
              grade,
              count,
              percentage: ((count / Object.values(metrics.gpaDistribution || {}).reduce((sum, val) => sum + val, 0)) * 100).toFixed(1)
            }))
          }
        ]
      };

    case 'enrollment-statistics':
      return {
        ...baseData,
        tables: [
          {
            title: 'Enrollment by Program',
            columns: [
              { key: 'name', header: 'Program' },
              { key: 'totalStudents', header: 'Enrolled Students' },
              { key: 'activeStudents', header: 'Active Students' },
              { key: 'completionRate', header: 'Completion Rate (%)' }
            ],
            data: metrics.programStats || []
          },
          {
            title: 'School Statistics',
            columns: [
              { key: 'name', header: 'School Name' },
              { key: 'totalStudents', header: 'Total Students' },
              { key: 'averageGPA', header: 'Average GPA' }
            ],
            data: metrics.schoolStats || []
          }
        ]
      };

    case 'student-progress':
      return {
        ...baseData,
        tables: [
          {
            title: 'Academic Trends',
            columns: [
              { key: 'year', header: 'School Year' },
              { key: 'totalRecords', header: 'Total Records' },
              { key: 'averageGPA', header: 'Average GPA' }
            ],
            data: metrics.trends || []
          }
        ]
      };

    case 'program-outcomes':
      return {
        ...baseData,
        tables: [
          {
            title: 'Program Effectiveness',
            columns: [
              { key: 'name', header: 'Program Name' },
              { key: 'totalStudents', header: 'Total Students' },
              { key: 'averageGPA', header: 'Average GPA' },
              { key: 'completionRate', header: 'Completion Rate (%)' },
              { key: 'status', header: 'Performance Status' }
            ],
            data: (metrics.programStats || []).map(program => ({
              ...program,
              status: program.averageGPA >= 3.5 ? 'Excellent' : 
                     program.averageGPA >= 3.0 ? 'Good' : 'Needs Improvement'
            }))
          }
        ]
      };

    default:
      return baseData;
  }
};

/**
 * Export all formats at once
 */
export const exportAllFormats = (reportData, reportType, options = {}) => {
  try {
    exportToPDF(reportData, reportType, options);
    setTimeout(() => exportToExcel(reportData, reportType, options), 500);
    setTimeout(() => exportToCSV(reportData, reportType, options), 1000);
  } catch (error) {
    console.error('Error exporting all formats:', error);
    throw error;
  }
};
