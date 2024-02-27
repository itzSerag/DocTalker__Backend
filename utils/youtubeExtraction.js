const { YoutubeTranscript } = require('youtube-transcript');

// Extract transcript from a YouTube video
exports.extractTranscript = async (url) => {

    try {

        let text ;
        const transcript = await YoutubeTranscript.fetchTranscript(url);
        
        for (let i = 0; i < transcript.length; i++) {
            text += transcript[i].text + " , " ;
        }
        return text;
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
