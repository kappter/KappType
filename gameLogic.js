export function getRandomVocab(sourceArray, usedTerms) {
  if (!sourceArray || !Array.isArray(sourceArray) || sourceArray.length === 0) {
    console.error('sourceArray is invalid or empty:', sourceArray);
    return null;
  }
  let availableTerms = sourceArray;
  if (usedTerms.length < sourceArray.length) {
    availableTerms = sourceArray.filter(item => !usedTerms.includes(item.Term));
  }
  if (availableTerms.length === 0) {
    console.log('All terms used, resetting usedTerms');
    usedTerms.length = 0;
    availableTerms = sourceArray;
  }
  const index = Math.floor(Math.random() * availableTerms.length);
  const selected = availableTerms[index];
  console.log('Selected term:', selected, 'Available terms:', availableTerms.length);
  return selected;
}

export function getUnderscoreText(text) {
  if (text.length > 50) text = text.slice(0, 47) + '...';
  return text[0] + '_'.repeat(text.length - 1);
}

export function spawnWord(vocabData, amalgamateVocab, promptType, mode, level, wave, ctx, canvas, userInput, words, updateTimeIndicator, usedTerms) {
  if (!vocabData || !Array.isArray(vocabData) || vocabData.length === 0) {
    console.error('vocabData is invalid or empty:', vocabData);
    return;
  }

  const vocab1 = getRandomVocab(vocabData, usedTerms);
  if (!vocab1) {
    console.error('No vocab1 selected from vocabData:', vocabData);
    return;
  }
  usedTerms.push(vocab1.Term);
  console.log('vocab1 selected:', vocab1, 'usedTerms:', usedTerms);

  let prompt1, typedInput1;
  if (promptType === 'definition') {
    prompt1 = vocab1.Definition;
    typedInput1 = vocab1.Term;
  } else if (promptType === 'term') {
    prompt1 = vocab1.Term;
    typedInput1 = vocab1.Definition;
  } else {
    const randomType = Math.random() < 0.5 ? 'definition' : 'term';
    prompt1 = randomType === 'definition' ? vocab1.Definition : vocab1.Term;
    typedInput1 = randomType === 'definition' ? vocab1.Term : vocab1.Definition;
  }

  let prompt2 = '', typedInput2 = '', vocab2 = null;
  if (amalgamateVocab && amalgamateVocab.length > 0) {
    vocab2 = getRandomVocab(amalgamateVocab, usedTerms);
    if (vocab2) {
      usedTerms.push(vocab2.Term);
      console.log('vocab2 selected:', vocab2, 'usedTerms:', usedTerms);
      if (promptType === 'definition') {
        prompt2 = vocab2.Definition;
        typedInput2 = vocab2.Term;
      } else if (promptType === 'term') {
        prompt2 = vocab2.Term;
        typedInput2 = vocab2.Definition;
      } else {
        const randomType = Math.random() < 0.5 ? 'definition' : 'term';
        prompt2 = randomType === 'definition' ? vocab2.Definition : vocab2.Term;
        typedInput2 = randomType === 'definition' ? vocab2.Term : vocab2.Definition;
      }
    } else {
      console.warn('No vocab2 selected from amalgamateVocab:', amalgamateVocab);
    }
  }

  const finalTypedInput = amalgamateVocab && vocab2 ? typedInput1 + ' ' + typedInput2 : typedInput1;
  const finalPrompt = amalgamateVocab && vocab2 ? prompt1 + ' ' + prompt2 : prompt1;
  const finalDefinition = amalgamateVocab && vocab2 ? vocab1.Definition + ' ' + vocab2.Definition : vocab1.Definition;

  console.log('Amalgamated word:', { finalPrompt, finalTypedInput, finalDefinition });

  const padding = 10;
  ctx.font = '20px Arial';
  const textWidth = ctx.measureText(finalTypedInput).width;
  const maxX = canvas.width - textWidth - padding;
  const minX = padding;
  const xRange = maxX - minX;
  const x = mode === 'game' ? minX + Math.random() * (xRange > 0 ? xRange : 0) : 50;
  const finalX = Math.max(minX, Math.min(x, maxX));

  const y = 0;
  const speed = mode === 'game' ? 0.5 + wave * 0.5 * (level / 5) : 0.5 + level * 0.1;
  const word = { prompt: finalPrompt, typedInput: finalTypedInput, displayText: getUnderscoreText(finalTypedInput), x: finalX, y, speed, matched: '', definition: finalDefinition, isExiting: false };
  words.push(word);
  userInput.placeholder = finalPrompt;
  updateTimeIndicator();
  console.log('Word pushed:', word, 'Words array:', words);
}

