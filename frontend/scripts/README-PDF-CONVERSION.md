# PowerPoint to PDF Conversion

This directory contains scripts to convert PowerPoint (PPTX) files to PDF format for use with the PDF viewer in the Learning Resources section.

## Why Convert to PDF?

Browsers cannot natively display PowerPoint files, so we convert them to PDF which can be rendered directly in the browser using our PDF viewer component.

## Options for Converting PPTX to PDF

### Option 1: Using Online Converters (Recommended for quick conversion)

There are several excellent free online services that can convert your PPTX files to PDF:

1. **Adobe Acrobat Online** - https://www.adobe.com/acrobat/online/ppt-to-pdf.html
   - High-quality conversion that preserves formatting
   - No registration required for basic conversions
   - Secure and reliable

2. **PDF24** - https://tools.pdf24.org/en/pptx-to-pdf
   - Free, quick, and no registration needed
   - Servers in Germany with automatic file deletion after one hour
   - Works on all operating systems

3. **CloudConvert** - https://cloudconvert.com/pptx-to-pdf
   - High-quality conversions that maintain layout
   - Secure with ISO 27001 certification
   - Simple drag-and-drop interface

Steps:
1. Visit one of these websites
2. Upload your PowerPoint file
3. Download the converted PDF
4. Place the PDF file in the `public/presentations` folder with the same base name as the PPTX file
   - Example: `HackHub_PPT_Template.pptx` → `HackHub_PPT_Template.pdf`

### Option 2: Using a desktop application

1. Open the PPTX file in Microsoft PowerPoint, LibreOffice Impress, or Google Slides
2. Save/Export the file as PDF
3. Place the PDF file in the `public/presentations` folder with the same base name as the PPTX file
   - Example: `HackHub_PPT_Template.pptx` → `HackHub_PPT_Template.pdf`

### Option 3: Using the provided scripts (For developers)

We've provided two scripts to automate the conversion process:

#### Script 1: Using node-libreoffice

1. Install LibreOffice on your computer:
   - Windows: Download from https://www.libreoffice.org/download/download/ and install
   - Mac: `brew install libreoffice`
   - Linux: `sudo apt-get install libreoffice`

2. Install the required npm package:
   ```
   npm install node-libreoffice
   ```

3. Run the script:
   ```
   node scripts/convert-pptx-to-pdf.js
   ```

#### Script 2: Alternative methods

We provide an alternative script with different options if the first script doesn't work for you:

1. Install one of the required packages:
   ```
   npm install unoconv
   ```
   OR
   ```
   npm install pptx2pdf
   ```

2. Edit the script to uncomment your preferred method:
   Open `scripts/convert-pptx-to-pdf-alt.js` and uncomment either `convertWithUnoconv()` or `convertWithPptx2Pdf()`

3. Run the script:
   ```
   node scripts/convert-pptx-to-pdf-alt.js
   ```

## Troubleshooting

- Make sure your PPTX files are in the `public/presentations` directory
- If the scripts fail, try the online conversion methods or manual conversion method using a desktop application
- Check that the PDF files have the same base name as the PPTX files (only the extension changes)
- Some complex PowerPoint features may not convert perfectly to PDF 