import { spawnWord, updateGame, calculateCorrectChars, calculateWPM, calculateAccuracy } from './gameLogic.js';
import { populateVocabDropdown, loadVocab } from './dataLoader.js';

const defaultVocabData = [
  { Term: 'Algorithm', Definition: 'A set of rules to solve a problem' },
  { Term: 'Loop', Definition: 'A structure that repeats code' },
  { Term: 'Variable', Definition: 'A storage location in memory' },
  { Term: 'Function', Definition: 'A reusable code block' }
];

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');

  const startButton = document.getElementById('startButton');
  const resetButton = document.getElementById('resetGame');
  const userInput = document.getElementById('userInput');
  const canvas = document.getElementById('gameCanvas');
  const vocabSelect = document.getElementById('vocabSelect');
  const amalgamateSelect = document.getElementById('amalgamateSelect');
  const loadingIndicator = document.getElementById('loadingIndicator');

  if (!vocabSelect || !amalgamateSelect || !startButton || !resetButton || !userInput || !canvas || !loadingIndicator) {
    console.error('DOM elements missing:', {
      vocabSelect: !!vocabSelect,
      amalgamateSelect: !!amalgamateSelect,
      startButton: !!startButton,
      resetButton: !!resetButton,
      userInput: !!userInput,
      canvas: !!canvas,
      loadingIndicator: !!loadingIndicator
    });
    alert('Error: Required DOM elements not found. Please check index.html.');
    return;
  }

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
  let wpmActive = false;
  let sessionStartTime = 0;
  let sessionEndTime = 0;
  let lastInputTime = 0;

  const waveSpeeds = [0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6];

  function showGameScreen() {
    document.getElementById('settings').classList.add('hidden');
    document.querySelector('.app-title').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');
    document.getElementById('stats').classList.remove('hidden');
    document.getElementById('input').classList.remove('hidden');
    document.getElementById('controls').classList.remove('hidden');
    document.getElementById('keyboard').classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('game').classList.add('active');
      document.getElementById('stats').classList.add('active');
      document.getElementById('input').classList.add('active');
      document.getElementById('controls').classList.add('active');
      document.getElementById('keyboard').classList.add('active');
    }, 10);
  }

  function hideGameScreen() {
    document.getElementById('game').classList.remove('active');
    document.getElementById('stats').classList.remove('active');
    document.getElementById('input').classList.remove('active');
    document.getElementById('controls').classList.remove('active');
    document.getElementById('keyboard').classList.remove('active');
    setTimeout(() => {
      document.getElementById('game').classList.add('hidden');
      document.getElementById('stats').classList.add('hidden');
      document.getElementById('input').classList.add('hidden');
      document.getElementById('controls').classList.add('hidden');
      document.getElementById('keyboard').classList.add('hidden');
      document.getElementById('settings').classList.remove('hidden');
      document.querySelector('.app-title').classList.remove('hidden');
    }, 500);
  }

  function updateStatsDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('wave').textContent = wave;
    document.getElementById('terms').textContent = `${correctTermsCount}/${vocabData.length + amalgamateVocab.length}`;
    document.getElementById('wpm').textContent = calculateWPM(totalChars, correctChars, sessionStartTime, lastInputTime || performance.now());
    document.getElementById('time').textContent = mode === 'game' ? `${30 - Math.floor((performance.now() - sessionStartTime) / 1000)}s` : '∞';
    document.getElementById('toWave').textContent = 10;
  }

  startButton.addEventListener('click', () => {
    console.log('Start button clicked');
    startGame();
  });

  resetButton.addEventListener('click', () => {
    console.log('Reset button clicked');
    resetGame();
  });

  async function startGame() {
    console.log('startGame initiated');
    const vocabUrl = vocabSelect.value;
    const amalgamateUrl = amalgamateSelect.value;

    console.log('Loading vocab from URL:', vocabUrl || 'default vocabulary');
    if (amalgamateUrl) console.log('Loading amalgamate vocab from URL:', amalgamateUrl);

    try {
      const vocabResult = await loadVocab(
        vocabUrl,
        false,
        vocabData,
        amalgamateVocab,
        vocabSelect,
        amalgamateSelect,
        loadingIndicator,
        startButton,
        defaultVocabData
      );
      vocabData = vocabResult.vocab || defaultVocabData;
      console.log(`Vocab loaded: ${vocabData.length} terms, setName: ${vocabResult.vocabSetName}`);

      if (amalgamateUrl) {
        const amalgamateResult = await loadVocab(
          amalgamateUrl,
          true,
          vocabData,
          amalgamateVocab,
          vocabSelect,
          amalgamateSelect,
          loadingIndicator,
          startButton,
          defaultVocabData
        );
        amalgamateVocab = amalgamateResult.vocab || [];
        console.log(`Amalgamate vocab loaded: ${amalgamateVocab.length} terms, setName: ${amalgamateResult.amalgamateSetName}`);
      } else {
        amalgamateVocab = [];
        console.log('No amalgamate vocab selected');
      }

      if (vocabData.length === 0 && amalgamateVocab.length === 0) {
        console.warn('No valid vocabulary loaded, using default');
        vocabData = [...defaultVocabData];
      }

      level = parseInt(document.getElementById('levelSelect')?.value) || 1;
      mode = document.getElementById('modeSelect')?.value || 'game';
      promptType = document.getElementById('promptType')?.value || 'definition';
      caseSensitive = document.getElementById('caseSensitivity')?.value === 'sensitive';
      randomizeTerms = document.getElementById('randomizeTerms')?.checked || true;
      console.log(`Starting game with level: ${level}, mode: ${mode}, promptType: ${promptType}, caseSensitive: ${caseSensitive}, randomizeTerms: ${randomizeTerms}`);

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

      const newWord = spawnWord(ctx, vocabData, amalgamateVocab, promptType, caseSensitive, randomizeTerms, usedVocabIndices, usedAmalgamateIndices, vocabIndex, amalgamateIndex, wave, level, mode, waveSpeeds, lastSpawnedWord);
      if (newWord) {
        words.push(newWord);
        console.log('Initial word spawned:', newWord.typedInput);
      } else {
        console.error('Failed to spawn initial word');
      }

      showGameScreen();
      updateStatsDisplay();
      gameLoop();
      console.log('Game loop started');
    } catch (error) {
      console.error('Error in startGame:', error.message);
      alert(`Failed to start game: ${error.message}. Using default vocabulary.`);
      vocabData = [...defaultVocabData];
      amalgamateVocab = [];

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

      showGameScreen();
      updateStatsDisplay();
      gameLoop();
      console.log('Game loop started with default vocabulary');
    }
  }

  function resetGame() {
    console.log('Resetting game');
    gameActive = false;
    words = [];
    wave = 1;
    score = 0;
    correctTermsCount = 0;
    coveredTerms.clear();
    totalChars = 0;
    correctChars = 0;
    missedWords = [];
    usedVocabIndices = [];
    usedAmalgamateIndices = [];
    vocabIndex = 0;
    amalgamateIndex = 0;
    lastSpawnedWord = null;
    wpmActive = false;
    sessionStartTime = 0;
    sessionEndTime = 0;
    lastInputTime = 0;
    userInput.value = '';
    userInput.disabled = true;
    hideGameScreen();
    updateStatsDisplay();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  function handleInput(event) {
    if (!gameActive) return;

    const input = event.target.value.trim();
    const word = words[0];
    if (word) {
      const target = caseSensitive ? word.typedInput : word.typedInput.toLowerCase();
      const userInputText = caseSensitive ? input : input.toLowerCase();
      console.log('Input:', userInputText, 'Target:', target);

      if (userInputText === target) {
        event.target.value = '';
        coveredTerms.set(word.typedInput, 'Correct');
        correctTermsCount++;
        score += Math.max(5, word.typedInput.length * 2);
        totalChars += word.typedInput.length;
        correctChars += calculateCorrectChars(word.typedInput, userInputText);
        words.shift();
        console.log(`Term completed. CorrectTermsCount: ${correctTermsCount}, Wave: ${wave}, Score: ${score}`);
        wpmActive = false;
        updateStatsDisplay();
        if (words.length === 0) {
          const newWord = spawnWord(ctx, vocabData, amalgamateVocab, promptType, caseSensitive, randomizeTerms, usedVocabIndices, usedAmalgamateIndices, vocabIndex, amalgamateIndex, wave, level, mode, waveSpeeds, lastSpawnedWord);
          if (newWord) {
            words.push(newWord);
            console.log('New word spawned after completion:', newWord.typedInput);
          }
        }
      } else {
        correctChars += calculateCorrectChars(target, userInputText);
      }
    }

    lastInputTime = performance.now();
    if (!wpmActive && input.length > 0) {
      wpmActive = true;
      sessionStartTime = performance.now();
      console.log('WPM calculation activated');
    }
  }

  function gameLoop() {
    if (!gameActive) return;

    lastFrameTime = updateGame(ctx, words, userInput, gameActive, mode, caseSensitive, getComputedStyle(document.body).getPropertyValue('--canvas-text').trim(), waveSpeeds, wave, score, correctTermsCount, coveredTerms, totalChars, correctChars, missedWords, lastFrameTime, vocabData, amalgamateVocab, promptType, randomizeTerms, usedVocabIndices, usedAmalgamateIndices, vocabIndex, amalgamateIndex, level, lastSpawnedWord);
    updateStatsDisplay();
    requestAnimationFrame(gameLoop);
  }

  userInput.addEventListener('input', handleInput);
});