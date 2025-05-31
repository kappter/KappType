export function updateTimer(timerDisplay, timeLeft, totalTime, mode, sessionStartTime, elapsedTime, gameActive, wpmDisplay, sessionEndTime, score, correctTermsCount, calculateWPM, wpmActive) {
  if (!gameActive) return;
  if (mode === 'game') {
    timeLeft = Math.max(0, timeLeft - 1);
    totalTime++;
    timerDisplay.textContent = `Time: ${timeLeft}s`;
  } else {
    const now = performance.now();
    elapsedTime = Math.floor((now - sessionStartTime) / 1000);
    timerDisplay.textContent = `Elapsed: ${elapsedTime}s`;
  }
  updateWPMDisplay(wpmDisplay, calculateWPM(wpmActive, sessionStartTime, sessionEndTime, score));
  if (timeLeft === 0 && mode === 'game') {
    timeLeft = 30;
    console.log(`Timer reset: Added 30 seconds. Continue playing! CorrectTermsCount: ${correctTermsCount}`);
    setTimeout(() => updateTimer(timerDisplay, timeLeft, totalTime, mode, sessionStartTime, elapsedTime, gameActive, wpmDisplay, sessionEndTime, score, correctTermsCount, calculateWPM, wpmActive), 1000);
  } else if (timeLeft > 0 || mode === 'practice') {
    setTimeout(() => updateTimer(timerDisplay, timeLeft, totalTime, mode, sessionStartTime, elapsedTime, gameActive, wpmDisplay, sessionEndTime, score, correctTermsCount, calculateWPM, wpmActive), 1000);
  }
}

export function updateWPMDisplay(wpmDisplay, currentWPM) {
  wpmDisplay.textContent = `WPM: ${currentWPM}`;
}

export function updateStatsDisplay(scoreDisplay, waveDisplay, timerDisplay, wpmDisplay, termsToWaveDisplay, termsCoveredDisplay, score, wave, timeLeft, currentWPM, correctTermsCount, vocabData, amalgamateVocab, coveredTerms) {
  const totalTerms = vocabData.length + (amalgamateVocab.length > 0 ? amalgamateVocab.length : 0);
  const termsToWave = 10 - correctTermsCount;
  scoreDisplay.textContent = `Score: ${score}`;
  waveDisplay.textContent = `Wave: ${wave}`;
  timerDisplay.textContent = `Time: ${timeLeft >= 0 ? timeLeft : 0}s`;
  wpmDisplay.textContent = `WPM: ${currentWPM}`;
  termsToWaveDisplay.textContent = `To Wave: ${termsToWave}`;
  termsCoveredDisplay.textContent = `Terms: ${coveredTerms.size}/${totalTerms}`;
}

export function highlightKeys(e, keys) {
  keys.forEach(key => key.classList.remove('pressed'));
  const keyValue = e.key === ' ' ? ' ' : e.key;
  const keyElement = Array.from(keys).find(k => k.getAttribute('data-key') === keyValue);
  if (keyElement) keyElement.classList.add('pressed');
  else if (e.key === 'Shift') document.querySelectorAll('.shift').forEach(shift => shift.classList.add('pressed'));
  else if (e.key === 'Control') document.querySelectorAll('.ctrl').forEach(ctrl => ctrl.classList.add('pressed'));
  else if (e.key === 'Alt') document.querySelectorAll('.alt').forEach(alt => alt.classList.add('pressed'));
  else if (e.key === 'Meta') document.querySelectorAll('.win').forEach(win => win.classList.remove('pressed'));
}

export function keyUpHandler(e, keys) {
  const keyValue = e.key === ' ' ? ' ' : e.key;
  const keyElement = Array.from(keys).find(k => k.getAttribute('data-key') === keyValue);
  if (keyElement) keyElement.classList.remove('pressed');
  else if (e.key === 'Shift') document.querySelectorAll('.shift').forEach(shift => shift.classList.remove('pressed'));
  else if (e.key === 'Control') document.querySelectorAll('.ctrl').forEach(ctrl => ctrl.classList.remove('pressed'));
  else if (e.key === 'Alt') document.querySelectorAll('.alt').forEach(alt => alt.classList.remove('pressed'));
  else if (e.key === 'Meta') document.querySelectorAll('.win').forEach(win => win.classList.remove('pressed'));
}

export function updateTimeIndicator(timeIndicator, sessionStartTime) {
  if (timeIndicator) {
    timeIndicator.classList.remove('active');
    if (sessionStartTime !== null) timeIndicator.classList.add('active');
  }
}
