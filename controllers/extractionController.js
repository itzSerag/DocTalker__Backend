const webScraper = require('../utils/webScrapper');
const youtubeTrans = require('../utils/youtubeExtraction');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.extractWebpage = catchAsync(async (req, res) => {
    if (!req.body.url) return next(new AppError('Please provide a URL', 400));

    const { url } = req.body;

    const text = await webScraper.scrapeWebpage(url);
    // Process the extracted text as needed (e.g., extracting relevant information)
    res.status(200).json({ transcript: text });
});

exports.extractYoutube = async (req, res) => {
    const { url } = req.body;

    try {
        const transcript = await youtubeTrans.extractTranscript(url);
        res.status(200).json({ transcript });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
