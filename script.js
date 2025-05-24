const defaultVocabData = [
  { Term: "Binary", Definition: "A numbering system that uses only 0s and 1s" },
  { Term: "Algorithm", Definition: "A set of rules to be followed in calculations or other problem-solving operations" },
  { Term: "Variable", Definition: "A named storage location in a program that can hold different values" },
  { Term: "Computer Science", Definition: "The study of computers and computational systems including programming and problem-solving" },
  { Term: "Computational Thinking", Definition: "A problem-solving approach using decomposition abstraction algorithms and data" },
  { Term: "Decomposition", Definition: "Breaking a complex problem into smaller manageable parts" },
  { Term: "Abstraction", Definition: "Simplifying a problem by focusing on essential details and ignoring irrelevant ones" },
  { Term: "Career Pathway", Definition: "A sequence of courses and experiences preparing students for computer science careers" },
  { Term: "Computer Scientist", Definition: "A professional who designs and develops computational systems or software" },
  { Term: "Pseudocode", Definition: "A simplified human-readable description of a program’s logic" },
  { Term: "Flowchart", Definition: "A visual diagram representing the steps of an algorithm or process" },
  { Term: "Pattern Recognition", Definition: "Identifying similarities or trends in data to solve problems" },
  { Term: "Iteration", Definition: "Repeating a process or set of instructions to achieve a goal" },
  { Term: "Data", Definition: "Information processed or stored by a computer such as numbers or text" },
  { Term: "Data Analysis", Definition: "The process of examining data to draw conclusions or identify patterns" },
  { Term: "Binary Number", Definition: "A number system using only 0s and 1s used by computers" },
  { Term: "Bit", Definition: "A single binary digit either 0 or 1" },
  { Term: "Byte", Definition: "A group of 8 bits used to represent a character or number" },
  { Term: "Spreadsheet", Definition: "A digital tool for organizing analyzing and visualizing data in rows and columns" },
  { Term: "Data Visualization", Definition: "Representing data graphically such as in charts or graphs" },
  { Term: "Data Type", Definition: "A classification of data such as integer string or boolean" },
  { Term: "Integer", Definition: "A whole number data type without decimal points" },
  { Term: "String", Definition: "A sequence of characters such as text used in programming" },
  { Term: "Boolean", Definition: "A data type with two values: true or false" },
  { Term: "Operator", Definition: "A symbol that performs operations like addition (+) or comparison (==)" },
  { Term: "Conditional Statement", Definition: "A programming construct like “if-then-else” that executes code based on a condition" },
  { Term: "Loop", Definition: "A programming construct that repeats a block of code until a condition is met" },
  { Term: "Function", Definition: "A reusable block of code that performs a specific task" },
  { Term: "Debugging", Definition: "The process of finding and fixing errors in a program" },
  { Term: "Syntax Error", Definition: "A mistake in the code’s structure that prevents it from running" },
  { Term: "Logic Error", Definition: "A flaw in the program’s logic causing incorrect results" },
  { Term: "Web Development", Definition: "The process of creating and maintaining websites" },
  { Term: "HTML", Definition: "HyperText Markup Language used to structure content on the web" },
  { Term: "Tag", Definition: "An HTML element like <p> or <div> used to define content structure" },
  { Term: "Attribute", Definition: "Additional information in an HTML tag like “class” or “id”" },
  { Term: "CSS", Definition: "Sheets used to style and format web content" },
  { Term: "Web Browser", Definition: "A software application for accessing and viewing websites" },
  { Term: "URL", Definition: "Uniform Resource Locator the address of a web resource" },
  { Term: "Hyperlink", Definition: "A clickable link that connects one web page to another" },
  { Term: "Digital Footprint", Definition: "The trail of data left by a user’s online activities" },
  { Term: "Digital Citizenship", Definition: "Responsible and ethical behavior in the digital world" },
  { Term: "Cybersecurity", Definition: "Protecting computers and data from unauthorized access or attacks" },
  { Term: "Encryption", Definition: "Converting data into a coded form to protect it from unauthorized access" },
  { Term: "Password", Definition: "A secret string of characters used to verify a user’s identity" },
  { Term: "Ethics", Definition: "Moral principles guiding responsible use of technology" },
  { Term: "Intellectual Property", Definition: "Creations like software or designs protected by law" },
  { Term: "Copyright", Definition: "A legal right protecting original works from unauthorized use" },
  { Term: "Fair Use", Definition: "A legal doctrine allowing limited use of copyrighted material without permission" },
  { Term: "Social Impact", Definition: "The effect of computing technologies on society such as privacy or accessibility" },
  { Term: "Accessibility", Definition: "Designing technology to be usable by people with diverse abilities" },
  { Term: "Collaboration", Definition: "Working with others to solve problems or create projects in computer science" },
  { Term: "Portfolio", Definition: "A collection of projects showcasing computer science skills and experience" }
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

  if (!canvas || !ctx || !userInput || !timeIndicator || !startButton || !resetButton || !randomizeTermsCheckbox || !themeSelect) {
    console.error('Required elements not found:', { canvas, ctx, userInput, timeIndicator, startButton, resetButton, randomizeTermsCheckbox, themeSelect });
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
  canvas.height = 350;

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
  let lastFrameTime = performance.now();
  let vocabIndex = 0;
  let amalgamateIndex = 0;
  let currentWPM = 0;
  let usedVocabIndices = [];
  let usedAmalgamateIndices = [];

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
    const underscoreCount = Math.max(0, Math.min(text.length - typedLength - 1, maxLength - typedLength - 1));
    let displayText = text.slice(0, typedLength) + (typedLength < text.length ? text.slice(typedLength, typedLength + 1) : '') + '_'.repeat(underscoreCount);
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

    const vocab1 = getRandomVocab(vocabData, false);
    if (!vocab1) return;

    let prompt1, typedInput1;
    if (promptType === 'definition') {
      prompt1 = vocab1.Definition;
      typedInput1 = vocab1.Term;
    } else if (promptType === 'term') {
      prompt1 = vocab1.Term;
      typedInput1 = vocab1.Definition;
    } else {
      const randomType = Math.random() < 0.5 ? 'definition' : 'term';
      prompt1 = randomType === 'definition' ? vocab1.Definition : vocab1.Term;
      typedInput1 = randomType === 'definition' ? vocab1.Term : vocab1.Definition;
    }

    let prompt2 = '', typedInput2 = '', vocab2 = null;
    if (amalgamateVocab.length > 0) {
      vocab2 = getRandomVocab(amalgamateVocab, true);
      if (vocab2) {
        if (promptType === 'definition') {
          prompt2 = vocab2.Definition;
          typedInput2 = vocab2.Term;
        } else if (promptType === 'term') {
          prompt2 = vocab2.Term;
          typedInput2 = vocab2.Definition;
        } else {
          const randomType = Math.random() < 0.5 ? 'definition' : 'term';
          prompt2 = randomType === 'definition' ? vocab2.Definition : vocab2.Term;
          typedInput2 = randomType === 'definition' ? vocab2.Term : vocab2.Definition;
        }
      }
    }

    const finalTypedInput = amalgamateVocab.length > 0 && vocab2 ? typedInput1 + ' ' + typedInput2 : typedInput1;
    const finalPrompt = amalgamateVocab.length > 0 && vocab2 ? prompt1 + ' ' + prompt2 : prompt1;
    const finalDefinition = amalgamateVocab.length > 0 && vocab2 ? vocab1.Definition + ' ' + vocab2.Definition : vocab1.Definition;

    const displayText = getUnderscoreText(finalTypedInput, 0);
    ctx.font = '18px Arial';
    const textWidth = ctx.measureText(displayText).width;

    const padding = 20;
    const maxX = canvas.width - textWidth - padding;
    const minX = padding;
    const x = mode === 'game' ? (minX + Math.random() * (maxX - minX)) : minX;

    const y = 0;
    const speed = mode === 'game' ? waveSpeeds[wave] : 0.5 + level * 0.1;
    const word = { prompt: finalPrompt, typedInput: finalTypedInput, displayText: displayText, x, y, speed, matched: '', definition: finalDefinition, isExiting: false, opacity: 0, fadeState: 'in' };
    words.push(word);
    userInput.placeholder = finalPrompt;
    updateWPMDisplay();
    updateTimeIndicator();
  }

  function updateGame() {
    if (!gameActive) return;

    const now = performance.now();
    const deltaTime = (now - lastFrameTime) / 1000;
    lastFrameTime = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

      const computedStyle = window.getComputedStyle(document.body);
      const baseColor = computedStyle.getPropertyValue('--canvas-text')?.trim() || '#ffffff';

      for (let i = 0; i < lines.length; i++) {
        ctx.font = '32px Arial';
        ctx.fillStyle = `rgba(${hexToRgb(baseColor)}, ${word.opacity})`;
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
    const computedStyle = window.getComputedStyle(document.body);
    const textColor = computedStyle.getPropertyValue('--canvas-text')?.trim() || '#ffffff';

    words = words.filter(word => word.y < canvas.height && !word.isExiting);
    words.forEach(word => {
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
        ctx.fillStyle = textColor;
        ctx.fillText(remainingText, word.x + ctx.measureText(word.matched).width, word.y);
      }

      if (word.y >= canvas.height) {
        missedWords.push(word.typedInput);
        totalChars += word.typedInput.length;
        word.isExiting = true;
        word.fadeState = 'out';
        if (mode === 'game') {
          gameActive = false;
          alert(`Game Over! Score: ${score}, WPM: ${calculateWPM()}, Accuracy: ${calculateAccuracy()}%`);
          return;
        }
      }
    });

    if (words.length > 0 && words[0].isExiting && words[0].opacity <= 0) {
      words = [];
      if (mode !== 'game') {
        spawnWord();
      }
    } else if (words.length === 0) {
      spawnWord();
    }

    if (mode === 'game' && timeLeft <= 0) {
      wave++;
      waveDisplay.textContent = `Wave: ${wave}`;
      timeLeft = 30;
      words.forEach(word => word.speed = waveSpeeds[wave] || waveSpeeds[waveSpeeds.length - 1]);
      const lightness = 50 + (wave - 1) * 3;
      document.documentElement.style.setProperty('--bg-lightness', `${Math.min(lightness, 77)}%`);
    }
    requestAnimationFrame(updateGame);
  }

  function calculateWPM() {
    if (sessionStartTime === null || correctChars === 0) return 0;
    const elapsedTime = (performance.now() - sessionStartTime) / 1000 / 60;
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

  function updateTimer() {
    if (!gameActive) return;
    timeLeft--;
    totalTime++;
    timerDisplay.textContent = `Time: ${timeLeft}s`;
    updateWPMDisplay();
    if (timeLeft <= 0) {
      wave++;
      waveDisplay.textContent = `Wave: ${wave}`;
      timeLeft = 30;
    }
    setTimeout(updateTimer, 1000);
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
        scoreDisplay.textContent = `Score: ${score}`;
        e.target.value = '';
        e.target.placeholder = 'Prompt will appear here...';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        word.isExiting = true;
        word.fadeState = 'out';
        return false;
      }
      if (target.startsWith(input)) {
        word.displayText = getUnderscoreText(word.typedInput, input.length);
      } else {
        word.displayText = getUnderscoreText(word.typedInput, 0);
      }
      return true;
    });

    updateTimeIndicator();
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

  function escapeLatex(str) {
    if (!str) return 'None';
    return str
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/#/g, '\\#')
      .replace(/%/g, '\\%')
      .replace(/&/g, '\\&')
      .replace(/_/g, '\\_')
      .replace(/\$/g, '\\$')
      .replace(/{/g, '\\{')
      .replace(/}/g, '\\}')
      .replace(/~/g, '\\textasciitilde{}')
      .replace(/\^/g, '\\textasciicircum{}');
  }

  function generateCertificate() {
    const name = prompt('Enter your name for the certificate:');
    if (!name || name.trim() === '') {
      alert('Please enter a valid name to generate the certificate.');
      return;
    }
    const safeName = escapeLatex(name.replace(/[^a-zA-Z0-9\s-]/g, ''));
    const wpm = currentWPM || 0;
    const accuracy = calculateAccuracy();
    const promptTypeText = escapeLatex(promptSelect.options[promptSelect.selectedIndex]?.text || 'Unknown');
    const missedTerms = missedWords.length > 0 ? escapeLatex(missedWords.join(', ')) : 'None';
    const certificateContent = `
\\documentclass[a4paper,12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\geometry{margin=1in}
\\usepackage{titling}
\\usepackage{times}

\\title{KappType Certificate}
\\author{}
\\date{}

\\begin{document}

\\maketitle
\\vspace{2cm}

\\begin{center}
  \\Large{\\textbf{Certificate of Achievement}}
  \\vspace{1cm}
  \\normalsize{This certifies that}
  \\vspace{0.5cm}
  \\Large{\\textbf{${safeName}}}
  \\vspace{0.5cm}
  \\normalsize{has successfully completed a session in KappType with the following results:}
  \\vspace{1cm}
  \\begin{tabular}{ll}
    Prompt Type: & ${promptTypeText} \\\\
    Typing Speed: & ${wpm} WPM \\\\
    Accuracy: & ${accuracy}\\% \\\\
    Wave Reached: & ${wave} \\\\
    Total Time: & ${totalTime} seconds \\\\
    Missed Terms: & \\begin{minipage}[t]{0.5\\textwidth} ${missedTerms} \\end{minipage} \\\\
    Score: & ${score} \\\\
  \\end{tabular}
  \\vspace{2cm}
  \\normalsize{Awarded on ${new Date().toLocaleDateString()}}
\\end{center}

\\end{document}
    `;

    const blob = new Blob([certificateContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'certificate.tex';
    a.click();
    URL.revokeObjectURL(url);

    alert('Certificate .tex file downloaded. Upload it to your Overleaf project to compile it into a PDF. If compilation fails, check for errors in Overleaf (e.g., missing packages or special characters in your name or missed terms). Alternatively, you can use a local LaTeX editor like TeXShop or TeXworks to compile it.');
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
});