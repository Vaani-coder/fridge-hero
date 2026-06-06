exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    // We changed the model name here to the classic, universally supported 'gemini-pro'
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: event.body
        });

        const data = await response.json();
        
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
