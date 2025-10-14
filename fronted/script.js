document.addEventListener('DOMContentLoaded', () => {
    // --- Get all necessary HTML elements ---
    const textInput = document.getElementById('text-input');
    const detectBtn = document.getElementById('detect-btn');
    const micBtn = document.getElementById('mic-btn');
    const micStatus = document.getElementById('mic-status');
    const languageNameEl = document.getElementById('language-name');
    const languageCodeEl = document.getElementById('language-code');
    const historyContainer = document.getElementById('history-content');

    // The URL of your running backend server
    const backendUrl = 'http://localhost:3000/detect';

    // --- Main function to detect language ---
    const detectLanguage = async () => {
        const text = textInput.value.trim();

        if (text.length === 0) {
            alert('Please enter some text to detect.');
            return;
        }
        
        // --- Update UI to show loading state ---
        detectBtn.disabled = true;
        micBtn.disabled = true;
        detectBtn.textContent = 'Analyzing...';
        languageNameEl.textContent = '...';
        languageCodeEl.textContent = '...';
        historyContainer.innerHTML = '<h2>Language History</h2><p>Fetching history...</p>';

        try {
            // Send the text to the backend API
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            // --- Update UI with the result from the backend ---
            languageNameEl.textContent = data.languageName;
            languageCodeEl.textContent = data.languageCode;
            
            historyContainer.innerHTML = `
                <h2>History of ${data.languageName}</h2>
                <p>${data.history}</p>
            `;

        } catch (error) {
            console.error('Error during language detection:', error);
            languageNameEl.textContent = 'Error';
            languageCodeEl.textContent = 'Could not connect to server';
            historyContainer.innerHTML = '<h2>Language History</h2><p>Could not load history due to a server error.</p>';
        } finally {
            // --- Reset UI after detection is complete ---
            detectBtn.disabled = false;
            micBtn.disabled = false;
            detectBtn.textContent = 'Detect Language';
        }
    };

    // Attach the function to the button's click event
    detectBtn.addEventListener('click', detectLanguage);

    // --- Speech Recognition Logic ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        micBtn.addEventListener('click', () => {
            recognition.start();
        });

        recognition.onstart = () => {
            micStatus.textContent = "🔴 Listening...";
            micBtn.disabled = true;
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            textInput.value = transcript;
            // Automatically trigger the detection after text is inserted
            setTimeout(detectLanguage, 250);
        };

        recognition.onerror = (event) => {
            micStatus.textContent = `Error: ${event.error}`;
            if (event.error === 'not-allowed') {
                micStatus.textContent = "Error: Microphone access denied.";
            }
        };

        recognition.onend = () => {
            micStatus.textContent = "";
            micBtn.disabled = false;
        };

    } else {
        micBtn.style.display = 'none';
        micStatus.textContent = "Sorry, your browser doesn't support voice recognition.";
    }
});