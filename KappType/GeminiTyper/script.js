const gameArea = document.querySelector('.game-area');
const typingInput = document.getElementById('typing-input');
const scoreDisplay = document.getElementById('score');
const waveTimerDisplay = document.getElementById('wave-timer');
const keyboardContainer = document.querySelector('.keyboard-container');
const downloadCertificateBtn = document.getElementById('download-certificate');

let wordsData = {};
let currentWords = [];
let score = 0;
let waveNumber = 1;
let waveDuration = 30;
let timeLeft = waveDuration;
let gameInterval;
let waveInterval;
let wordFallSpeed = 1; // Base speed
let speedIncreaseRate = 0.1; // How much the speed increases per wave
let startTime;
let endTime;
let missedWords = 0;

const keyboardLayout = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
];

function loadWords() {
    fetch('words.csv')
        .then(response => response.text())
        .then(csvData => {
            const lines = csvData.trim().split('\n');
            const headers = lines[0].split(',');
            wordsData = headers.reduce((acc, header) => ({ ...acc, [header.trim()]: [] }), {});

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',');
                headers.forEach((header, index) => {
                    if (values[index] && values[index].trim() !== '') {
                        wordsData[header.trim()].push(values[index].trim());
                    }
                });
            }
            startNewWave();
        });
}

function getRandomWord() {
    const wordLengths = Object.keys(wordsData).filter(key => wordsData[key].length > 0);
    if (wordLengths.length === 0) return null;

    const randomLengthCategory = wordLengths[Math.floor(Math.random() * wordLengths.length)];
    const randomIndex = Math.floor(Math.random() * wordsData[randomLengthCategory].length);
    return wordsData[randomLengthCategory][randomIndex];
}

function createFallingWord() {
    const wordText = getRandomWord();
    if (!wordText) return;

    const wordElement = document.createElement('div');
    wordElement.classList.add('word');
    wordElement.innerHTML = wordText.split('').map(char => `<span>${char}</span>`).join('');
    const startPosition = Math.random() * (gameArea.offsetWidth - wordElement.offsetWidth);
    wordElement.style.left = `${startPosition}px`;
    gameArea.appendChild(wordElement);

    let topPosition = -30;
    const fallInterval = setInterval(() => {
        topPosition += wordFallSpeed;
        wordElement.style.top = `${topPosition}px`;

        if (topPosition > gameArea.offsetHeight) {
            clearInterval(fallInterval);
            wordElement.remove();
            missedWords++;
        } else if (wordElement.dataset.typed === 'true') {
            clearInterval(fallInterval);
            wordElement.remove();
        }
    }, 20); // Adjust for smoother animation if needed

    currentWords.push({ element: wordElement, text: wordText, interval: fallInterval });
}

function checkWord() {
    const typedText = typingInput.value.trim();

    currentWords.forEach(wordObj => {
        if (wordObj.text.startsWith(typedText) && wordObj.element.dataset.typed !== 'true') {
            const wordSpans = wordObj.element.querySelectorAll('span');
            typedText.split('').forEach((char, index) => {
                if (wordSpans[index] && char === wordObj.text[index].toLowerCase()) {
                    wordSpans[index].classList.add('typed');
                }
            });
        }
        if (wordObj.text === typedText && wordObj.element.dataset.typed !== 'true') {
            score++;
            scoreDisplay.textContent = `Score: ${score}`;
            wordObj.element.dataset.typed = 'true'; // Mark as typed
            typingInput.value = '';
        }
    });
}

function updateTimer() {
    timeLeft--;
    waveTimerDisplay.textContent = `Wave ends in: ${timeLeft}`;
    if (timeLeft <= 0) {
        clearInterval(gameInterval);
        endWave();
    }
}

function startNewWave() {
    if (waveNumber === 1) {
        startTime = new Date();
        missedWords = 0;
    }

    currentWords.forEach(wordObj => {
        clearInterval(wordObj.interval);
        wordObj.element.remove();
    });
    currentWords = [];
    timeLeft = waveDuration;
    waveTimerDisplay.textContent = `Wave ends in: ${timeLeft}`;
    wordFallSpeed += speedIncreaseRate; // Increase speed for the new wave

    gameInterval = setInterval(() => {
        createFallingWord();
        if (Math.random() < 0.3 + (waveNumber * 0.02)) { // Increase word frequency over time
            createFallingWord();
        }
    }, 1000 / (1 + (waveNumber * 0.1))); // Adjust word generation frequency

    waveInterval = setInterval(updateTimer, 1000);
}

function endWave() {
    clearInterval(waveInterval);
    alert(`Wave ${waveNumber} ended! Score: ${score}`);
    waveNumber++;
    setTimeout(startNewWave, 2000); // Start the next wave after a short delay
}

function renderKeyboard() {
    keyboardLayout.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.style.display = 'flex';
        rowDiv.style.gap = '3px';
        rowDiv.style.marginBottom = '3px';
        keyboardContainer.appendChild(rowDiv);
        row.forEach(keyChar => {
            const keyDiv = document.createElement('div');
            keyDiv.classList.add('key');
            keyDiv.textContent = keyChar;
            keyDiv.dataset.key = keyChar;
            rowDiv.appendChild(keyDiv);
        });
    });
}

function handleKeyPress(event) {
    const pressedKey = event.key.toLowerCase();
    const keyElement = document.querySelector(`.key[data-key="${pressedKey}"]`);
    if (keyElement) {
        keyElement.classList.add('active');
        setTimeout(() => {
            keyElement.classList.remove('active');
        }, 100); // Briefly highlight the key
    }
}

function downloadCertificate() {
    const userName = prompt("Enter your name for the certificate:");
    if (userName) {
        endTime = new Date();
        const totalTimeSeconds = Math.round((endTime - startTime) / 1000);
        const accuracy = score > 0 ? Math.round((score / (score + missedWords)) * 100) : 0;

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        pdf.setFontSize(24);
        pdf.text("Typing Certificate", 105, 30, null, null, "center");

        pdf.setFontSize(16);
        pdf.text(`This certificate is awarded to:`, 105, 50, null, null, "center");

        pdf.setFontSize(20);
        pdf.text(userName, 105, 65, null, null, "center");

        pdf.setFontSize(16);
        pdf.text(`for completing ${waveNumber - 1} waves of the Falling Words typing game.`, 105, 80, null, null, "center");

        pdf.setFontSize(14);
        pdf.text(`Score: ${score}`, 20, 100);
        pdf.text(`Accuracy: ${accuracy}%`, 20, 115);
        pdf.text(`Total Time: ${formatTime(totalTimeSeconds)}`, 20, 130);
        pdf.text(`Missed Words: ${missedWords}`, 20, 145);
        pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 160);

        pdf.save(`${userName}_typing_certificate.pdf`);
    }
}

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Event listeners
typingInput.addEventListener('input', checkWord);
document.addEventListener('keydown', handleKeyPress);
downloadCertificateBtn.addEventListener('click', downloadCertificate);

// Initialize the game
renderKeyboard();
loadWords();
typingInput.focus(); // Keep focus on the input field