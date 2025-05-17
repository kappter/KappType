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
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
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
  const caseSelect = document.getElementById('caseSelect');
  const vocabSelect = document.getElementById('vocabSelect');
  const amalgamateSelect = document.getElementById('amalgamateSelect');
  const vocabSetTitle = document.getElementById('vocabSetTitle');
  const certificateButton = document.getElementById('certificateButton');
  const loadingIndicator = document.getElementById('loadingIndicator');

  canvas.width = 800;
  canvas.height = 400;

  let words = [];
  let vocabData = [];
  let amalgamateVocab = [];
  let vocabSetName = '';
  let score = 0;
  let wave = 1;
  let timeLeft = 30;
  let gameActive = false;
  let mode = 'game';
  let caseSensitive = false;
  let level = 1;
  let totalTime = 0;
  let wpmStartTime = null; // Tracks when WPM calculation begins
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
    const targetArray = isAmalgamate ? amalgamateVocab : vocabData;
    vocabSetName = vocabSelect.options[vocabSelect.selectedIndex].textContent;
    if (!csvUrl) {
      targetArray.length = 0; // Clear the array
      if (!isAmalgamate) {
        vocabData = [...defaultVocabData];
        vocabSetName = vocabSetName || 'Embedded Vocabulary - 53 Computer Science Terms';
      }
      loadingIndicator.classList.add('hidden');
      startButton.disabled = false;
      return;
    }

    if (window.location.protocol === 'file:') {
      alert('Cannot load external CSV files when running via file://. Using embedded vocabulary (53 computer science terms). For external CSVs, run a local server (e.g., python -m http.server) and access http://localhost:8000.');
      targetArray.length = 0;
      if (!isAmalgamate) {
        vocabData = [...defaultVocabData];
        vocabSetName = 'Embedded Vocabulary - 53 Computer Science Terms';
      }
      loadingIndicator.classList.add('hidden');
      startButton.disabled = false;
      return;
    }

    if (!validateCsvUrl(csvUrl)) {
      alert('Invalid CSV URL. Using embedded vocabulary.');
      targetArray.length = 0;
      if (!isAmalgamate) {
        vocabData = [...defaultVocabData];
        vocabSetName = 'Embedded Vocabulary - 53 Computer Science Terms';
      }
      loadingIndicator.classList.add('hidden');
      startButton.disabled = false;
      return;
    }

    if (typeof Papa === 'undefined') {
      alert('Papa Parse library not loaded. Using embedded vocabulary. Ensure papaparse.min.js is in the repository root.');
      targetArray.length = 0;
      if (!isAmalgamate) {
        vocabData = [...defaultVocabData];
        vocabSetName = 'Embedded Vocabulary - 53 Computer Science Terms';
      }
      loadingIndicator.classList.add('hidden');
      startButton.disabled = false;
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
            targetArray.length = 0; // Clear before adding new data
            targetArray.push(...results.data.filter(row => row.Term && row.Definition));
            loadingIndicator.classList.add('hidden');
            startButton.disabled = false;
            if (targetArray.length === 0) {
              alert(`No valid terms found in the CSV at ${csvUrl}. Ensure it has "Term" and "Definition" columns. Using embedded vocabulary for ${isAmalgamate ? 'amalgamation' : 'primary'}.`);
              if (!isAmalgamate) {
                vocabData = [...defaultVocabData];
                vocabSetName = 'Embedded Vocabulary - 53 Computer Science Terms';
              }
            }
          },
          error: function(error) {
            clearTimeout(timeoutId);
            console.error(`Papa Parse error for ${csvUrl}:`, error);
            alert(`Failed to parse CSV at ${csvUrl}. Error: ${error.message || 'Unknown error'}. Using embedded vocabulary for ${isAmalgamate ? 'amalgamation' : 'primary'}.`);
            targetArray.length = 0;
            if (!isAmalgamate) {
              vocabData = [...defaultVocabData];
              vocabSetName = 'Embedded Vocabulary - 53 Computer Science Terms';
            }
            loadingIndicator.classList.add('hidden');
            startButton.disabled = false;
          }
        });
      })
      .catch(error => {
        clearTimeout(timeoutId);
        console.error(`Fetch error for ${csvUrl}:`, error);
        alert(`Failed to load CSV at ${csvUrl}. Error: ${error.message || 'Unknown error'}. Using embedded vocabulary for ${isAmalgamate ? 'amalgamation' : 'primary'}.`);
        targetArray.length = 0;
        if (!isAmalgamate) {
          vocabData = [...defaultVocabData];
          vocabSetName = 'Embedded Vocabulary - 53 Computer Science Terms';
        }
        loadingIndicator.classList.add('hidden');
        startButton.disabled = false;
      });
  }

  function getRandomVocab(sourceArray) {
    const index = Math.floor(Math.random() * sourceArray.length);
    return sourceArray[index];
  }

  function getUnderscoreText(text) {
    if (text.length > 50) text = text.slice(0, 47) + '...'; // Truncate long definitions
    return text[0] + '_'.repeat(text.length - 1);
  }

  function spawnWord() {
    if (vocabData.length === 0) {
      vocabData = [...defaultVocabData];
    }
    const vocab1 = getRandomVocab(vocabData);
    let prompt1 = vocab1.Definition; // Default to Definition (Type Term)
    let typedInput1 = vocab1.Term;

    let prompt2 = '', typedInput2 = '', vocab2 = null;
    if (amalgamateVocab.length > 0) {
      vocab2 = getRandomVocab(amalgamateVocab);
      prompt2 = vocab2.Definition;
      typedInput2 = vocab2.Term;
    }

    // Concatenate terms and definitions with a space for amalgamation
    const finalTypedInput = amalgamateVocab.length > 0 ? typedInput1 + ' ' + typedInput2 : typedInput1;
    const finalPrompt = amalgamateVocab.length > 0 ? prompt1 + ' ' + prompt2 : prompt1;
    const finalDefinition = amalgamateVocab.length > 0 ? vocab1.Definition + ' ' + vocab2.Definition : vocab1.Definition;

    const x = mode === 'game' ? Math.random() * (canvas.width - ctx.measureText(getUnderscoreText(finalTypedInput)).width) : 50;
    const y = 0;
    const speed = mode === 'game' ? 0.5 + wave * 0.5 * (level / 5) : 0.5 + level * 0.1; // Reduced initial speed by half
    words.push({ prompt: finalPrompt, typedInput: finalTypedInput, displayText: getUnderscoreText(finalTypedInput), x, y, speed, matched: '', definition: finalDefinition });
    userInput.placeholder = finalPrompt; // Set placeholder, will clear on match
    wpmStartTime = null; // Reset WPM start time on new word

    // Set definition as background text
    let definitionBackground = document.querySelector('.definition-background');
    if (!definitionBackground) {
      definitionBackground = document.createElement('div');
      definitionBackground.className = 'definition-background';
      gameContainer.insertBefore(definitionBackground, gameContainer.firstChild);
    }
    definitionBackground.textContent = finalDefinition;
  }

  function updateGame() {
    if (!gameActive) return;

    const now = performance.now();
    if (now - lastFrameTime < 16.67) {
      requestAnimationFrame(updateGame);
      return;
    }
    lastFrameTime = now;

    // Clear the entire canvas to remove any stray renders
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = '20px Arial';

    // Get the current text color from CSS variable --text
    const computedStyle = window.getComputedStyle(document.body);
    const textColor = computedStyle.getPropertyValue('--text').trim();

    words = words.filter(word => word.y < canvas.height);
    words.forEach(word => {
      word.y += word.speed;
      const typed = userInput.value;
      const target = caseSensitive ? word.typedInput : word.typedInput.toLowerCase();
      const input = caseSensitive ? typed : typed.toLowerCase();
      word.matched = target.startsWith(input) ? typed : '';
      ctx.fillStyle = 'red';
      ctx.fillText(word.typedInput.slice(0, word.matched.length), word.x, word.y);
      ctx.fillStyle = textColor; // Use dynamic text color for unmatched text
      ctx.fillText(word.displayText.slice(word.matched.length), word.x + ctx.measureText(word.typedInput.slice(0, word.matched.length)).width, word.y);
      if (word.y >= canvas.height) {
        missedWords.push(word.typedInput);
        totalChars += word.typedInput.length;
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
    // Only increase speed if typing has started (wpmStartTime is set)
    if (mode === 'game' && wpmStartTime !== null && timeLeft <= 0) {
      wave++;
      waveDisplay.textContent = `Wave: ${wave}`;
      timeLeft = 30;
      words.forEach(word => word.speed += 0.5);
    }
    requestAnimationFrame(updateGame);
  }

  function calculateWPM() {
    if (wpmStartTime === null) return 0; // Return 0 WPM until first keystroke
    const elapsedTime = (performance.now() - wpmStartTime) / 1000 / 60; // Convert to minutes
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
      wpmStartTime = performance.now(); // Start WPM timing on first keystroke
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
        e.target.placeholder = 'Prompt will appear here...'; // Clear placeholder on match
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas immediately
        wpmStartTime = null; // Reset WPM start time on word clear
        spawnWord();
        return false;
      }
      return true;
    });
  }

  function highlightKeys(e) {
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => key.classList.remove('pressed'));
    if (e.key === ' ') {
      document.querySelector('.space').classList.add('pressed');
    } else {
      const key = Array.from(keys).find(k => k.textContent.toLowerCase() === e.key.toLowerCase());
      if (key) key.classList.add('pressed');
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
    const safeName = escapeLatex(name.replace(/[^a-zA-Z0-9\s-]/g, '')); // Sanitize and escape
    const wpm = calculateWPM();
    const accuracy = calculateAccuracy();
    const promptTypeText = escapeLatex('Definition (Type Term)'); // Default prompt type
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

    // Download .tex file as fallback
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
    }
    gameActive = true;
    userInput.focus();
    userInput.addEventListener('input', handleInput);
    document.addEventListener('keydown', highlightKeys);
    document.addEventListener('keyup', () => {
      document.querySelectorAll('.key').forEach(key => key.classList.remove('pressed'));
    });
    certificateButton.addEventListener('click', generateCertificate);
    vocabSetTitle.textContent = vocabSetName + (amalgamateVocab.length ? ' + Amalgamated Set' : '');
    spawnWord();
    updateGame();
    updateTimer();
  }

  populateVocabDropdown();
  startButton.addEventListener('click', () => {
    level = Math.max(1, Math.min(10, parseInt(levelInput.value)));
    mode = modeSelect.value;
    caseSensitive = caseSelect.value === 'sensitive';
    const csvUrl = vocabSelect.value || '';
    const amalgamateUrl = amalgamateSelect.value || '';
    loadVocab(csvUrl);
    if (amalgamateUrl) {
      loadVocab(amalgamateUrl, true);
    }
    setTimeout(() => {
      startScreen.classList.add('hidden');
      gameContainer.classList.remove('hidden');
      startGame();
    }, 100);
  });
});