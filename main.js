import { populateVocabDropdown, loadVocab } from './dataLoader.js';
import { startGame } from './gameLogic.js';
import { generateCertificate } from './certificate-generator.js';
import { updateStatsDisplay } from './uiUtils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const vocabSelect = document.getElementById('vocabSelect');
  const amalgamateSelect = document.getElementById('amalgamateSelect');
  const startButton = document.getElementById('startButton');
  const resetButton = document.getElementById('resetButton');
  const certificateButton = document.getElementById('certificateButton');
  const themeSelect = document.getElementById('themeSelect');
  const userInput = document.getElementById('userInput');

  // Initialize start screen
  document.body.className = `start-screen ${themeSelect.value || 'natural-light'}`;
  document.getElementById('settings').classList.remove('hidden');
  const appTitle = document.querySelector('.app-title');
  if (appTitle) appTitle.classList.remove('hidden');

  // Populate vocab dropdowns
  try {
    await populateVocabDropdown(vocabSelect, amalgamateSelect);
  } catch (error) {
    console.error('Error loading vocab dropdowns:', error);
    alert('Failed to load vocabulary options. Please try again.');
  }

  // Theme switching
  themeSelect.addEventListener('change', () => {
    document.body.className = `${document.body.className.includes('start-screen') ? 'start-screen' : 'game-screen'} ${themeSelect.value}`;
  });

  // Start game
  startButton.addEventListener('click', async () => {
    startButton.disabled = true;
    document.getElementById('loadingIndicator').style.display = 'block';
    const vocabUrl = vocabSelect.value;
    const amalgamateUrl = amalgamateSelect.value;
    const level = document.getElementById('levelSelect')?.value || 1;
    const mode = document.getElementById('modeSelect')?.value || 'game';
    const promptType = document.getElementById('promptType')?.value || 'definition';
    const caseSensitive = document.getElementById('caseSensitivity')?.value === 'sensitive';
    const randomizeTerms = document.getElementById('randomizeTerms')?.checked || true;
    const lives = parseInt(document.getElementById('lives')?.value) || 3;

    try {
      const vocabData = await loadVocab(vocabUrl, amalgamateUrl);
      startGameScreen();
      startGame(vocabData, parseInt(level), mode, promptType, caseSensitive, randomizeTerms, lives);
      userInput.focus();
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to load vocabulary. Please try again.');
    } finally {
      startButton.disabled = false;
      document.getElementById('loadingIndicator').style.display = 'none';
    }
  });

  // Reset game
  resetButton.addEventListener('click', () => {
    resetGame();
    hideGameScreen();
  });

  // Certificate
  certificateButton.addEventListener('click', () => {
    generateCertificate();
  });

  // Virtual keyboard
  createVirtualKeyboard();

  // Touch support for iPad
  userInput.addEventListener('touchstart', () => userInput.focus());
});

function startGameScreen() {
  document.body.className = `game-screen ${document.getElementById('themeSelect').value || 'natural-light'}`;
  document.getElementById('settings').classList.add('hidden');
  const appTitle = document.querySelector('.app-title');
  if (appTitle) appTitle.classList.add('hidden');
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
  document.body.className = `start-screen ${document.getElementById('themeSelect').value || 'natural-light'}`;
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
    const appTitle = document.querySelector('.app-title');
    if (appTitle) appTitle.classList.remove('hidden');
  }, 300);
}

function resetGame() {
  const userInput = document.getElementById('userInput');
  if (userInput) userInput.value = '';
  const stats = document.getElementById('stats');
  if (stats) stats.innerHTML = '';
  // Reset any game state (e.g., score, lives) if stored globally
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
      const input = document.getElementById('userInput');
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
