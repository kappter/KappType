
let wordsByLength = {};
let fallingWords = [];
let gameInterval;
let mode = "normal";

function loadCSV() {
  Papa.parse("words.csv", {
    download: true,
    header: true,
    complete: function(results) {
      results.data.forEach(row => {
        for (let key in row) {
          if (!wordsByLength[key]) wordsByLength[key] = [];
          if (row[key]) wordsByLength[key].push(row[key]);
        }
      });
      document.getElementById("start-normal").disabled = false;
      document.getElementById("start-training").disabled = false;
    }
  });
}

function spawnWord() {
  const lengths = Object.keys(wordsByLength);
  if (lengths.length === 0) return;

  const group = lengths[Math.floor(Math.random() * lengths.length)];
  const wordList = wordsByLength[group];
  if (!wordList || wordList.length === 0) return;

  const word = wordList[Math.floor(Math.random() * wordList.length)];
  const display = word[0] + "_".repeat(word.length - 1);

  fallingWords.push({
    word: word,
    display: display,
    x: Math.random() * 700,
    y: 0,
    speed: 1 + Math.random() * 2
  });
}

function updateCanvas() {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  fallingWords.forEach(w => {
    w.y += w.speed;
    ctx.fillText(mode === "normal" ? w.word : w.display, w.x, w.y);
  });

  fallingWords = fallingWords.filter(w => w.y < canvas.height);
}

function startGame(selectedMode) {
  mode = selectedMode;
  fallingWords = [];
  clearInterval(gameInterval);
  setInterval(spawnWord, 1500);
  gameInterval = setInterval(updateCanvas, 50);
}

document.getElementById("start-normal").onclick = () => startGame("normal");
document.getElementById("start-training").onclick = () => startGame("training");

loadCSV();
