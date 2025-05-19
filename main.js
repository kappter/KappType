// main.js - Entry point for the game, coordinates DOM setup, event listeners, and game initialization.

import { calculateWPM, calculateAccuracy, updateTimer } from './stats.js';
import { spawnWord, updateGame, handleInput } from './gameLogic.js';
import { toggleTheme, highlightKeys, keyUpHandler, updateTimeIndicator } from './theme.js';

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
  const customVocabInput1 = document.getElementById('customVocabInput1');
  const customVocabInput2 = document.getElementById('customVocabInput2');
  const vocabSetTitle = document.getElementById('vocabSetTitle');
  const certificateButton = document.getElementById('certificateButton');
  const restartButton = document.getElementById('restartButton');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const timeIndicator = document.getElementById('timeIndicator');

  if (!canvas || !ctx || !userInput || !timeIndicator || !startButton || !restartButton || !certificateButton || !vocabSelect || !amalgamateSelect) {
    console.error('Required elements not found:', { canvas, ctx, userInput, timeIndicator, startButton, restartButton, certificateButton, vocabSelect, amalgamateSelect });
    alert('Critical elements are missing from the page. Please check the HTML structure and try again.');
    return;
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
  let totalTypingTime = 0;
  let missedWords = [];
  let totalChars = 0;
  let correctChars = 0;

  gameContainer.classList.add('hidden');
  startScreen.classList.remove('hidden');

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  }

  function populateVocabDropdown() {
    console.log('Populating vocab dropdowns...');
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
    console.log('Vocab select element:', vocabSelect);
    console.log('Amalgamate select element:', amalgamateSelect);
    if (!vocabSelect || !amalgamateSelect) {
      console.error('Vocab or amalgamate select elements not found');
      return;
    }
    vocabSelect.innerHTML = '<option value="">[Embedded Vocabulary - 53 Computer Science Terms]</option>';
    amalgamateSelect.innerHTML = '<option value="">[None]</option>';
    files.forEach(file => {
      const option1 = document.createElement('option');
      option1.value = baseUrl + file + '.csv';
      option1.textContent = file;
      vocabSelect.appendChild(option1);
      console.log(`Added option to vocabSelect: ${file}`);

      const option2 = document.createElement('option');
      option2.value = baseUrl + file + '.csv';
      option2.textContent = file;
      amalgamateSelect.appendChild(option2);
      console.log(`Added option to amalgamateSelect: ${file}`);
    });
    console.log('Dropdown population completed. Vocab options:', vocabSelect.options.length, 'Amalgamate options:', amalgamateSelect.options.length);
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
    console.log('Certificate button clicked at', new Date().toISOString());
    let name;
    try {
      name = prompt('Enter your name for the certificate:');
    } catch (error) {
      console.error('Prompt failed:', error);
      alert('Unable to open the name prompt. This may be due to browser security settings. Please try a different browser or disable extensions that might block prompts.');
      return;
    }
    if (!name) {
      console.log('Certificate generation cancelled: No name provided');
      return;
    }
    const safeName = escapeLatex(name.replace(/[^a-zA-Z0-9\s-]/g, ''));
    const wpm = calculateWPM(totalTypingTime, totalChars);
    const accuracy = calculateAccuracy(totalChars, correctChars);
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

    try {
      const blob = new Blob([certificateContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'certificate.tex';
      a.click();
      URL.revokeObjectURL(url);

      alert('Certificate .tex file downloaded. Upload it to your Overleaf project at https://www.overleaf.com/project/6827805d3e926f37c9afb11e to compile it into a PDF. If compilation fails, check for errors in Overleaf (e.g., missing packages or syntax issues) or ensure your GitHub repository (https://github.com/kappter/KappType) is synced with your Overleaf project under the "certificate.tex" file.');
    } catch (error) {
      console.error('Certificate generation failed:', error);
      alert('Failed to generate the certificate. Please check the console for errors and try again.');
    }
  }

  function restartGame() {
    console.log('restartGame() called - Resetting game state');
    gameActive = false;
    words = [];
    vocabData = [];
    amalgamateVocab = [];
    vocabSetName = '';
    amalgamateSetName = '';
    score = 0;
    wave = 1;
    timeLeft = 30;
    mode = 'game';
    promptType = 'definition';
    caseSensitive = false;
    level = 1;
    totalTime = 0;
    totalTypingTime = 0;
    totalChars = 0;
    correctChars = 0;
    missedWords = [];
    userInput.value = '';
    userInput.placeholder = 'Prompt will appear here...';
    scoreDisplay.textContent = `Score: ${score}`;
    waveDisplay.textContent = `Wave: ${wave}`;
    timerDisplay.textContent = `Time: ${timeLeft}s`;
    wpmDisplay.textContent = `WPM: ${calculateWPM(totalTypingTime, totalChars)}`;

    gameContainer.classList.add('hidden');
    startScreen.classList.remove('hidden');

    userInput.removeEventListener('input', handleInputWrapper);
    document.removeEventListener('keydown', highlightKeys);
    document.removeEventListener('keyup', keyUpHandler);
    certificateButton.removeEventListener('click', generateCertificate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function startGame() {
    if (vocabData.length === 0) {
      vocabData = [...defaultVocabData];
      vocabSetName = 'Embedded Vocabulary - 53 Computer Science Terms';
    }
    vocabSetTitle.textContent = vocabSetName + (amalgamateSetName ? ' + ' + amalgamateSetName : '');
    gameActive = true;
    wpmStartTime = null;
    totalTypingTime = 0;
    totalChars = 0;
    correctChars = 0;
    userInput.focus();
    userInput.addEventListener('input', handleInputWrapper);
    document.addEventListener('keydown', highlightKeys);
    document.addEventListener('keyup', keyUpHandler);
    certificateButton.removeEventListener('click', generateCertificate);
    certificateButton.addEventListener('click', generateCertificate);
    certificateButton.disabled = true; // Disable until game ends
    spawnWord(vocabData, amalgamateVocab, promptType, mode, level, wave, ctx, canvas, userInput, words, () => updateTimeIndicator(timeIndicator, wpmStartTime));
    updateGame(gameActive, ctx, canvas, userInput, words, mode, wave, wpmStartTime, missedWords, totalChars, scoreDisplay, calculateWPM, calculateAccuracy, restartGame, () => spawnWord(vocabData, amalgamateVocab, promptType, mode, level, wave, ctx, canvas, userInput, words, () => updateTimeIndicator(timeIndicator, wpmStartTime)), certificateButton, gameContainer, startScreen, vocabData, amalgamateVocab, promptType, level, () => updateTimeIndicator(timeIndicator, wpmStartTime));
    const updatedStats = updateTimer(gameActive, timeLeft, timerDisplay, wpmDisplay, wave, waveDisplay, mode, words, calculateWPM, totalTypingTime, totalChars);
    timeLeft = updatedStats.timeLeft;
    wave = updatedStats.wave;
  }

  function handleInputWrapper(e) {
    const result = handleInput(e, words, caseSensitive, score, correctChars, totalChars, scoreDisplay, userInput, ctx, canvas, wpmStartTime, totalTypingTime, () => spawnWord(vocabData, amalgamateVocab, promptType, mode, level, wave, ctx, canvas, userInput, words, () => updateTimeIndicator(timeIndicator, wpmStartTime)), vocabData, amalgamateVocab, promptType, mode, level, wave, () => updateTimeIndicator(timeIndicator, wpmStartTime));
    wpmStartTime = result.wpmStartTime;
    totalTypingTime = result.totalTypingTime;
    score = result.score;
    correctChars = result.correctChars;
    totalChars = result.totalChars;
    words = result.words;
  }

  populateVocabDropdown();
  startButton.addEventListener('click', async () => {
    level = Math.max(1, Math.min(10, parseInt(levelInput.value)));
    mode = modeSelect.value;
    promptType = promptSelect.value;
    caseSensitive = caseSelect.value === 'sensitive';
    const csvUrl = vocabSelect.value || '';
    const amalgamateUrl = amalgamateSelect.value || '';

    if (customVocabInput1 && customVocabInput2) {
      if (customVocabInput1.files && customVocabInput1.files.length > 0) {
        await loadCustomVocab(customVocabInput1.files[0]);
      }
      if (customVocabInput2.files && customVocabInput2.files.length > 0) {
        await loadCustomVocab(customVocabInput2.files[0], true);
      }
    } else {
      console.warn('Custom vocabulary inputs not available.');
    }

    if (csvUrl && (!customVocabInput1 || !customVocabInput1.files || customVocabInput1.files.length === 0)) {
      await loadVocab(csvUrl);
    } else if (!customVocabInput1 || !customVocabInput1.files || customVocabInput1.files.length === 0) {
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

  restartButton.addEventListener('click', () => {
    console.log('Restart button clicked at', new Date().toISOString());
    restartGame();
  });
});
