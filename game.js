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
                // Process row-based CSV into word arrays
                wordData = {
                    two_letter: [],
                    three_letter: [],
                    four_letter: [],
                    five_letter: [],
                    six_letter: [],
                    seven_letter: [],
                    hyphenated: [],
                    special: [],
                    sat_words: []
                };
                results.data.forEach(row => {
                    Object.keys(wordData).forEach(category => {
                        if (row[category] && row[category].trim()) {
                            wordData[category].push(row[category].trim());
                        }
                    });
                });
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
        'six_letter', 'seven_letter', 'hyphenated', 'special', 'sat_words'
    ];
    const longWordCategories = ['five_letter', 'six_letter', 'seven_letter', 'hyphenated', 'special', 'sat_words'];
    const shortWordCategories = ['two_letter', 'three_letter', 'four_letter'];
    
    // Calculate weights based on wave
    const maxWeightWave = 10;
    const waveFactor = Math.min(wave - 1, maxWeightWave - 1) / (maxWeightWave - 1); // 0 to 1
    const longWordWeight = 0.111 + waveFactor * (0.167 - 0.111); // 11.1% to 16.7%
    const shortWordWeight = 0.111 - waveFactor * (0.111 - 0.0556); // 11.1% to 5.56%
    
    const weights = categories.map(category => 
        longWordCategories.includes(category) ? longWordWeight : shortWordWeight
    );
    
    // Normalize weights to sum to 1
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const normalizedWeights = weights.map(w => w / totalWeight);
    
    // Choose category based on weights
    let rand = Math.random();
    let sum = 0;
    for (let i = 0; i < categories.length; i++) {
        sum += normalizedWeights[i];
        if (rand < sum) {
            const category = categories[i];
            const words = wordData[category].filter(w => w);
            if (words.length === 0) continue; // Skip empty categories
            return words[Math.floor(Math.random() * words.length)];
        }
    }
    
    // Fallback: Random non-empty category
    const nonEmptyCategories = categories.filter(cat => wordData[cat].length > 0);
    const category = nonEmptyCategories[Math.floor(Math.random() * nonEmptyCategories.length)];
    const words = wordData[category];
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
    // Trigger confetti
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00']
    });
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
hypenated
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
    totalKeystrokes =0;
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
    
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert('PDF generation failed. Please try again or screenshot the results.');
        return;
    }
    
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
    let y = 100;
    doc.text('Score:', 80, y);
    doc.text(`${score || 0}`, 130, y);
    y += 10;
    const waveLabel = gameMode === 'training' ? 'Stint Reached:' : 'Wave Reached:';
    doc.text(waveLabel, 80, y);
    doc.text(`${wave || 1}`, 130, y);
    y += 10;
    doc.text('Words Typed:', 80, y);
    doc.text(`${wordsTyped || 0}`, 130, y);
    y += 10;
    doc.text('Typing Speed:', 80, y);
    doc.text(`${wpm} WPM`, 130, y);
    y += 10;
    doc.text('Accuracy:', 80, y);
    doc.text(`${accuracy}%`, 130, y);
    y += 10;
    doc.text('Total Time:', 80, y);
    doc.text(`${(totalTime || 0).toFixed(2)} seconds`, 130, y);
    y += 10;
    doc.text('Missed Words:', 80, y);
    doc.text(`${misses || 0}`, 130, y);

    // Footer
    doc.text(`Issued on ${new Date().toLocaleDateString()}`, 105, y + 20, { align: 'center' });
    doc.line(80, y + 30, 130, y + 30);
    doc.text('Signature', 105, y + 35, { align: 'center' });

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
    key.setAttribute('data-key', 
        text === 'space' ? 'space' :
        text === 'backspace' ? 'backspace' :
        text === 'tab' ? 'tab' :
        text === 'caps' ? 'caps' :
        text === 'enter' ? 'enter' :
        text === 'shift' ? 'shift' : text
    );
});