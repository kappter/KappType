export function spawnWord(wordData, ctx) {
  console.log("spawnWord called with wordData:", wordData, "ctx:", ctx);

  // Validate wordData
  if (!wordData || typeof wordData !== "object" || !wordData.term || !wordData.definition) {
    console.error("Invalid word data:", wordData);
    return false;
  }

  // Validate canvas context
  if (!ctx || !(ctx instanceof CanvasRenderingContext2D)) {
    console.error("Invalid canvas context:", ctx);
    return false;
  }

  // Get promptType (adjust based on your global or passed variable)
  const promptType = window.promptType || "definition";
  const displayText = promptType === "definition" ? wordData.definition : wordData.term;

  if (!displayText) {
    console.error("No valid display text for:", wordData);
    return false;
  }

  // Set up canvas drawing
  ctx.font = "16px sans-serif"; // Adjust font as needed
  ctx.fillStyle = "black"; // Text color
  const x = Math.random() * (ctx.canvas.width - 100); // Random x-position
  const y = 0; // Start at top

  // Draw text
  ctx.fillText(displayText, x, y);

  // Store word data for animation (e.g., in a global array)
  if (!window.activeWords) window.activeWords = [];
  window.activeWords.push({
    text: displayText,
    x: x,
    y: y,
    term: wordData.term,
    definition: wordData.definition
  });

  return true;
}

// Function to animate words (call this in gameLoop)
export function animateWords(ctx, speed = 0.15) {
  if (!window.activeWords) return;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear canvas
  window.activeWords = window.activeWords.filter(word => {
    word.y += speed; // Move down
    if (word.y < ctx.canvas.height) {
      ctx.font = "16px sans-serif";
      ctx.fillStyle = "black";
      ctx.fillText(word.text, word.x, word.y);
      return true; // Keep word
    }
    return false; // Remove off-screen word
  });
}

// Function to spawn a random word
export function spawnRandomWord(vocab, ctx) {
  if (!vocab || !vocab.length) {
    console.error("No vocabulary data available.");
    return;
  }
  const randomIndex = Math.floor(Math.random() * vocab.length);
  const selectedTerm = vocab[randomIndex];
  spawnWord(selectedTerm, ctx);
}

export function getUnderscoreText(word, userInput, caseSensitive) {
  if (!word) return '';
  const target = caseSensitive ? word.typedInput : word.typedInput.toLowerCase();
  const input = caseSensitive ? (userInput.value || '') : (userInput.value || '').toLowerCase();

  if (input.length === 0) {
    console.log('Showing first character:', word.typedInput[0] || '');
    return word.typedInput[0] || '';
  }

  if (target.startsWith(input)) {
    console.log('Showing full word:', word.typedInput);
    return word.typedInput;
  }

  console.log('Showing partial word up to last correct input:', word.typedInput.slice(0, input.length) || '');
  return word.typedInput.slice(0, input.length) || '';
}

export function renderWord(ctx, word, userInput, caseSensitive) {
  const target = caseSensitive ? word.typedInput : word.typedInput.toLowerCase();
  const input = caseSensitive ? (userInput.value || '') : (userInput.value || '').toLowerCase();
  const displayText = getUnderscoreText(word, userInput, caseSensitive);

  ctx.font = '20px monospace';
  ctx.textAlign = 'center';

  if (displayText.length === 1) {
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--canvas-text').trim();
    ctx.fillText(displayText, word.x, word.y);
  } else {
    let xOffset = word.x - ctx.measureText(displayText).width / 2;
    for (let i = 0; i < displayText.length; i++) {
      ctx.fillStyle = i === input.length && target.startsWith(input)
        ? getComputedStyle(document.body).getPropertyValue('--active-letter').trim()
        : getComputedStyle(document.body).getPropertyValue('--canvas-text').trim();
      ctx.fillText(displayText[i], xOffset + ctx.measureText(displayText.slice(0, i)).width + ctx.measureText(displayText[i]).width / 2, word.y);
    }
  }
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  const lines = [];
  ctx.font = '24px monospace';

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      lines.push(line.trim());
      line = words[i] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());

  const totalHeight = lines.length * lineHeight;
  const startY = y - totalHeight / 2;

  const gradient = ctx.createLinearGradient(0, startY, 0, startY + totalHeight);
  const neonCyan = getComputedStyle(document.body).getPropertyValue('--neon-cyan').trim();
  const neonPurple = getComputedStyle(document.body).getPropertyValue('--neon-purple').trim();
  gradient.addColorStop(0, `${neonCyan}80`);
  gradient.addColorStop(1, `${neonPurple}80`);

  ctx.fillStyle = gradient;
  ctx.textAlign = 'center';
  lines.forEach((line, index) => {
    ctx.fillText(line, x, startY + index * lineHeight);
  });
}

export function updateGame(
  ctx, words, userInput, gameActive, mode, caseSensitive, textColor, waveSpeeds,
  wave, score, correctTermsCount, coveredTerms, totalChars, correctChars, missedWords,
  lastFrameTime, vocabData, amalgamateVocab, promptType, randomizeTerms,
  usedVocabIndices, usedAmalgamateIndices, vocabIndex, amalgamateIndex, level, lastSpawnedWord
) {
  const now = performance.now();
  const deltaTime = (now - lastFrameTime) / 1000;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  if (!gameActive) {
    ctx.font = '20px monospace';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.fillText('Game Paused', ctx.canvas.width / 2, ctx.canvas.height / 2);
    return { lastFrameTime: now, words, lostLife: false, missedWord: '' };
  }

  let lostLife = false;
  let missedWord = '';

  // Process only the first word that hits the bottom per frame
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    word.y += word.speed * deltaTime * 60;
    if (word.y >= ctx.canvas.height && !lostLife) {
      console.log(`Word reached bottom: ${word.typedInput}, triggering life loss`);
      lostLife = true;
      missedWord = word.typedInput;
      words.splice(i, 1); // Remove one word
      i--; // Adjust index after removal
    } else {
      renderWord(ctx, word, userInput, caseSensitive);
      wrapText(ctx, word.prompt, ctx.canvas.width / 2, ctx.canvas.height / 2, ctx.canvas.width - 40, 30);
      console.log('Rendering word:', getUnderscoreText(word, userInput, caseSensitive), 'at', word.x, word.y);
    }
  }

  return { lastFrameTime: now, words, lostLife, missedWord };
}

export function calculateCorrectChars(target, input) {
  let correct = 0;
  for (let i = 0; i < Math.min(target.length, input.length); i++) {
    if (target[i] === input[i]) {
      correct++;
    } else {
      break;
    }
  }
  return correct;
}

export function calculateWPM(totalChars, correctChars, startTime, endTime) {
  const timeInMinutes = (endTime - startTime) / 1000 / 60;
  if (timeInMinutes <= 0) {
    return 0;
  }
  return Math.min(200, Math.round((correctChars / 5) / timeInMinutes));
}

export function calculateAccuracy(correctChars, totalChars) {
  if (totalChars === 0) {
    return 0;
  }
  return Math.round((correctChars / totalChars) * 100);
}

export function calculateTermAccuracy(coveredTerms) {
  if (coveredTerms.size === 0) {
    return 0;
  }
  const correctCount = Array.from(coveredTerms.values()).filter(status => status === 'Correct').length;
  return Math.round((correctCount / coveredTerms.size) * 100);
}
