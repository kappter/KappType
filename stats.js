export function calculateWPM(totalTypingTime, totalChars) {
  if (totalTypingTime === 0) return 0;
  const minutes = totalTypingTime / 60;
  const words = totalChars / 5; // Average word length
  return Math.round(words / minutes) || 0;
}

export function calculateAccuracy(totalChars, correctChars) {
  if (totalChars === 0) return 100;
  return Math.round((correctChars / totalChars) * 100);
}