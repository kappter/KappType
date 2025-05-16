const canvas = document.getElementById(' partners');
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
const csvInput = document.getElementById('csvInput');
const certificateButton = document.getElementById('certificateButton');
const definitionDisplay = document.getElementById('definition');

canvas.width = 800;
canvas.height = 400;

let words = [];
let vocabData = [];
let score = 0;
let wave = 1;
let timeLeft = 30;
let gameActive = false;
let mode = 'game';
let level = 1;
let totalTime = 0;
let missedWords = [];
let totalChars = 0;
let correctChars = 0;

function loadVocab(csvUrl) {
  const url = csvUrl || 'vocab.csv';
  Papa.parse(url, {
    download: true,
    header: true,
    complete: function(results) {
      vocabData = results.data.filter(row => row.Term && row.Definition);
      if (vocabData.length === 0) {
        alert('No valid terms found in the CSV. Please ensure it has "Term" and "Definition" columns.');
      }
    },
    error: function() {
      alert('Failed to load CSV. Ensure you’re using a raw file URL (e.g., https://raw.githubusercontent.com/...). Falling back to default vocab.csv.');
      Papa.parse('vocab.csv', {
        download: true,
        header: true,
        complete: function(results) {
          vocabData = results.data.filter(row => row.Term && row.Definition);
          if (vocabData.length === 0) {
            alert('Default vocab.csv is invalid or missing. Please provide a valid CSV.');
          }
        },
        error: function() {
          alert('Default vocab.csv not found. Please include it in the project directory.');
        }
      });
    }
  });
}

function getRandomVocab() {
  const index = Math.floor(Math.random() * vocabData.length);
  return vocabData[index];
}

function getUnderscoreText(term) {
  return term[0] + '_'.repeat(term.length - 1);
}

function spawnWord() {
  if (vocabData.length === 0) return;
  const vocab = getRandomVocab();
  const term = vocab.Term;
  const definition = vocab.Definition;
  const x = mode === 'game' ? Math.random() * (canvas.width - ctx.measureText(getUnderscoreText(term)).width) : 50;
  const y = 0;
  const speed = mode === 'game' ? 1 + wave * 0.5 * (level / 5) : 1 + level * 0.1;
  words.push({ term, definition, displayText: getUnderscoreText(term), x, y, speed, matched: '' });
  definitionDisplay.textContent = definition;
}

function updateGame() {
  if (!gameActive) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '20px Arial';

  words = words.filter(word => word.y < canvas.height);
  words.forEach(word => {
    word.y += word.speed;
    const typed = userInput.value.trim().toLowerCase();
    word.matched = word.term.toLowerCase().startsWith(typed) ? typed : '';
    ctx.fillStyle = 'red';
    ctx.fillText(word.term.slice(0, word.matched.length), word.x, word.y);
    ctx.fillStyle = 'white';
    ctx.fillText(word.displayText.slice(word.matched.length), word.x + ctx.measureText(word.term.slice(0, word.matched.length)).width, word.y);
    if (word.y >= canvas.height) {
      missedWords.push(word.term);
      totalChars += word.term.length;
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
  requestAnimationFrame(updateGame);
}

function calculateWPM() {
  return totalTime > 0 ? Math.round((totalChars / 5) / (totalTime / 60)) : 0;
}

function calculateAccuracy() {
  return totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
}

function updateTimer() {
  if (!gameActive) return;
  totalTime++;
  timeLeft--;
  timerDisplay.textContent = `Time: ${timeLeft}s`;
  wpmDisplay.textContent = `WPM: ${calculateWPM()}`;
  if (timeLeft <= 0) {
    wave++;
    waveDisplay.textContent = `Wave: ${wave}`;
    timeLeft = 30;
    if (mode === 'game') {
      words.forEach(word => word.speed += 0.5);
    }
  }
  setTimeout(updateTimer, 1000);
}

function handleInput(e) {
  const typed = e.target.value.trim().toLowerCase();
  words = words.filter(word => {
    if (word.term.toLowerCase() === typed) {
      score += word.term.length;
      correctChars += word.term.length;
      totalChars += word.term.length;
      scoreDisplay.textContent = `Score: ${score}`;
      e.target.value = '';
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

function generateCertificate() {
  const name = prompt('Enter your name for the certificate:');
  if (!name) return;
  const wpm = calculateWPM();
  const accuracy = calculateAccuracy();
  const certificateContent = `
\\documentclass[a4paper,12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\geometry{margin=1in}
\\usepackage{titling}
\\usepackage{noto}

\\title{Typing Trainer Certificate}
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
  \\Large{\\textbf{${name}}}
  \\vspace{0.5cm}
  \\normalsize{has successfully completed a session in Typing Trainer with the following results:}
  \\vspace{1cm}
  \\begin{tabular}{ll}
    Typing Speed: & ${wpm} WPM \\\\
    Accuracy: & ${accuracy}\\% \\\\
    Wave Reached: & ${wave} \\\\
    Total Time: & ${totalTime} seconds \\\\
    Missed Terms: & ${missedWords.length > 0 ? missedWords.join(', ') : 'None'} \\\\
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
}

function startGame() {
  if (vocabData.length === 0) {
    alert('No vocabulary loaded. Please restart and provide a valid CSV.');
    return;
  }
  gameActive = true;
  userInput.focus();
  userInput.addEventListener('input', handleInput);
  document.addEventListener('keydown', highlightKeys);
  document.addEventListener('keyup', () => {
    document.querySelectorAll('.key').forEach(key => key.classList.remove('pressed'));
  });
  certificateButton.addEventListener('click', generateCertificate);
  spawnWord();
  updateGame();
  updateTimer();
}

startButton.addEventListener('click', () => {
  level = Math.max(1, Math.min(10, parseInt(levelInput.value)));
  mode = modeSelect.value;
  const csvUrl = csvInput.value.trim();
  loadVocab(csvUrl);
  setTimeout(() => {
    startScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    startGame();
  }, 1000);
});