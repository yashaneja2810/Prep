/**
 * This script converts PPTX files to PDF using LibreOffice or other tools.
 * You'll need to install the required dependencies:
 * npm install node-libreoffice
 * 
 * If you don't have LibreOffice installed, you'll need to install it:
 * Windows: Download from https://www.libreoffice.org/download/download/ and install
 * Mac: brew install libreoffice
 * Linux: sudo apt-get install libreoffice
 */

const libre = require('node-libreoffice');
const path = require('path');
const fs = require('fs');

// Directories
const presentationsDir = path.join(process.cwd(), 'public', 'presentations');

// Get all PPTX files in the presentations directory
const pptxFiles = fs.readdirSync(presentationsDir)
  .filter(file => file.endsWith('.pptx'));

console.log(`Found ${pptxFiles.length} PPTX files to convert`);

// Convert each PPTX file to PDF
async function convertFiles() {
  for (const pptxFile of pptxFiles) {
    const pptxPath = path.join(presentationsDir, pptxFile);
    const pdfFile = pptxFile.replace('.pptx', '.pdf');
    const pdfPath = path.join(presentationsDir, pdfFile);
    
    console.log(`Converting ${pptxFile} to ${pdfFile}...`);
    
    try {
      await libre.convert({
        src: pptxPath,
        dst: pdfPath,
        format: 'pdf'
      });
      
      console.log(`Successfully converted ${pptxFile} to ${pdfFile}`);
    } catch (error) {
      console.error(`Error converting ${pptxFile}:`, error);
    }
  }
}

// Run the conversion
convertFiles().then(() => {
  console.log('Conversion complete!');
}).catch(err => {
  console.error('Conversion failed:', err);
}); 