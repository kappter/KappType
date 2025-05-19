export function applyTheme(theme) {
  console.log('Applying theme:', theme);
  const root = document.documentElement;
  if (theme === 'dark') {
    root.style.setProperty('--background-color', '#1a1a1a');
    root.style.setProperty('--text-color', '#ffffff');
    root.style.setProperty('--canvas-bg', '#333333');
    root.style.setProperty('--key-bg', '#444444');
    root.style.setProperty('--key-pressed-bg', '#666666');
  } else {
    root.style.setProperty('--background-color', '#ffffff');
    root.style.setProperty('--text-color', '#000000');
    root.style.setProperty('--canvas-bg', '#f0f0f0');
    root.style.setProperty('--key-bg', '#e0e0e0');
    root.style.setProperty('--key-pressed-bg', '#bbbbbb');
  }
  localStorage.setItem('theme', theme);
}

export function highlightKeys(e) {
  const keys = document.querySelectorAll('.key');
  keys.forEach(key => key.classList.remove('pressed'));
  if (e.key === ' ') {
    document.querySelector('.key.large:last-child')?.classList.add('pressed'); // Space
  } else if (e.key === 'Backspace') {
    document.querySelector('.key.large:first-child')?.classList.add('pressed'); // Backspace
  } else if (e.key === 'Tab') {
    document.querySelector('.key-row:nth-child(2) .key.large')?.classList.add('pressed'); // Tab
  } else if (e.key === 'CapsLock') {
    document.querySelector('.key-row:nth-child(3) .key.large')?.classList.add('pressed'); // Caps Lock
  } else if (e.key === 'Enter') {
    document.querySelector('.key-row:nth-child(3) .key.large:last-child')?.classList.add('pressed'); // Enter
  } else if (e.key === 'Shift') {
    document.querySelectorAll('.key-row:nth-child(4) .key.large')?.forEach(shift => shift.classList.add('pressed')); // Shift
  } else if (e.key === 'Control') {
    document.querySelectorAll('.key-row:last-child .key:first-child, .key-row:last-child .key:last-child')?.forEach(ctrl => ctrl.classList.add('pressed')); // Ctrl
  } else if (e.key === 'Alt') {
    document.querySelectorAll('.key-row:last-child .key:nth-child(3), .key-row:last-child .key:nth-child(5)')?.forEach(alt => alt.classList.add('pressed')); // Alt
  } else if (e.key === 'Meta') {
    document.querySelectorAll('.key-row:last-child .key:nth-child(2), .key-row:last-child .key:nth-child(6)')?.forEach(win => win.classList.add('pressed')); // Win
  } else {
    const key = Array.from(keys).find(k => k.textContent.toLowerCase() === e.key.toLowerCase());
    if (key) key.classList.add('pressed');
  }
}

export function keyUpHandler() {
  document.querySelectorAll('.key').forEach(key => key.classList.remove('pressed'));
}
