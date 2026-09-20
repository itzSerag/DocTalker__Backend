import axios from 'axios';
import * as cheerio from 'cheerio';
import AppError from './appError';

export const scrapeWebpage = async (url: string): Promise<string> => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    // Remove scripts, styles, and navigational junk
    $('script, style, noscript, svg, nav, footer, header, iframe').remove();

    let text = $('body').text().trim();

    // Normalize whitespaces
    text = text.replace(/\s+/g, ' ').trim();

    if (!text) {
      throw new AppError('Could not extract readable text from webpage', 400);
    }

    return text;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    console.error('Error fetching webpage:', error.message);
    throw new AppError(`Failed to fetch webpage: ${error.message}`, 400);
  }
};

export default { scrapeWebpage };
