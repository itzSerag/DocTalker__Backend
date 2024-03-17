const axios = require('axios');
const cheerio = require('cheerio');
const minify = require("string-minify");

// extract text from webpage


exports.scrapeWebpage = async (url) =>{
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Remove script tags and their contents (JavaScript)
        $('script').remove();

        // Remove style tags and their contents (CSS)
        $('style').remove();

        let text = $('body').text().trim();

        // Minify the text
        text = minify(text);

        
        return text;
    } catch (error) {
        console.error('Error fetching webpage:', error);
        throw new Error('Failed to fetch webpage');
    }
}

