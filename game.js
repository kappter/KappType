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
let totalTime = 0;
let correctKeystrokes = 0;
let totalKeystrokes = 0;
let gameStartTime = 0;
let experienceLevel = 1;
let gameMode = 'arcade';
let deviceType = 'desktop';
let BASE_SPEED = 0.3;
let WORD_SPAWN_RATE = 3000;
let lastWordX = 10;

const MAX_MISSES = 5;
const SPEED_INCREMENT = 0.2;
const BASE_FONT_SIZE = 20;
const MAX_FONT_SIZE = 24;
const SPEED_INCREASE_RATE = 0.01;
const MAX_SPEED_INCREASE = 0.3;

// Load CSV
fetch('words.csv')
    .then(response => response.text())
    .then(data => {
        Papa.parse(data, {
            header: true,
            complete: function(results) {
                wordData = results.data[0];
                document.getElementById('startGame').addEventListener('click', () => {
                    deviceType = document.getElementById('deviceType').value;
                    gameMode = document.getElementById('gameMode').value;
                    experienceLevel = parseInt(document.getElementById('experienceLevel').value);
                    BASE_SPEED = gameMode === 'training' ? 0.2 + (experienceLevel - 1) * 0.03 : 0.3 + (experienceLevel - 1) * 0.04;
                    WORD_SPAWN_RATE = 3000 - (experienceLevel - 1) * 222;
                    canvas.height = deviceType === 'tablet' ? 300 : 400;
                    document.getElementById('startScreen').classList.add('hidden');
                    document.querySelector('.game-container').classList.remove('hidden');
                    document.getElementById('waveLabel').textContent = gameMode === 'training' ? 'Stint' : 'Wave';
                    document.querySelector('.keyboard').classList.toggle('hidden', deviceType === 'tablet');
                    document.querySelector('.info').classList.toggle('hidden', deviceType === 'tablet');
                    canvas.focus();
                    startGame();
                });
            }
        });
    });

function getBackgroundColor(wave) {
    const maxWaves = 10;
    const lightness = 90 - Math.min(wave - 1, maxWaves - 1) * 7;
    return `hsl(200, 70%, ${lightness}%)`;
}

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
    ctx.font = `${BASE_FONT_SIZE}px Arial`;
    let x = lastWordX;
    const wordWidth = ctx.measureText(word).width;
    if (gameMode === 'training') {
        if (x + wordWidth > canvas.width) {
            x = 10;
        }
        words.push({ text: word, x, y: 0, speed: BASE_SPEED, fontSize: BASE_FONT_SIZE });
        lastWordX = x + wordWidth + 10;
    } else {
        x = Math.random() * (canvas.width - wordWidth);
        words.push({ text: word, x, y: 0, speed: BASE_SPEED + (wave - 1) * SPEED_INCREMENT, fontSize: BASE_FONT_SIZE });
        lastWordX = x + wordWidth + 10;
    }
}

function startWave() {
    waveActive = true;
    waveStartTime = performance.now();
    words = [];
    lastWordX = 10;
    currentInput = '';
    document.body.style.backgroundColor = getBackgroundColor(wave);
    addWord();
    if (gameMode === 'arcade') {
        setInterval(() => {
            if (waveActive && !gameOver) addWord();
        }, WORD_SPAWN_RATE);
    }
}

function endWave() {
    waveActive = false;
    setTimeout(() => {
        wave++;
        waveTime = 30;
        startWave();
    }, 3000);
}

function startGame() {
    gameStartTime = performance.now();
    startWave();
    requestAnimationFrame(gameLoop);
}

function drawWord(wordObj) {
    const word = wordObj.text;
    let matchedLength = 0;
    if (currentInput.toLowerCase().startsWith(word.toLowerCase().slice(0, currentInput.length))) {
        matchedLength = currentInput.length;
    }
    
    ctx.font = `${wordObj.fontSize}px Arial`;
    let x = wordObj.x;
    for (let i = 0; i < word.length; i++) {
        ctx.fillStyle = i < matchedLength ? 'red' : 'black';
        ctx.fillText(word[i], x, wordObj.y);
        x += ctx.measureText(word[i]).width;
    }
}

