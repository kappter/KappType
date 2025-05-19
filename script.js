// Embedded default vocabulary (53 computer science terms)
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

// Theme toggle function (global so it can be called from HTML)
function toggleTheme() {
  const body = document.body;
  body.classList.toggle('dark');
  const isDark = body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

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
  const vocabSetTitle = document.getElementById('vocabSetTitle');
  const certificateButton = document.getElementById('certificateButton');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const timeIndicator = document.getElementById('timeIndicator');

  // Check for missing critical elements
  if (!canvas || !ctx || !userInput || !timeIndicator || !startButton) {
    console.error('Required elements not found:', { canvas, ctx, userInput, timeIndicator, startButton });
    alert('Critical elements are missing from the page. Please check the HTML structure and try again.');
    return;
  }

  // Warn if customVocabInput or customVocabInput2 is missing
  if (!customVocabInput) {
    console.warn('customVocabInput element not found. Custom vocabulary upload will be disabled.');
  }
  if (!customVocabInput2) {
    console.warn('customVocabInput2 element not found. Amalgamation vocabulary upload will be disabled.');
  }

  canvas.width = 800;
  canvas.height = 400;

  let words = [];
  let vocabData = [];
  let amalgamateVocab = [];
  let vocabSetName = '';
  let amalgamateSetName = '';
  let score = 0;
  let wave = 1;
  let timeLeft = 30;
  let gameActive = false;
  let mode = 'game';
  let promptType = 'definition';
  let caseSensitive = false;
  let level = 1;
  let totalTime = 0;
  let wpmStartTime = null;
  let missedWords = [];
  let totalChars = 0;
  let correctChars = 0;
  let lastFrameTime = performance.now();

  // Apply saved theme on load
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  }

  function populateVocabDropdown() {
    const baseUrl = 'https://raw.githubusercontent.com/kappter/vocab-sets/main/';
    const files = [
      'Exploring_Computer_Science_Vocabulary',
      'ARRL_Ham_Radio_Extra_License_Terms_Definitions',
      'ARRL_Ham_Radio_General_License_Terms_Definitions',
      'ARRL_Ham_Radio_Technician_License_Terms_Definitions',
      'Computer_Programming_2_Terms_Definitions',
      'Digital_Media_2_Terms_and_Definitions',
      'ECS_Hardware_OS_DataStorage_Terms_Definitions',
      'Game_Development_Fundamentals_2_Terms_Definitions',
      'Game_Development_Fundamentals_1_Terms_Definitions',
      'Music_Theory_Terms_Definitions',
      'Short_Testing_Sample',
      'Summer_Job_Preparation_Terms_Definitions',
      'Utah_Computer_Programming_1_Terms_Definitions',
      'Web_Development_Terms_Definitions',
      'Yearbook_Staff_Editor_Skills_Terms_Definitions',
      'advanced_computer_programming_vocab',
      'psych_terms_1',
      'psych_terms_2',
      'psych_terms_3',
      'psych_terms_4',
      'utah_video_production_terms_Final'
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

      // Clear the target array before loading new data
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
              targetArray.length = 0; // Ensure the array is clear
              const filteredData = results.data.filter(row => row.Term && row.Definition);
              if (filteredData.length === 0) {
                alert(`No valid terms found in the CSV at ${csvUrl}. Ensure it has "Term" and "Definition" columns. Using embedded vocabulary for ${isAmalgamate ? 'amalgamation' : 'primary'}.`);
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
              alert(`Failed to parse CSV at ${csvUrl}. Error: ${error.message || 'Unknown error'}. Using embedded vocabulary for ${isAmalgamate ? 'amalgamation' : 'primary'}.`);
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
          alert(`Failed to load CSV at ${csvUrl}. Error: ${error.message || 'Unknown error'}. Using embedded vocabulary for ${isAmalgamate ? 'amalgamation' : 'primary'}.`);
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

      // Clear the target array before loading new data
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
          targetArray.length = 0; // Ensure the array is clear
          const filteredData = results.data.filter(row => row.Term && row.Definition);
          if (filteredData.length === 0) {
            alert(`No valid terms found in the uploaded CSV. Ensure it has "Term" and "Definition" columns. Using embedded vocabulary for ${isAmalgamate ? 'amalgamation' : 'primary'}.`);
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
          alert(`Failed to parse the uploaded CSV. Error: ${error.message || 'Unknown error'}. Using embedded vocabulary for ${isAmalgamate ? 'amalgamation' : 'primary'}.`);
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

  function getRandomVocab(sourceArray) {
    if (sourceArray.length === 0) return null;
    const index = Math.floor(Math.random() * sourceArray.length);
    return sourceArray[index];
  }

  function getUnderscoreText(text) {
    if (text.length > 50) text = text.slice(0, 47) + '...';
    return text[0] + '_'.repeat(text.length - 1);
  }

  function spawnWord() {
    if (vocabData.length === 0) {
      vocabData = [...defaultVocabData];
      vocabSetName = 'Embedded Vocabulary - 53 Computer Science Terms';
    }

    const vocab1 = getRandomVocab(vocabData);
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
      vocab2 = getRandomVocab(amalgamateVocab);
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

    // Ensure word stays within canvas bounds with padding
    const padding = 10;
    const textWidth = ctx.measureText(finalTypedInput).width;
    const maxX = canvas.width - textWidth - padding;
    const minX = padding;
    const xRange = maxX - minX;
    const x = mode === 'game' ? minX + Math.random() * (xRange > 0 ? xRange : 0) : 50;

    const y = 0;
    const speed = mode === 'game' ? 0.5 + wave * 0.5 * (level / 5) : 0.5 + level * 0.1;
    const word = { prompt: finalPrompt, typedInput: finalTypedInput, displayText: getUnderscoreText(finalTypedInput), x, y, speed, matched: '', definition: finalDefinition, isExiting: false };
    words.push(word);
    userInput.placeholder = finalPrompt;
    wpmStartTime = null;

    updateTimeIndicator();
  }

  function updateGame() {
    if (!gameActive) return;

    const now = performance.now();
    if (now - lastFrameTime < 16.67) {
      requestAnimationFrame(updateGame);
      return;
    }
    lastFrameTime = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bottom warning line
    const rectHeight = 20;
    const rectY = canvas.height - rectHeight;
    ctx.beginPath();
    ctx.roundRect(0, rectY, canvas.width, rectHeight, 10);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fill();
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw definition background text on the canvas
    if (words.length > 0) {
      const definition = words[0].definition;
      ctx.font = '24px Arial';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.textAlign = 'center';
      const maxWidth = canvas.width - 40;
      const wordsArray = definition.split(' ');
      let line = '';
      let lines = [];
      for (let word of wordsArray) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== '') {
          lines.push(line.trim());
          line = word + ' ';
        } else {
          line = testLine;
        }
      }
      if (line) lines.push(line.trim());
      const lineHeight = 30;
      const totalHeight = lines.length * lineHeight;
      const startY = (canvas.height - totalHeight) / 2;
      lines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
      });
    }

    // Draw falling words
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    const computedStyle = window.getComputedStyle(document.body);
    const textColor = computedStyle.getPropertyValue('--text')?.trim() || '#ffffff';

    words = words.filter(word => word.y < canvas.height && !word.isExiting);
    words.forEach(word => {
      // Clear the area around the word to prevent overlap
      const textWidth = ctx.measureText(word.typedInput).width;
      ctx.clearRect(word.x - 5, word.y - 25, textWidth + 10, 30);

      word.y += word.speed;
      const typed = userInput.value;
      const target = caseSensitive ? word.typedInput : word.typedInput.toLowerCase();
      const input = caseSensitive ? typed : typed.toLowerCase();
      word.matched = target.startsWith(input) ? typed : '';
      
      // Render matched portion in red
      ctx.fillStyle = 'red';
      ctx.fillText(word.matched, word.x, word.y);
      
      // Render unmatched portion in the default text color
      const matchedWidth = ctx.measureText(word.matched).width;
      ctx.fillStyle = textColor;
      ctx.fillText(word.displayText.slice(word.matched.length), word.x + matchedWidth, word.y);

      if (word.y >= canvas.height) {
        missedWords.push(word.typedInput);
        totalChars += word.typedInput.length;
        word.isExiting = true;
        words = [];
        if (mode === 'game') {
          gameActive = false;
          alert(`Game Over! Score: ${score}, WPM: ${calculateWPM()}, Accuracy: ${calculateAccuracy()}%`);
        } else {
          spawnWord();
        }
      }
    });

    if (words.length === 0) spawnWord();
    if (mode === 'game' && wpmStartTime !== null && timeLeft <= 0) {
      wave++;
      waveDisplay.textContent = `Wave: ${wave}`;
      timeLeft = 30;
      words.forEach(word => word.speed += 0.5);
    }
    requestAnimationFrame(updateGame);
  }

  function calculateWPM() {
    if (wpmStartTime === null) return 0;
    const elapsedTime = (performance.now() - wpmStartTime) / 1000 / 60;
    return elapsedTime > 0 ? Math.round((totalChars / 5) / elapsedTime) : 0;
  }

  function calculateAccuracy() {
    return totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
  }

  function updateTimer() {
    if (!gameActive) return;
    timeLeft--;
    timerDisplay.textContent = `Time: ${timeLeft}s`;
    wpmDisplay.textContent = `WPM: ${calculateWPM()}`;
    if (timeLeft <= 0) {
      wave++;
      waveDisplay.textContent = `Wave: ${wave}`;
      timeLeft = 30;
    }
    setTimeout(updateTimer, 1000);
  }

  function handleInput(e) {
    const typed = e.target.value;
    if (wpmStartTime === null && typed.length > 0) {
      wpmStartTime = performance.now();
    }
    words = words.filter(word => {
      const target = caseSensitive ? word.typedInput : word.typedInput.toLowerCase();
      const input = caseSensitive ? typed : typed.toLowerCase();
      if (typed.length === 1 && target.startsWith(input)) {
        word.displayText = word.typedInput;
      }
      if (target === input) {
        score += word.typedInput.length;
        correctChars += word.typedInput.length;
        totalChars += word.typedInput.length;
        scoreDisplay.textContent = `Score: ${score}`;
        e.target.value = '';
        e.target.placeholder = 'Prompt will appear here...';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        wpmStartTime = null;
        word.isExiting = true; // Mark for exit animation
        spawnWord();
        return false;
      }
      return true;
    });

    updateTimeIndicator();
  }

  function highlightKeys(e) {
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => key.classList.remove('pressed'));

    const keyValue = e.key === ' ' ? ' ' : e.key; // Handle space key
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
      if (wpmStartTime !== null) {
        timeIndicator.classList.add('active');
      }
    }
  }

  function escapeLatex(str) {
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
    if (!name) return;
    const safeName = escapeLatex(name.replace(/[^a-zA-Z0-9\s-]/g, ''));
    const wpm = calculateWPM();
    const accuracy = calculateAccuracy();
    const promptTypeText = escapeLatex(promptSelect.options[promptSelect.selectedIndex].text);
    const missedTerms = missedWords.length > 0 ? escapeLatex(missedWords.join(', ')) : 'None';
    const certificateContent = `
\\documentclass[a4paper,12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\geometry{margin=1in}
\\usepackage{titling}
\\usepackage{noto}

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
    Missed Terms: & \\begin{minipage}[t]{0.6\\textwidth} ${missedTerms} \\end{minipage} \\\\
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

    alert('Certificate .tex file downloaded. Upload it to your Overleaf project at https://www.overleaf.com/project/6827805d3e926f37c9afb11e to compile it into a PDF. If compilation fails, check for errors in Overleaf (e.g., missing packages or syntax issues) or ensure your GitHub repository (https://github.com/kappter/KappType) is synced with your Overleaf project under the "certificate.tex" file.');
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
    const csvUrl = vocabSelect.value || '';
    const amalgamateUrl = amalgamateSelect.value || '';

    // Handle custom vocabulary uploads
    if (customVocabInput && customVocabInput.files && customVocabInput.files.length > 0) {
      await loadCustomVocab(customVocabInput.files[0], false);
    }
    if (customVocabInput2 && customVocabInput2.files && customVocabInput2.files.length > 0) {
      await loadCustomVocab(customVocabInput2.files[0], true);
    }

    // Load from URL if no custom file is uploaded
    if (csvUrl && (!customVocabInput || !customVocabInput.files || customVocabInput.files.length === 0)) {
      await loadVocab(csvUrl, false);
    } else if (!customVocabInput || !customVocabInput.files || customVocabInput.files.length === 0) {
      vocabData = [...defaultVocabData];
      vocabSetName = 'Embedded Vocabulary - 53 Computer Science Terms';
    }

    // Handle amalgamation URL if no second file is uploaded
    if (amalgamateUrl && (!customVocabInput2 || !customVocabInput2.files || customVocabInput2.files.length === 0)) {
      await loadVocab(amalgamateUrl, true);
    }

    startScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    startGame();
  });
});