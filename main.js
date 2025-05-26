import { spawnWord, updateGame, calculateCorrectChars, calculateWPM, calculateAccuracy } from './gameLogic.js';
import { populateVocabDropdown } from './dataLoader.js';

const defaultVocabData = [
  { Term: 'Algorithm', Definition: 'A set of rules to solve a problem' },
  { Term: 'Loop', Definition: 'A structure that repeats code' },
  { Term: 'Variable', Definition: 'A storage location in memory' },
  { Term: 'Function', Definition: 'A reusable code block' }
];

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');

  // Get DOM elements
  const startButton = document.getElementById('startButton');
  const userInput = document.getElementById('userInput');
  const canvas = document.getElementById('gameCanvas');
  const vocabSelect = document.getElementById('vocabSelect');
  const amalgamateSelect = document.getElementById('amalgamateSelect');

  // Debug: Check if dropdown elements exist
  if (!vocabSelect || !amalgamateSelect) {
    console.error('Dropdown elements not found:', {
      vocabSelect: !!vocabSelect,
      amalgamateSelect: !!amalgamateSelect
    });
    alert('Error: Vocabulary dropdowns not found in the DOM. Please check index.html.');
    return;
  }

  // Populate dropdowns
  console.log('Calling populateVocabDropdown');
  try {
    populateVocabDropdown(vocabSelect, amalgamateSelect);
    console.log('Dropdowns populated successfully');
  } catch (error) {
    console.error('Error populating dropdowns:', error);
    alert('Failed to populate vocabulary dropdowns. Using default vocabulary.');
  }

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
    console.log('startGame initiated');
    const vocabUrl = vocabSelect.value || '';
    const amalgamateUrl = amalgamateSelect.value;

    console.log('Loading vocab from URL:', vocabUrl || 'default vocabulary');
    if (amalgamateUrl) console.log('Loading amalgamate vocab from URL:', amalgamateUrl);

    try {
      // Load primary vocabulary
      if (vocabUrl) {
        const response = await fetch(vocabUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const text = await response.text();
        vocabData = await parseCSV(text);
        console.log(`Vocab data loaded: ${vocabData.length} terms`);
      } else {
        console.log('No vocab URL selected, using default vocabulary');
        vocabData = [...defaultVocabData];
      }

      // Load amalgamate vocabulary if selected
      if (amalgamateUrl) {
        const amalgamateResponse = await fetch(amalgamateUrl);
        if (!amalgamateResponse.ok) throw new Error(`HTTP error! status: ${amalgamateResponse.status}`);
        const amalgamateText = await amalgamateResponse.text();
        amalgamateVocab = await parseCSV(amalgamateText);
        console.log(`Amalgamate vocab loaded: ${amalgamateVocab.length} terms`);
      } else {
        amalgamateVocab = [];
        console.log('No amalgamate vocab selected');
      }

      // Validate vocabulary
      if (vocabData.length === 0 && amalgamateVocab.length === 0) {
        console.warn('No valid vocabulary loaded, using default');
        vocabData = [...defaultVocabData];
      }

      level = parseInt(document.getElementById('levelSelect')?.value) || 1;
      mode = document.getElementById('modeSelect')?.value || 'game';
      promptType = document.getElementById('promptSelect')?.value || 'definition';
      caseSensitive = document.getElementById('caseSensitive')?.checked || false;
      randomizeTerms = document.getElementById('randomizeTerms')?.checked || true;
      console.log(`Starting game with level: ${level}, mode: ${mode}, promptType: ${promptType}, caseSensitive: ${caseSensitive}, randomizeTerms: ${randomizeTerms}`);

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
      sessionStartTime = performance.now();
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
        console.log('Initial word spawned:', newWord.typedInput);
      } else {
        console.error('Failed to spawn initial word');
      }

      gameLoop();
      console.log('Game loop started');
    } catch (error) {
      console.error('Error loading vocab:', error.message);
      alert(`Failed to load vocabulary: ${error.message}. Using default vocabulary.`);
      vocabData = [...defaultVocabData];
      amalgamateVocab = [];
      
      // Initialize game with default vocabulary
      level = 1;
      mode = 'game';
      promptType = 'definition';
      caseSensitive = false;
      randomizeTerms = true;

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
      sessionStartTime = performance.now();
      sessionEndTime = 0;
      lastInputTime = 0;

      userInput.disabled = false;
      userInput.focus();
      userInput.value = '';

      const newWord = spawnWord(ctx, vocabData, amalgamateVocab, promptType, caseSensitive, randomizeTerms, usedVocabIndices, usedAmalgamateIndices, vocabIndex, amalgamateIndex, wave, level, mode, waveSpeeds, lastSpawnedWord);
      if (newWord) {
        words.push(newWord);
        console.log('Initial word spawned with default vocab:', newWord.typedInput);
      }

      gameLoop();
      console.log('Game loop started with default vocabulary');
    }
  }

  async function parseCSV(text) {
    console.log('Parsing CSV data');
    if (typeof Papa !== 'undefined') {
      return new Promise((resolve) => {
        Papa.parse(text, {
          header: true,
          complete: (results) => {
            const filteredData = results.data.filter(row => row.Term && row.Definition);
            console.log('Parsed with Papa Parse:', filteredData.length, 'terms');
            resolve(filteredData);
          },
          error: (error) => {
            console.error('Papa Parse error:', error);
            resolve(fallbackParseCSV(text));
          }
        });
      });
    } else {
      console.warn('Papa Parse not available, using fallback parser');
      return fallbackParseCSV(text);
    }
  }

  function fallbackParseCSV(text) {
    console.log('Using fallback CSV parser');
    const rows = text.split('\n').filter(row => row.trim() !== '');
    const headers = rows[0].split(',').map(header => header.trim());
    return rows.slice(1).map(row => {
      const values = row.split(',').map(value => value.trim());
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index] || '';
        return obj;
      }, {});
    }).filter(item => item.Term && item.Definition);
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