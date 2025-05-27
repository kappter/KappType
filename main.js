import { spawnWord, updateGame, calculateCorrectChars, calculateWPM, calculateAccuracy } from './gameLogic.js';
import { populateVocabDropdown, loadVocab } from './dataLoader.js';
import { generateCertificate } from './certificate-generator.js';

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
  const generateCertificateButton = document.getElementById('generateCertificate');
  const promptSelect = document.getElementById('promptType');
  const themeSelect = document.getElementById('themeSelect');
  const pageLoadTime = performance.now();

  if (!vocabSelect || !amalgamateSelect || !startButton || !resetButton || !userInput || !canvas || !loadingIndicator || !generateCertificateButton || !promptSelect || !themeSelect) {
    console.error('DOM elements missing:', {
      vocabSelect: !!vocabSelect,
      amalgamateSelect: !!amalgamateSelect,
      startButton: !!startButton,
      resetButton: !!resetButton,
      userInput: !!userInput,
      canvas: !!canvas,
      loadingIndicator: !!loadingIndicator,
      generateCertificateButton: !!generateCertificateButton,
      promptSelect: !!promptSelect,
      themeSelect: !!themeSelect
    });
    alert('Error: Required DOM elements not found. Please check index.html.');
    return;
  }

  // Set default theme
  document.body.className = 'natural-light';
  console.log('Default theme set: natural-light');

  // Theme selection
  themeSelect.addEventListener('change', () => {
    const selectedTheme = themeSelect.value;
    console.log(`Theme selected: ${selectedTheme}`);
    document.body.className = selectedTheme;
  });

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
  let wordStartTime = 0;
  let wordEndTime = 0;
  let lastWPM = 0;
  let sessionStartTime = 0;
  let sessionEndTime = 0;

  const waveSpeeds = [0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6];

  function showGameScreen() {
    document.getElementById('settings').classList.add('hidden');
    const appTitle = document.querySelector('.app-title');
    if (appTitle) {
      appTitle.classList.add('hidden');
    } else {
      console.warn('App title element (.app-title) not found in DOM');
    }
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
    document.getElementById('controls').classList('controls').classList.remove('active');
    document.getElementById('keyboard').classList.remove('active');
    setTimeout(() => {
      document.getElementById('game').classList.add('hidden');
      document.getElementById('stats').classList.add('hidden');
      document.getElementById('input').classList.add('hidden');
      document.getElementById('controls').classList.add('hidden');
      document.getElementById('keyboard').classList.add('hidden');
      document.getElementById('settings').classList.remove('hidden');
      const appTitle = document.querySelector('.app-title');
      if (appTitle) {
        appTitle.classList.remove('hidden');
      } else {
        console.warn('App title element (.app-title) not found in DOM');
      }
    }, 500);
  }

  function updateStatsDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('wave').textContent = wave;
    document.getElementById('terms').textContent = `${correctTermsCount}/${vocabData.length + amalgamateVocab.length}`;
    document.getElementById('wpm').textContent = lastWPM;
    document.getElementById('time').textContent = mode === 'game' ? `${Math.max(0, 30 - Math.floor((performance.now() - sessionStartTime) / 1000))}s` : '∞';
    document.getElementById('toWave').textContent = 10;
  }

  function endGame() {
    console.log('Game ended');
    gameActive = false;
    sessionEndTime = performance.now();
    userInput.disabled = true;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = '30px Orbitron';
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--neon-cyan').trim();
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', ctx.canvas.width / 2, ctx.canvas.height / 2);
    updateStatsDisplay();
  }

  startButton.addEventListener('click', () => {
    console.log('Start button clicked');
    startGame();
  });

  resetButton.addEventListener('click', () => {
    console.log('Reset button clicked');
    resetGame();
  });

  generateCertificateButton.addEventListener('click', () => {
    console.log('Generate certificate button clicked');
    generateCertificate(pageLoadTime, sessionStartTime, sessionEndTime, score, wave, promptSelect, vocabData, amalgamateVocab, coveredTerms, lastWPM, totalChars, correctChars);
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
      wordStartTime = 0;
      wordEndTime = 0;
      lastWPM = 0;
      sessionStartTime = performance.now();
      sessionEndTime = 0;

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
      wordStartTime = 0;
      wordEndTime = 0;
      lastWPM = 0;
      sessionStartTime = performance.now();
      sessionEndTime = 0;

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
    wordStartTime = 0;
    wordEndTime = 0;
    lastWPM = 0;
    sessionStartTime = 0;
    sessionEndTime = 0;
    userInput.value = '';
    userInput.disabled = true;
    hideGameScreen();
    updateStatsDisplay();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  function handleInput(event) {
    if (!gameActive) return;

    let input = event.target.value.trim();
    // Normalize apostrophes, quotes, and spaces
    input = input.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/\s+/g, ' ');
    event.target.value = input;
    console.log('Input received:', input);

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
        wordEndTime = performance.now();
        if (wpmActive && wordStartTime > 0) {
          lastWPM = calculateWPM(word.typedInput.length, word.typedInput.length, wordStartTime, wordEndTime);
          console.log(`Word completed, WPM: ${lastWPM}`);
        }
        words.shift();
        console.log(`Term completed. CorrectTermsCount: ${correctTermsCount}, Wave: ${wave}, Score: ${score}`);
        wpmActive = false;
        wordStartTime = 0;
        wordEndTime = 0;
        updateStatsDisplay();
        if (coveredTerms.size >= vocabData.length + amalgamateVocab.length) {
          endGame();
          return;
        }
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

    if (!wpmActive && input.length > 0) {
      wpmActive = true;
      wordStartTime = performance.now();
      console.log('WPM calculation started for new word');
    }
  }

  function gameLoop() {
    if (!gameActive) return;

    if (mode === 'game' && performance.now() - sessionStartTime > 30000) {
      endGame();
      return;
    }

    lastFrameTime = updateGame(ctx, words, userInput, gameActive, mode, caseSensitive, getComputedStyle(document.body).getPropertyValue('--canvas-text').trim(), waveSpeeds, wave, score, correctTermsCount, coveredTerms, totalChars, correctChars, missedWords, lastFrameTime, vocabData, amalgamateVocab, promptType, randomizeTerms, usedVocabIndices, usedAmalgamateIndices, vocabIndex, amalgamateIndex, level, lastSpawnedWord);
    updateStatsDisplay();
    requestAnimationFrame(gameLoop);
  }

  userInput.addEventListener('input', handleInput);

  // Virtual keyboard handling
  document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', () => {
      const char = key.textContent;
      console.log('Virtual key pressed:', char);
      userInput.value += char;
      userInput.dispatchEvent(new Event('input'));
      key.classList.add('pressed');
      setTimeout(() => key.classList.remove('pressed'), 100);
    });
  });
});