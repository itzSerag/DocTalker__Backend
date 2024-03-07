const webScraper = require('../utils/webScrapper');
const youtubeTrans = require('../utils/youtubeExtraction');

exports.extractWebpage = async (req, res) => {
    const { url } = req.body;

    try {
        const text = await scraper.scrapeWebpage(url);
        // Process the extracted text as needed (e.g., extracting relevant information)
        res.status(200).json({ transcript: text });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.extractYoutube = async (req, res) => {
    const { url } = req.body;

    try {
        const transcript = await youtubeTrans.extractTranscript(url);
        res.status(200).json({ transcript });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
