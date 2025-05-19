let currentVocab = [];
let currentWordIndex = 0;
let startTime = null;
let totalTypingTime = 0;
let isProcessingWord = false; // Flag to prevent infinite loop

// Populate dropdowns (assumed to be working as per logs)
function populateDropdowns(vocabLists) {
    const vocabSelect = document.getElementById('vocabSelect');
    const amalgamateSelect = document.getElementById('amalgamateSelect');
    
    vocabLists.forEach(list => {
        const option1 = document.createElement('option');
        option1.value = list.name;
        option1.textContent = list.name;
        vocabSelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = list.name;
        option2.textContent = list.name;
        amalgamateSelect.appendChild(option2);
        
        console.log(`Added option to vocabSelect: ${list.name}`);
        console.log(`Added option to amalgamateSelect: ${list.name}`);
    });
    console.log(`Dropdown population completed. Vocab options: ${vocabSelect.options.length} Amalgamate options: ${amalgamateSelect.options.length}`);
}

// Start the game with the selected vocabulary
function startGame(vocabList) {
    currentVocab = vocabList;
    currentWordIndex = 0;
    totalTypingTime = 0;
    startTime = new Date();
    console.log(`WPM timer started at ${startTime.toISOString()}`);
    updateGameState();
}

// Update the game state (display the current word/definition)
function updateGameState() {
    if (currentWordIndex >= currentVocab.length) {
        endGame();
        return;
    }

    const vocab1 = currentVocab[currentWordIndex];
    console.log(`vocab1 selected: ${JSON.stringify(vocab1)}`);

    const amalgamateWord = {
        finalPrompt: vocab1.Definition,
        finalTypedInput: vocab1.Term,
        finalDefinition: vocab1.Definition
    };
    console.log(`Amalgamated word: ${JSON.stringify(amalgamateWord)}`);

    // Display the definition to the user (assumed to be handled by UI)
    displayDefinition(amalgamateWord.finalPrompt);
}

// Handle user input
function handleInput(userInput) {
    if (isProcessingWord) return; // Prevent re-entry during processing
    isProcessingWord = true;

    const currentWord = currentVocab[currentWordIndex];
    if (userInput.trim().toLowerCase() === currentWord.Term.toLowerCase()) {
        const endTime = new Date();
        const elapsedTime = (endTime - startTime) / 1000;
        totalTypingTime += elapsedTime;
        console.log(`Word completed. Elapsed time: ${elapsedTime.toFixed(2)}s, Total typing time: ${totalTypingTime.toFixed(2)}s`);

        currentWordIndex++; // Move to the next word
        startTime = new Date(); // Reset the timer for the next word
        updateGameState(); // Update to the next word
    } else {
        // Handle incorrect input (e.g., show feedback)
        console.log("Incorrect input, try again.");
    }

    isProcessingWord = false; // Reset the flag
}

// End the game
function endGame() {
    console.log("Game Over! Calculating WPM...");
    const wpm = (currentVocab.length / (totalTypingTime / 60)).toFixed(2);
    alert(`Game Over! Your WPM: ${wpm}`);
}

// Toggle theme (light/dark mode)
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    console.log("Theme toggled");
}

// Placeholder for displaying the definition (assumed to be in UI code)
function displayDefinition(definition) {
    const definitionElement = document.getElementById('definition');
    definitionElement.textContent = definition;
}

// Event listener for theme toggle button (assumed to be in UI code)
document.getElementById('toggleThemeButton').addEventListener('click', toggleTheme);
