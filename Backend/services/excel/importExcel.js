import Excel from 'exceljs';
import fs from 'fs';

export const importExcelFile = async (filePath, userId, mode) => {
  try {
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheet = workbook.getWorksheet(2); // Access the second sheet
    if (!sheet) {
      throw new Error('No valid worksheet found');
    }

    const products = [];
    sheet.eachRow((row, rowIndex) => {
      if (rowIndex < 21) return; // Skip rows before the 20th
    
      console.log(`Processing row ${rowIndex}:`, row.values);
    
      if (!row.getCell(1).value) {
        console.log(`Skipping row ${rowIndex} as the first cell is empty.`);
        return;
      }
    
      const priceCell = row.getCell(8).value;
      const parsedPrice = priceCell && priceCell.result !== undefined
        ? priceCell.result.toFixed(2) // Retain trailing zeros as string
        : (priceCell || 0).toFixed(2);
    
      console.log(`Row ${rowIndex}, Price Cell:`, priceCell);
      console.log(`Row ${rowIndex}, Parsed Price:`, parsedPrice);

      // Process the uzunluk cell
      const lengthCell = row.getCell(5).value;
      const parsedLength =lengthCell && typeof lengthCell.result !== undefined
      ? lengthCell.result
      : lengthCell || 0;
    
      products.push({
        category: mode === 'primer' ? 'primer' : 'probe', // Set category based on mode
        modifications: {
          fivePrime: row.getCell(2).value || '',
          threePrime: row.getCell(4).value || '',
        },
        
        sekans: row.getCell(3).value|| '',
        uzunluk: parsedLength ,
        saflaştırma: row.getCell(7).value || null,
        scale: row.getCell(6).value || '50 nmol',
        totalPrice: parsedPrice,
        oligoAdi: row.getCell(1).value || `Imported Product ${rowIndex}`,
        quantity: 1,
        userId,
      });
    });
    

    fs.unlinkSync(filePath); // Delete the file after processing

    return products;
  } catch (error) {
    console.error('Error processing Excel file:', error.message);
    throw error;
  }
};
