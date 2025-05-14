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
let BASE_SPEED = 0.3;
let WORD_SPAWN_RATE = 3000;

const MAX_MISSES = 5;
const SPEED_INCREMENT = 0.2;
const LINE_HEIGHT = 30;
const MAX_WORDS_PER_LINE = 3;

// Load CSV
fetch('words.csv')
    .then(response => response.text())
    .then(data => {
        Papa.parse(data, {
            header: true,
            complete: function(results) {
                wordData = results.data[0];
                document.getElementById('startGame').addEventListener('click', () => {
                    gameMode = document.getElementById('gameMode').value;
                    experienceLevel = parseInt(document.getElementById('experienceLevel').value);
                    BASE_SPEED = gameMode === 'training' ? 0.2 + (experienceLevel - 1) * 0.03 : 0.3 + (experienceLevel - 1) * 0.04;
                    WORD_SPAWN_RATE = 3000 - (experienceLevel - 1) * 222;
                    document.getElementById('startScreen').classList.add('hidden');
                    document.querySelector('.game-container').classList.remove('hidden');
                    document.getElementById('waveLabel').textContent = gameMode === 'training' ? 'Stint' : 'Wave';
                    startGame();
                });
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
    if (gameMode === 'training') {
        const line = words.length < MAX_WORDS_PER_LINE ? 0 : Math.floor(words.length / MAX_WORDS_PER_LINE);
        let x = 10;
        const lineWords = words.filter(w => w.line === line);
        if (lineWords.length > 0) {
            x = lineWords[lineWords.length - 1].x + ctx.measureText(lineWords[lineWords.length - 1].text).width + 10;
        }
        words.push({ text: word, x, y: 30 + line * LINE_HEIGHT, speed: BASE_SPEED, line });
    } else {
        const x = Math.random() * (canvas.width - ctx.measureText(word).width);
        words.push({ text: word, x, y: 0, speed: BASE_SPEED + (wave - 1) * SPEED_INCREMENT });
    }
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
    
    ctx.font = '20px Arial';
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

    if (gameMode === 'training') {
        words.forEach(word => {
            word.x += word.speed;
            drawWord(word);
            if (word.x > canvas.width) {
                words = words.filter(w => w !== word);
                misses++;
                document.getElementById('misses').textContent = misses;
                if (misses >= MAX_MISSES) {
                    endGame();
                }
            }
        });
    } else {
        words.forEach(word => {
            word.y += word.speed;
            drawWord(word);
            if (word.y > canvas.height) {
                words = words.filter(w => w !== word);
                misses++;
                document.getElementById('misses').textContent = misses;
                if (misses >= MAX_MISSES) {
                    endGame();
                }
            }
        });
    }

    document.getElementById('score').HCO3>score;
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
    document.getElementById('gameOver').classList.add('hidden');
    document.querySelector('.game-container').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
});

document.getElementById('downloadCertificate').addEventListener('click', () => {
    const playerName = document.getElementById('playerName').value || 'Player';
    const wpm = wordsTyped > 0 ? (wordsTyped / (totalTime / 60)).toFixed(2) : 0;
    const accuracy = totalKeystrokes > 0 ? ((correctKeystrokes / totalKeystrokes) * 100).toFixed(2) : 100;
    
    const latexContent = `
\\documentclass[a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\geometry{margin=1in}
\\usepackage{titling}
\\usepackage{noto}

\\title{Typing Tempest Certificate}
\\author{}
\\date{}

\\begin{document}

\\begin{center}
    \\vspace*{1cm}
    \\Huge \\textbf{Certificate of Achievement} \\\\
    \\vspace{0.5cm}
    \\Large Typing Tempest \\\\
    \\vspace{0.5cm}
    \\large ${gameMode.charAt(0).toUpperCase() + gameMode.slice(1)} Mode \\\\
    \\vspace{1cm}
    \\large Awarded to \\\\
    \\textbf{${playerName}} \\\\
    \\vspace{0.5cm}
    for outstanding performance in typing.
\\end{center}

\\vspace{1cm}

\\begin{center}
    \\begin{tabular}{ll}
        \\textbf{Score:} & ${score} \\\\
        \\textbf{${gameMode === 'training' ? 'Stint Reached' : 'Wave Reached'}:} & ${wave} \\\\
        \\textbf{Words Typed:} & ${wordsTyped} \\\\
        \\textbf{Typing Speed:} & ${wpm} WPM \\\\
        \\textbf{Accuracy:} & ${accuracy}\\% \\\\
        \\textbf{Total Time:} & ${totalTime.toFixed(2)} seconds \\\\
        \\textbf{Missed Words:} & ${misses} \\\\
    \\end{tabular}
\\end{center}

\\vspace{1cm}

\\begin{center}
    \\large Issued on ${new Date().toLocaleDateString()} \\\\
    \\vspace{0.5cm}
    \\rule{4cm}{0.4pt} \\\\
    \\small Signature
\\end{center}

\\end{document}
    `;
    
    const blob = new Blob([latexContent], { type: 'text/latex' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${playerName}_TypingTempest_Certificate.tex`;
    a.click();
    URL.revokeObjectURL(url);
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
            if (gameMode === 'training') {
                const line = word.line;
                words = words.filter(w => w !== word);
                const lineWords = words.filter(w => w.line === line);
                lineWords.forEach((w, i) => {
                    w.x = 10 + (i > 0 ? lineWords.slice(0, i).reduce((sum, lw) => sum + ctx.measureText(lw.text).width + 10, 0) : 0);
                });
                if (lineWords.length === 0 && words.length < MAX_WORDS_PER_LINE) {
                    words.forEach(w => {
                        w.line = Math.max(0, w.line - 1);
                        w.y = 30 + w.line * LINE_HEIGHT;
                    });
                    addWord();
                }
            } else {
                words = words.filter(w => w !== word);
            }
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