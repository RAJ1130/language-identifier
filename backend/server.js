// server.js - CORRECTED VERSION

// --- FIX: Added all required packages here ---
const express = require('express');
const cors = require('cors');
const axios = require('axios'); // We will use axios for Wikipedia
const { franc } = require('franc-min'); // Was missing
const langs = require('langs'); // Was missing

const app = express();
const port = process.env.PORT || 3000;

// --- Middleware setup ---
app.use(cors());
app.use(express.json());

// --- All routes must be defined BEFORE app.listen() ---

// Welcome route for the root URL
app.get('/', (req, res) => {
    res.send('✅ AI Language Detector backend is running!');
});

// Function to get language history from Wikipedia
const getLanguageHistory = async (languageName) => {
    const languageQuery = encodeURIComponent(`${languageName} language`);
    const wikipediaUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${languageQuery}`;

    try {
        // --- FIX: Using axios to make the API call ---
        const response = await axios.get(wikipediaUrl, {
            headers: { 'User-Agent': 'LanguageIdentifier/1.0 (your-email@example.com)' }
        });
        
        // Return the summary text (the 'extract')
        return response.data.extract || "No summary available for this language.";

    } catch (error) {
        console.error("Wikipedia fetch error:", error);
        return "Could not find a history for this language on Wikipedia.";
    }
};

// Main API Route for Language Detection
app.post('/detect', async (req, res) => {
    const { text } = req.body;

    if (!text || text.trim().length < 5) {
        return res.status(400).json({ error: 'Please provide a longer sentence.' });
    }

    try {
        const langCode = franc(text);

        if (langCode === 'und') {
            return res.json({
                languageName: 'Could not determine language',
                languageCode: 'N/A',
                history: 'Please provide a longer sentence to get language history.'
            });
        }
    
        const languageInfo = langs.where('3', langCode);

        if (languageInfo) {
            const history = await getLanguageHistory(languageInfo.name);
            res.json({
                languageName: languageInfo.name,
                languageCode: langCode,
                history: history
            });
        } else {
            res.json({
                languageName: 'Unknown Language',
                languageCode: langCode,
                history: 'No information available for this language code.'
            });
        }
    } catch (err) {
        console.error("Detection error:", err);
        res.status(500).json({ error: "An internal error occurred during language detection." });
    }
});

// --- FIX: Only one app.listen() call at the very end of the file ---
app.listen(port, () => {
    console.log(`✅ Server is running and listening on port ${port}`);
});