export function updateGame(gameState) {
  const {
    gameActive, ctx, canvas, userInput, words, mode, wave, wpmStartTime,
    missedWords, totalChars, scoreDisplay, calculateWPM, calculateAccuracy,
    restartGame, spawnWord, vocabData, amalgamateVocab, promptType, level,
    timeLeft, caseSensitive, score, totalTypingTime, correctChars, updateTimeIndicator
  } = gameState;

  console.log('updateGame called', { gameActive, wordsLength: words.length, restartGameDefined: typeof restartGame });

  if (!gameActive) {
    console.log('Game not active, exiting updateGame');
    return;
  }

  let lastFrameTime = performance.now();
  function gameLoop() {
    if (!gameState.gameActive) {
      console.log('Game loop stopped: game not active');
      return;
    }

    const now = performance.now();
    if (now - lastFrameTime < 16.67) {
      requestAnimationFrame(gameLoop);
      return;
    }
    lastFrameTime = now;

    console.log('Game loop tick', { wordsLength: words.length, gameActive: gameState.gameActive });

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Test rendering
    ctx.fillStyle = 'blue';
    ctx.fillRect(10, 10, 50, 50);

    const rectHeight = 20;
    const rectY = canvas.height - rectHeight;
    ctx.beginPath();
    ctx.roundRect(0, rectY, canvas.width, rectHeight, 10);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fill();
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (words.length > 0) {
      const definition = words[0].definition;
      console.log('Rendering definition:', definition);
      ctx.font = '24px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.textAlign = 'center';
      const maxWidth = canvas.width - 40;
      const wordsArray = definition.split(' ');
      let line = '';
      let lines = [];
      for (let word of wordsArray) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== '') {
          lines.push(line.trim());
          line = word + ' ';
        } else {
          line = testLine;
        }
      }
      if (line) lines.push(line.trim());
      const lineHeight = 30;
      const totalHeight = lines.length * lineHeight;
      const startY = (canvas.height - totalHeight) / 2;
      lines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
      });
    } else {
      console.log('No words to render');
      ctx.font = '24px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.textAlign = 'center';
      ctx.fillText('Waiting for word...', canvas.width / 2, canvas.height / 2);
    }

    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    const computedStyle = window.getComputedStyle(document.body);
    const textColor = computedStyle.color || '#333';

    words.forEach(word => {
      console.log('Rendering word:', { text: word.displayText, x: word.x, y: word.y, matched: word.matched });
      const textWidth = ctx.measureText(word.typedInput).width;
      ctx.clearRect(word.x - 5, word.y - 25, textWidth + 10, 30);

      word.y += word.speed;
      const typed = userInput.value;
      const target = gameState.caseSensitive ? word.typedInput : word.typedInput.toLowerCase();
      const input = gameState.caseSensitive ? typed : typed.toLowerCase();
      word.matched = target.startsWith(input) ? typed : '';

      ctx.fillStyle = 'red';
      ctx.fillText(word.matched, word.x, word.y);

      const matchedWidth = ctx.measureText(word.matched).width;
      ctx.fillStyle = textColor;
      ctx.fillText(word.displayText.slice(word.matched.length), word.x + matchedWidth, word.y);

      if (word.y >= canvas.height) {
        console.log('Word reached bottom:', word.typedInput);
        missedWords.push(word.typedInput);
        gameState.totalChars += word.typedInput.length;
        words.length = 0;
        if (mode === 'game') {
          gameState.gameActive = false;
          console.log('Game over due to word reaching bottom');
          if (confirm(`Game Over! Score: ${gameState.score}, WPM: ${calculateWPM(gameState.totalTypingTime, gameState.totalChars)}, Accuracy: ${calculateAccuracy(gameState.totalChars, gameState.correctChars)}%\nClick OK to redo or Cancel to stay.`)) {
            gameState.usedTerms.length = 0;
            restartGame();
          }
        } else {
          spawnWord(vocabData, amalgamateVocab, promptType, mode, level, wave, ctx, canvas, userInput, words, updateTimeIndicator, gameState.usedTerms);
        }
      }
    });

    if (words.length === 0 && vocabData && vocabData.length > 0) {
      console.log('Spawning new word due to empty words array');
      spawnWord(vocabData, amalgamateVocab, promptType, mode, level, wave, ctx, canvas, userInput, words, updateTimeIndicator, gameState.usedTerms);
    }

    requestAnimationFrame(gameLoop);
  }
  gameLoop();
}

