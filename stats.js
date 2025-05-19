// stats.js - Manages score, WPM, accuracy, and timer calculations for the game.

export function calculateWPM(totalTypingTime, totalChars) {
  if (totalTypingTime === 0) return 0;
  const minutes = totalTypingTime / 60;
  const wordsTyped = totalChars / 5; // Standard WPM calculation: 5 characters = 1 word
  return minutes > 0 ? Math.round(wordsTyped / minutes) : 0;
}

export function calculateAccuracy(totalChars, correctChars) {
  return totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
}

export function updateTimer(gameActive, timeLeft, timerDisplay, wpmDisplay, wave, waveDisplay, mode, words, calculateWPM, totalTypingTime, totalChars) {
  if (!gameActive) return;
  timeLeft--;
  timerDisplay.textContent = `Time: ${timeLeft}s`;
  wpmDisplay.textContent = `WPM: ${calculateWPM(totalTypingTime, totalChars)}`;
  if (timeLeft <= 0) {
    wave++;
    waveDisplay.textContent = `Wave: ${wave}`;
    timeLeft = 30;
    if (mode === 'game') {
      words.forEach(word => word.speed += 0.5);
    }
  }
  setTimeout(() => updateTimer(gameActive, timeLeft, timerDisplay, wpmDisplay, wave, waveDisplay, mode, words, calculateWPM, totalTypingTime, totalChars), 1000);
  return { timeLeft, wave };
}