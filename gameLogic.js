let currentVocab = [];
let currentWordIndex = 0;
let startTime = null;
let totalTypingTime = 0;
let isProcessingWord = false;

// Populate dropdowns (not needed here since it's handled in main.js, but included for context)
export function populateDropdowns(vocabLists) {
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
export function startGame(vocabList) {
    currentVocab = vocabList;
    currentWordIndex = 0;
    totalTypingTime = 0;
    startTime = new Date();
    console.log(`WPM timer started at ${startTime.toISOString()}`);
}

// Spawn a new word on the canvas
export function spawnWord(vocabData, amalgamateVocab, promptType, mode, level, wave, ctx, canvas, userInput, words, updateTimeIndicator) {
    if (!vocabData || vocabData.length === 0) return;

    const combinedVocab = [...vocabData];
    if (amalgamateVocab && amalgamateVocab.length > 0) {
        combinedVocab.push(...amalgamateVocab);
    }

    // Select a random word from the combined vocabulary
    const vocabItem = combinedVocab[Math.floor(Math.random() * combinedVocab.length)];
    const wordText = promptType === 'definition' ? vocabItem.Definition : vocabItem.Term;
    const expectedInput = promptType === 'definition' ? vocabItem.Term : vocabItem.Definition;

    const word = {
        text: wordText,
        expected: expectedInput,
        x: Math.random() * (canvas.width - 100),
        y: 0,
        speed: 1 + (level * 0.5) + (wave * 0.2),
        width: ctx.measureText(wordText).width
    };

    words.push(word);
    userInput.placeholder = promptType === 'definition' ? 'Type the term...' : 'Type the definition...';

    console.log(`Spawned word: ${word.text} (Expected: ${word.expected})`);
    updateTimeIndicator();
}

// Update the game state (move words, check collisions, etc.)
export function updateGame(gameActive, ctx, canvas, userInput, words, mode, wave, wpmStartTime, missedWords, totalChars, scoreDisplay, calculateWPM, calculateAccuracy, restartGame, spawnWordCallback, certificateButton, gameContainer, startScreen, vocabData, amalgamateVocab, promptType, level, updateTimeIndicator) {
    if (!gameActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    words.forEach((word, index) => {
        // Draw the word
        ctx.font = '16px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText(word.text, word.x, word.y);

        // Move the word down
        word.y += word.speed;

        // Check if the word has reached the bottom
        if (word.y > canvas.height) {
            missedWords.push(word.expected);
            words.splice(index, 1);
            console.log(`Missed word: ${word.expected}`);
            spawnWordCallback();
        }
    });

    // Update score display
    scoreDisplay.textContent = `Score: ${parseInt(scoreDisplay.textContent.split(': ')[1]) || 0}`;

    // If no words left, spawn a new one
    if (words.length === 0) {
        spawnWordCallback();
    }

    // Continue the game loop
    requestAnimationFrame(() =>
        updateGame(gameActive, ctx, canvas, userInput, words, mode, wave, wpmStartTime, missedWords, totalChars, scoreDisplay, calculateWPM, calculateAccuracy, restartGame, spawnWordCallback, certificateButton, gameContainer, startScreen, vocabData, amalgamateVocab, promptType, level, updateTimeIndicator)
    );
}

// Handle user input
export function handleInput(e, words, caseSensitive, score, correctChars, totalChars, scoreDisplay, userInput, ctx, canvas, wpmStartTime, totalTypingTime, spawnWordCallback, vocabData, amalgamateVocab, promptType, mode, level, wave, updateTimeIndicator) {
    if (isProcessingWord) return { words, score, correctChars, totalChars, wpmStartTime, totalTypingTime };
    isProcessingWord = true;

    const userInputValue = userInput.value.trim();
    let matchFound = false;

    words.forEach((word, index) => {
        const expected = caseSensitive ? word.expected : word.expected.toLowerCase();
        const input = caseSensitive ? userInputValue : userInputValue.toLowerCase();

        if (input === expected) {
            matchFound = true;
            words.splice(index, 1);
            score += 10;
            scoreDisplay.textContent = `Score: ${score}`;

            // Update WPM timing
            if (!wpmStartTime) wpmStartTime = new Date();
            const endTime = new Date();
            totalTypingTime += (endTime - wpmStartTime) / 1000;
            wpmStartTime = null;

            // Update accuracy stats
            totalChars += word.expected.length;
            correctChars += word.expected.length;

            userInput.value = '';
            console.log(`Word completed: ${word.expected}. Score: ${score}, Total typing time: ${totalTypingTime.toFixed(2)}s`);

            spawnWordCallback();
        }
    });

    if (!matchFound) {
        totalChars += userInputValue.length;
        // Assume all chars are incorrect if no match (simplified accuracy calculation)
        // In a real app, you might compare character-by-character
    }

    updateTimeIndicator();
    isProcessingWord = false;

    return { words, score, correctChars, totalChars, wpmStartTime, totalTypingTime };
}

// Toggle theme (light/dark mode)
export function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    console.log("Theme toggled to", isDark ? 'dark' : 'light');
}
