const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 400;

let words = [];
let wordData = {};
let score = 0;
let wave = 1;
let misses = 0;
let wordsTyped = 0;
let currentInput = '';
let waveTime = 30;
let lastTime = 0;
let gameOver = false;
let waveActive = true;
let waveStartTime = 0;

const MAX_MISSES = 5;
const BASE_SPEED = 0.5;
const SPEED_INCREMENT = 0.2;
const WORD_SPAWN_RATE = 2000; // ms

// Load CSV
fetch('words.csv')
    .then(response => response.text())
    .then(data => {
        Papa.parse(data, {
            header: true,
            complete: function(results) {
                wordData = results.data[0];
                startGame();
            }
        });
    });

function getRandomWord() {
    const categories = [
        'two_letter', 'three_letter', 'four_letter', 'five_letter',
        'six_letter', 'seven_letter', 'hyphenated', 'special'
    ];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const words = wordData[category].split(',').filter(w => w);
    return words[Math.floor(Math.random() * words.length)];
}

function addWord() {
    if (!waveActive) return;
    const word = getRandomWord();
    const x = Math.random() * (canvas.width - ctx.measureText(word).width);
    words.push({ text: word, x, y: 0, speed: BASE_SPEED + (wave - 1) * SPEED_INCREMENT });
}

function startWave() {
    waveActive = true;
    waveStartTime = performance.now();
    words = [];
    currentInput = '';
    addWord();
    setInterval(() => {
        if (waveActive && !gameOver) addWord();
    }, WORD_SPAWN_RATE);
}

function endWave() {
    waveActive = false;
    setTimeout(() => {
        wave++;
        waveTime = 30;
        startWave();
    }, 3000); // 3-second pause
}

function startGame() {
    startWave();
    requestAnimationFrame(gameLoop);
}

function gameLoop(time) {
    if (gameOver) return;

    const delta = (time - lastTime) / 1000;
    lastTime = time;

    if (waveActive) {
        waveTime -= delta;
        if (waveTime <= 0) {
            endWave();
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '20px Arial';

    words.forEach(word => {
        word.y += word.speed;
        ctx.fillText(word.text, word.x, word.y);
        if (word.y > canvas.height) {
            words = words.filter(w => w !== word);
            misses++;
            document.getElementById('misses').textContent = misses;
            if (misses >= MAX_MISSES) {
                endGame();
            }
        }
    });

    document.getElementById('score').textContent = score;
    document.getElementById('wave').textContent = wave;
    document.getElementById('timer').textContent = Math.max(0, Math.floor(waveTime));
    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameOver = true;
    document.getElementById('gameOver').classList.remove('hidden');
    document.getElementById('finalScore').textContent = score;
    document.getElementById('wordsTyped').textContent = wordsTyped;
}

document.getElementById('restart').addEventListener('click', () => {
    score = 0;
    wave = 1;
    misses = 0;
    wordsTyped = 0;
    waveTime = 30;
    gameOver = false;
    waveActive = true;
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('score').textContent = score;
    document.getElementById('wave').textContent = wave;
    document.getElementById('misses').textContent = misses;
    startWave();
});

document.addEventListener('keydown', (e) => {
    if (gameOver) return;

    const key = e.key.toLowerCase();
    const keyElement = document.querySelector(`.key[data-key="${key}"]`) || 
                      document.querySelector(`.key[data-key="${key === ' ' ? 'space' : key === 'enter' ? 'enter' : key}"]`);
    if (keyElement) {
        keyElement.classList.add('active');
        setTimeout(() => keyElement.classList.remove('active'), 100);
    }

    if (e.key === 'Backspace') {
        currentInput = currentInput.slice(0, -1);
    } else if (e.key.length === 1) {
        currentInput += e.key;
    }

    words.forEach(word => {
        if (currentInput.toLowerCase() === word.text.toLowerCase()) {
            words = words.filter(w => w !== word);
            score += word.text.length * 10;
            wordsTyped++;
            currentInput = '';
        }
    });
});

// Map keys to keyboard elements
document.querySelectorAll('.key').forEach(key => {
    const text = key.textContent.toLowerCase();
    key.setAttribute('data-key', text === 'space' ? 'space' : text === 'backspace' ? 'backspace' : text === 'tab' ? 'tab' : text === 'caps' ? 'caps' : text === 'enter' ? 'enter' : text === 'shift' ? 'shift' : text);
});