const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const userInput = document.getElementById('userInput');
const scoreDisplay = document.getElementById('score');
const waveDisplay = document.getElementById('wave');
const timerDisplay = document.getElementById('timer');

canvas.width = 800;
canvas.height = 600;

let words = [];
let wordData = {};
let score = 0;
let wave = 1;
let timeLeft = 30;
let gameActive = true;

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
      startGame();
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
  const x = Math.random() * (canvas.width - ctx.measureText(word).width);
  words.push({ text: word, x, y: 0, speed: 1 + wave * 0.5 });
}

function updateGame() {
  if (!gameActive) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '20px Arial';
  ctx.fillStyle = 'white';

  words = words.filter(word => word.y < canvas.height);
  words.forEach(word => {
    word.y += word.speed;
    ctx.fillText(word.text, word.x, word.y);
    if (word.y >= canvas.height) {
      gameActive = false;
      alert('Game Over! Final Score: ' + score);
    }
  });

  if (Math.random() < 0.02 * wave) spawnWord();
  requestAnimationFrame(updateGame);
}

function updateTimer() {
  if (!gameActive) return;
  timeLeft -= 1;
  timerDisplay.textContent = `Time: ${timeLeft}s`;
  if (timeLeft <= 0) {
    wave++;
    waveDisplay.textContent = `Wave: ${wave}`;
    timeLeft = 30;
    words.forEach(word => word.speed += 0.5);
  }
  setTimeout(updateTimer, 1000);
}

function handleInput(e) {
  const typed = e.target.value.trim().toLowerCase();
  words = words.filter(word => {
    if (word.text.toLowerCase() === typed) {
      score += word.text.length;
      scoreDisplay.textContent = `Score: ${score}`;
      e.target.value = '';
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

function startGame() {
  userInput.focus();
  userInput.addEventListener('input', handleInput);
  document.addEventListener('keydown', highlightKeys);
  document.addEventListener('keyup', () => {
    document.querySelectorAll('.key').forEach(key => key.classList.remove('pressed'));
  });
  setInterval(spawnWord, 2000 / wave);
  updateGame();
  updateTimer();
}

loadWords();