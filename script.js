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

  if (!canvas || !ctx || !userInput || !timeIndicator || !startButton || !resetButton || !randomizeTermsCheckbox || !themeSelect || !termsToWaveDisplay || !termsCoveredDisplay) {
    console.error('Required elements not found:', { canvas, ctx, userInput, timeIndicator, startButton, resetButton, randomizeTermsCheckbox, themeSelect, termsToWaveDisplay, termsCoveredDisplay });
    alert('Critical elements are missing from the page. Please check the HTML structure and try again.');
    return;
  }

  if (!customVocabInput) {
    console.warn('customVocabInput element not found. Custom vocabulary upload will be disabled.');
  }
  if (!customVocabInput2) {
    console.warn('customVocabInput2 element not found. Amalgamation vocabulary upload will be disabled.');
  }

  canvas.width = 800;
  canvas.height = 500;

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
  let coveredTerms = new Map(); // Map to track terms and their status (correct or missed)

  const waveSpeeds = [
    0.435, 0.87, 1.0875, 1.3594, 1.6992, 2.1240, 2.6550, 3.3188, 4.1485, 5.1856, 6.4820
  ];

  const savedTheme = localStorage.getItem('theme') || 'natural-light';
  document.body.className = savedTheme;
  themeSelect.value = savedTheme;

  themeSelect.addEventListener('change', () => {
    const selectedTheme = themeSelect.value;
    document.body.className = selectedTheme;
    localStorage.setItem('theme', selectedTheme);
  });

  function populateVocabDropdown() {
    const baseUrl = 'https://raw.githubusercontent.com/kappter/vocab-sets/main/';
    const files = [
      'Exploring_Computer_Science_Vocabulary',
      'Periodic_Table_Elements',
      'Study_Skills_High_School',
      'Financial_Management_Tips',
      'AP_Computer_Science_A_Concepts',
      'AP_Java_Code_Snippets',
      'AP_Astronomy_Concepts',
      'Computer_Usage_Terms',
      'OS_Navigation_Capabilities',
      'Guitar_Techniques',
      'Music_Composition_Techniques',
      'Literary_Techniques',
      'Rogets_Abstract_Relations_Terms',
      'Rogets_Space_Terms',
      'Rogets_Matter_Terms',
      'Rogets_Intellectual_Faculties_Terms',
      'Rogets_Volition_Terms',
      'Rogets_Affections_Terms',
      'Rogets_Consolidated_Terms',
      'ARRL_Ham_Radio_Extra_License_Terms_Definitions',
      'ARRL_Ham_Radio_General_License_Terms_Definitions',
      'ARRL_Ham_Radio_Technician_License_Terms_Definitions',
      'Computer_Programming_2_Terms_Definitions',
      'Digital_Media_2_Terms_and_Definitions',
      'ECS_Hardware_OS_DataStorage_Terms_Definitions',
      'Game_Development_Fundamentals_2_Terms_Definitions',
      'Game_Development_Fundamentals_1_Terms_Definitions',
      'Game_Development_Terms_2020s',
      'Music_Theory_Terms_Definitions',
      'Short_Testing_Sample',
      'Summer_Job_Preparation_Terms_Definitions',
      'Utah_Computer_Programming_1_Terms_Definitions',
      'Web_Development_Terms_Definitions',
      'Yearbook_Design_Terms',
      'advanced_computer_programming_vocab',
      'Photography_Terms',
      'OOP_Programming_Terms',
      'psych_terms_1',
      'psych_terms_2',
      'psych_terms_3',
      'psych_terms_4',
      'utah_video_production_terms_Final',
      'Social_Media_Photography_Terms',
      'idioms',
      'unusual_adjectives',
      'unusual_verbs',
      'Rare_English_Words',
      'common_appetizers_usa',
      'common_us_entrees',
      'common_us_side_dishes'
    ];
    const vocabSelectElement = document.getElementById('vocabSelect');
    const amalgamateSelectElement = document.getElementById('amalgamateSelect');
    vocabSelectElement.innerHTML = '<option value="">[Embedded Vocabulary - 53 Computer Science Terms]</option>';
    amalgamateSelectElement.innerHTML = '<option value="">[None]</option>';
    files.forEach(file => {
      const option1 = document.createElement('option');
      option1.value = baseUrl + file + '.csv';
      option1.textContent = file;
      vocabSelectElement.appendChild(option1);

      const option2 = document.createElement('option');
      option2.value = baseUrl + file + '.csv';
      option2.textContent = file;
      amalgamateSelectElement.appendChild(option2);
    });
  }

  function validateCsvUrl(url) {
    return url.includes('github.com') || url.endsWith('.csv') || url.startsWith('/');
  }

  function loadVocab(csvUrl, isAmalgamate = false) {
    return new Promise((resolve, reject) => {
      const targetArray = isAmalgamate ? amalgamateVocab : vocabData;
      const setName = isAmalgamate ? amalgamateSelect.options[amalgamateSelect.selectedIndex].textContent : vocabSelect.options[vocabSelect.selectedIndex].textContent;

      targetArray.length = 0;

      if (!csvUrl) {
        if (!isAmalgamate) {
          vocabData = [...defaultVocabData];
          vocabSetName = setName || 'Embedded Vocabulary - 53 Computer Science Terms';
        } else {
          amalgamateSetName = '';
        }
        loadingIndicator.classList.add('hidden');
        startButton.disabled = false;
        updateStatsDisplay();
        resolve();
        return;
      }

      if (window.location.protocol === 'file:') {
        alert('Cannot load external CSV files when running via file://. Using embedded vocabulary (53 computer science terms). For external CSVs, run a local server (e.g., python -m http.server) and access http://localhost:8000.');
        if (!isAmalgamate) {
          vocabData = [...defaultVocabData];
          vocabSetName = 'Embedded Vocabulary - 53 Computer Science Terms';
        } else {
          amalgamateSetName = '';
        }
        loadingIndicator.classList.add('hidden');
        startButton.disabled = false;
        updateStatsDisplay();
        resolve();
        return;
      }

      if (!validateCsvUrl(csvUrl)) {
        alert('Invalid CSV URL. Using embedded vocabulary.');
        if (!isAmalgamate) {
          vocabData = [...defaultVocabData];
          vocabSetName = 'Embedded Vocabulary - 53 Computer Science Terms';
        } else {
          amalgamateSetName = '';
        }
        loadingIndicator.classList.add('hidden');
        startButton.disabled = false;
        updateStatsDisplay();
        resolve();
        return;
      }

      if (typeof Papa === 'undefined') {
        alert('Papa Parse library not loaded. Using embedded vocabulary. Ensure papaparse.min.js is in the repository root.');
        if (!isAmalgamate) {
          vocabData = [...defaultVocabData];
          vocabSetName = 'Embedded Vocabulary - 53 Computer Science Terms';
        } else {
          amalgamateSetName = '';
        }
        loadingIndicator.classList.add('hidden');
        startButton.disabled = false;
        updateStatsDisplay();
        resolve();
        return;
      }

      loadingIndicator.classList.remove('hidden');
      startButton.disabled = true;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      fetch(csvUrl, { signal: controller.signal })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} (${response.statusText})`);
          }
          return response.text();
        })
        .then(data => {
          Papa.parse(data, {
            header: true,
            complete: function(results) {
              clearTimeout(timeoutId);
              targetArray.length = 0;
              const filteredData = results.data.filter(row => row.Term && row.Definition);
              if (filteredData.length === 0) {
                alert(`No valid terms found in the CSV at ${csvUrl}. Ensure it has "Term" and "Definition" columns. Using embedded vocabulary for ${isAmalgamate ? 'amalgamate' : 'primary'}.`);
                if (!isAmalgamate) {
                  vocabData = [...defaultVocabData];
                  vocabSetName = 'Embedded Vocabulary - 53 Computer Science Terms';
                } else {
                  amalgamateSetName = '';
                }
              } else {
                targetArray.push(...filteredData);
                if (isAmalgamate) {
                  amalgamateSetName = setName;
                } else {
                  vocabSetName = setName;
                }
              }
              loadingIndicator.classList.add('hidden');
              startButton.disabled = false;
              updateStatsDisplay();
              resolve();
            },
            error: function(error) {
              clearTimeout(timeoutId);
              console.error(`Papa Parse error for ${csvUrl}:`, error);
              alert(`Failed to parse CSV at ${csvUrl}. Error: ${error.message || 'Unknown error'}. Using embedded vocabulary for ${isAmalgamate ? 'amalgamate' : 'primary'}.`);
              if (!isAmalgamate) {
                vocabData = [...defaultVocabData];
                vocabSetName = 'Embedded Vocabulary - 53 Computer Science Terms';
              } else {
                amalgamateSetName = '';
              }
              loadingIndicator.classList.add('hidden');
              startButton.disabled = false;
              updateStatsDisplay();
              resolve();
            }
          });
        })
        .catch(error => {
          clearTimeout(timeoutId);
          console.error(`Fetch error for ${csvUrl}:`, error);
          alert(`Failed to load CSV at ${csvUrl}. Error: ${error.message || 'Unknown error'}. Using embedded vocabulary for ${isAmalgamate ? 'amalgamate' : 'primary'}.`);
          if (!isAmalgamate) {
            vocabData = [...defaultVocabData];
            vocabSetName = 'Embedded Vocabulary - 53 Computer Science Terms';
          } else {
            amalgamateSetName = '';
          }
          loadingIndicator.classList.add('hidden');
          startButton.disabled = false;
          updateStatsDisplay();
          resolve();
        });
    });
  }

  function loadCustomVocab(file, isAmalgamate = false) {
    return new Promise((resolve, reject) => {
      const targetArray = isAmalgamate ? amalgamateVocab : vocabData;
      const setName = file.name.replace(/\.csv$/, '');

      targetArray.length = 0;

      if (typeof Papa === 'undefined') {
        alert('Papa Parse library not loaded. Using embedded vocabulary. Ensure papaparse.min.js is in the repository root.');
        if (!isAmalgamate) {
          vocabData = [...defaultVocabData];
          vocabSetName = 'Embedded Vocabulary - 53 Computer Science Terms';
        } else {
          amalgamateSetName = '';
        }
        loadingIndicator.classList.add('hidden');
        startButton.disabled = false;
        updateStatsDisplay();
        resolve();
        return;
      }

      loadingIndicator.classList.remove('hidden');
      startButton.disabled = true;

      Papa.parse(file, {
        header: true,
        complete: function(results) {
          targetArray.length = 0;
          const filteredData = results.data.filter(row => row.Term && row.Definition);
          if (filteredData.length === 0) {
            alert(`No valid terms found in the uploaded CSV. Ensure it has "Term" and "Definition" columns. Using embedded vocabulary for ${isAmalgamate ? 'amalgamate' : 'primary'}.`);
            if (!isAmalgamate) {
              vocabData = [...defaultVocabData];
              vocabSetName = 'Embedded Vocabulary - 53 Computer Science Terms';
            } else {
              amalgamateSetName = '';
            }
          } else {
            targetArray.push(...filteredData);
            if (isAmalgamate) {
              amalgamateSetName = setName;
            } else {
              vocabSetName = setName;
            }
          }
          loadingIndicator.classList.add('hidden');
          startButton.disabled = false;
          updateStatsDisplay();
          resolve();
        },
        error: function(error) {
          console.error('Papa Parse error for uploaded file:', error);
          alert(`Failed to parse the uploaded CSV. Error: ${error.message || 'Unknown error'}. Using embedded vocabulary for ${isAmalgamate ? 'amalgamate' : 'primary'}.`);
          if (!isAmalgamate) {
            vocabData = [...defaultVocabData];
            vocabSetName = 'Embedded Vocabulary - 53 Computer Science Terms';
          } else {
            amalgamateSetName = '';
          }
          loadingIndicator.classList.add('hidden');
          startButton.disabled = false;
          updateStatsDisplay();
          resolve();
        }
      });
    });
  }

  function getRandomVocab(sourceArray, isAmalgamate = false) {
    if (sourceArray.length === 0) return null;
    let index;
    if (randomizeTerms) {
      const availableIndices = isAmalgamate ? usedAmalgamateIndices : usedVocabIndices;
      const pool = Array.from({ length: sourceArray.length }, (_, i) => i).filter(i => !availableIndices.includes(i));
      if (pool.length === 0) {
        if (isAmalgamate) {
          usedAmalgamateIndices = [];
        } else {
          usedVocabIndices = [];
        }
        index = Math.floor(Math.random() * sourceArray.length);
      } else {
        index = pool[Math.floor(Math.random() * pool.length)];
      }
      if (isAmalgamate) {
        usedAmalgamateIndices.push(index);
      } else {
        usedVocabIndices.push(index);
      }
    } else {
      if (isAmalgamate) {
        index = amalgamateIndex;
        amalgamateIndex = (amalgamateIndex + 1) % sourceArray.length;
      } else {
        index = vocabIndex;
        vocabIndex = (vocabIndex + 1) % sourceArray.length;
      }
    }
    return sourceArray[index];
  }

  function getUnderscoreText(text, typedLength = 0) {
    const maxLength = 50;
    let displayText;
    if (typedLength === 0) {
      const underscoreCount = Math.min(text.length - 1, maxLength - 1);
      displayText = text.slice(0, 1) + '_'.repeat(underscoreCount);
    } else {
      displayText = text;
    }
    if (text.length > maxLength) {
      displayText = displayText.slice(0, 47) + '...';
    }
    return displayText;
  }

function spawnWord() {
  if (vocabData.length === 0) {
    vocabData = [...defaultVocabData];
    vocabSetName = 'Embedded Vocabulary - 53 Computer Science Terms';
  }

  const allVocab = [...vocabData, ...amalgamateVocab].filter(v => v && v.Term && v.Definition);
  if (allVocab.length === 0) return;

  let index;
  const usedIndices = [...usedVocabIndices, ...usedAmalgamateIndices];
  const availableIndices = Array.from({ length: allVocab.length }, (_, i) => i).filter(i => !usedIndices.includes(i));

  if (availableIndices.length > 0) {
    index = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  } else {
    // All terms used, reset indices
    usedVocabIndices = [];
    usedAmalgamateIndices = [];
    index = Math.floor(Math.random() * allVocab.length);
  }

  const vocab = allVocab[index];
  let prompt, typedInput;
  if (promptType === 'definition') {
    prompt = vocab.Definition;
    typedInput = vocab.Term;
  } else if (promptType === 'term') {
    prompt = vocab.Term;
    typedInput = vocab.Definition;
  } else {
    const randomType = Math.random() < 0.5 ? 'definition' : 'term';
    prompt = randomType === 'definition' ? vocab.Definition : vocab.Term;
    typedInput = randomType === 'definition' ? vocab.Term : vocab.Definition;
  }

  const displayText = getUnderscoreText(typedInput, 0);
  ctx.font = '18px Arial';
  const textWidth = ctx.measureText(displayText).width;

  const padding = 20;
  const maxX = canvas.width - textWidth - padding;
  const minX = padding;
  const x = mode === 'game' ? (minX + Math.random() * (maxX - minX)) : minX;

  const y = 0;
  const speed = mode === 'game' ? (waveSpeeds[wave] || waveSpeeds[waveSpeeds.length - 1]) : 0.5 + level * 0.1;
  const word = { 
    prompt: prompt, 
    typedInput: typedInput, 
    displayText: displayText, 
    x: x, 
    y: y, 
    speed: speed, 
    matched: '', 
    definition: vocab.Definition, 
    isExiting: false, 
    opacity: 0, 
    fadeState: 'in',
    spawnWave: wave
  };

  if (index < vocabData.length) {
    usedVocabIndices.push(index);
  } else {
    usedAmalgamateIndices.push(index - vocabData.length);
  }

  words.push(word);
  userInput.placeholder = prompt;
  updateWPMDisplay();
  updateTimeIndicator();
}

function updateGame() {
  if (!gameActive) return;

  const now = performance.now();
  const deltaTime = (now - lastFrameTime) / 1000;
  lastFrameTime = now;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Define textColor at the start of the function
  const computedStyle = window.getComputedStyle(document.body);
  const textColor = computedStyle.getPropertyValue('--canvas-text')?.trim() || '#ffffff';
  console.log('textColor initialized:', textColor); // Debug log

  // Robust hexToRgb function
  function hexToRgb(hex) {
    if (!hex || typeof hex !== 'string') return '255, 255, 255'; // Fallback to white
    hex = hex.replace(/^#/, ''); // Remove # if present
    if (hex.length === 3) hex = hex.split('').map(h => h + h).join(''); // Expand shorthand (e.g., #fff to #ffffff)
    if (hex.length !== 6) return '255, 255, 255'; // Invalid hex, fallback
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }

  if (words.length > 0) {
    const word = words[0];
    const definition = word.definition;

    const fadeDuration = 4;
    const fadeSpeed = 0.3 / fadeDuration;
    if (word.fadeState === 'in') {
      word.opacity = Math.min(word.opacity + fadeSpeed * deltaTime, 0.3);
    } else if (word.fadeState === 'out') {
      word.opacity = Math.max(word.opacity - fadeSpeed * deltaTime, 0);
    }

    const maxWidth = canvas.width - 40;
    const wordsArray = definition.split(' ');
    let lines = [];
    let line = '';

    ctx.font = '32px Arial';
    for (let w of wordsArray) {
      const testLine = line + w + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line !== '') {
        lines.push(line.trim());
        line = w + ' ';
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line.trim());

    if (lines.length > 4) {
      lines = lines.slice(0, 3);
      const lastLine = lines[2];
      let truncated = lastLine;
      while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
        truncated = truncated.slice(0, -1);
      }
      lines[2] = truncated + '...';
    }

    const lineHeight = 40;
    const totalHeight = lines.length * lineHeight;
    const startY = (canvas.height - totalHeight) / 2 - 20;
    ctx.textAlign = 'center';

    for (let i = 0; i < lines.length; i++) {
      ctx.font = '32px Arial';
      ctx.fillStyle = `rgba(${hexToRgb(textColor)}, ${word.opacity})`;
      ctx.fillText(lines[i], canvas.width / 2, startY + i * lineHeight);
    }
  }

  const rectHeight = 20;
  const rectY = canvas.height - rectHeight;
  ctx.beginPath();
  ctx.roundRect(0, rectY, canvas.width, rectHeight, 8);
  ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
  ctx.fill();
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = '18px Arial';
  ctx.textAlign = 'left';

  words = words.filter(word => {
    word.y += word.speed;
    const typed = userInput.value;
    const target = caseSensitive ? word.typedInput : word.typedInput.toLowerCase();
    const input = caseSensitive ? typed : typed.toLowerCase();
    word.matched = target.startsWith(input) ? typed : '';

    ctx.clearRect(word.x - 5, word.y - 20, ctx.measureText(word.displayText).width + 10, 25);

    if (word.matched) {
      ctx.fillStyle = 'red';
      ctx.fillText(word.matched, word.x, word.y);
    }
    const remainingText = word.displayText.slice(word.matched.length);
    if (remainingText) {
      ctx.fillStyle = textColor; // Use textColor directly for remaining text
      ctx.fillText(remainingText, word.x + ctx.measureText(word.matched).width, word.y);
    }

    if (word.y >= canvas.height) {
      console.log(`Word missed: ${word.typedInput}, Time Left: ${timeLeft}s`);
      missedWords.push(word.typedInput);
      coveredTerms.set(word.typedInput, 'Missed');
      totalChars += word.typedInput.length;
      word.isExiting = true;
      word.fadeState = 'out';
      if (words.length === 1 && mode === 'game') {
        gameActive = false;
        console.log(`Game Over due to missed word. Score: ${score}, WPM: ${calculateWPM()}, Accuracy: ${calculateAccuracy()}%`);
        alert(`Game Over! Score: ${score}, WPM: ${calculateWPM()}, Accuracy: ${calculateAccuracy()}%`);
        return false;
      }
    }
    return !word.isExiting;
  });

  if (words.length > 0 && words[0].isExiting && words[0].opacity <= 0) {
    words = [];
    if (mode !== 'game') {
      spawnWord();
    }
  } else if (words.length === 0) {
    spawnWord();
  }

  requestAnimationFrame(updateGame);
}

  function calculateWPM() {
    if (sessionStartTime === null || correctChars === 0) return 0;
    const elapsedTime = Math.max(0, (performance.now() - sessionStartTime) / 1000 / 60);
    if (elapsedTime <= 0) return 0;
    const wpm = Math.round((correctChars / 5) / elapsedTime);
    return Math.min(wpm, 200);
  }

  function updateWPMDisplay() {
    currentWPM = calculateWPM();
    wpmDisplay.textContent = `WPM: ${currentWPM}`;
  }

  function calculateAccuracy() {
    return totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
  }

  function calculateTermAccuracy() {
    const totalAttempts = correctTermsCount + missedWords.length;
    return totalAttempts > 0 ? Math.round((correctTermsCount / totalAttempts) * 100) : 100;
  }

function updateTimer() {
  if (!gameActive) return;
  timeLeft = Math.max(0, timeLeft - 1);
  totalTime++;
  timerDisplay.textContent = `Time: ${timeLeft}s`;
  updateWPMDisplay();
  if (timeLeft > 0) {
    setTimeout(updateTimer, 1000);
  } else if (mode === 'game') {
    gameActive = false;
    console.log(`Game Over due to timer. Score: ${score}, WPM: ${calculateWPM()}, Accuracy: ${calculateAccuracy()}%`);
    alert(`Game Over! Score: ${score}, WPM: ${calculateWPM()}, Accuracy: ${calculateAccuracy()}%`);
  }
}

  function updateStatsDisplay() {
    const termsCovered = correctTermsCount + missedWords.length;
    const totalTerms = vocabData.length + (amalgamateVocab.length > 0 ? amalgamateVocab.length : 0);
    const termsToWave = 10 - correctTermsCount;
    scoreDisplay.textContent = `Score: ${score}`;
    waveDisplay.textContent = `Wave: ${wave}`;
    timerDisplay.textContent = `Time: ${timeLeft >= 0 ? timeLeft : 0}s`;
    wpmDisplay.textContent = `WPM: ${currentWPM}`;
    termsToWaveDisplay.textContent = `To Wave: ${termsToWave}`;
    termsCoveredDisplay.textContent = `Terms: ${termsCovered}/${totalTerms}`;
  }

  function handleInput(e) {
    const typed = e.target.value;
    if (sessionStartTime === null && typed.length > 0) {
      sessionStartTime = performance.now();
      correctChars = 0;
    }

    words = words.filter(word => {
      const target = caseSensitive ? word.typedInput : word.typedInput.toLowerCase();
      const input = caseSensitive ? typed : typed.toLowerCase();
      if (target === input) {
        correctChars += word.typedInput.length;
        totalChars += word.typedInput.length;
        score += word.typedInput.length;
        correctTermsCount++;
        coveredTerms.set(word.typedInput, 'Correct');
        console.log(`Term completed. CorrectTermsCount: ${correctTermsCount}, Wave: ${wave}`);
        scoreDisplay.textContent = `Score: ${score}`;
        e.target.value = '';
        e.target.placeholder = 'Prompt will appear here...';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        word.isExiting = true;
        word.fadeState = 'out';

        if (mode === 'game' && correctTermsCount >= 10) {
          console.log(`Advancing to Wave ${wave + 1}`);
          wave++;
          correctTermsCount = 0;
          waveDisplay.textContent = `Wave: ${wave}`;
          words.forEach(word => {
            word.speed = waveSpeeds[word.spawnWave] || waveSpeeds[waveSpeeds.length - 1];
          });
          const lightness = 50 + (wave - 1) * 3;
          document.documentElement.style.setProperty('--bg-lightness', `${Math.min(lightness, 77)}%`);
          userInput.classList.add('pulse');
          setTimeout(() => userInput.classList.remove('pulse'), 1000);
        }

        updateStatsDisplay();
        return false;
      }
      if (target.startsWith(input)) {
        word.displayText = getUnderscoreText(word.typedInput, input.length > 0 ? 1 : 0);
      } else {
        word.displayText = getUnderscoreText(word.typedInput, 0);
      }
      return true;
    });

    updateTimeIndicator();
    updateStatsDisplay();
  }

  function highlightKeys(e) {
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => key.classList.remove('pressed'));

    const keyValue = e.key === ' ' ? ' ' : e.key;
    const keyElement = Array.from(keys).find(k => k.getAttribute('data-key') === keyValue);

    if (keyElement) {
      keyElement.classList.add('pressed');
    } else if (e.key === 'Shift') {
      document.querySelectorAll('.shift').forEach(shift => shift.classList.add('pressed'));
    } else if (e.key === 'Control') {
      document.querySelectorAll('.ctrl').forEach(ctrl => ctrl.classList.add('pressed'));
    } else if (e.key === 'Alt') {
      document.querySelectorAll('.alt').forEach(alt => alt.classList.add('pressed'));
    } else if (e.key === 'Meta') {
      document.querySelectorAll('.win').forEach(win => win.classList.add('pressed'));
    }
  }

  function keyUpHandler(e) {
    const keys = document.querySelectorAll('.key');
    const keyValue = e.key === ' ' ? ' ' : e.key;
    const keyElement = Array.from(keys).find(k => k.getAttribute('data-key') === keyValue);

    if (keyElement) {
      keyElement.classList.remove('pressed');
    } else if (e.key === 'Shift') {
      document.querySelectorAll('.shift').forEach(shift => shift.classList.remove('pressed'));
    } else if (e.key === 'Control') {
      document.querySelectorAll('.ctrl').forEach(ctrl => ctrl.classList.remove('pressed'));
    } else if (e.key === 'Alt') {
      document.querySelectorAll('.alt').forEach(alt => alt.classList.remove('pressed'));
    } else if (e.key === 'Meta') {
      document.querySelectorAll('.win').forEach(win => win.classList.remove('pressed'));
    }
  }

  function updateTimeIndicator() {
    if (timeIndicator) {
      timeIndicator.classList.remove('active');
      if (sessionStartTime !== null) {
        timeIndicator.classList.add('active');
      }
    }
  }

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }

  function escapeHtml(str) {
    if (!str) return 'None';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function generateCertificate() {
    const name = prompt('Enter your name for the report:');
    if (!name || name.trim() === '') {
      alert('Please enter a valid name to generate the report.');
      return;
    }
    const safeName = escapeHtml(name);
    const wpm = currentWPM || 0;
    const charAccuracy = calculateAccuracy();
    const termAccuracy = calculateTermAccuracy();
    const promptTypeText = escapeHtml(promptSelect.options[promptSelect.selectedIndex]?.text || 'Unknown');
    const totalTerms = vocabData.length + (amalgamateVocab.length > 0 ? amalgamateVocab.length : 0);
    const termsCoveredCount = coveredTerms.size;
    const allTermsCompleted = termsCoveredCount === totalTerms;

    // Build the terms table
    let termsTableRows = '';
    for (const [term, status] of coveredTerms.entries()) {
      termsTableRows += `
        <tr>
          <td>${escapeHtml(term)}</td>
          <td>${status}</td>
        </tr>
      `;
    }
    if (termsTableRows === '') {
      termsTableRows = '<tr><td colspan="2">No terms covered.</td></tr>';
    }

    const certificateContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KappType Performance Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      line-height: 1.6;
      text-align: center;
    }
    h1 {
      color: #333;
    }
    .certificate {
      border: 2px solid #333;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
      background-color: #f9f9f9;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
    }
    .stats {
      margin: 20px 0;
      text-align: left;
      display: inline-block;
    }
    .stats p {
      margin: 5px 0;
    }
    .completion-status {
      font-weight: bold;
      color: ${allTermsCompleted ? 'green' : 'red'};
    }
    @media print {
      body {
        margin: 0;
      }
      .certificate {
        border: none;
        background-color: white;
      }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <h1>KappType Performance Report</h1>
    <h2>Certificate of Achievement</h2>
    <p>This certifies that <strong>${safeName}</strong> has completed a session in KappType with the following results:</p>
    
    <div class="stats">
      <p><strong>Prompt Type:</strong> ${promptTypeText}</p>
      <p><strong>Typing Speed:</strong> ${wpm} WPM</p>
      <p><strong>Character Accuracy:</strong> ${charAccuracy}%</p>
      <p><strong>Term Accuracy:</strong> ${termAccuracy}%</p>
      <p><strong>Wave Reached:</strong> ${wave}</p>
      <p><strong>Total Time:</strong> ${totalTime} seconds</p>
      <p><strong>Score:</strong> ${score}</p>
    </div>

    <h3>Terms Covered</h3>
    <table>
      <thead>
        <tr>
          <th>Term</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${termsTableRows}
      </tbody>
    </table>

    <p><strong>Total Terms Covered:</strong> ${termsCoveredCount} out of ${totalTerms}</p>
    <p class="completion-status">
      ${allTermsCompleted ? 'Congratulations! All terms in the set were covered.' : 'Not all terms were covered in this session.'}
    </p>

    <p>Awarded on ${new Date().toLocaleDateString()}</p>
  </div>
</body>
</html>
    `;

    const blob = new Blob([certificateContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kapp-type-report.html';
    a.click();
    URL.revokeObjectURL(url);

    alert('Performance report downloaded as an HTML file. Open it in a browser to view or print it (use Ctrl+P or Cmd+P to print).');
  }

  function startGame() {
    if (vocabData.length === 0) {
      vocabData = [...defaultVocabData];
      vocabSetName = 'Embedded Vocabulary - 53 Computer Science Terms';
    }
    vocabSetTitle.textContent = vocabSetName + (amalgamateSetName ? ' + ' + amalgamateSetName : '');
    gameActive = true;
    userInput.focus();
    userInput.addEventListener('input', handleInput);
    document.addEventListener('keydown', highlightKeys);
    document.addEventListener('keyup', keyUpHandler);
    certificateButton.addEventListener('click', generateCertificate);
    spawnWord();
    updateGame();
    updateTimer();
  }

  populateVocabDropdown();
  startButton.addEventListener('click', async () => {
    level = Math.max(1, Math.min(10, parseInt(levelInput.value)));
    mode = modeSelect.value;
    promptType = promptSelect.value;
    caseSensitive = caseSelect.value === 'sensitive';
    randomizeTerms = randomizeTermsCheckbox.checked;
    const csvUrl = vocabSelect.value || '';
    const amalgamateUrl = amalgamateSelect.value || '';

    if (customVocabInput && customVocabInput.files && customVocabInput.files.length > 0) {
      await loadCustomVocab(customVocabInput.files[0], false);
    }
    if (customVocabInput2 && customVocabInput2.files && customVocabInput2.files.length > 0) {
      await loadCustomVocab(customVocabInput2.files[0], true);
    }

    if (csvUrl && (!customVocabInput || !customVocabInput.files || customVocabInput.files.length === 0)) {
      await loadVocab(csvUrl, false);
    } else if (!customVocabInput || !customVocabInput.files || customVocabInput.files.length === 0) {
      vocabData = [...defaultVocabData];
      vocabSetName = 'Embedded Vocabulary - 53 Computer Science Terms';
    }

    if (amalgamateUrl && (!customVocabInput2 || !customVocabInput2.files || customVocabInput2.files.length === 0)) {
      await loadVocab(amalgamateUrl, true);
    }

    startScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    startGame();
  });

  resetButton.addEventListener('click', () => {
    location.reload();
  });

  updateStatsDisplay();
});
