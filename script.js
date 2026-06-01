// DOM Elements
const cookBtn = document.getElementById('cook-btn');
const ing1Input = document.getElementById('ing1');
const ing2Input = document.getElementById('ing2');
const ing3Input = document.getElementById('ing3');
const errorMsg = document.getElementById('error-msg');
const loadingSection = document.getElementById('loading-section');
const recipeOutput = document.getElementById('recipe-output');

// Recipe UI Elements
const dishNameEl = document.getElementById('dish-name');
const dishDescEl = document.getElementById('dish-desc');
const recipeStepsEl = document.getElementById('recipe-steps');
const servingTipEl = document.getElementById('serving-tip');

cookBtn.addEventListener('click', handleCookMagic);

async function handleCookMagic() {
    // 1. Read input values
    const ing1 = ing1Input.value.trim();
    const ing2 = ing2Input.value.trim();
    const ing3 = ing3Input.value.trim();

    // 2. Validate empty fields
    if (!ing1 || !ing2 || !ing3) {
        errorMsg.classList.remove('hidden');
        return;
    }

    // 3. UI State: Hide errors, hide previous output, show loading
    errorMsg.classList.add('hidden');
    recipeOutput.classList.add('hidden');
    loadingSection.classList.remove('hidden');
    cookBtn.disabled = true;
    cookBtn.textContent = "Cooking...";

    // 4. Create the prompt
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
        // 5. Call our Netlify Serverless Function 
        const response = await fetch('/.netlify/functions/generate', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) throw new Error("Failed to fetch from API");

        const data = await response.json();
        
        // Extract the text response
        let textResponse = data.candidates[0].content.parts[0].text;
        
        // Clean up text in case Gemini adds markdown like ```json ... ```
        textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        
        // Parse the JSON
        const recipeData = JSON.parse(textResponse);

        // 6. Update the UI
        dishNameEl.textContent = recipeData.dishName;
        dishDescEl.textContent = recipeData.shortDescription;
        servingTipEl.textContent = recipeData.servingTip;
        
        // Clear previous steps and inject new ones
        recipeStepsEl.innerHTML = "";
        recipeData.steps.forEach(step => {
            const li = document.createElement("li");
            li.textContent = step;
            recipeStepsEl.appendChild(li);
        });

        // Show the recipe card
        loadingSection.classList.add('hidden');
        recipeOutput.classList.remove('hidden');

    } catch (error) {
        console.error("Error generating recipe:", error);
        alert("Oops! Something went wrong while generating the recipe.");
        loadingSection.classList.add('hidden');
    } finally {
        cookBtn.disabled = false;
        cookBtn.textContent = "Cook Magic ✨";
    }
}