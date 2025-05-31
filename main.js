import { populateVocabDropdown, loadVocab } from './dataLoader.js';
import { spawnWord, updateGame } from './gameLogic.js';
import { generateCertificate } from './certificate-generator.js';
import { updateStatsDisplay } from './uiUtils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const vocabSet = document.getElementById('vocab-set');
  const amalgamateSet = document.getElementById('amalgamate-set');
  const startButton = document.getElementById('start-button');
  const resetButton = document.getElementById('reset-button');
  const certificateButton = document.getElementById('certificate-button');
  const themeSelect = document.getElementById('theme-select');
  const userInput = document.getElementById('user-input');
  const loadingIndicator = document.getElementById('loading-indicator');

  // Check for missing elements
  if (!vocabSet) console.error('vocab-set element not found');
  if (!amalgamateSet) console.error('amalgamate-set element not found');
  if (!startButton) console.error('start-button element not found');
  if (!resetButton) console.error('reset-button element not found');
  if (!certificateButton) console.error('certificate-button element not found');
  if (!themeSelect) console.error('theme-select element not found');
  if (!userInput) console.error('user-input element not found');
  if (!loadingIndicator) console.error('loading-indicator element not found');

  // Initialize start screen
  document.body.className = `start-screen ${themeSelect?.value || 'natural-light'}`;
  const settings = document.getElementById('settings');
  if (settings) settings.classList.remove('hidden');
  const appTitle = document.querySelector('.app-title');
  if (appTitle) appTitle.classList.remove('hidden');

  // Populate vocab dropdowns
  try {
    await populateVocabDropdown(vocabSet, amalgamateSet);
    console.log('Vocab dropdown options:', Array.from(vocabSet?.options || []).map(opt => opt.value));
    console.log('Amalgamate dropdown options:', Array.from(amalgamateSet?.options || []).map(opt => opt.value));
  } catch (error) {
    console.error('Error loading vocab dropdowns:', error);
    alert('Failed to load vocabulary options. Please try again.');
  }

  // Theme switching
  if (themeSelect) {
    themeSelect.addEventListener('change', () => {
      document.body.className = `${document.body.className.includes('start-screen') ? 'start-screen' : 'game-screen'} ${themeSelect.value}`;
    });
  }

  // Start game
  if (startButton) {
    startButton.addEventListener('click', async () => {
      if (startButton) startButton.disabled = true;
      if (loadingIndicator) loadingIndicator.style.display = 'block';
      const vocabUrl = vocabSet?.value || '';
      const amalgamateUrl = amalgamateSet?.value || '';
      const level = document.getElementById('level-select')?.value || 1;
      const mode = document.getElementById('mode-select')?.value || 'game';
      const promptType = document.getElementById('prompt-type')?.value || 'definition';
      const caseSensitive = document.getElementById('case-sensitivity')?.value === 'sensitive';
      const randomizeTerms = document.getElementById('randomize-terms')?.checked || true;
      const lives = parseInt(document.getElementById('lives-select')?.value) || 3;

      console.log('Starting game with:', { vocabUrl, amalgamateUrl, level, mode, promptType, caseSensitive, randomizeTerms, lives });

      try {
        let vocabData = [];
        if (!vocabUrl) {
          console.warn('No vocab URL selected, using fallback vocabulary');
          vocabData = [
            { Term: 'test', Definition: 'A procedure to assess something' },
            { Term: 'code', Definition: 'Instructions for a computer' }
          ];
        } else {
          vocabData = await loadVocab(vocabUrl, amalgamateUrl);
          if (!Array.isArray(vocabData) || vocabData.length === 0) {
            throw new Error('Invalid or empty vocabulary data');
          }
        }
        startGameScreen();
        startGame(vocabData, parseInt(level), mode, promptType, caseSensitive, randomizeTerms, lives);
        if (userInput) userInput.focus();
      } catch (error) {
        console.error('Error starting game:', error, 'Vocab URL:', vocabUrl, 'Amalgamate URL:', amalgamateUrl);
        alert(`Failed to load vocabulary: ${error.message}. Please try again.`);
      } finally {
        if (startButton) startButton.disabled = false;
        if (loadingIndicator) loadingIndicator.style.display = 'none';
      }
    });
  }

  // Reset game
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      resetGame();
      hideGameScreen();
    });
  }

  // Certificate
  if (certificateButton) {
    certificateButton.addEventListener('click', () => {
      generateCertificate();
    });
  }

  // Virtual keyboard
  createVirtualKeyboard();

  // Touch support for iPad
  if (userInput) {
    userInput.addEventListener('touchstart', () => userInput.focus());
  }
});

