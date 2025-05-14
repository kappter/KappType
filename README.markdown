# Typing Tempest

Typing Tempest is an engaging, browser-based typing game designed to improve typing speed and accuracy, aiming for a goal of 40 words per minute (WPM). It features two game modes (Arcade and Training), supports Desktop and Tablet devices, and includes educational SAT vocabulary to enhance learning. Players type words falling on a canvas, earning points and advancing through waves or stints, with visual effects and a downloadable certificate to celebrate progress.

## Features

### Gameplay
- **Two Game Modes**:
  - **Arcade Mode**: Words spawn at random positions, with increasing speed per wave. Ideal for fast-paced challenges.
  - **Training Mode**: Words spawn left-to-right, with speed increasing within each stint (0.01 pixels/frame per second, capped at base speed + 0.3). Perfect for focused practice.
- **Experience Levels**: Choose difficulty from 1 (easy) to 10 (hard), adjusting word spawn rate (3000ms to 1778ms) and base speed (0.3 to 0.66 pixels/frame in Arcade, 0.2 to 0.47 in Training).
- **Word Categories**: Words are drawn from nine categories in `words.csv`:
  - `two_letter`, `three_letter`, `four_letter`, `five_letter`, `six_letter`, `seven_letter`, `hyphenated`, `special`, `sat_words`.
  - `sat_words` includes 100 SAT vocabulary words from [Vocabulary.com](https://www.vocabulary.com/lists/191545), e.g., `abate`, `benevolent`, `capricious`.
- **Wave-Based Difficulty**:
  - Each wave/stint lasts 30 seconds, with confetti effects on completion.
  - Higher waves favor longer words (`five_letter`, `six_letter`, `seven_letter`, `hyphenated`, `special`, `sat_words`): ~11.1% probability per category in Wave 1, ~16.7% in Wave 10+; shorter words (`two_letter`, `three_letter`, `four_letter`): ~11.1% to ~5.56%.
- **Scoring**: Earn 10 points per letter for each word typed correctly.
- **Misses**: Game ends after 5 missed words (words reaching the canvas bottom).

### Visual and UI Elements
- **Canvas**: 600x400 pixels (Desktop) or 600x300 (Tablet), with words falling from top to bottom.
- **Word Effects**: Words grow from 20px to 24px as they fall, with typed letters highlighted in red.
- **Background**: Transitions to darker blue hues per wave (HSL 200, 70%, 90% to 23%).
- **Confetti**: Celebrates wave/stint completion with colorful particle effects.
- **Keyboard Display**: On-screen keyboard (Desktop only) highlights pressed keys.
- **Info Panel**: Shows score, wave/stint, time, and misses (Desktop); overlaid on canvas (Tablet).
- **Compact Header**: Fixed, minimal header with game title.

### Customization
- **Device Support**:
  - **Desktop**: Full UI with keyboard display and info panel.
  - **Tablet**: Smaller canvas, no rendered keyboard, info on canvas for touch devices.
- **words.csv Structure**:
  - Row-based CSV with columns: `two_letter`, `three_letter`, `four_letter`, `five_letter`, `six_letter`, `seven_letter`, `hyphenated`, `special`, `sat_words`.
  - Each row contains one word per category (or empty). Example:
    ```
    two_letter,three_letter,four_letter,five_letter,six_letter,seven_letter,hyphenated,special,sat_words
    to,cat,play,smile,create,perfect,well-known,it's,abate
    of,dog,work,write,design,complex,high-tech,you're,abdicate
    ```
  - Allows random selection from specific categories, with 100 SAT words in `sat_words`.
- **Certificate**: Downloadable PDF certificate with player name, mode, score, wave/stint, words typed, WPM, accuracy, time, and misses.

### Technical Details
- **Libraries**:
  - [PapaParse](https://www.papaparse.com/) for CSV parsing.
  - [jsPDF](https://github.com/parallax/jsPDF) for PDF certificate generation.
  - [canvas-confetti](https://github.com/catdad/canvas-confetti) for wave/stint completion effects.
- **Canvas API**: Used for rendering words and game state.
- **Responsive Design**: CSS media queries for Tablet (max-width: 1024px).
- **Error Handling**: Robust parsing for `words.csv`, fallback for empty categories, and jsPDF validation.

## Setup

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, etc.).
- A local server (e.g., Python’s `http.server`) or hosting platform (e.g., GitHub Pages).

### Installation
1. **Clone or Download**:
   - Clone the repository or download the files: `index.html`, `styles.css`, `game.js`, `words.csv`.
2. **Directory Structure**:
   ```
   typing-tempest/
   ├── index.html
   ├── styles.css
   ├── game.js
   ├── words.csv
   ```
3. **Run Locally**:
   - Navigate to the project directory.
   - Start a local server:
     ```bash
     python -m http.server 8000
     ```
   - Open `http://localhost:8000` in your browser.
4. **Deploy to GitHub Pages** (Optional):
   - Push the files to a GitHub repository.
   - Enable GitHub Pages in the repository settings (use the `main` branch or a `gh-pages` branch).
   - Access the game at `https://<username>.github.io/<repository>`.

### Customization
- **Add Words**:
  - Edit `words.csv` to add words to any column. Ensure no trailing commas and valid UTF-8 encoding.
  - Example: Add `new` to `three_letter` in a new row:
    ```
    to,cat,play,smile,create,perfect,well-known,it's,abate
    of,new,work,write,design,complex,high-tech,you're,abdicate
    ```
- **Adjust Difficulty**:
  - Modify `BASE_SPEED`, `WORD_SPAWN_RATE`, or `SPEED_INCREMENT` in `game.js`.
  - Example: Reduce `WORD_SPAWN_RATE = 2000` for faster word spawning.
- **New Modes**:
  - Extend `gameMode` in `index.html` and `game.js` for category-specific modes (e.g., SAT-only practice).

## How to Play
1. **Start Screen**:
   - Select **Device Type** (Desktop or Tablet).
   - Choose **Game Mode** (Arcade or Training).
   - Pick **Experience Level** (1–10).
   - Click **Start Game**.
2. **Gameplay**:
   - Type the words falling on the canvas.
   - Correct letters turn red; complete words disappear, earning points.
   - Advance through waves (Arcade) or stints (Training) every 30 seconds.
   - Game ends after 5 misses.
3. **Game Over**:
   - View final score, words typed, and WPM.
   - Enter your name and download a PDF certificate.
   - Click **Restart** to play again.

## Contributing
- **Add Words**: Update `words.csv` with new words, ensuring they fit the category (e.g., `two_letter` for 2-letter words).
- **Enhance Features**: Submit pull requests for new modes, UI improvements, or performance optimizations.
- **Report Issues**: Open an issue for bugs or suggestions.

## License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details (if included).

## Acknowledgments
- SAT vocabulary sourced from [Vocabulary.com](https://www.vocabulary.com/lists/191545).
- Built with [PapaParse](https://www.papaparse.com/), [jsPDF](https://github.com/parallax/jsPDF), and [canvas-confetti](https://github.com/catdad/canvas-confetti).