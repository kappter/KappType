export function spawnWord(
  ctx, vocabData, amalgamateVocab, promptType, caseSensitive,
  randomizeTerms, usedVocabIndices, usedAmalgamateIndices, vocabIndex,
  amalgamateIndex, wave, level, mode, waveSpeeds, lastSpawnedWord
) {
  const combinedVocab = [...vocabData, ...amalgamateVocab];
  if (combinedVocab.length === 0) {
    console.error('No vocabulary data available');
    return null;
  }

  let selectedVocab;
  let isAmalgamate = false;
  let index;

  if (amalgamateVocab.length > 0 && Math.random() < 0.5) {
    if (randomizeTerms) {
      index = Math.floor(Math.random() * amalgamateVocab.length);
      while (usedAmalgamateIndices.includes(index) && usedAmalgamateIndices.length < amalgamateVocab.length) {
        index = Math.floor(Math.random() * amalgamateVocab.length);
      }
    } else {
      index = amalgamateIndex % amalgamateVocab.length;
    }
    selectedVocab = amalgamateVocab[index];
    usedAmalgamateIndices.push(index);
    isAmalgamate = true;
  } else {
    if (randomizeTerms) {
      index = Math.floor(Math.random() * vocabData.length);
      while (usedVocabIndices.includes(index) && usedVocabIndices.length < vocabData.length) {
        index = Math.floor(Math.random() * vocabData.length);
      }
    } else {
      index = vocabIndex % vocabData.length;
    }
    selectedVocab = vocabData[index];
    usedVocabIndices.push(index);
  }

  if (!selectedVocab || !selectedVocab.Term || !selectedVocab.Definition) {
    console.error('Invalid vocabulary entry:', selectedVocab);
    return null;
  }

  const displayText = promptType === 'definition' ? selectedVocab.Definition : selectedVocab.Term;
  const typedInput = promptType === 'definition' ? selectedVocab.Term : selectedVocab.Definition;

  const x = Math.random() * (ctx.canvas.width - 200) + 100;
  const y = lastSpawnedWord ? lastSpawnedWord.y + 50 : -20; // Stagger y

  console.log(`Spawning word: display=${displayText}, input=${typedInput}, x=${x}, y=${y}`);

  return {
    displayText,
    typedInput: caseSensitive ? typedInput : typedInput.toLowerCase(),
    x,
    y
  };
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
  ctx, words, userInput, gameActive, mode, caseSensitive,
  canvasTextColor, waveSpeeds, wave, score, correctTermsCount,
  coveredTerms, totalChars, correctChars, missedWords, lastFrameTime,
  vocabData, amalgamateVocab, promptType, randomizeTerms,
  usedVocabIndices, usedAmalgamateIndices, vocabIndex,
  amalgamateIndex, level, lastSpawnedWord
) {
  const currentTime = performance.now();
  const deltaTime = (currentTime - lastFrameTime) / 1000;
  let lostLife = false;
  let missedWord = '';

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (let i = words.length - 1; i >= 0; i--) {
    const word = words[i];
    word.y += waveSpeeds[Math.min(wave - 1, waveSpeeds.length - 1)] * deltaTime * 100;

    if (word.y > ctx.canvas.height) {
      if (mode !== 'practice') {
        lostLife = true;
        missedWord = word.typedInput;
        words.splice(i, 1);
        coveredTerms.set(word.typedInput, 'Incorrect');
        missedWords.push(word.typedInput);
        totalChars += word.typedInput.length;
        console.log(`Word missed: ${word.typedInput}`);
      }
      continue;
    }

    // Draw word with gradient
    const draw = () => {
      ctx.font = '20px Orbitron';
      ctx.textAlign = 'center';
      const gradient = ctx.createLinearGradient(word.x, word.y - 20, word.x, word.y + 20);
      try {
        gradient.addColorStop(0, '#00f6ff'); // Valid cyan
        gradient.addColorStop(1, '#ff00ff'); // Valid pink
        ctx.fillStyle = gradient;
        console.log('Gradient applied:', { start: '#00f6ff', end: '#ff00ff' });
      } catch (error) {
        console.error('Gradient error:', error);
        ctx.fillStyle = canvasTextColor || '#000'; // Fallback
      }
      ctx.fillText(word.displayText, word.x, word.y);
      ctx.fillStyle = canvasTextColor || '#000';
      ctx.fillText(word.typedInput, word.x, word.y + 20);
    };

    draw();
  }

  return {
    lastFrameTime: currentTime,
    words,
    lostLife,
    missedWord
  };
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
