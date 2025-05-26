// gameLogic.js
export function getWordSpeed(level, mode, wave, waveSpeeds) {
  const baseSpeed = level === 0 ? 0.15 : (level === 1 ? 0.25 : 0.5);
  const speedIncreasePerLevel = 0.1;
  if (mode === 'game') {
    return waveSpeeds[wave] || waveSpeeds[waveSpeeds.length - 1];
  } else {
    return baseSpeed + (level > 1 ? (level - 1) * speedIncreasePerLevel : 0);
  }
}

export function spawnWord(ctx, vocabData, amalgamateVocab, promptType, caseSensitive, randomizeTerms, usedVocabIndices, usedAmalgamateIndices, vocabIndex, amalgamateIndex, wave, level, mode, waveSpeeds) {
  console.log('Attempting to spawn new word');
  if (vocabData.length === 0) {
    console.warn('vocabData is empty, using defaultVocabData');
    vocabData = [...defaultVocabData]; // Ensure defaultVocabData is imported or defined
  }

  const allVocab = [...vocabData, ...amalgamateVocab].filter(v => v && v.Term && v.Definition);
  if (allVocab.length === 0) {
    console.error('No valid vocab available');
    return null;
  }

  let index;
  const usedIndices = [...usedVocabIndices, ...usedAmalgamateIndices];
  const availableIndices = Array.from({ length: allVocab.length }, (_, i) => i).filter(i => !usedIndices.includes(i));

  if (availableIndices.length > 0) {
    index = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  } else {
    console.log('Resetting used indices, all vocab cycled');
    usedVocabIndices = [];
    usedAmalgamateIndices = [];
    index = Math.floor(Math.random() * allVocab.length);
  }

  const vocab = allVocab[index];
  let prompt, typedInput;
  if (promptType === 'definition') {
    prompt = vocab.Definition;
    typedInput = vocab.Term;
  } else if (promptType === 'term') {
    prompt = vocab.Term;
    typedInput = vocab.Definition;
  } else {
    const randomType = Math.random() < 0.5 ? 'definition' : 'term';
    prompt = randomType === 'definition' ? vocab.Definition : vocab.Term;
    typedInput = randomType === 'definition' ? vocab.Term : vocab.Definition;
  }

  const displayText = getUnderscoreText(typedInput, 0);
  ctx.font = '18px Arial';
  const textWidth = ctx.measureText(displayText).width;

  const padding = 20;
  const maxX = 900 - textWidth - padding; // Assuming canvas.width = 900
  const minX = padding;
  const x = minX + Math.random() * (maxX - minX);

  const y = 0;
  const speed = getWordSpeed(level, mode, wave, waveSpeeds);
  const word = { 
    prompt, typedInput, displayText, x, y, speed, matched: '', definition: vocab.Definition, 
    isExiting: false, opacity: 0, fadeState: 'in', spawnWave: wave 
  };

  if (index < vocabData.length) {
    if (!usedVocabIndices.includes(index)) usedVocabIndices.push(index);
  } else {
    const amalgamateIndex = index - vocabData.length;
    if (!usedAmalgamateIndices.includes(amalgamateIndex)) usedAmalgamateIndices.push(amalgamateIndex);
  }

  console.log('Spawned word:', typedInput);
  return word;
}

