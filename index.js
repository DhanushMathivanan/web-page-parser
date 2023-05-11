import fs from 'fs/promises';
import path from 'path';
import cheerio from 'cheerio';
import ExcelJS from 'exceljs';
import websiteScraper from 'website-scraper';
import PuppeteerPlugin from 'website-scraper-puppeteer';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function scrapeWebsite(url, outputDir) {
  const options = {
    urls: [url],
    directory: outputDir,
    plugins: [new PuppeteerPlugin({
        launchOptions: { headless: false }, /* optional */
        scrollToBottom: { timeout: 10000, viewportN: 10 }, /* optional */
        blockNavigation: true, /* optional */
      })],
  };

  try {
    await websiteScraper(options);
    console.log('Website scraped successfully!');
  } catch (error) {
    console.error('Error scraping website:', error);
  }
}

async function main() {
  try {
    const url = {url:'https://kite.zerodha.com/',filename:'zerodha.html'} // Replace with your desired URL
    const outputDir = path.join(__dirname, 'website');

    // Scrape the website and generate HTML file
    await scrapeWebsite(url, outputDir);

    // Read the generated HTML file
    const html = await fs.readFile(path.join(outputDir, 'zerodha.html'), 'utf8');

    // Parse the HTML using Cheerio
    const $ = cheerio.load(html);

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('HTML Tags');

    // Find all HTML tags and their values
    // let rowIndex = 1;
    // $('*').each((index, element) => {
    //   const tagName = element.tagName;
    //   const value = $(element).text();

    //   // Add the tag and value to the worksheet
    //   worksheet.getCell(`A${rowIndex}`).value = tagName;
    //   worksheet.getCell(`B${rowIndex}`).value = value;

    //   rowIndex++;
    // });

    // let rowIndex = 1;
    // $('input').each((index, element) => {
    //   const tagName = element.tagName;
    //   const value = $(element).val(); // Use `.val()` to get the input value

    //   // Add the tag and value to the worksheet
    //   worksheet.getCell(`A${rowIndex}`).value = tagName;
    //   worksheet.getCell(`B${rowIndex}`).value = value;

    //   rowIndex++;
    // });

    let rowIndex = 1;
    $('input[id]').each((index, element) => {
      const tagName = element.tagName;
      const id = $(element).attr('id'); // Retrieve the id attribute value

      // Add the tag and id to the worksheet
      worksheet.getCell(`A${rowIndex}`).value = tagName;
      worksheet.getCell(`B${rowIndex}`).value = id;

      rowIndex++;
    });

    // Save the workbook to a file
    const outputPath = path.join(__dirname, 'output.xlsx');
    await workbook.xlsx.writeFile(outputPath);
    console.log(`Excel report created successfully! Saved as: ${outputPath}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
