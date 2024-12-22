import Excel from 'exceljs';
import path from 'path';
import fs from 'fs';

export const generateExcelTemplate = async (templateid, rows, res, mode = null) => {
  try {
    let templatePath;
    let fileName;

    if (mode) {
      // Use specific template based on mode
      templatePath = path.resolve(
        mode === 'primer' 
          ? 'files/Sentebiolab-Primer-siparis-formu.xlsx' 
          : 'files/Sentebiolab-Prob-siparis-formu.xlsx'
      );
      fileName = path.basename(templatePath); // Get the original file name
      console.log('Loading specific template from:', templatePath);
    } else {
      // Default template
      templatePath = path.resolve('files/siparis_template.xlsx');
      fileName = path.basename(templatePath); // Get the original file name
      console.log('Loading template from:', templatePath);
    }

    if (!fs.existsSync(templatePath)) {
      console.error('Template file not found:', templatePath);
      throw new Error('Template file not found');
    }

    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(templatePath);

    const sheet = workbook.getWorksheet(1);
    if (!sheet) {
      throw new Error('Worksheet not found');
    }

    // Populate rows if provided
    if (rows.length > 0) {
      rows.forEach((row, rowIndex) => {
        const excelRow = sheet.getRow(rowIndex + 1);
        row.forEach((cell, colIndex) => {
          excelRow.getCell(colIndex + 1).value = cell;
        });
        excelRow.commit();
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    await workbook.xlsx.write(res);
  } catch (error) {
    console.error('Error in generateExcelTemplate:', error.message);
    throw error;
  }
};
