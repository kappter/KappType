const gameArea = document.querySelector('.game-area');
const typingInput = document.getElementById('typing-input');
const scoreDisplay = document.getElementById('score');
const waveTimerDisplay = document.getElementById('wave-timer');
const keyboardContainer = document.querySelector('.keyboard-container');
const downloadCertificateBtn = document.getElementById('download-certificate');
const startScreen = document.getElementById('start-screen');
const gameContainer = document.querySelector('.game-container');
const difficultyLevels = document.getElementById('difficulty-levels');
const trainingModeButton = document.getElementById('training-mode');
const csvFileInput = document.getElementById('csv-file-input');
const csvFileNameDisplay = document.getElementById('csv-file-name');
const definitionDisplay = document.getElementById('definition-display');

let wordsData = {};
let currentWords = [];
let score = 0;
let waveNumber = 1;
let waveDuration = 30;
let timeLeft = waveDuration;
let gameInterval;
let waveInterval;
let wordFallSpeed = 1;
let speedIncreaseRate = 0.1;
let startTime;
let endTime;
let missedWords = 0;
let gameMode = 'normal';
let difficultyLevel = 1;
let trainingInterval;
let trainingWords = [];
let currentTrainingWordIndex = 0;
let wordsPerMinuteGoal = 40;
let termDefinitions = []; // Array to hold term-definition objects
let currentDefinitionIndex = 0;

const keyboardLayout = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
];

function loadWords() {
    // This function now handles only the default word list.
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
        });
}

function getRandomWord() {
    if (gameMode === 'normal' && termDefinitions.length === 0) {
        const wordLengths = Object.keys(wordsData).filter(key => wordsData[key].length > 0);
        if (wordLengths.length === 0) return null;
        const randomLengthCategory = wordLengths[Math.floor(Math.random() * wordLengths.length)];
        const randomIndex = Math.floor(Math.random() * wordsData[randomLengthCategory].length);
        return wordsData[randomLengthCategory][randomIndex];
    } else if (gameMode === 'normal' && termDefinitions.length > 0) {
        //use the term from termDefinitions
        if (currentDefinitionIndex >= termDefinitions.length) {
            currentDefinitionIndex = 0; //restart
        }
        const term = termDefinitions[currentDefinitionIndex].term;
        currentDefinitionIndex++; // Move to the next term for next time
        return term;

    } else { //training mode
        const wordLengths = Object.keys(wordsData).filter(key => wordsData[key].length > 0);
        if (wordLengths.length === 0) return null;
        const randomLengthCategory = wordLengths[Math.floor(Math.random() * wordLengths.length)];
        const randomIndex = Math.floor(Math.random() * wordsData[randomLengthCategory].length);
        return wordsData[randomLengthCategory][randomIndex];
    }
}

function createFallingWord() {
    const wordText = getRandomWord();
    if (!wordText) return;

    const wordElement = document.createElement('div');
    wordElement.classList.add('word');
    let displayWord = wordText;
    if (gameMode == 'normal' && termDefinitions.length > 0) {
        displayWord = wordText[0] + "_".repeat(wordText.length - 1);
    }
    wordElement.innerHTML = displayWord.split('').map(char => `<span>${char}</span>`).join('');
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
    }, 20);

    currentWords.push({ element: wordElement, text: wordText, interval: fallInterval });
}

function checkWord() {
    const typedText = typingInput.value.trim();

    currentWords.forEach(wordObj => {
        let wordToCheck = wordObj.text;
        let elementText = wordObj.element.innerText;

        if (gameMode == 'normal' && termDefinitions.length > 0) {
            if (wordToCheck.toLowerCase().startsWith(typedText.toLowerCase())) {
                const wordSpans = wordObj.element.querySelectorAll('span');
                for (let i = 0; i < typedText.length; i++) {
                    wordSpans[i].classList.add('typed');
                }
            }
        }
        else {
            if (wordObj.text.startsWith(typedText) && wordObj.element.dataset.typed !== 'true') {
                const wordSpans = wordObj.element.querySelectorAll('span');
                typedText.split('').forEach((char, index) => {
                    if (wordSpans[index] && char === wordObj.text[index].toLowerCase()) {
                        wordSpans[index].classList.add('typed');
                    }
                });
            }
        }

        if (wordToCheck.toLowerCase() === typedText.toLowerCase() && wordObj.element.dataset.typed !== 'true') {
            score++;
            scoreDisplay.textContent = `Score: ${score}`;
            wordObj.element.dataset.typed = 'true';
            typingInput.value = '';
        }
    });
}

function updateTimer() {
    timeLeft--;
    waveTimerDisplay.textContent = `Wave ends in: ${timeLeft}`;
    if (timeLeft <= 0) {
        clearInterval(gameInterval);
        clearInterval(waveInterval);
        endWave();
    }
}

