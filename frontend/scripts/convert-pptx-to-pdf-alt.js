/**
 * Alternative script to convert PPTX files to PDF using unoconv or pptx2pdf.
 * 
 * Option 1: Using unoconv (requires LibreOffice/OpenOffice)
 * npm install unoconv
 * 
 * Option 2: Using pptx2pdf
 * npm install pptx2pdf
 * 
 * Choose one of the options below and uncomment that section.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directories
const presentationsDir = path.join(process.cwd(), 'public', 'presentations');

// Get all PPTX files in the presentations directory
const pptxFiles = fs.readdirSync(presentationsDir)
  .filter(file => file.endsWith('.pptx'));

console.log(`Found ${pptxFiles.length} PPTX files to convert`);

/*
 * OPTION 1: Using unoconv (requires LibreOffice/OpenOffice)
 */
function convertWithUnoconv() {
  try {
    for (const pptxFile of pptxFiles) {
      const pptxPath = path.join(presentationsDir, pptxFile);
      
      console.log(`Converting ${pptxFile} to PDF using unoconv...`);
      
      // Execute unoconv command
      execSync(`unoconv -f pdf "${pptxPath}"`, { cwd: presentationsDir });
      
      console.log(`Successfully converted ${pptxFile} to PDF`);
    }
    console.log('All conversions completed successfully!');
  } catch (error) {
    console.error('Conversion failed:', error.message);
  }
}

/*
 * OPTION 2: Using pptx2pdf (a Node.js package)
 */
async function convertWithPptx2Pdf() {
  try {
    // Dynamically import pptx2pdf to avoid issues if it's not installed
    const pptx2pdf = require('pptx2pdf');
    
    for (const pptxFile of pptxFiles) {
      const pptxPath = path.join(presentationsDir, pptxFile);
      const pdfFile = pptxFile.replace('.pptx', '.pdf');
      const pdfPath = path.join(presentationsDir, pdfFile);
      
      console.log(`Converting ${pptxFile} to ${pdfFile} using pptx2pdf...`);
      
      await pptx2pdf.convert(pptxPath, pdfPath);
      
      console.log(`Successfully converted ${pptxFile} to ${pdfFile}`);
    }
    console.log('All conversions completed successfully!');
  } catch (error) {
    console.error('Conversion failed:', error.message);
  }
}

// Choose one of the conversion methods to run
// Uncomment the method you want to use:

// convertWithUnoconv();
// convertWithPptx2Pdf(); 