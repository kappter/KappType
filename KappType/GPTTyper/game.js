
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let experienceLevel = 0;
let gameMode = "normal";
let gameInterval;
let fallingWords = [];
let vocabTerms = [];
let wordsByLength = {};

function loadCSV() {
    Papa.parse("words.csv", {
        download: true,
        header: true,
        complete: function(results) {
            if (results.data[0].Term && results.data[0].Definition) {
                vocabTerms = results.data.filter(r => r.Term && r.Definition).map(r => ({
                    term: r.Term.trim(),
                    definition: r.Definition.trim()
                }));
            } else {
                results.data.forEach(row => {
                    for (let key in row) {
                        if (!wordsByLength[key]) wordsByLength[key] = [];
                        if (row[key]) wordsByLength[key].push(row[key]);
                    }
                });
            }
        }
    });
}

class Word {
    constructor(text, x, y, speed, definition = "") {
        this.text = text;
        this.definition = definition;
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.matched = 0;
    }

    draw() {
        ctx.font = "20px Arial";
        let displayText = this.text.split("").map((c, i) =>
            i === 0 || i < this.matched ? c : "_").join("");
        ctx.fillStyle = "red";
        ctx.fillText(displayText, this.x, this.y);
    }

    update() {
        this.y += this.speed;
    }
}

function spawnWord() {
    const speed = 1 + experienceLevel;
    const x = Math.random() * (canvas.width - 100);
    if (gameMode === "vocab" && vocabTerms.length > 0) {
        const entry = vocabTerms[Math.floor(Math.random() * vocabTerms.length)];
        fallingWords.push(new Word(entry.term, x, 60, speed, entry.definition));
    } else {
        let len = 4 + Math.floor(Math.random() * (6 + experienceLevel));
        let pool = wordsByLength[len] || wordsByLength[4];
        let word = pool[Math.floor(Math.random() * pool.length)];
        fallingWords.push(new Word(word, x, 60, speed));
    }
}

function startGame(mode) {
    gameMode = mode;
    clearInterval(gameInterval);
    fallingWords = [];
    loadCSV();
    setTimeout(() => {
        gameInterval = setInterval(gameLoop, 50);
        setInterval(spawnWord, 2000 - experienceLevel * 500);
    }, 500);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let word of fallingWords) {
        word.update();
        word.draw();
    }
    if (gameMode === "vocab" && fallingWords.length > 0) {
        ctx.font = "18px Arial";
        ctx.fillStyle = "blue";
        ctx.fillText("Definition: " + fallingWords[0].definition, 20, 30);
    }
}

document.addEventListener("keydown", (e) => {
    let key = e.key.toLowerCase();
    for (let word of fallingWords) {
        if (word.text[word.matched].toLowerCase() === key) {
            word.matched++;
            if (word.matched === word.text.length) {
                fallingWords = fallingWords.filter(w => w !== word);
            }
            break;
        }
    }
});

document.getElementById("start-vocab").addEventListener("click", () => {
    experienceLevel = parseInt(document.getElementById("experience").value);
    startGame("vocab");
});

loadCSV();