export function handleInput(e, words, caseSensitive, score, correctChars, totalChars, scoreDisplay, userInput, ctx, wpmStartTime, totalTypingTime, spawnWord, vocabData, amalgamateVocab, promptType, mode, level, wave, updateTimeIndicator) {
  const typed = e.target.value.trim();
  let newWpmStartTime = wpmStartTime;
  let newTotalTypingTime = totalTypingTime;
  let newScore = score;
  let newCorrectChars = correctChars;
  let newTotalChars = totalChars;
  let usedTerms = gameState.usedTerms || [];

  console.log('handleInput called', { typed, caseSensitive, wordsLength: words.length, usedTerms });

  if (newWpmStartTime === null && typed.length > 0) {
    newWpmStartTime = performance.now();
    console.log('WPM timer started at', new Date().toISOString());
  }

  let wordMatched = false;
  words = words.filter(word => {
    const target = caseSensitive ? word.typedInput : word.typedInput.toLowerCase();
    const input = caseSensitive ? typed : typed.toLowerCase();
    console.log('Comparing:', { target, input, matches: target === input });

    if (typed.length === 1 && target.startsWith(input)) {
      word.displayText = word.typedInput;
      console.log('First character matched, showing full text:', word.typedInput);
    }

    if (target === input) {
      console.log('Word matched:', word.typedInput);
      wordMatched = true;
      if (newWpmStartTime !== null) {
        const elapsed = (performance.now() - newWpmStartTime) / 1000;
        newTotalTypingTime += elapsed;
        console.log(`Word completed. Elapsed time: ${elapsed.toFixed(2)}s, Total typing time: ${newTotalTypingTime.toFixed(2)}s`);
      }
      newScore += word.typedInput.length;
      newCorrectChars += word.typedInput.length;
      newTotalChars += word.typedInput.length;
      scoreDisplay.textContent = `Score: ${newScore}`;
      e.target.value = '';
      console.log('Input cleared');
      e.target.placeholder = 'Type here...';
      ctx.clearRect(0, 0, ctx.canvas.width, canvas.height);
      newWpmStartTime = null;
      return false;
    }
    return true;
  });

  if (wordMatched && vocabData && vocabData.length > 0) {
    console.log('Clearing words array and spawning new word');
    words.length = 0;
    spawnWord(vocabData, amalgamateVocab, promptType, mode, level, wave, ctx, ctx.canvas, userInput, words, updateTimeIndicator, usedTerms);
  }

  console.log('After handleInput, words:', words, 'usedTerms:', usedTerms);
  updateTimeIndicator();
  return { wpmStartTime: newWpmStartTime, totalTypingTime: newTotalTypingTime, score: newScore, correctChars: newCorrectChars, totalChars: newTotalChars, words, usedTerms };
}