function startGameScreen() {
  document.body.className = `game-screen ${document.getElementById('theme-select')?.value || 'natural-light'}`;
  const settings = document.getElementById('settings');
  if (settings) settings.classList.add('hidden');
  const appTitle = document.querySelector('.app-title');
  if (appTitle) appTitle.classList.add('hidden');
  const game = document.getElementById('game');
  const stats = document.getElementById('stats');
  const input = document.getElementById('input');
  const controls = document.getElementById('controls');
  const keyboard = document.getElementById('keyboard');
  if (game) game.classList.remove('hidden');
  if (stats) stats.classList.remove('hidden');
  if (input) input.classList.remove('hidden');
  if (controls) controls.classList.remove('hidden');
  if (keyboard) keyboard.classList.remove('hidden');
  setTimeout(() => {
    if (game) game.classList.add('active');
    if (stats) stats.classList.add('active');
    if (input) input.classList.add('active');
    if (controls) controls.classList.add('active');
    if (keyboard) keyboard.classList.add('active');
  }, 10);
}

function hideGameScreen() {
  document.body.className = `start-screen ${document.getElementById('theme-select')?.value || 'natural-light'}`;
  const game = document.getElementById('game');
  const stats = document.getElementById('stats');
  const input = document.getElementById('input');
  const controls = document.getElementById('controls');
  const keyboard = document.getElementById('keyboard');
  if (game) game.classList.remove('active');
  if (stats) stats.classList.remove('active');
  if (input) input.classList.remove('active');
  if (controls) controls.classList.remove('active');
  if (keyboard) keyboard.classList.remove('active');
  setTimeout(() => {
    if (game) game.classList.add('hidden');
    if (stats) stats.classList.add('hidden');
    if (input) input.classList.add('hidden');
    if (controls) controls.classList.add('hidden');
    if (keyboard) keyboard.classList.add('hidden');
    const settings = document.getElementById('settings');
    if (settings) settings.classList.remove('hidden');
    const appTitle = document.querySelector('.app-title');
    if (appTitle) appTitle.classList.remove('hidden');
  }, 300);
}

function resetGame() {
  const userInput = document.getElementById('user-input');
  if (userInput) userInput.value = '';
  const stats = document.getElementById('stats');
  if (stats) stats.innerHTML = `
    <p><span id="score">Score: 0</span></p>
    <p><span id="wave">Wave: 1</span></p>
    <p><span id="termsCovered">Terms: 0/0</span></p>
    <p><span id="wpm">Recent WPM: 0</span></p>
    <p><span id="timer">Time: ∞</span></p>
    <p><span id="lives">Lives: 3</span></p>
    <p><span id="termsToWave">To Next Wave: 10</span></p>
  `;
  console.log('Game reset');
}