function gameLoop(time) {
    if (gameOver) return;

    const delta = (time - lastTime) / 1000;
    lastTime = time;
    totalTime = (time - gameStartTime) / 1000;

    if (waveActive) {
        waveTime -= delta;
        if (waveTime <= 0) {
            endWave();
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (deviceType === 'tablet') {
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, 30);
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText(`Score: ${score}`, 10, 20);
        ctx.fillText(`${gameMode === 'training' ? 'Stint' : 'Wave'}: ${wave}`, 150, 20);
        ctx.fillText(`Time: ${Math.max(0, Math.floor(waveTime))}s`, 300, 20);
        ctx.fillText(`Misses: ${misses}`, 450, 20);
    }

    const stintElapsed = (time - waveStartTime) / 1000;
    words.forEach(word => {
        if (gameMode === 'training') {
            word.speed = Math.min(BASE_SPEED + SPEED_INCREASE_RATE * stintElapsed, BASE_SPEED + MAX_SPEED_INCREASE);
        }
        word.y += word.speed;
        word.fontSize = BASE_FONT_SIZE + (word.y / canvas.height) * (MAX_FONT_SIZE - BASE_FONT_SIZE);
        drawWord(word);
        if (word.y > canvas.height) {
            words = words.filter(w => w !== word);
            misses++;
            document.getElementById('misses').textContent = misses;
            if (misses >= MAX_MISSES) {
                endGame();
            }
            if (gameMode === 'training' && words.length === 0) {
                addWord();
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
    totalTime = (performance.now() - gameStartTime) / 1000;
    const wpm = wordsTyped > 0 ? (wordsTyped / (totalTime / 60)).toFixed(2) : 0;
    document.getElementById('gameOver').classList.remove('hidden');
    document.getElementById('finalScore').textContent = score;
    document.getElementById('wordsTyped').textContent = wordsTyped;
    document.getElementById('wpm').textContent = wpm;
}

document.getElementById('restart').addEventListener('click', () => {
    score = 0;
    wave = 1;
    misses = 0;
    wordsTyped = 0;
    waveTime = 30;
    totalTime = 0;
    correctKeystrokes = 0;
    totalKeystrokes = 0;
    gameOver = false;
    waveActive = true;
    gameStartTime = 0;
    lastWordX = 10;
    document.getElementById('gameOver').classList.add('hidden');
    document.querySelector('.game-container').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
    document.querySelector('.keyboard').classList.remove('hidden');
    document.querySelector('.info').classList.remove('hidden');
    document.body.style.backgroundColor = '';
});

document.getElementById('downloadCertificate').addEventListener('click', () => {
    const playerName = document.getElementById('playerName').value || 'Player';
    const wpm = wordsTyped > 0 ? (wordsTyped / (totalTime / 60)).toFixed(2) : 0;
    const accuracy = totalKeystrokes > 0 ? ((correctKeystrokes / totalKeystrokes) * 100).toFixed(2) : 100;
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Set fonts and sizes
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('Certificate of Achievement', 105, 20, { align: 'center' });

    doc.setFontSize(18);
    doc.text('Typing Tempest', 105, 35, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text(`${gameMode.charAt(0).toUpperCase() + gameMode.slice(1)} Mode`, 105, 45, { align: 'center' });

    doc.text('Awarded to', 105, 60, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(playerName, 105, 70, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text('for outstanding performance in typing.', 105, 80, { align: 'center' });

    // Stats table
    doc.setFontSize(12);
    const stats = [
        `Score: ${score}`,
        `${gameMode === 'training' ? 'Stint Reached' : 'Wave Reached'}: ${wave}`,
        `Words Typed: ${wordsTyped}`,
        `Typing Speed: ${wpm} WPM`,
        `Accuracy: ${accuracy}%`,
        `Total Time: ${totalTime.toFixed(2)} seconds`,
        `Missed Words: ${misses}`
    ];
    let y = 100;
    stats.forEach(stat => {
        doc.text(stat, 105, y, { align: 'center' });
        y += 10;
    });

    // Footer
    doc.text(`Issued on ${new Date().toLocaleDateString()}`, 105, y + 20, { align: 'center' });
    doc.line(80, y + 30, 130, y + 30); // Signature line
    doc.text('Signature', 105, y + 35, { align: 'center' });

    // Save PDF
    doc.save(`${playerName}_TypingTempest_Certificate.pdf`);
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

    totalKeystrokes++;
    if (e.key === 'Backspace') {
        currentInput = currentInput.slice(0, -1);
    } else if (e.key.length === 1) {
        currentInput += e.key;
        const activeWord = words.find(w => w.text.toLowerCase().startsWith(currentInput.toLowerCase()));
        if (activeWord) correctKeystrokes++;
    }

    words.forEach(word => {
        if (currentInput.toLowerCase() === word.text.toLowerCase()) {
            words = words.filter(w => w !== word);
            score += word.text.length * 10;
            wordsTyped++;
            currentInput = '';
            if (gameMode === 'training') {
                addWord();
            }
        }
    });
});

// Map keys to keyboard elements
document.querySelectorAll('.key').forEach(key => {
    const text = key.textContent.toLowerCase();
    key.setAttribute('data-key', text === 'space' ? 'space' : text === 'backspace' ? 'backspace' : text === 'tab' : 'tab' : text === 'caps' ? 'caps' : text === 'enter' ? 'enter' : text === 'shift' ? 'shift' : text);
});