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
  const x = Math.random() * 200 - 100 + ctx.canvas.width / 2; // Center ±100px
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

// [Remaining functions unchanged: getUnderscoreText, renderWord, wrapText, updateGame, calculateCorrectChars, calculateWPM, calculateAccuracy, calculateTermAccuracy]