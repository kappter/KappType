# Typing Tempest

Welcome to **Typing Tempest**, an exciting typing game that challenges your speed and accuracy! Type falling words or terms before they reach the bottom to score points and advance through waves or stints. With three gameplay modes, adjustable difficulty, and real-time performance tracking, Typing Tempest is perfect for casual players, typing enthusiasts, and students learning computer science vocabulary. Play on desktop or tablet, improve your skills, and earn a personalized certificate!

## Features

- **Three Gameplay Modes**:
  - **Arcade Mode**: Words fall randomly with increasing speed and spawn rate as waves progress. Survive as long as you can!
  - **Training Mode**: Words appear sequentially from left to right, with gradually increasing speed, ideal for practicing typing skills.
  - **Vocab Mode**: Type computer science terms matching displayed definitions. Terms appear as falling underscores, with the first letter revealed automatically, then display in light gray as you type, great for learning vocabulary.
- **Device Support**:
  - **Desktop**: Features an onscreen virtual keyboard with keypress animations and an info panel showing score, wave/stint, time, misses, WPM, and definition (vocab mode).
  - **Tablet**: Optimized UI with on-canvas stats, definition display, and a stop button, perfect for touch devices (virtual keyboard hidden).
- **Customizable Difficulty**: Choose from 10 experience levels (1 = Easy, 10 = Hard) to adjust word spawn rate and falling speed.
- **Real-Time WPM Tracking**: Monitor your Words Per Minute (WPM) live, displayed in the info panel (desktop) or on the canvas (tablet).
- **Input Clearing on Miss**: When a word reaches the bottom, the current typed input is cleared, letting you start fresh (vocab mode preserves first letter).
- **Vocab Mode Mechanics**:
  - Definitions from a computer science vocabulary set are shown onscreen.
  - Terms appear as falling underscores with the first letter revealed, turning light gray as you type.
  - Supports multi-word terms (e.g., “Computer Science”) with spaces in input and rendering.
  - Slower falling speed (0.1 base) and longer spawn interval (5s) for easier learning.
- **Dynamic Word Selection**:
  - Arcade/Training: Words sourced from a CSV with categories (e.g., two-letter, hyphenated, SAT words), with longer words in later waves.
  - Vocab: Terms from a vocabulary CSV, paired with definitions.
- **Wave Advancement Feedback**: A flash effect celebrates wave/stint ends with a white overlay fading out.
- **Game Over and Certificate**:
  - Game ends after 5 missed words, showing final score, words typed, and WPM.
  - Download a personalized PDF certificate with your name, score, WPM, accuracy, and more.
- **Responsive Design**: Adapts to screen sizes with CSS media queries.
- **Visual Feedback**:
  - Background darkens per wave.
  - Typed letters highlight in red (or gray in vocab mode).
  - Words/underscores grow as they fall.

## Screenshots

*(Add screenshots here, e.g.:)*
- Start Screen: `screenshots/start-screen.png`
- Arcade Mode: `screenshots/arcade-mode.png`
- Training Mode: `screenshots/training-mode.png`
- Vocab Mode: `screenshots/vocab-mode.png`
- Game Over: `screenshots/game-over.png`

## Setup Instructions

### Running Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/kappter/typing-tempest.git
   cd typing-tempest
   ```
2. Start a local server:
   ```bash
   python -m http.server 8000
   ```
3. Open `http://localhost:8000`.
4. Ensure `words.csv` and `vocabulary.csv` are in the root directory.

### Deploying to GitHub Pages
1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Deploy Typing Tempest"
   git push origin main
   ```
2. Enable GitHub Pages:
   - Go to Settings > Pages.
   - Set Source to `gh-pages` and root directory.
3. Access at `https://kappter.github.io/typing-tempest`.
4. Verify all assets (`index.html`, `game.js`, `styles.css`, `words.csv`, `vocabulary.csv`) are committed.

## Technologies Used
- **HTML5**: Structure and UI.
- **CSS3**: Styling with responsive design.
- **JavaScript**: Game logic, canvas rendering, event handling.
- **HTML5 Canvas**: For rendering falling words/terms, stats, flash effect.
- **PapaParse**: Parses `words.csv` and `vocabulary.csv`.
- **jsPDF**: Generates PDF certificates.
- **GitHub Pages**: Hosts the live game.

## Contributing
We welcome contributions! To contribute:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/new-feature`).
3. Commit changes (`git commit -m "Add new feature"`).
4. Push to the branch (`git push origin feature/new-feature`).
5. Open a Pull Request.
Report bugs or suggest features via [GitHub Issues](https://github.com/kappter/typing-tempest/issues).

## License
This project is licensed under the [MIT License](LICENSE).

---
Typing Tempest © 2025 | Built with 💻 and ☕