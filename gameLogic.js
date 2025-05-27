export function spawnWord(ctx, vocabData, amalgamateVocab, promptType, caseSensitive, randomizeTerms, usedVocabIndices, usedAmalgamateIndices, vocabIndex, amalgamateIndex, wave, level, mode, waveSpeeds, lastSpawnedWord) {
  console.log('Attempting to spawn new word');
  const allVocab = [...vocabData, ...amalgamateVocab];
  if (allVocab.length === 0) {
    console.error('No vocabulary available');
    return null;
  }

  let wordData;
  if (randomizeTerms) {
    const availableIndices = Array.from({ length: allVocab.length }, (_, i) => i).filter(
      i => !usedVocabIndices.includes(i) && !usedAmalgamateIndices.includes(i)
    );
    if (availableIndices.length === 0) {
      usedVocabIndices.length = 0;
      usedAmalgamateIndices.length = 0;
      availableIndices.push(...Array.from({ length: allVocab.length }, (_, i) => i));
    }
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    wordData = allVocab[randomIndex];
    if (randomIndex < vocabData.length) {
      usedVocabIndices.push(randomIndex);
    } else {
      usedAmalgamateIndices.push(randomIndex - vocabData.length);
    }
  } else {
    wordData = allVocab[vocabIndex % allVocab.length];
    if (vocabIndex < vocabData.length) {
      usedVocabIndices.push(vocabIndex);
    } else {
      usedAmalgamateIndices.push(vocabIndex - vocabData.length);
    }
    vocabIndex++;
  }

  if (!wordData || !wordData.Term || !wordData.Definition) {
    console.error('Invalid word data:', wordData);
    return null;
  }

  const typedInput = promptType === 'definition' ? wordData.Term : wordData.Definition;
  const displayText = caseSensitive ? typedInput : typedInput.toLowerCase();
  const x = Math.random() * (ctx.canvas.width - 100) + 50;
  const y = 0;
  const speed = waveSpeeds[Math.min(wave - 1, waveSpeeds.length - 1)] * level;

  const word = {
    x,
    y,
    typedInput,
    displayText,
    prompt: promptType === 'definition' ? wordData.Definition : wordData.Term,
    speed,
    typedSoFar: '',
    width: ctx.measureText(displayText).width,
    height: 20
  };

  console.log('Spawned word:', word.typedInput);
  return word;
}

export function getUnderscoreText(word, userInput, caseSensitive) {
  if (!word) return '';
  const target = caseSensitive ? word.typedInput : word.typedInput.toLowerCase();
  const input = caseSensitive ? userInput : userInput.toLowerCase();

  if (input.length === 0) {
    console.log('Showing first character:', word.typedInput[0] || '');
    return word.typedInput[0] || '';
  }

  if (target.startsWith(input)) {
    console.log('Showing full word:', word.typedInput);
    return word.typedInput;
  }

  console.log('Showing first character due to mismatch:', word.typedInput[0] || '');
  return word.typedInput[0] || '';
}

export function renderWord(ctx, word, userInput, caseSensitive) {
  const target = caseSensitive ? word.typedInput : word.typedInput.toLowerCase();
  const input = caseSensitive ? userInput : userInput.toLowerCase();
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
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--canvas-text').trim();
    ctx.textAlign = 'center';
    ctx.fillText('Game Paused', ctx.canvas.width / 2, ctx.canvas.height / 2);
    return now;
  }

  words.forEach(word => {
    word.y += word.speed * deltaTime * 60;
    renderWord(ctx, word, userInput.value, caseSensitive);
    ctx.font = '16px Arial';
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--canvas-text').trim();
    ctx.textAlign = 'center';
    ctx.fillText(word.prompt, ctx.canvas.width / 2, ctx.canvas.height / 2);
    console.log('Rendering word:', getUnderscoreText(word, userInput.value, caseSensitive), 'at', word.x, word.y);
  });

  words = words.filter(word => word.y < ctx.canvas.height + word.height);

  if (words.length === 0) {
    const newWord = spawnWord(
      ctx, vocabData, amalgamateVocab, promptType, caseSensitive, randomizeTerms,
      usedVocabIndices, usedAmalgamateIndices, vocabIndex, amalgamateIndex,
      wave, level, mode, waveSpeeds, lastSpawnedWord
    );
    if (newWord) {
      words.push(newWord);
    }
  }

  ctx.font = '16px Arial';
  ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--canvas-text').trim();
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${score}`, 50, 30);
  ctx.fillText(`Wave: ${wave}`, 50, 50);
  ctx.fillText(`Correct Terms: ${correctTermsCount}`, 50, 70);

  return now;
}

export function calculateCorrectChars(target, input) {
  let correct = 0;
  for (let i = 0; i < Math.min(target.length, input.length); i++) {
    if (target[i] === input[i]) correct++;
    else break;
  }
  return correct;
}

export function calculateWPM(totalChars, correctChars, sessionStartTime, sessionEndTime) {
  const timeInMinutes = (sessionEndTime - sessionStartTime) / 1000 / 60;
  if (timeInMinutes <= 0) return 0;
  return Math.min(200, Math.round((correctChars / 5) / timeInMinutes));
}

export function calculateAccuracy(correctChars, totalChars) {
  if (totalChars === 0) return 0;
  return Math.round((correctChars / totalChars) * 100);
}