export function updateGame(ctx, words, userInput, gameActive, mode, caseSensitive, textColor, waveSpeeds, wave, score, correctTermsCount, coveredTerms, totalChars, correctChars, missedWords, lastFrameTime, vocabData, amalgamateVocab, promptType, randomizeTerms, usedVocabIndices, usedAmalgamateIndices, vocabIndex, amalgamateIndex, level) {
  if (!gameActive) return;

  const now = performance.now();
  const deltaTime = (now - lastFrameTime) / 1000;
  const newLastFrameTime = now;

  ctx.clearRect(0, 0, 900, 300); // Assuming canvas dimensions

  const hexToRgb = (hex) => {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(h => h + h).join('');
    if (hex.length !== 6) return '255, 255, 255';
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  };

  if (words.length > 0) {
    const word = words[0];
    const definition = word.definition;

    const fadeDuration = 2;
    const fadeSpeed = 0.3 / fadeDuration;
    if (word.fadeState === 'in') word.opacity = Math.min(word.opacity + fadeSpeed * deltaTime, 0.3);
    else if (word.fadeState === 'out') word.opacity = Math.max(word.opacity - fadeSpeed * deltaTime, 0);

    const maxWidth = 900 - 40;
    const wordsArray = definition.split(' ');
    let lines = [], line = '';
    ctx.font = '32px Arial';
    for (let w of wordsArray) {
      const testLine = line + w + ' ';
      if (ctx.measureText(testLine).width > maxWidth && line) {
        lines.push(line.trim());
        line = w + ' ';
      } else line = testLine;
    }
    if (line) lines.push(line.trim());

    if (lines.length > 4) {
      lines = lines.slice(0, 3);
      let truncated = lines[2];
      while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length) truncated = truncated.slice(0, -1);
      lines[2] = truncated + '...';
    }

    const lineHeight = 40;
    const totalHeight = lines.length * lineHeight;
    const startY = (300 - totalHeight) / 2 - 20;
    ctx.textAlign = 'center';

    for (let i = 0; i < lines.length; i++) {
      ctx.fillStyle = `rgba(${hexToRgb(textColor)}, ${word.opacity})`;
      ctx.fillText(lines[i], 450, startY + i * lineHeight); // Assuming canvas.width / 2 = 450
    }
  }

  const rectHeight = 20, rectY = 300 - rectHeight;
  ctx.beginPath();
  ctx.roundRect(0, rectY, 900, rectHeight, 8);
  ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
  ctx.fill();
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = '18px Arial';
  ctx.textAlign = 'left';

  words = words.filter(word => {
    word.y += word.speed;
    const typed = userInput.value;
    const target = caseSensitive ? word.typedInput : word.typedInput.toLowerCase();
    const input = caseSensitive ? typed : typed.toLowerCase();
    word.matched = target.startsWith(input) ? typed : '';

    ctx.clearRect(word.x - 5, word.y - 20, ctx.measureText(word.displayText).width + 10, 25);

    if (word.matched) {
      ctx.fillStyle = 'red';
      ctx.fillText(word.matched, word.x, word.y);
    }
    const remainingText = word.displayText.slice(word.matched.length);
    if (remainingText) {
      ctx.fillStyle = textColor;
      ctx.fillText(remainingText, word.x + ctx.measureText(word.matched).width, word.y);
    }

    if (word.y >= 300) {
      console.log(`Word missed: ${word.typedInput}, Time Left: ${timeLeft}s, CorrectTermsCount: ${correctTermsCount}`);
      missedWords.push(word.typedInput);
      coveredTerms.set(word.typedInput, 'Missed');
      totalChars += word.typedInput.length;
      word.isExiting = true;
      word.fadeState = 'out';
      if (words.length === 1 && mode === 'game') {
        gameActive = false;
        sessionEndTime = performance.now();
        console.log(`Game Over due to missed word. Score: ${score}, WPM: ${calculateWPM(wpmActive, sessionStartTime, sessionEndTime, score)}, Accuracy: ${calculateAccuracy(totalChars, correctChars)}%`);
        alert(`Game Over! Score: ${score}, WPM: ${calculateWPM(wpmActive, sessionStartTime, sessionEndTime, score)}, Accuracy: ${calculateAccuracy(totalChars, correctChars)}%`);
        return false;
      }
    }
    return !word.isExiting;
  });

  if (words.length > 0 && words[0].isExiting && words[0].opacity <= 0) {
    words = [];
    console.log('Word faded out, resetting words array');
    if (mode !== 'game') spawnWord(ctx, vocabData, amalgamateVocab, promptType, caseSensitive, randomizeTerms, usedVocabIndices, usedAmalgamateIndices, vocabIndex, amalgamateIndex, wave, level, mode, waveSpeeds);
  } else if (words.length === 0) {
    console.log('No words left, attempting to spawn new word');
    const newWord = spawnWord(ctx, vocabData, amalgamateVocab, promptType, caseSensitive, randomizeTerms, usedVocabIndices, usedAmalgamateIndices, vocabIndex, amalgamateIndex, wave, level, mode, waveSpeeds);
    if (newWord) {
      words.push(newWord);
      console.log('New word spawned:', newWord.typedInput);
    } else {
      console.error('Failed to spawn new word');
    }
  }

  return newLastFrameTime; // Return the updated lastFrameTime for the next frame
}

export function calculateCorrectChars(target, input) {
  let correct = 0;
  for (let i = 0; i < Math.min(target.length, input.length); i++) {
    if (target[i] === input[i]) correct++;
  }
  return correct;
}

export function calculateWPM(wpmActive, sessionStartTime, sessionEndTime, score) {
  if (!wpmActive) return 0;
  const correctTermsFromCovered = Array.from(coveredTerms.values()).filter(status => status === 'Correct').length;
  if (correctTermsFromCovered === 0) return 0;

  const sessionTimeMs = (sessionEndTime || performance.now()) - sessionStartTime || 1;
  const sessionTimeMin = sessionTimeMs / 1000 / 60;
  const wpm = Math.round((score / 5) / sessionTimeMin);
  console.log('WPM calc - sessionTimeMs:', sessionTimeMs, 'sessionTimeMin:', sessionTimeMin, 'score:', score, 'wpm:', wpm);
  return Math.min(wpm, 200);
}

export function calculateAccuracy(totalChars, correctChars) {
  return totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
}

export function calculateTermAccuracy(coveredTerms) {
  const correctTerms = Array.from(coveredTerms.values()).filter(status => status === 'Correct').length;
  const totalAttempts = coveredTerms.size;
  return totalAttempts > 0 ? Math.round((correctTerms / totalAttempts) * 100) : 100;
}

export function getUnderscoreText(text, typedLength = 0) {
  const maxLength = 50;
  let displayText;
  if (typedLength === 0) {
    const underscoreCount = Math.min(text.length - 1, maxLength - 1);
    displayText = text.slice(0, 1) + '_'.repeat(underscoreCount);
  } else {
    displayText = text;
  }
  if (text.length > maxLength) {
    displayText = displayText.slice(0, 47) + '...';
  }
  return displayText;
}
