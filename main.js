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
  const customVocabInput = document.getElementById('customVocab');
  const amalgamateVocabInput = document.getElementById('amalgamateVocab');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const generateCertificateButton = document.getElementById('generateCertificate');
  const promptSelect = document.getElementById('promptType');
  const themeSelect = document.getElementById('themeSelect');
  const livesSelect = document.getElementById('livesSelect');
  const pageLoadTime = performance.now();

  if (!vocabSelect || !amalgamateSelect || !startButton || !resetButton || !userInput || !canvas || !loadingIndicator || !generateCertificateButton || !promptSelect || !themeSelect || !livesSelect || !customVocabInput || !amalgamateVocabInput) {
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
      themeSelect: !!themeSelect,
      livesSelect: !!livesSelect,
      customVocabInput: !!customVocabInput,
      amalgamateVocabInput: !!amalgamateVocabInput
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
  let lives = 3;
  let termsPerWave = 10;

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
    document.getElementById('time').textContent = '∞';
    document.getElementById('lives').textContent = lives;
    document.getElementById('toWave').textContent = Math.max(0, termsPerWave - (coveredTerms.size / Math.max(1, amalgamateVocab.length > 0 ? 2 : 1)));
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

  function checkWaveCompletion() {
    const termsPerSet = amalgamateVocab.length > 0 ? termsPerWave * 2 : termsPerWave;
    if (coveredTerms.size % termsPerSet === 0 && coveredTerms.size > 0) {
      console.log(`Wave ${wave} completed`);
      const waveTerms = Array.from(coveredTerms.entries()).slice(-termsPerSet);
      const allCorrect = waveTerms.every(([_, status]) => status === 'Correct');
      if (allCorrect && lives < 5) {
        lives = Math.min(5, lives + 1);
        console.log('100% correct wave, +1 life');
      }
      wave++;
      updateStatsDisplay();
    }
  }

  async function loadCustomVocab(file) {
    return new Promise((resolve, reject) => {
      if (!file) resolve([]);
      Papa.parse(file, {
        header: true,
        complete: (result) => {
          const data = result.data.filter(row => row.Term && row.Definition);
          console.log(`Loaded ${data.length} terms from custom vocab file`);
          resolve(data);
        },
        error: (error) => {
          console.error('Error parsing custom vocab:', error);
          reject(error);
        }
      });
    });
  }

  startButton.addEventListener('click', () => {
  const settings = {
    vocabUrl: vocabSelect.value,
    amalgamateUrl: amalgamateSelect.value,
    level: document.getElementById('levelSelect')?.value || 1,
    mode: document.getElementById('modeSelect')?.value || 'game',
    promptType: document.getElementById('promptType')?.value || 'definition',
    caseSensitive: document.getElementById('caseSensitivity')?.value === 'sensitive',
    randomizeTerms: document.getElementById('randomizeTerms')?.checked || true,
    lives: parseInt(livesSelect.value) || 3,
    theme: themeSelect.value
  };
  window.location.href = `game.html?settings=${encodeURIComponent(JSON.stringify(settings))}`;
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
    let vocabUrl = vocabSelect.value;
    let amalgamateUrl = amalgamateSelect.value;
    const customVocabFile = customVocabInput.files[0];
    const amalgamateVocabFile = amalgamateVocabInput.files[0];

    lives = Math.max(1, Math.min(5, parseInt(livesSelect.value) || 3));
    console.log(`Starting with ${lives} lives`);

    try {
      if (customVocabFile) {
        vocabData = await loadCustomVocab(customVocabFile);
        vocabUrl = null;
      } else {
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
      }

      if (amalgamateVocabFile) {
        amalgamateVocab = await loadCustomVocab(amalgamateVocabFile);
        amalgamateUrl = null;
      } else if (amalgamateUrl) {
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
      if (promptType === 'random') {
        promptType = Math.random() < 0.5 ? 'definition' : 'term';
      }
      caseSensitive = document.getElementById('caseSensitivity')?.value === 'sensitive';
      randomizeTerms = document.getElementById('randomizeTerms')?.checked || true;
      console.log(`Starting game with level: ${level}, mode: ${mode}, promptType: ${promptType}, caseSensitive: ${caseSensitive}, randomizeTerms: ${randomizeTerms}, lives: ${lives}`);

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

      lives = 3;
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
    lives = Math.max(1, Math.min(5, parseInt(livesSelect.value) || 3));
    userInput.value = '';
    userInput.disabled = true;
    hideGameScreen();
    updateStatsDisplay();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  function handleInput(event) {
    if (!gameActive) return;

    let input = event.target.value;
    // Normalize quotes and apostrophes, preserve single spaces
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
        checkWaveCompletion();
        updateStatsDisplay();
        if (coveredTerms.size >= (vocabData.length + amalgamateVocab.length) * (amalgamateVocab.length > 0 ? 2 : 1)) {
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

  function handleEnterKey(event) {
    if (!gameActive || event.key !== 'Enter') return;

    const word = words[0];
    if (word) {
      console.log(`Enter pressed, marking word incorrect: ${word.typedInput}`);
      coveredTerms.set(word.typedInput, 'Incorrect');
      missedWords.push(word.typedInput);
      totalChars += word.typedInput.length;
      userInput.value = '';
      words.shift();
      checkWaveCompletion();
      updateStatsDisplay();
      if (coveredTerms.size >= (vocabData.length + amalgamateVocab.length) * (amalgamateVocab.length > 0 ? 2 : 1)) {
        endGame();
        return;
      }
      if (words.length === 0) {
        const newWord = spawnWord(ctx, vocabData, amalgamateVocab, promptType, caseSensitive, randomizeTerms, usedVocabIndices, usedAmalgamateIndices, vocabIndex, amalgamateIndex, wave, level, mode, waveSpeeds, lastSpawnedWord);
        if (newWord) {
          words.push(newWord);
          console.log('New word spawned after Enter:', newWord.typedInput);
        }
      }
      wpmActive = false;
      wordStartTime = 0;
      wordEndTime = 0;
    }
  }

  function gameLoop() {
    if (!gameActive) return;

    const updateResult = updateGame(
      ctx, words, userInput, gameActive, mode, caseSensitive,
      getComputedStyle(document.body).getPropertyValue('--canvas-text').trim(),
      waveSpeeds, wave, score, correctTermsCount, coveredTerms,
      totalChars, correctChars, missedWords, lastFrameTime,
      vocabData, amalgamateVocab, promptType, randomizeTerms,
      usedVocabIndices, usedAmalgamateIndices, vocabIndex,
      amalgamateIndex, level, lastSpawnedWord
    );
    lastFrameTime = updateResult.lastFrameTime;
    words = updateResult.words;

    if (updateResult.lostLife) {
      lives--;
      console.log(`Life lost, remaining: ${lives}`);
      coveredTerms.set(updateResult.missedWord, 'Incorrect');
      missedWords.push(updateResult.missedWord);
      totalChars += updateResult.missedWord.length;
      checkWaveCompletion();
      updateStatsDisplay();
      if (lives <= 0) {
        endGame();
        return;
      }
    }

    if (words.length === 0) {
      const newWord = spawnWord(
        ctx, vocabData, amalgamateVocab, promptType, caseSensitive,
        randomizeTerms, usedVocabIndices, usedAmalgamateIndices,
        vocabIndex, amalgamateIndex, wave, level, mode, waveSpeeds,
        lastSpawnedWord
      );
      if (newWord) {
        words.push(newWord);
        console.log('New word spawned in game loop:', newWord.typedInput);
      }
    }

    updateStatsDisplay();
    requestAnimationFrame(gameLoop);
  }

  userInput.addEventListener('input', handleInput);
  userInput.addEventListener('keydown', handleEnterKey);

  // Virtual keyboard handling
  document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', () => {
      const char = key.textContent.toLowerCase();
      console.log('Virtual key pressed:', char);
      if (char === 'space') {
        userInput.value += ' ';
      } else if (char === 'backspace') {
        userInput.value = userInput.value.slice(0, -1);
      } else if (char === 'enter') {
        userInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        return;
      } else if (char.length === 1) {
        userInput.value += char;
      }
      userInput.dispatchEvent(new Event('input'));
      key.classList.add('pressed');
      setTimeout(() => key.classList.remove('pressed'), 100);
    });
  });
});
