// theme.js - Manages theme toggling and UI interactions like key highlighting.

export function toggleTheme() {
  const body = document.body;
  body.classList.toggle('dark');
  const isDark = body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

export function highlightKeys(e) {
  const keys = document.querySelectorAll('.key');
  keys.forEach(key => key.classList.remove('pressed'));
  if (e.key === ' ') {
    document.querySelector('.space').classList.add('pressed');
  } else if (e.key === 'Backspace') {
    document.querySelector('.backspace').classList.add('pressed');
  } else if (e.key === 'Tab') {
    document.querySelector('.tab').classList.add('pressed');
  } else if (e.key === 'CapsLock') {
    document.querySelector('.caps-lock').classList.add('pressed');
  } else if (e.key === 'Enter') {
    document.querySelector('.enter').classList.add('pressed');
  } else if (e.key === 'Shift') {
    document.querySelectorAll('.shift').forEach(shift => shift.classList.add('pressed'));
  } else if (e.key === 'Control') {
    document.querySelectorAll('.ctrl').forEach(ctrl => ctrl.classList.add('pressed'));
  } else if (e.key === 'Alt') {
    document.querySelectorAll('.alt').forEach(alt => alt.classList.add('pressed'));
  } else if (e.key === 'Meta') {
    document.querySelectorAll('.win').forEach(win => win.classList.add('pressed'));
  } else {
    const key = Array.from(keys).find(k => k.textContent.toLowerCase() === e.key.toLowerCase());
    if (key) key.classList.add('pressed');
  }
}

export function keyUpHandler() {
  document.querySelectorAll('.key').forEach(key => key.classList.remove('pressed'));
}

export function updateTimeIndicator(timeIndicator, wpmStartTime) {
  if (timeIndicator) {
    timeIndicator.classList.remove('active');
    if (wpmStartTime !== null) {
      timeIndicator.classList.add('active');
    }
  }
}