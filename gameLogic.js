export function spawnWord(ctx, vocabData, amalgamateVocab, promptType, caseSensitive, randomizeTerms, usedVocabIndices, usedAmalgamateIndices, vocabIndex, amalgamateIndex, wave, level, mode, waveSpeeds, lastSpawnedWord) {
  console.log('Attempting to spawn new word');
  if (!vocabData || vocabData.length === 0) {
    console.warn('No vocab data available for spawning word');
    return null;
  }

  const allVocab = [...vocabData, ...amalgamateVocab];
  let termObj;
  if (randomizeTerms) {
    const availableIndices = allVocab.map((_, i) => i).filter(i => !usedVocabIndices.includes(i) && !usedAmalgamateIndices.includes(i));
    if (availableIndices.length === 0) {
      usedVocabIndices.length = 0;
      usedAmalgamateIndices.length = 0;
      availableIndices.push(...allVocab.map((_, i) => i));
    }
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    termObj = allVocab[randomIndex];
    if (randomIndex < vocabData.length) usedVocabIndices.push(randomIndex);
    else usedAmalgamateIndices.push(randomIndex - vocabData.length);
  } else {
    termObj = vocabData[vocabIndex % vocabData.length];
    usedVocabIndices.push(vocabIndex % vocabData.length);
  }

  if (!termObj || !termObj.Term || !termObj.Definition) {
    console.warn('Invalid term object:', termObj);
    return null;
  }

  const isDefinitionPrompt = promptType === 'definition' || (promptType === 'random' && Math.random() < 0.5);
  const typedInput = isDefinitionPrompt ? termObj.Term : termObj.Definition;
  const displayText = isDefinitionPrompt ? termObj.Definition : termObj.Term;

  const word = {
    typedInput,
    displayText,
    x: Math.random() * (ctx.canvas.width - 100),
    y: -20,
    speed: waveSpeeds[Math.min(wave - 1, waveSpeeds.length - 1)] * (level / 5),
    visibleChars: 1
  };

  console.log(`Spawned word: ${word.typedInput} Prompt: "${word.displayText}"`);
  console.log(`Showing first character: ${word.typedInput[0]}`);
  return word;
}

export function updateGame(ctx, words, userInput, gameActive, mode, caseSensitive, textColor, waveSpeeds, wave, score, correctTermsCount, coveredTerms, totalChars, correctChars, missedWords, lastFrameTime, vocabData, amalgamateVocab, promptType, randomizeTerms, usedVocabIndices, usedAmalgamateIndices, vocabIndex, amalgamateIndex, level, lastSpawnedWord) {
  const now = performance.now();
  const deltaTime = (now - lastFrameTime) / 1000;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  let lostLife = false;
  for (let i = words.length - 1; i >= 0; i--) {
    const word = words[i];
    word.y += word.speed * deltaTime * 60;

    if (word.y > ctx.canvas.height) {
      missedWords.push(word.typedInput);
      words.splice(i, 1);
      lostLife = true;
      continue;
    }

    wrapText(ctx, word.displayText, word.x, word.y, 200, 20, word.visibleChars, textColor);
    if (userInput && userInput.value) {
      const input = caseSensitive ? userInput.value : userInput.value.toLowerCase();
      const target = caseSensitive ? word.typedInput : word.typedInput.toLowerCase();
      if (input.length > 0 && target.startsWith(input)) {
        word.visibleChars = input.length + 1;
      }
    }
  }

  return {
    words,
    lastFrameTime: now,
    lostLife,
    wpm: calculateWPM(totalChars, now - lastFrameTime)
  };
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, visibleChars, textColor) {
  ctx.font = '16px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const gradient = ctx.createLinearGradient(x, y, x + maxWidth, y);
  gradient.addColorStop(0, textColor); // Use valid color
  gradient.addColorStop(1, textColor); // Use valid color
  ctx.fillStyle = gradient;

  let words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line.slice(0, visibleChars), x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
      visibleChars -= line.length;
      if (visibleChars <= 0) break;
    } else {
      line = testLine;
    }
  }
  if (line && visibleChars > 0) {
    ctx.fillText(line.slice(0, visibleChars), x, currentY);
  }
}

function calculateWPM(totalChars, timeMs) {
  if (timeMs === 0) return 0;
  const minutes = timeMs / 60000;
  const words = totalChars / 5;
  return Math.round(words / minutes);
}