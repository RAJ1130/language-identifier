// server.js - Using the DetectLanguage.com API

const express = require('express');
const cors = require('cors');
const axios = require('axios'); // For making API requests

const app = express();
const port = process.env.PORT || 3000;

// --- CONFIGURATION ---
app.use(cors());
app.use(express.json());

// --- API KEY ---
const apiKey = "YOUR_API_KEY_HERE"; // <-- Paste your API key here

// --- API ROUTE ---
app.post('/detect', async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text is required.' });
    }

    try {
        // Make the API request to DetectLanguage.com
        const response = await axios.post("https://ws.detectlanguage.com/0.2/detect", {
            q: text
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        const detectedLang = response.data.data.detections[0].language; // e.g., 'en'

        res.json({
            languageName: detectedLang,
            languageCode: detectedLang,
            history: `History for ${detectedLang} would be fetched here.`
        });

    } catch (error) {
        console.error("ERROR:", error.response.data);
        res.status(500).json({ error: 'Failed to detect language with DetectLanguage.com' });
    }
});

app.listen(port, () => {
    console.log(`✅ Server with DetectLanguage.com AI running at http://localhost:${port}`);
});
// ... the rest of your code ...
const getLanguageHistory = async (languageName) => {
    // Prepare the language name for the URL query
    const languageQuery = encodeURIComponent(`${languageName} language`);
    const wikipediaUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${languageQuery}`;

    try {
        const response = await fetch(wikipediaUrl, {
            headers: { 'User-Agent': 'LanguageIdentifier/1.0 (your-email@example.com)' }
        });

        if (!response.ok) {
            return "Could not find a history for this language on Wikipedia.";
        }

        const data = await response.json();
        // Return the summary text (the 'extract')
        return data.extract || "No summary available for this language.";

    } catch (error) {
        console.error("Wikipedia fetch error:", error);
        return "Failed to fetch language history due to a network error.";
    }
};

// --- API Route for Language Detection ---
app.post('/detect', async (req, res) => { // Route must be async to use 'await'
    const { text } = req.body;

    if (!text || text.trim().length < 5) {
        return res.status(400).json({ error: 'Please provide a longer sentence.' });
    }

    // Detect the 3-letter language code (e.g., 'tam', 'eng')
    const langCode = franc(text);

    // Handle cases where the language is undetermined
    if (langCode === 'und') {
        return res.json({
            languageName: 'Could not determine language',
            languageCode: 'N/A',
            history: 'Please provide a longer sentence to get language history.'
        });
    }
    
    // Get full language information from the code
    const languageInfo = langs.where('3', langCode);

    if (languageInfo) {
        // If language is found, fetch its history
        const history = await getLanguageHistory(languageInfo.name);

        res.json({
            languageName: languageInfo.name,
            languageCode: langCode,
            history: history // Send the fetched history back to the frontend
        });
    } else {
        res.json({
            languageName: 'Unknown Language',
            languageCode: langCode,
            history: 'No information available for this language code.'
        });
    }
});

// --- Start the server ---
app.listen(port, () => {
    console.log(`✅ AI Language Detector server running at http://localhost:${port}`);

});







