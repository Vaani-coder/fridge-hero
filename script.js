// DOM Elements matching your custom HTML perfectly!
const cookBtn = document.getElementById('cook-btn');
const ing1Input = document.getElementById('ing1');
const ing2Input = document.getElementById('ing2');
const ing3Input = document.getElementById('ing3');

const errorState = document.getElementById('error-state');
const errorMessage = document.getElementById('error-message');
const loadingState = document.getElementById('loading-state');
const recipeCard = document.getElementById('recipe-card');
const recipeTitle = document.getElementById('recipe-title');
const recipeDesc = document.getElementById('recipe-desc');
const recipeSteps = document.getElementById('recipe-steps');
const recipeTip = document.getElementById('recipe-tip');
const btnText = document.querySelector('.btn-text');

cookBtn.addEventListener('click', handleCookMagic);

async function handleCookMagic(event) {
    event.preventDefault(); // Stops the page from refreshing

    const ing1 = ing1Input.value.trim();
    const ing2 = ing2Input.value.trim();
    const ing3 = ing3Input.value.trim();

    // Check for empty fields
    if (!ing1 || !ing2 || !ing3) {
        errorMessage.textContent = "Please enter all 3 ingredients!";
        errorState.classList.remove('hidden');
        return;
    }

    // Hide errors, show loading spinner
    errorState.classList.add('hidden');
    recipeCard.classList.add('hidden');
    loadingState.classList.remove('hidden');
    cookBtn.disabled = true;
    btnText.textContent = "Cooking...";

    const prompt = `
        You are a creative chef assistant. 
        The user has these 3 ingredients: 1. ${ing1} 2. ${ing2} 3. ${ing3}
        Create a fun, tasty dish using only or mainly these ingredients. 
        Return the answer STRICTLY as a JSON object with no formatting or markdown. 
        Use the following JSON structure:
        {
            "dishName": "A creative fancy name for the dish",
            "shortDescription": "A 1-2 sentence appetizing description",
            "steps": ["Step 1", "Step 2", "Step 3"],
            "servingTip": "One optional serving tip or plating suggestion"
        }
    `;

try {
        const response = await fetch('/.netlify/functions/generate', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) throw new Error("Failed to fetch from API");

        const data = await response.json();
        
        // Safer way to open the AI's envelope
        let textResponse = "";
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            textResponse = data.candidates[0].content.parts[0].text;
        } else if (data.body) {
             // Netlify sometimes strings the body twice
            let parsedBody = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
            textResponse = parsedBody.candidates[0].content.parts[0].text;
        }

        // Clean up the text and turn it into a JavaScript object
        textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const recipeData = JSON.parse(textResponse);

        // Put the AI data into your beautiful HTML elements
        recipeTitle.textContent = recipeData.dishName;
        recipeDesc.textContent = recipeData.shortDescription;
        recipeTip.textContent = recipeData.servingTip;
        
        recipeSteps.innerHTML = "";
        recipeData.steps.forEach(step => {
            const li = document.createElement("li");
            li.textContent = step;
            recipeSteps.appendChild(li);
        });

        // Hide loading, show the final recipe card!
        loadingState.classList.add('hidden');
        recipeCard.classList.remove('hidden');

    } catch (error) {
        console.error("Error generating recipe:", error);
        errorMessage.textContent = "Oops! Something went wrong generating the recipe.";
        errorState.classList.remove('hidden');
        loadingState.classList.add('hidden');
    } finally {
        cookBtn.disabled = false;
        btnText.textContent = "Cook Magic ✨";
    }
}
