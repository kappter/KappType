// --- Utility to load CSV ---
async function loadCSV(url) {
  const resp = await fetch(url);
  const text = await resp.text();
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  const words = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    let row = {};
    headers.forEach((h, idx) => row[h.trim()] = (cols[idx] || '').trim());
    words.push(row);
  }
  return { headers, words };
}

// --- Game State ---
let wordBank = {};
let fallingWords = [];
let currentWave = 1;
let waveTime = 30;
let gameStats = {
  name: '',
  speed: 0,
  accuracy: 0,
  wave: 1,
  totalTime: 0,
  missedWords: 0,
  score: 0
};
let activeWord = null;
let typed = '';
let timer = null;
let startTime = null;
let totalTyped = 0;
let totalCorrect = 0;

// --- Keyboard Layout ---
const keyboardLayout = [
  ['1','2','3','4','5','6','7','8','9','0'],
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['z','x','c','v','b','n','m','-']
];

// --- DOM Elements ---
const wordArea = document.getElementById('word-fall-area');
const keyboardDiv = document.getElementById('keyboard-visual');
const certBtn = document.getElementById('download-certificate');

// --- Keyboard Rendering ---
function createKeyboard() {
  keyboardDiv.innerHTML = '';
  keyboardLayout.forEach(row => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'keyboard-row';
    row.forEach(key => {
      const keyDiv = document.createElement('div');
      keyDiv.className = 'key';
      keyDiv.textContent = key;
      keyDiv.dataset.key = key;
      rowDiv.appendChild(keyDiv);
    });
    keyboardDiv.appendChild(rowDiv);
  });
}

function setKeyActive(key, active) {
  const el = keyboardDiv.querySelector(`.key[data-key="${key.toLowerCase()}"]`);
  if (el) el.classList.toggle('key-active', active);
}

// --- Falling Words Logic ---
function pickWord() {
  // Increase word length with wave
  let col;
  if (currentWave < 2) col = '2letter';
  else if (currentWave < 3) col = '3letter';
  else if (currentWave < 4) col = '4letter';
  else if (currentWave < 5) col = '5letter';
  else if (currentWave < 6) col = '6letter';
  else if (currentWave < 7) col = '7letter';
  else if (currentWave < 8) col = 'hyphenated';
  else col = 'combos';
  // Pick random word from that column
  const options = wordBank[col].filter(Boolean);
  return options[Math.floor(Math.random() * options.length)];
}

function spawnWord() {
  const word = pickWord();
  const wordDiv = document.createElement('div');
  wordDiv.className = 'word';
  wordDiv.style.left = `${Math.random() * 80 + 10}%`;
  wordDiv.style.top = `0px`;
  wordDiv.dataset.word = word;
  wordDiv.innerHTML = '';
  for (let i = 0; i < word.length; i++) {
    const span = document.createElement('span');
    span.textContent = word[i];
    wordDiv.appendChild(span);
  }
  wordArea.appendChild(wordDiv);
  fallingWords.push({div: wordDiv, word, y: 0, matched: 0});
  if (!activeWord) {
    activeWord = fallingWords[0];
    highlightActiveWord();
  }
}

function highlightActiveWord() {
  fallingWords.forEach(fw => fw.div.classList.remove('active-word'));
  if (activeWord) activeWord.div.classList.add('active-word');
}

function updateFallingWords(speed) {
  for (let fw of fallingWords) {
    fw.y += speed;
    fw.div.style.top = `${fw.y}px`;
    if (fw.y > wordArea.offsetHeight - 40) {
      // Missed word
      wordArea.removeChild(fw.div);
      if (fw === activeWord) {
        activeWord = fallingWords[1] || null;
        typed = '';
        highlightActiveWord();
      }
      gameStats.missedWords++;
    }
  }
  fallingWords = fallingWords.filter(fw => fw.y <= wordArea.offsetHeight - 40);
  if (fallingWords.length === 0) {
    activeWord = null;
    typed = '';
  }
}

// --- Typing Logic ---
document.addEventListener('keydown', e => {
  if (!activeWord) return;
  if (e.key.length === 1) {
    setKeyActive(e.key, true);
    totalTyped++;
    const word = activeWord.word;
    if (word[typed.length] === e.key) {
      typed += e.key;
      totalCorrect++;
      // Update coloring
      const spans = activeWord.div.querySelectorAll('span');
      spans.forEach((s, i) => {
        if (i < typed.length) s.classList.add('letter-correct');
        else s.classList.remove('letter-correct');
      });
      if (typed === word) {
        // Word complete
        wordArea.removeChild(activeWord.div);
        fallingWords = fallingWords.filter(fw => fw !== activeWord);
        activeWord = fallingWords[0] || null;
        typed = '';
        highlightActiveWord();
        gameStats.score += 10 * currentWave;
      }
    }
  }
});

document.addEventListener('keyup', e => {
  if (e.key.length === 1) setKeyActive(e.key, false);
});

// --- Game Loop ---
function startWave() {
  let speed = 1 + currentWave * 0.5;
  let wordInterval = 1500 - currentWave * 100;
  if (wordInterval < 400) wordInterval = 400;
  let elapsed = 0;
  spawnWord();
  timer = setInterval(() => {
    updateFallingWords(speed);
    elapsed += 50;
    if (elapsed % wordInterval < 50) spawnWord();
    if (elapsed >= waveTime * 1000) {
      clearInterval(timer);
      currentWave++;
      gameStats.wave = currentWave;
      if (currentWave <= 8) {
        setTimeout(startWave, 1000);
      } else {
        endGame();
      }
    }
  }, 50);
}

function endGame() {
  gameStats.totalTime = Math.round((Date.now() - startTime) / 1000);
  gameStats.speed = Math.round((totalCorrect / gameStats.totalTime) * 60);
  gameStats.accuracy = totalTyped ? Math.round((totalCorrect / totalTyped) * 100) : 0;
  alert(`Game Over! Score: ${gameStats.score}`);
}

// --- Certificate Generation ---
certBtn.onclick = () => {
  if (!gameStats.name) {
    gameStats.name = prompt('Enter your name for the certificate:') || 'Anonymous';
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.text('Typing Master Pro Certificate', 20, 20);
  doc.setFontSize(12);
  doc.text(`Name: ${gameStats.name}`, 20, 40);
  doc.text(`Speed: ${gameStats.speed} WPM`, 20, 50);
  doc.text(`Accuracy: ${gameStats.accuracy}%`, 20, 60);
  doc.text(`Wave: ${gameStats.wave}`, 20, 70);
  doc.text(`Total Time: ${gameStats.totalTime} seconds`, 20, 80);
  doc.text(`Missed Words: ${gameStats.missedWords}`, 20, 90);
  doc.text(`Score: ${gameStats.score}`, 20, 100);
  doc.save('typing_certificate.pdf');
};

// --- Initialization ---
async function init() {
  createKeyboard();
  const { headers, words } = await loadCSV('words.csv');
  // Build wordBank
  wordBank = {};
  headers.forEach(h => wordBank[h] = []);
  words.forEach(row => {
    headers.forEach(h => {
      if (row[h]) wordBank[h].push(row[h]);
    });
  });
  startTime = Date.now();
  startWave();
}
init();