function createVirtualKeyboard() {
  const container = document.getElementById('keyboard');
  if (!container) {
    console.warn('Keyboard container not found');
    return;
  }
  container.innerHTML = '';
  const keys = [
    '`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'backspace',
    'tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\',
    'caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', 'enter',
    'shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'shift',
    'ctrl', 'win', 'alt', 'space', 'alt', 'win', 'ctrl'
  ];
  keys.forEach(key => {
    const keyElement = document.createElement('div');
    keyElement.className = `key ${key.toLowerCase()}`;
    keyElement.textContent = key;
    keyElement.setAttribute('data-key', key === 'space' ? ' ' : key);
    keyElement.addEventListener('click', () => {
      const input = document.getElementById('user-input');
      if (!input) return;
      if (key === 'backspace') {
        input.value = input.value.slice(0, -1);
      } else if (key === 'space') {
        input.value += ' ';
      } else if (key === 'enter') {
        input.dispatchEvent(new Event('input'));
      } else if (!['tab', 'caps', 'shift', 'ctrl', 'win', 'alt'].includes(key)) {
        input.value += key;
      }
      input.dispatchEvent(new Event('input'));
      input.focus();
    });
    container.appendChild(keyElement);
  });
}

function startGame(vocabData, level, mode, promptType, caseSensitive, randomizeTerms, lives) {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) {
    console.error('gameCanvas element not found');
    return;
  }
  const ctx = canvas.getContext('2d');
  const userInput = document.getElementById('user-input');
  let words = [];
  let gameActive = true;
  let wave = 1;
  let score = 0;
  let correctTermsCount = 0;
  let coveredTerms = new Set();
  let totalChars = 0;
  let correctChars = 0;
  let missedWords = [];
  let lastFrameTime = performance.now();
  let vocabIndex = 0;
  let amalgamateIndex = 0;
  let usedVocabIndices = [];
  let usedAmalgamateIndices = [];
  let lastSpawnedWord = null;
  const waveSpeeds = [1, 1.2, 1.4, 1.6, 1.8, 2];
  const textColor = getComputedStyle(document.body).getPropertyValue('--canvas-text').trim();
  const amalgamateVocab = []; // Empty unless loaded separately

  function gameLoop() {
    if (!gameActive) return;
    const result = updateGame(
      ctx, words, userInput, gameActive, mode, caseSensitive, textColor, waveSpeeds,
      wave, score, correctTermsCount, coveredTerms, totalChars, correctChars, missedWords,
      lastFrameTime, vocabData, amalgamateVocab, promptType, randomizeTerms,
      usedVocabIndices, usedAmalgamateIndices, vocabIndex, amalgamateIndex, level, lastSpawnedWord
    );
    words = result.words;
    lastFrameTime = result.lastFrameTime;
    if (result.lostLife) {
      lives--;
      if (lives <= 0) {
        gameActive = false;
        alert('Game Over!');
        hideGameScreen();
        return;
      }
    }
    if (Math.random() < 0.02) { // Spawn new word occasionally
      const word = spawnWord(
        ctx, vocabData, amalgamateVocab, promptType, caseSensitive, randomizeTerms,
        usedVocabIndices, usedAmalgamateIndices, vocabIndex, amalgamateIndex, wave, level, mode,
        waveSpeeds, lastSpawnedWord
      );
      if (word) {
        words.push(word);
        lastSpawnedWord = word;
        vocabIndex++;
        amalgamateIndex++;
      }
    }
    updateStatsDisplay(
      document.getElementById('score'), document.getElementById('wave'),
      document.getElementById('timer'), document.getElementById('wpm'),
      document.getElementById('termsToWave'), document.getElementById('termsCovered'),
      score, wave, lives * 30, 0, correctTermsCount, vocabData, amalgamateVocab, coveredTerms
    );
    requestAnimationFrame(gameLoop);
  }

  if (userInput) {
    userInput.addEventListener('input', () => {
      if (!gameActive) return;
      const input = caseSensitive ? userInput.value : userInput.value.toLowerCase();
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const target = caseSensitive ? word.typedInput : word.typedInput.toLowerCase();
        if (input === target) {
          words.splice(i, 1);
          score += 10;
          correctTermsCount++;
          coveredTerms.add(word.typedInput);
          totalChars += target.length;
          correctChars += target.length;
          userInput.value = '';
          if (correctTermsCount >= 10) {
            wave++;
            correctTermsCount = 0;
          }
          break;
        }
      }
    });
  }

  canvas.width = 800;
  canvas.height = 400;
  gameLoop();
}