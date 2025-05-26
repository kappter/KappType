// main.js
import { getWordSpeed, spawnWord, updateGame, calculateCorrectChars, calculateWPM, calculateAccuracy, calculateTermAccuracy, getUnderscoreText } from './gameLogic.js';
import { updateTimer, updateWPMDisplay, updateStatsDisplay, highlightKeys, keyUpHandler, updateTimeIndicator } from './uiUtils.js';
import { populateVocabDropdown, validateCsvUrl, loadVocab, loadCustomVocab } from './dataLoader.js';
import { generateCertificate, escapeHtml } from './certificate.js';

const defaultVocabData = [
  { Term: "Algorithm", Definition: "A set of steps to solve a problem" },
  { Term: "Variable", Definition: "A storage location with a symbolic name" },
  { Term: "Loop", Definition: "A control structure that repeats code" },
  { Term: "Function", Definition: "A block of reusable code" },
  // ... (add the full 53 terms here)
];

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const userInput = document.getElementById('userInput');
  const scoreDisplay = document.getElementById('score');
  const waveDisplay = document.getElementById('wave');
  const timerDisplay = document.getElementById('timer');
  const wpmDisplay = document.getElementById('wpm');
  const termsToWaveDisplay = document.getElementById('termsToWave');
  const termsCoveredDisplay = document.getElementById('termsCovered');
  const startScreen = document.getElementById('startScreen');
  const gameContainer = document.getElementById('gameContainer');
  const startButton = document.getElementById('startButton');
  const levelInput = document.getElementById('levelInput');
  const modeSelect = document.getElementById('modeSelect');
  const promptSelect = document.getElementById('promptSelect');
  const caseSelect = document.getElementById('caseSelect');
  const vocabSelect = document.getElementById('vocabSelect');
  const amalgamateSelect = document.getElementById('amalgamateSelect');
  const customVocabInput = document.getElementById('customVocabInput');
  const customVocabInput2 = document.getElementById('customVocabInput2');
  const randomizeTermsCheckbox = document.getElementById('randomizeTerms');
  const vocabSetTitle = document.getElementById('vocabSetTitle');
  const certificateButton = document.getElementById('certificateButton');
  const resetButton = document.getElementById('resetButton');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const timeIndicator = document.getElementById('timeIndicator');
  const themeSelect = document.getElementById('themeSelect');

  const requiredElements = { canvas, ctx, userInput, timeIndicator, startButton, resetButton, randomizeTermsCheckbox, themeSelect, termsToWaveDisplay, termsCoveredDisplay };
  const missingElements = Object.entries(requiredElements).filter(([key, value]) => !value);
  if (missingElements.length > 0) {
    console.error('Required elements not found:', missingElements);
    alert(`Critical elements are missing: ${missingElements.map(([key]) => key).join(', ')}. Please check the HTML structure and try again.`);
    return;
  }

  if (!customVocabInput) console.warn('customVocabInput element not found. Custom vocabulary upload will be disabled.');
  if (!customVocabInput2) console.warn('customVocabInput2 element not found. Amalgamation vocabulary upload will be disabled.');

  canvas.width = 900;
  canvas.height = 300;

  const pageLoadTime = performance.now();
  let words = [];
  let vocabData = [];
  let amalgamateVocab = [];
  let vocabSetName = '';
  let amalgamateSetName = '';
  let score = 0;
  let wave = 0;
  let timeLeft = 30;
  let gameActive = false;
  let mode = 'game';
  let promptType = 'definition';
  let caseSensitive = false;
  let randomizeTerms = true;
  let level = 1;
  let totalTime = 0;
  let sessionStartTime = null;
  let sessionEndTime = null;
  let missedWords = [];
  let totalChars = 0;
  let correctChars = 0;
  let correctTermsCount = 0;
  let lastFrameTime = performance.now();
  let vocabIndex = 0;
  let amalgamateIndex = 0;
  let currentWPM = 0;
  let usedVocabIndices = [];
  let usedAmalgamateIndices = [];
  let coveredTerms = new Map();
  let currentTermStartTime = null;
  let elapsedTime = 0;
  let wpmActive = false;

  const waveSpeeds = [0.15, 0.435, 0.87, 1.0875, 1.3594, 1.6992, 2.1240, 2.6550, 3.3188, 4.1485, 5.1856];
  const savedTheme = localStorage.getItem('theme') || 'natural-light';
  document.body.className = savedTheme;
  themeSelect.value = savedTheme;

  themeSelect.addEventListener('change', () => {
    const selectedTheme = themeSelect.value;
    document.body.className = selectedTheme;
    localStorage.setItem('theme', selectedTheme);
  });

  populateVocabDropdown(vocabSelect, amalgamateSelect);

  startButton.addEventListener('click', async () => {
    console.log('Start button clicked');
    level = Math.max(0, Math.min(10, parseInt(levelInput.value) || 0));
    mode = modeSelect.value;
    promptType = promptSelect.value;
    caseSensitive = caseSelect.value === 'sensitive';
    randomizeTerms = randomizeTermsCheckbox.checked;
    const csvUrl = vocabSelect.value || '';
    const amalgamateUrl = amalgamateSelect.value || '';

    if (customVocabInput && customVocabInput.files && customVocabInput.files.length > 0) {
      console.log('Loading custom vocab');
      const result = await loadCustomVocab(customVocabInput.files[0], false, vocabData, amalgamateVocab, loadingIndicator, startButton, defaultVocabData);
      if (result.vocabSetName) vocabSetName = result.vocabSetName;
      if (result.amalgamateSetName) amalgamateSetName = result.amalgamateSetName;
    }
    if (customVocabInput2 && customVocabInput2.files && customVocabInput2.files.length > 0) {
      console.log('Loading custom amalgamate vocab');
      const result = await loadCustomVocab(customVocabInput2.files[0], true, vocabData, amalgamateVocab, loadingIndicator, startButton, defaultVocabData);
      if (result.vocabSetName) vocabSetName = result.vocabSetName;
      if (result.amalgamateSetName) amalgamateSetName = result.amalgamateSetName;
    }

    if (csvUrl && (!customVocabInput || !customVocabInput.files || customVocabInput.files.length === 0)) {
      console.log('Loading vocab from URL:', csvUrl);
      const result = await loadVocab(csvUrl, false, vocabData, amalgamateVocab, vocabSelect, amalgamateSelect, loadingIndicator, startButton, defaultVocabData);
      if (result.vocabSetName) vocabSetName = result.vocabSetName;
      if (result.amalgamateSetName) amalgamateSetName = result.amalgamateSetName;
    } else if (!customVocabInput || !customVocabInput.files || customVocabInput.files.length === 0) {
      console.log('Using default vocab:', defaultVocabData.length, 'terms');
      vocabData.length = 0;
      vocabData.push(...defaultVocabData);
      vocabSetName = 'Embedded Vocabulary - 53 Computer Science Terms';
    }

    if (amalgamateUrl && (!customVocabInput2 || !customVocabInput2.files || customVocabInput2.files.length === 0)) {
      console.log('Loading amalgamate vocab from URL:', amalgamateUrl);
      const result = await loadVocab(amalgamateUrl, true, vocabData, amalgamateVocab, vocabSelect, amalgamateSelect, loadingIndicator, startButton, defaultVocabData);
      if (result.vocabSetName) vocabSetName = result.vocabSetName;
      if (result.amalgamateSetName) amalgamateSetName = result.amalgamateSetName;
    }

    console.log('Vocab data length:', vocabData.length, 'Amalgamate length:', amalgamateVocab.length);
    startScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    startGame();
  });

  function startGame() {
    console.log('Starting game with level:', level, 'mode:', mode);
    if (vocabData.length === 0) {
      vocabData.length = 0;
      vocabData.push(...defaultVocabData);
      vocabSetName = 'Embedded Vocabulary - 53 Computer Science Terms';
    }
    vocabSetTitle.textContent = vocabSetName + (amalgamateSetName ? ' + ' + amalgamateSetName : '');
    
    usedVocabIndices = [];
    usedAmalgamateIndices = [];
    sessionStartTime = null;
    sessionEndTime = null;
    timeLeft = 30;
    totalTime = 0;
    score = 0;
    wave = 0;
    missedWords = [];
    totalChars = 0;
    correctChars = 0;
    correctTermsCount = 0;
    coveredTerms.clear();
    elapsedTime = 0;
    wpmActive = false;
    
    gameActive = true;
    userInput.focus();

    const initialSpeed = getWordSpeed(level, mode, wave, waveSpeeds);
    console.log(`Starting ${mode} mode at Level ${level} with speed: ${initialSpeed}`);

    userInput.addEventListener('input', handleInput);
    document.addEventListener('keydown', (e) => highlightKeys(e, document.querySelectorAll('.key')));
    document.addEventListener('keyup', (e) => keyUpHandler(e, document.querySelectorAll('.key')));
    certificateButton.addEventListener('click', () => generateCertificate(pageLoadTime, sessionStartTime, sessionEndTime, score, wave, promptSelect, vocabData, amalgamateVocab, coveredTerms, calculateWPM, calculateAccuracy, calculateTermAccuracy));
    const newWord = spawnWord(ctx, vocabData, amalgamateVocab, promptType, caseSensitive, randomizeTerms, usedVocabIndices, usedAmalgamateIndices, vocabIndex, amalgamateIndex, wave);
    if (newWord) words.push(newWord);
    updateGame(ctx, words, userInput, gameActive, mode, caseSensitive, '#ffffff', waveSpeeds, wave, score, correctTermsCount, coveredTerms, totalChars, correctChars, missedWords);
    updateTimer(timerDisplay, timeLeft, totalTime, mode, sessionStartTime, elapsedTime, gameActive, wpmDisplay, sessionEndTime, score, correctTermsCount, calculateWPM);
  }

  function handleInput(e) {
    const typed = e.target.value;
    if (sessionStartTime === null && typed.length > 0) {
      sessionStartTime = performance.now();
      currentTermStartTime = sessionStartTime;
      wpmActive = true;
      console.log('WPM calculation activated - First keypress detected');
    }

    words = words.filter(word => {
      const target = caseSensitive ? word.typedInput : word.typedInput.toLowerCase();
      const input = caseSensitive ? typed : typed.toLowerCase();
      totalChars += typed.length;
      correctChars += calculateCorrectChars(target, input);

      if (target === input) {
        const completionTime = performance.now();
        word.completionTime = completionTime - currentTermStartTime;
        totalChars += word.typedInput.length;
        correctChars += word.typedInput.length;
        score += word.typedInput.length;
        correctTermsCount++;
        coveredTerms.set(word.typedInput, 'Correct');
        console.log(`Term completed. CorrectTermsCount: ${correctTermsCount}, Wave: ${wave}, Time Taken: ${word.completionTime / 1000}s, Score Increment: ${word.typedInput.length}`);
        scoreDisplay.textContent = `Score: ${score}`;
        e.target.value = '';
        e.target.placeholder = 'Prompt will appear here...';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        word.isExiting = true;
        word.fadeState = 'out';
        currentTermStartTime = performance.now();
        wpmActive = false;
        console.log('WPM calculation deactivated - Term completed');

        if (mode === 'game' && correctTermsCount >= 10) {
          console.log(`Advancing to Wave ${wave + 1}`);
          wave++;
          correctTermsCount = 0;
          waveDisplay.textContent = `Wave: ${wave}`;
          words.forEach(word => word.speed = waveSpeeds[word.spawnWave] || waveSpeeds[waveSpeeds.length - 1]);
          const lightness = 50 + (wave - 1) * 3;
          document.documentElement.style.setProperty('--bg-lightness', `${Math.min(lightness, 77)}%`);
          userInput.classList.add('pulse');
          setTimeout(() => userInput.classList.remove('pulse'), 1000);
        }

        updateStatsDisplay(scoreDisplay, waveDisplay, timerDisplay, wpmDisplay, termsToWaveDisplay, termsCoveredDisplay, score, wave, timeLeft, currentWPM, correctTermsCount, vocabData, amalgamateVocab, coveredTerms);
        return false;
      }
      if (target.startsWith(input)) word.displayText = getUnderscoreText(word.typedInput, input.length > 0 ? 1 : 0);
      else word.displayText = getUnderscoreText(word.typedInput, 0);
      return true;
    });

    if (typed === '' && words.length === 0) {
      const newWord = spawnWord(ctx, vocabData, amalgamateVocab, promptType, caseSensitive, randomizeTerms, usedVocabIndices, usedAmalgamateIndices, vocabIndex, amalgamateIndex, wave);
      if (newWord) words.push(newWord);
      currentTermStartTime = performance.now();
      wpmActive = true;
      console.log('WPM calculation reactivated - New term started');
    }
    updateTimeIndicator(timeIndicator, sessionStartTime);
    updateStatsDisplay(scoreDisplay, waveDisplay, timerDisplay, wpmDisplay, termsToWaveDisplay, termsCoveredDisplay, score, wave, timeLeft, currentWPM, correctTermsCount, vocabData, amalgamateVocab, coveredTerms);
  }

  resetButton.addEventListener('click', () => {
    console.log('Reset button clicked');
    if (!gameActive) return;
    gameActive = false;
    score = 0;
    wave = 0;
    timeLeft = 30;
    totalTime = 0;
    correctTermsCount = 0;
    totalChars = 0;
    correctChars = 0;
    missedWords = [];
    coveredTerms.clear();
    words = [];
    sessionStartTime = null;
    sessionEndTime = null;
    vocabIndex = 0;
    amalgamateIndex = 0;
    currentWPM = 0;
    usedVocabIndices = [];
    usedAmalgamateIndices = [];
    currentTermStartTime = null;
    elapsedTime = 0;
    wpmActive = false;

    userInput.removeEventListener('input', handleInput);
    document.removeEventListener('keydown', (e) => highlightKeys(e, document.querySelectorAll('.key')));
    document.removeEventListener('keyup', (e) => keyUpHandler(e, document.querySelectorAll('.key')));
    certificateButton.removeEventListener('click', () => generateCertificate(pageLoadTime, sessionStartTime, sessionEndTime, score, wave, promptSelect, vocabData, amalgamateVocab, coveredTerms, calculateWPM, calculateAccuracy, calculateTermAccuracy));

    startScreen.classList.remove('hidden');
    gameContainer.classList.add('hidden');

    updateStatsDisplay(scoreDisplay, waveDisplay, timerDisplay, wpmDisplay, termsToWaveDisplay, termsCoveredDisplay, score, wave, timeLeft, currentWPM, correctTermsCount, vocabData, amalgamateVocab, coveredTerms);
    console.log('Game reset. Returned to start screen.');
  });

  updateStatsDisplay(scoreDisplay, waveDisplay, timerDisplay, wpmDisplay, termsToWaveDisplay, termsCoveredDisplay, score, wave, timeLeft, currentWPM, correctTermsCount, vocabData, amalgamateVocab, coveredTerms);
});
