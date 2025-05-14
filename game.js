const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 100;

let terms = [];
let currentTerm = null;
let currentDefinition = '';
let currentInput = '';
let typedFirstLetter = false;
let termComplete = false;

function loadVocabulary() {
    fetch('vocabulary.csv')
        .then(response => response.text())
        .then(data => {
            Papa.parse(data, {
                header: true,
                skipEmptyLines: true,
                complete: function(results) {
                    terms = results.data.map(row => ({
                        term: row.term.trim(),
                        definition: row.definition.trim()
                    }));
                    document.getElementById('startGame').addEventListener('click', () => {
                        document.getElementById('startScreen').classList.add('hidden');
                        document.querySelector('.game-container').classList.remove('hidden');
                        startGame();
                    });
                }
            });
        });
}

function getRandomTerm() {
    return terms[Math.floor(Math.random() * terms.length)];
}

function startGame() {
    currentInput = '';
    typedFirstLetter = false;
    termComplete = false;
    document.getElementById('nextTerm').classList.add('hidden');
    selectNewTerm();
    canvas.focus();
    requestAnimationFrame(gameLoop);
}

function selectNewTerm() {
    const termData = getRandomTerm();
    currentTerm = termData.term;
    currentDefinition = termData.definition;
    document.getElementById('definition').textContent = currentDefinition;
    updateTermDisplay();
}

function updateTermDisplay() {
    if (!typedFirstLetter) {
        document.getElementById('termDisplay').textContent = '_ '.repeat(currentTerm.length).trim();
    } else {
        document.getElementById('termDisplay').textContent = currentTerm;
        document.getElementById('termDisplay').style.color = 'lightgray';
    }
    document.getElementById('typedInput').textContent = currentInput;
}

function drawTerm() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let x = canvas.width / 2;
    let y = canvas.height / 2;

    for (let i = 0; i < currentTerm.length; i++) {
        ctx.fillStyle = (i < currentInput.length && currentInput[i].toLowerCase() === currentTerm[i].toLowerCase()) ? 'red' : 'black';
        ctx.fillText(typedFirstLetter ? currentTerm[i] : '_', x + (i - currentTerm.length / 2) * 15, y);
    }
}

function gameLoop() {
    if (termComplete) {
        document.getElementById('nextTerm').classList.remove('hidden');
        return;
    }
    drawTerm();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    if (termComplete || e.key === 'Enter') return;

    if (e.key === 'Backspace') {
        if (typedFirstLetter && currentInput.length > 0) {
            currentInput = currentInput.slice(0, -1);
        }
    } else if (/^[a-zA-Z0-9\-']$/.test(e.key)) {
        if (!typedFirstLetter) {
            typedFirstLetter = true;
            currentInput = e.key;
        } else {
            currentInput += e.key;
        }
    }

    updateTermDisplay();

    if (currentInput.toLowerCase() === currentTerm.toLowerCase()) {
        termComplete = true;
        document.getElementById('termDisplay').style.color = 'black';
        document.getElementById('typedInput').textContent = 'Correct!';
    }
});

document.getElementById('nextTerm').addEventListener('click', startGame);

loadVocabulary();