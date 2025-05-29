const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static(__dirname));

app.get('/download-pdf', async (req, res) => {
  try {
    // Launch browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Load your resume page
    await page.goto(`http://localhost:${port}`, {
      waitUntil: 'networkidle2'
    });
    
    // Hide download button
    await page.evaluate(() => {
      document.getElementById('downloadBtn').style.display = 'none';
    });
    
    // Apply additional CSS fixes for date alignment
    await page.addStyleTag({
      content: `
        .entry-header {
          display: flex !important;
          justify-content: space-between !important;
          width: 100% !important;
        }
        
        .entry-title {
          font-weight: bold !important;
          flex: 1 !important;
          text-align: left !important;
        }
        
        .entry-date {
          font-weight: normal !important;
          text-align: right !important;
          margin-left: auto !important;
          min-width: 100px !important;
          float: right !important;
        }
      `
    });
    
    // Generate PDF
    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.25in',
        right: '0.25in',
        bottom: '0.25in',
        left: '0.25in'
      },
      preferCSSPageSize: true,
      scale: 1.0
    });
    
    // Close browser
    await browser.close();
    
    // Send PDF as download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');
    res.send(pdf);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Error generating PDF');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});