function startNewWave() {
    gameMode = 'normal';
    gameContainer.style.display = 'flex';
    startScreen.style.display = 'none';
    if (waveNumber === 1) {
        startTime = new Date();
        missedWords = 0;
        score = 0;
        scoreDisplay.textContent = `Score: ${score}`;
    }

    currentWords.forEach(wordObj => {
        clearInterval(wordObj.interval);
        wordObj.element.remove();
    });
    currentWords = [];
    timeLeft = waveDuration;
    waveTimerDisplay.textContent = `Wave ends in: ${timeLeft}`;
    wordFallSpeed = 1 + (difficultyLevel - 1) * 0.2;
    speedIncreaseRate = 0.1 + (difficultyLevel - 1) * 0.05;

    if (termDefinitions.length > 0) {
        const randomIndex = Math.floor(Math.random() * termDefinitions.length);
        definitionDisplay.textContent = termDefinitions[randomIndex].definition;
    }
    else {
        definitionDisplay.textContent = '';
    }


    gameInterval = setInterval(() => {
        createFallingWord();
        if (Math.random() < 0.3 + (waveNumber * 0.02)) {
            createFallingWord();
        }
    }, 1000 / (1 + (waveNumber * 0.1)));

    waveInterval = setInterval(updateTimer, 1000);
}

function endWave() {
    clearInterval(waveInterval);
    clearInterval(gameInterval);
    alert(`Wave ${waveNumber} ended! Score: ${score}`);
    waveNumber++;
    setTimeout(startNewWave, 2000);
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
        }, 100);
    }
}

function downloadCertificate() {
    const userName = prompt("Enter your name for the certificate:");
    if (userName) {
        endTime = new Date();
        const totalTimeSeconds = Math.round((endTime - startTime) / 1000);
        const wordsPerMinute = score > 0 && totalTimeSeconds > 0
            ? Math.round((score / totalTimeSeconds) * 60)
            : 0;
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
        pdf.text(`Words Per Minute: ${wordsPerMinute}`, 105, 90, null, null, "center");


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

function startTrainingMode() {
    gameMode = 'training';
    gameContainer.style.display = 'flex';
    startScreen.style.display = 'none';
    gameArea.innerHTML = '';
    trainingWords = [];
    currentTrainingWordIndex = 0;
    timeLeft = 30;
    waveTimerDisplay.textContent = `Training: ${timeLeft}`;

    const wordList = [];
    for (let i = 0; i < 10; i++) {
        wordList.push(getRandomWord());
    }

    let xPos = 50;
    wordList.forEach((word, index) => {
        const wordElement = document.createElement('div');
        wordElement.classList.add('training-word');
        wordElement.textContent = word;
        wordElement.style.left = `${xPos}px`;
        wordElement.style.top = '50px';
        gameArea.appendChild(wordElement);
        trainingWords.push({ element: wordElement, text: word });
        xPos += 120;
    });

    trainingInterval = setInterval(() => {
        timeLeft--;
        waveTimerDisplay.textContent = `Training: ${timeLeft}`;
        if (timeLeft <= 0) {
            clearInterval(trainingInterval);
            endTrainingMode();
        }
    }, 1000);

    typingInput.addEventListener('input', checkTrainingWord);
    typingInput.value = '';
}

function checkTrainingWord() {
    const typedText = typingInput.value.trim();

    if (trainingWords[currentTrainingWordIndex] && trainingWords[currentTrainingWordIndex].text.toLowerCase() === typedText.toLowerCase()) {
        const currentWordElement = trainingWords[currentTrainingWordIndex].element;
        currentWordElement.classList.add('active');
        currentTrainingWordIndex++;
        typingInput.value = '';

        if (currentTrainingWordIndex >= trainingWords.length) {
            setTimeout(endTrainingMode, 500);
        }
    }
}

function endTrainingMode() {
    clearInterval(trainingInterval);
    typingInput.removeEventListener('input', checkTrainingWord);
    alert("Training session ended!");
    gameContainer.style.display = 'none';
    startScreen.style.display = 'flex';
    gameArea.innerHTML = '';
    timeLeft = waveDuration;
    waveTimerDisplay.textContent = `Wave ends in: ${timeLeft}`;
    currentTrainingWordIndex = 0;
    definitionDisplay.textContent = '';

}

function parseCSV(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const csvData = event.target.result;
        const lines = csvData.trim().split('\n');
        const headers = lines[0].split(',');
        if (headers.length < 2) {
            alert("CSV file must contain at least two columns: Term and Definition.");
            return;
        }
        termDefinitions = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const term = values[0] ? values[0].trim() : '';
            const definition = values[1] ? values[1].trim() : '';
            if (term && definition) {
                termDefinitions.push({ term, definition });
            }
        }
        if (termDefinitions.length === 0) {
            alert("No valid term and definition pairs found in the CSV file.");
            return;
        }
        //console.log(termDefinitions);
        //startNewWave(); //start the wave.
    };
    reader.onerror = function() {
        alert("Error reading the CSV file.");
    };
    reader.readAsText(file);
}

// Event listeners
window.onload = function() {
    renderKeyboard();
    loadWords();

    typingInput.addEventListener('input', checkWord);
    document.addEventListener('keydown', handleKeyPress);
    downloadCertificateBtn.addEventListener('click', downloadCertificate);
    difficultyLevels.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            difficultyLevel = parseInt(event.target.dataset.level);
            startNewWave();
        }
    });
    trainingModeButton.addEventListener('click', startTrainingMode);

    typingInput.focus();
};
</script>

