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
const certificateButton = document.getElementById('certificateButton');

canvas.width = 800;
canvas.height = 400;

let words = [];
let wordData = {};
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
let lastWordX = 0;

const categories = ['twoLetter', 'threeLetter', 'fourLetter', 'fiveLetter', 'sixLetter', 'sevenLetter', 'hyphenated', 'combo'];

function loadWords() {
  Papa.parse('words.csv', {
    download: true,
    header: true,
    complete: function(results) {
      wordData = results.data.reduce((acc, row) => {
        categories.forEach(cat => {
          if (row[cat]) {
            acc[cat] = acc[cat] || [];
            acc[cat].push(row[cat]);
          }
        });
        return acc;
      }, {});
    }
  });
}

function getRandomWord() {
  const cat = categories[Math.floor(Math.random() * categories.length)];
  const wordList = wordData[cat] || wordData.twoLetter;
  return wordList[Math.floor(Math.random() * wordList.length)];
}

function spawnWord() {
  const word = getRandomWord();
  let x, y, speed, dx;
  if (mode === 'game') {
    x = Math.random() * (canvas.width - ctx.measureText(word).width);
    y = 0;
    speed = 1 + wave * 0.5 * (level / 5);
    dx = 0;
  } else {
    x = lastWordX;
    y = 50;
    speed = 0;
    dx = 1 + level * 0.2;
    if (x + ctx.measureText(word).width > canvas.width) {
      x = 0;
      y += 50;
    }
    lastWordX = x + ctx.measureText(word).width + 20;
  }
  words.push({ text: word, x, y, speed, dx, matched: '' });
}

function updateGame() {
  if (!gameActive) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '20px Arial';

  words = words.filter(word => mode === 'game' ? word.y < canvas.height : true);
  words.forEach(word => {
    if (mode === 'game') {
      word.y += word.speed;
    } else {
      word.x += word.dx;
      if (word.x > canvas.width) {
        missedWords.push(word.text);
        totalChars += word.text.length;
        return false;
      }
    }
    const typed = userInput.value.trim().toLowerCase();
    word.matched = word.text.toLowerCase().startsWith(typed) ? typed : '';
    ctx.fillStyle = 'red';
    ctx.fillText(word.text.slice(0, word.matched.length), word.x, word.y);
    ctx.fillStyle = 'white';
    ctx.fillText(word.text.slice(word.matched.length), word.x + ctx.measureText(word.text.slice(0, word.matched.length)).width, word.y);
    if (mode === 'game' && word.y >= canvas.height) {
      gameActive = false;
      missedWords.push(word.text);
      totalChars += word.text.length;
      alert(`Game Over! Score: ${score}, WPM: ${calculateWPM()}, Accuracy: ${calculateAccuracy()}%`);
    }
  });

  if (mode === 'game' && Math.random() < 0.02 * wave * (level / 5)) spawnWord();
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
    } else {
      words = [];
      lastWordX = 0;
      spawnWord();
    }
  }
  setTimeout(updateTimer, 1000);
}

function handleInput(e) {
  const typed = e.target.value.trim().toLowerCase();
  words = words.filter(word => {
    if (word.text.toLowerCase() === typed) {
      score += word.text.length;
      correctChars += word.text.length;
      totalChars += word.text.length;
      scoreDisplay.textContent = `Score: ${score}`;
      e.target.value = '';
      if (mode === 'training') {
        lastWordX = word.x + ctx.measureText(word.text).width + 20;
        spawnWord();
      }
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
    Missed Words: & ${missedWords.length > 0 ? missedWords.join(', ') : 'None'} \\\\
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
  startScreen.classList.add('hidden');
  gameContainer.classList.remove('hidden');
  startGame();
});

loadWords();