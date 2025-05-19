let currentWord = null;
let totalTypingTime = 0;
let isProcessingWord = false;

// Spawn a new word (sets the placeholder, no canvas rendering)
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

    currentWord = {
        text: wordText,
        expected: expectedInput
    };

    // Set the placeholder to the definition (or term)
    userInput.placeholder = wordText;

    // Clear the words array (since we're not using the canvas)
    words.length = 0;
    words.push(currentWord);

    console.log(`Spawned word: ${wordText} (Expected: ${expectedInput})`);
    updateTimeIndicator();
}

// Update the game state (no canvas rendering, just ensures the game continues)
export function updateGame(gameActive, ctx, canvas, userInput, words, mode, wave, wpmStartTime, missedWords, totalChars, totalTypingTime, score, scoreDisplay, calculateWPM, calculateAccuracy, restartGame, spawnWordCallback, certificateButton, gameContainer, startScreen, vocabData, amalgamateVocab, promptType, level, updateTimeIndicator) {
    if (!gameActive) return;

    // Clear the canvas (since we're not rendering anything)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If no words are active, spawn a new one
    if (words.length === 0) {
        spawnWordCallback();
    }

    // Update score display
    scoreDisplay.textContent = `Score: ${score}`;

    // Continue the game loop
    requestAnimationFrame(() =>
        updateGame(gameActive, ctx, canvas, userInput, words, mode, wave, wpmStartTime, missedWords, totalChars, totalTypingTime, score, scoreDisplay, calculateWPM, calculateAccuracy, restartGame, spawnWordCallback, certificateButton, gameContainer, startScreen, vocabData, amalgamateVocab, promptType, level, updateTimeIndicator)
    );
}

// Handle user input
export function handleInput(e, words, caseSensitive, score, correctChars, totalChars, scoreDisplay, userInput, ctx, canvas, wpmStartTime, totalTypingTime, spawnWordCallback, vocabData, amalgamateVocab, promptType, mode, level, wave, updateTimeIndicator) {
    if (isProcessingWord || words.length === 0) return { words, score, correctChars, totalChars, wpmStartTime, totalTypingTime };
    isProcessingWord = true;

    const userInputValue = userInput.value.trim();
    let matchFound = false;

    const word = words[0]; // Only one word active at a time
    const expected = caseSensitive ? word.expected : word.expected.toLowerCase();
    const input = caseSensitive ? userInputValue : userInputValue.toLowerCase();

    if (input === expected) {
        matchFound = true;
        words.splice(0, 1); // Remove the current word
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
    } else {
        totalChars += userInputValue.length;
        // Simplified accuracy: assume all chars are incorrect if no match
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