exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { 
            statusCode: 405, 
            body: JSON.stringify({ error: 'Method Not Allowed' }) 
        };
    }

    // Grab the API key from Netlify's secure environment variables
    const API_KEY = process.env.GEMINI_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    try {
        // Forward the request to Google Gemini
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: event.body
        });

        const data = await response.json();
        
        // Send the Google response back to our frontend
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error("API Error:", error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: 'Failed to generate recipe' }) 
        };
    }
}