// gameLogic.js - Manages game mechanics, including word spawning, game updates, and input handling.

export function getRandomVocab(sourceArray) {
  if (sourceArray.length === 0) return null;
  const index = Math.floor(Math.random() * sourceArray.length);
  return sourceArray[index];
}

export function getUnderscoreText(text) {
  if (text.length > 50) text = text.slice(0, 47) + '...';
  return text[0] + '_'.repeat(text.length - 1);
}

export function spawnWord(vocabData, amalgamateVocab, promptType, mode, level, wave, ctx, canvas, userInput, words, updateTimeIndicator) {
  if (vocabData.length === 0) {
    console.error('vocabData is empty in spawnWord');
    return;
  }

  const vocab1 = getRandomVocab(vocabData);
  if (!vocab1) {
    console.error('No vocab1 selected from vocabData:', vocabData);
    return;
  }
  console.log('vocab1 selected:', vocab1);

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
  if (amalgamateVocab.length > 0) {
    vocab2 = getRandomVocab(amalgamateVocab);
    if (vocab2) {
      console.log('vocab2 selected:', vocab2);
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

  const finalTypedInput = amalgamateVocab.length > 0 && vocab2 ? typedInput1 + ' ' + typedInput2 : typedInput1;
  const finalPrompt = amalgamateVocab.length > 0 && vocab2 ? prompt1 + ' ' + prompt2 : prompt1;
  const finalDefinition = amalgamateVocab.length > 0 && vocab2 ? vocab1.Definition + ' ' + vocab2.Definition : vocab1.Definition;

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
}

export function updateGame(gameActive, ctx, canvas, userInput, words, mode, wave, wpmStartTime, missedWords, totalChars, scoreDisplay, calculateWPM, calculateAccuracy, restartGame, spawnWordCallback, certificateButton, gameContainer, startScreen, vocabData, amalgamateVocab, promptType, level) {
  if (!gameActive) return;

  let lastFrameTime = performance.now();
  function gameLoop() {
    if (!gameActive) return;

    const now = performance.now();
    if (now - lastFrameTime < 16.67) {
      requestAnimationFrame(gameLoop);
      return;
    }
    lastFrameTime = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
    }

    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    const computedStyle = window.getComputedStyle(document.body);
    const textColor = computedStyle.color || '#333';

    words = words.filter(word => word.y < canvas.height && !word.isExiting);
    words.forEach(word => {
      const textWidth = ctx.measureText(word.typedInput).width;
      ctx.clearRect(word.x - 5, word.y - 25, textWidth + 10, 30);

      word.y += word.speed;
      const typed = userInput.value;
      const target = word.caseSensitive ? word.typedInput : word.typedInput.toLowerCase();
      const input = word.caseSensitive ? typed : typed.toLowerCase();
      word.matched = target.startsWith(input) ? typed : '';

      ctx.fillStyle = 'red';
      ctx.fillText(word.matched, word.x, word.y);

      const matchedWidth = ctx.measureText(word.matched).width;
      ctx.fillStyle = textColor;
      ctx.fillText(word.displayText.slice(word.matched.length), word.x + matchedWidth, word.y);

      if (word.y >= canvas.height) {
        missedWords.push(word.typedInput);
        totalChars += word.typedInput.length;
        word.isExiting = true;
        words = [];
        if (mode === 'game') {
          gameActive = false;
          const score = word.score || 0; // Fallback if score isn't passed correctly
          if (confirm(`Game Over! Score: ${score}, WPM: ${calculateWPM(totalTypingTime, totalChars)}, Accuracy: ${calculateAccuracy(totalChars, correctChars)}%\nClick OK to restart or Cancel to generate a certificate.`)) {
            restartGame();
          } else {
            // Keep game container visible, enable certificate button
            gameContainer.classList.remove('hidden');
            certificateButton.disabled = false;
            certificateButton.focus();
          }
        } else {
          spawnWordCallback(vocabData, amalgamateVocab, promptType, mode, level, wave, ctx, canvas, userInput, words, updateTimeIndicator);
        }
      }
    });

    if (words.length === 0) spawnWordCallback(vocabData, amalgamateVocab, promptType, mode, level, wave, ctx, canvas, userInput, words, updateTimeIndicator);
    if (mode === 'game' && wpmStartTime !== null && timeLeft <= 0) {
      wave++;
      waveDisplay.textContent = `Wave: ${wave}`;
      timeLeft = 30;
      words.forEach(word => word.speed += 0.5);
    }
    requestAnimationFrame(gameLoop);
  }
  gameLoop();
}

export function handleInput(e, words, caseSensitive, score, correctChars, totalChars, scoreDisplay, userInput, ctx, wpmStartTime, totalTypingTime, spawnWordCallback, vocabData, amalgamateVocab, promptType, mode, level, wave, updateTimeIndicator) {
  const typed = e.target.value;
  let newWpmStartTime = wpmStartTime;
  let newTotalTypingTime = totalTypingTime;

  if (newWpmStartTime === null && typed.length > 0) {
    newWpmStartTime = performance.now();
    console.log('WPM timer started at', new Date().toISOString());
  }

  words = words.filter(word => {
    const target = caseSensitive ? word.typedInput : word.typedInput.toLowerCase();
    const input = caseSensitive ? typed : typed.toLowerCase();
    if (typed.length === 1 && target.startsWith(input)) {
      word.displayText = word.typedInput;
    }
    if (target === input) {
      if (newWpmStartTime !== null) {
        const elapsed = (performance.now() - newWpmStartTime) / 1000;
        newTotalTypingTime += elapsed;
        console.log(`Word completed. Elapsed time: ${elapsed.toFixed(2)}s, Total typing time: ${newTotalTypingTime.toFixed(2)}s`);
      }
      score += word.typedInput.length;
      correctChars += word.typedInput.length;
      totalChars += word.typedInput.length;
      scoreDisplay.textContent = `Score: ${score}`;
      e.target.value = '';
      e.target.placeholder = 'Prompt will appear here...';
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      newWpmStartTime = null;
      word.isExiting = true;
      spawnWordCallback(vocabData, amalgamateVocab, promptType, mode, level, wave, ctx, canvas, userInput, words, updateTimeIndicator);
      return false;
    }
    return true;
  });

  updateTimeIndicator();
  return { wpmStartTime: newWpmStartTime, totalTypingTime: newTotalTypingTime, score, correctChars, totalChars, words };
}
