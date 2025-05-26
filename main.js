// main.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');
  const startButton = document.getElementById('startButton');
  const userInput = document.getElementById('userInput');
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  let words = [];
  let gameActive = false;
  let vocabData = [];
  let amalgamateVocab = [];
  let promptType = 'definition';
  let caseSensitive = false;
  let randomizeTerms = true;
  let usedVocabIndices = [];
  let usedAmalgamateIndices = [];
  let vocabIndex = 0;
  let amalgamateIndex = 0;
  let wave = 1;
  let score = 0;
  let correctTermsCount = 0;
  let coveredTerms = new Map();
  let totalChars = 0;
  let correctChars = 0;
  let missedWords = [];
  let lastFrameTime = performance.now();
  let level = 1;
  let mode = 'game';
  let lastSpawnedWord = null;
  let textColor = '#000000';
  const waveSpeeds = [0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6];

  // Variables for WPM calculation
  let wpmActive = false;
  let sessionStartTime = 0;
  let sessionEndTime = 0;
  let lastInputTime = 0;

  startButton.addEventListener('click', () => {
    console.log('Start button clicked');
    startGame();
  });

  async function startGame() {
    const vocabUrl = 'https://raw.githubusercontent.com/kappter/vocab-sets/main/Study_Skills_High_School.csv';
    console.log('Loading vocab from URL:', vocabUrl);

    try {
      const response = await fetch(vocabUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const text = await response.text();
      vocabData = parseCSV(text);
      console.log(`Vocab data length: ${vocabData.length} Amalgamate length: ${amalgamateVocab.length}`);

      level = 1; // Example: Set level based on user input
      mode = 'game'; // Example: Set mode based on user selection
      console.log(`Starting game with level: ${level} mode: ${mode}`);

      // Reset game state
      words = [];
      gameActive = true;
      wave = 1;
      score = 0;
      correctTermsCount = 0;
      coveredTerms.clear();
      totalChars = 0;
      correctChars = 0;
      missedWords = [];
      lastFrameTime = performance.now();
      usedVocabIndices = [];
      usedAmalgamateIndices = [];
      vocabIndex = 0;
      amalgamateIndex = 0;
      lastSpawnedWord = null;
      wpmActive = false;
      sessionStartTime = 0;
      sessionEndTime = 0;
      lastInputTime = 0;

      console.log(`Starting game mode at Level ${level} with speed: ${waveSpeeds[0]}`);
      userInput.disabled = false;
      userInput.focus();
      userInput.value = '';

      // Initial word spawn
      const newWord = spawnWord(ctx, vocabData, amalgamateVocab, promptType, caseSensitive, randomizeTerms, usedVocabIndices, usedAmalgamateIndices, vocabIndex, amalgamateIndex, wave, level, mode, waveSpeeds, lastSpawnedWord);
      if (newWord) {
        words.push(newWord);
      }

      gameLoop();
    } catch (error) {
      console.error('Error loading vocab:', error);
    }
  }

  function parseCSV(text) {
    const rows = text.split('\n').filter(row => row.trim() !== '');
    const headers = rows[0].split(',').map(header => header.trim());
    return rows.slice(1).map(row => {
      const values = row.split(',').map(value => value.trim());
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index] || '';
        return obj;
      }, {});
    });
  }

  function handleInput(event) {
    if (!gameActive) return;

    const input = event.target.value.trim();
    const word = words[0];
    if (word) {
      const target = caseSensitive ? word.typedInput : word.typedInput.toLowerCase();
      const userInputText = caseSensitive ? input : input.toLowerCase();

      if (userInputText === target) {
        event.target.value = '';
        coveredTerms.set(word.typedInput, 'Correct');
        correctTermsCount++;
        score += Math.max(5, word.typedInput.length * 2);
        totalChars += word.typedInput.length;
        correctChars += calculateCorrectChars(word.typedInput, userInputText);
        words.shift();
        console.log(`Term completed. CorrectTermsCount: ${correctTermsCount}, Wave: ${wave}, Time Taken: ${(performance.now() - lastInputTime) / 1000}s, Score Increment: ${Math.max(5, word.typedInput.length * 2)}`);
        wpmActive = false;
        console.log('WPM calculation deactivated - Term completed');
      } else {
        correctChars += calculateCorrectChars(target, userInputText);
      }
    }

    lastInputTime = performance.now();
    if (!wpmActive && input.length > 0) {
      wpmActive = true;
      sessionStartTime = performance.now();
      console.log('WPM calculation activated - First keypress detected');
    }
  }

  function gameLoop() {
    if (!gameActive) return;

    lastFrameTime = updateGame(ctx, words, userInput, gameActive, mode, caseSensitive, textColor, waveSpeeds, wave, score, correctTermsCount, coveredTerms, totalChars, correctChars, missedWords, lastFrameTime, vocabData, amalgamateVocab, promptType, randomizeTerms, usedVocabIndices, usedAmalgamateIndices, vocabIndex, amalgamateIndex, level, lastSpawnedWord);
    requestAnimationFrame(gameLoop);
  }

  userInput.addEventListener('input', handleInput);
});
