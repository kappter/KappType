import { updateGame, spawnWord, handleInput } from './gameLogic.js';
import { calculateWPM, calculateAccuracy } from './stats.js';
import { applyTheme, highlightKeys, keyUpHandler } from './theme.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM fully loaded and parsed');

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const userInput = document.getElementById('userInput');
  const scoreDisplay = document.getElementById('score');
  const startButton = document.getElementById('startButton');
  const restartButton = document.getElementById('restartButton');
  const modeSelect = document.getElementById('modeSelect');
  const promptTypeSelect = document.getElementById('promptTypeSelect');
  const levelSelect = document.getElementById('levelSelect');
  const waveSelect = document.getElementById('waveSelect');
  const caseSelect = document.getElementById('caseSelect');
  const themeSelect = document.getElementById('themeSelect');
  const timeIndicator = document.getElementById('timeIndicator');
  const loadingOverlay = document.getElementById('loadingOverlay');

  let vocabData = [];
  let amalgamateVocab = [];

  // Load vocabulary data
  try {
    const response = await fetch('vocab.csv');
    if (!response.ok) throw new Error(`Failed to fetch vocab.csv: ${response.statusText}`);
    const csvText = await response.text();
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    vocabData = parsed.data;
    console.log('vocabData loaded:', vocabData.length, 'terms');
    if (vocabData.length === 0) {
      throw new Error('vocabData is empty after parsing');
    }
  } catch (error) {
    console.error('Error loading vocab.csv:', error);
    alert('Failed to load vocabulary data. Please ensure vocab.csv is available.');
    loadingOverlay.style.display = 'none';
    return;
  }

  // Load amalgamate vocabulary if available
  try {
    const response = await fetch('amalgamateVocab.csv');
    if (response.ok) {
      const csvText = await response.text();
      const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
      amalgamateVocab = parsed.data;
      console.log('amalgamateVocab loaded:', amalgamateVocab.length, 'terms');
    } else {
      console.warn('amalgamateVocab.csv not found, proceeding without it');
    }
  } catch (error) {
    console.warn('Error loading amalgamateVocab.csv:', error);
  }

  loadingOverlay.style.display = 'none';

  canvas.width = 1200;
  canvas.height = 600;

  let gameState = {
    gameActive: false,
    ctx,
    canvas,
    userInput,
    words: [],
    mode: modeSelect.value,
    wave: parseInt(waveSelect.value),
    wpmStartTime: null,
    missedWords: [],
    totalChars: 0,
    scoreDisplay,
    calculateWPM,
    calculateAccuracy,
    restartGame: null,
    vocabData,
    amalgamateVocab,
    promptType: promptTypeSelect.value,
    level: parseInt(levelSelect.value),
    timeLeft: 30,
    caseSensitive: caseSelect.value === 'sensitive',
    score: 0,
    totalTypingTime: 0,
    correctChars: 0,
    usedTerms: [],
    updateTimeIndicator: () => {
      timeIndicator.textContent = `Time: ${gameState.timeLeft}s`;
      if (gameState.wpmStartTime !== null) {
        timeIndicator.classList.add('active');
      } else {
        timeIndicator.classList.remove('active');
      }
    }
  };

  function restartGame() {
    console.log('restartGame called');
    gameState.gameActive = false;
    gameState.words = [];
    gameState.score = 0;
    gameState.totalTypingTime = 0;
    gameState.correctChars = 0;
    gameState.totalChars = 0;
    gameState.wpmStartTime = null;
    gameState.missedWords = [];
    gameState.timeLeft = 30;
    gameState.mode = modeSelect.value;
    gameState.wave = parseInt(waveSelect.value);
    gameState.promptType = promptTypeSelect.value;
    gameState.level = parseInt(levelSelect.value);
    gameState.caseSensitive = caseSelect.value === 'sensitive';
    gameState.usedTerms = [];
    scoreDisplay.textContent = 'Score: 0';
    userInput.value = '';
    userInput.placeholder = 'Type here...';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameState.updateTimeIndicator();
    startGame();
  }

  gameState.restartGame = restartGame;

  function startGame() {
    console.log('startGame called, restartGame defined:', typeof gameState.restartGame);
    if (!vocabData || vocabData.length === 0) {
      console.error('vocabData is not loaded or empty');
      alert('Cannot start game: Vocabulary data is not loaded.');
      return;
    }
    gameState.gameActive = true;
    gameState.mode = modeSelect.value;
    gameState.wave = parseInt(waveSelect.value);
    gameState.promptType = promptTypeSelect.value;
    gameState.level = parseInt(levelSelect.value);
    gameState.caseSensitive = caseSelect.value === 'sensitive';
    gameState.words = [];
    gameState.usedTerms = gameState.usedTerms || [];
    console.log('Starting game with state:', gameState);
    spawnWord(vocabData, amalgamateVocab, gameState.promptType, gameState.mode, gameState.level, gameState.wave, ctx, canvas, userInput, gameState.words, gameState.updateTimeIndicator, gameState.usedTerms);
    updateGame(gameState);
  }

  userInput.addEventListener('input', (e) => {
    if (!gameState.gameActive) return;
    const updatedState = handleInput(
      e,
      gameState.words,
      gameState.caseSensitive,
      gameState.score,
      gameState.correctChars,
      gameState.totalChars,
      gameState.scoreDisplay,
      gameState.userInput,
      gameState.ctx,
      gameState.wpmStartTime,
      gameState.totalTypingTime,
      spawnWord,
      gameState.vocabData,
      gameState.amalgamateVocab,
      gameState.promptType,
      gameState.mode,
      gameState.level,
      gameState.wave,
      gameState.updateTimeIndicator
    );
    gameState.wpmStartTime = updatedState.wpmStartTime;
    gameState.totalTypingTime = updatedState.totalTypingTime;
    gameState.score = updatedState.score;
    gameState.correctChars = updatedState.correctChars;
    gameState.totalChars = updatedState.totalChars;
    gameState.words = updatedState.words;
    gameState.usedTerms = updatedState.usedTerms;
  });

  userInput.addEventListener('keydown', highlightKeys);
  userInput.addEventListener('keyup', keyUpHandler);

  startButton.addEventListener('click', startGame);
  restartButton.addEventListener('click', restartGame);

  modeSelect.addEventListener('change', () => {
    gameState.mode = modeSelect.value;
    restartGame();
  });

  promptTypeSelect.addEventListener('change', () => {
    gameState.promptType = promptTypeSelect.value;
    restartGame();
  });

  levelSelect.addEventListener('change', () => {
    gameState.level = parseInt(levelSelect.value);
    restartGame();
  });

  waveSelect.addEventListener('change', () => {
    gameState.wave = parseInt(waveSelect.value);
    restartGame();
  });

  caseSelect.addEventListener('change', () => {
    gameState.caseSensitive = caseSelect.value === 'sensitive';
    restartGame();
  });

  themeSelect.addEventListener('change', () => {
    try {
      applyTheme(themeSelect.value);
    } catch (error) {
      console.warn('Failed to apply theme:', error);
    }
  });

  try {
    applyTheme(themeSelect.value || localStorage.getItem('theme') || 'light');
  } catch (error) {
    console.warn('Failed to apply initial theme:', error);
  }
});