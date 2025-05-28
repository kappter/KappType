export function spawnWord(ctx, vocabData, amalgamateVocab, promptType, caseSensitive, randomizeTerms, usedVocabIndices, usedAmalgamateIndices, vocabIndex, amalgamateIndex, wave, level, mode, waveSpeeds, lastSpawnedWord) {
  console.log('Attempting to spawn new word');
  const hasAmalgamate = amalgamateVocab.length > 0;
  let primaryWordData, amalgamateWordData;

  // Select primary term
  if (vocabData.length === 0) {
    console.error('No primary vocabulary available');
    return null;
  }

  if (randomizeTerms) {
    const availableVocabIndices = Array.from({ length: vocabData.length }, (_, i) => i).filter(i => !usedVocabIndices.includes(i));
    if (availableVocabIndices.length === 0) {
      usedVocabIndices.length = 0;
      availableVocabIndices.push(...Array.from({ length: vocabData.length }, (_, i) => i));
    }
    const vocabRandomIndex = availableVocabIndices[Math.floor(Math.random() * availableVocabIndices.length)];
    primaryWordData = vocabData[vocabRandomIndex];
    usedVocabIndices.push(vocabRandomIndex);
  } else {
    primaryWordData = vocabData[vocabIndex % vocabData.length];
    usedVocabIndices.push(vocabIndex % vocabData.length);
    vocabIndex++;
  }

  // Select amalgamate term if available
  if (hasAmalgamate) {
    if (randomizeTerms) {
      const availableAmalgamateIndices = Array.from({ length: amalgamateVocab.length }, (_, i) => i).filter(i => !usedAmalgamateIndices.includes(i));
      if (availableAmalgamateIndices.length === 0) {
        usedAmalgamateIndices.length = 0;
        availableAmalgamateIndices.push(...Array.from({ length: amalgamateVocab.length }, (_, i) => i));
      }
      const amalgamateRandomIndex = availableAmalgamateIndices[Math.floor(Math.random() * availableAmalgamateIndices.length)];
      amalgamateWordData = amalgamateVocab[amalgamateRandomIndex];
      usedAmalgamateIndices.push(amalgamateRandomIndex);
    } else {
      amalgamateWordData = amalgamateVocab[amalgamateIndex % amalgamateVocab.length];
      usedAmalgamateIndices.push(amalgamateIndex % amalgamateVocab.length);
      amalgamateIndex++;
    }
  }

  if (!primaryWordData || !primaryWordData.Term || !primaryWordData.Definition || (hasAmalgamate && (!amalgamateWordData || !amalgamateWordData.Term || !amalgamateWordData.Definition))) {
    console.error('Invalid word data:', { primary: primaryWordData, amalgamate: amalgamateWordData });
    return null;
  }

  // Combine terms and definitions
  const primaryTyped = promptType === 'definition' ? primaryWordData.Term : primaryWordData.Definition;
  const primaryPrompt = promptType === 'definition' ? primaryWordData.Definition : primaryWordData.Term;
  let typedInput, prompt;

  if (hasAmalgamate) {
    const amalgamateTyped = promptType === 'definition' ? amalgamateWordData.Term : amalgamateWordData.Definition;
    const amalgamatePrompt = promptType === 'definition' ? amalgamateWordData.Definition : amalgamateWordData.Term;
    typedInput = `${primaryTyped} ${amalgamateTyped}`;
    prompt = `${primaryPrompt} ${amalgamatePrompt}`;
  } else {
    typedInput = primaryTyped;
    prompt = primaryPrompt;
  }

  const displayText = caseSensitive ? typedInput : typedInput.toLowerCase();
  const x = Math.random() * (ctx.canvas.width - 100) + 50;
  const y = 0;
  const speed = waveSpeeds[Math.min(wave - 1, waveSpeeds.length - 1)] * level;

  const word = {
    x,
    y,
    typedInput,
    displayText,
    prompt,
    speed,
    textAlign: 'center',
    width: ctx.measureText(displayText).width,
    height: 20
  };

  console.log('Spawned word:', word.typedInput, 'Prompt:', word.prompt);
  return word;
}

export function calculateAccuracy(correctChars, totalChars) {
  if (totalChars === 0) return 0;
  return Math.round((correctChars / totalChars) * 100);
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

  console.log('Showing partial word up to last correct input:', word.typedInput.slice(0, input.length) || target);
  return word.typedInput.slice(0, input.length) || '';
}

export function renderWord(ctx, word, userInput, caseSensitive) {
  const target = caseSensitive ? word.typedInput : word.typedInput.toLowerCase();
  const input = caseSensitive ? (userInput.value || '') : (userInput.value || '').toLowerCase();
  const displayText = getUnderscoreText(word, userInput, caseSensitive);

  ctx.font = '20px Arial';
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
  ctx.font = '24px Arial';

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
    ctx.font = '20px Arial';
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
    if (word.y >= ctx.canvas.height + word.height && !lostLife) {
      console.log(`Word reached bottom: ${word.typedInput}, triggering life loss`);
      lostLife = true;
      missedWord = word.typedInput;
      words.splice(i, 1); // Remove the word immediately
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
    if (target[i] === input[i]) correct++;
    else break;
  }
  return correct;
}

export function calculateWPM(totalChars, correctChars, startTime, endTime) {
  const timeInMinutes = (endTime - startTime) / 1000 / 60;
  if (timeInMinutes <= 0) return 0;
  return Math.min(200, Math.round((correctChars / 5) / timeInMinutes));
}

export function calculateAccuracy(correctChars, totalChars) {
  if (totalChars === 0) return 0;
  return Math.round((correctChars / totalChars) * 100);
}

export function calculateTermAccuracy(coveredTerms) {
  if (coveredTerms.size === 0) return 0;
  const correctCount = Array.from(coveredTerms.values()).filter(status => status === 'Correct').length;
  return Math.round((correctCount / coveredTerms.size) * 100);
}
