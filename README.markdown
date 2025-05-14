# Typing Tempest

Typing Tempest is a browser-based typing game designed to improve typing speed and accuracy, targeting 40 words per minute (WPM). It offers Arcade and Training modes, supports Desktop and Tablet devices, and includes 100 SAT vocabulary words for educational value. Players type falling words to earn points and advance through waves or stints, with visual effects and a downloadable PDF certificate.

## Features

### Gameplay
- **Two Game Modes**:
  - **Arcade Mode**: Words spawn randomly, with speed increasing per wave (`BASE_SPEED + (wave - 1) * 0.2`).
  - **Training Mode**: Words spawn left-to-right, with speed increasing within stints (0.01 pixels/frame per second, capped at `BASE_SPEED + 0.3`).
- **Experience Levels**: 1 (easy) to 10 (hard), adjusting spawn rate (3000ms to 1778ms) and base speed (Arcade: 0.3 to 0.66; Training: 0.2 to 0.47 pixels/frame).
- **Word Categories**: Nine categories in `words.csv`:
  - `two_letter`, `three_letter`, `four_letter`, `five_letter`, `six_letter`, `seven_letter`, `hyphenated`, `special`, `sat_words`.
  - `sat_words` includes 100 SAT words from [Vocabulary.com](https://www.vocabulary.com/lists/191545) (e.g., `abate`, `benevolent`).
- **Wave-Based Difficulty**:
  - Waves/stints last 30 seconds, with confetti on completion.
  - Higher waves favor long words (`five_letter`, `six_letter`, `seven_letter`, `hyphenated`, `special`, `sat_words`): ~11.1% per category (Wave 1) to ~16.7% (Wave 10+); short words (`two_letter`, `three_letter`, `four_letter`): ~11.1% to ~5.56%.
- **Scoring**: 10 points per letter for correct words.
- **Misses**: Game ends after 5 missed words.

### Visual and UI Elements
- **Canvas**: 600x400 (Desktop) or 600x300 (Tablet).
- **Word Effects**: Words grow from 20px to 24px, with typed letters in red.
- **Background**: Darkens per wave (HSL 200, 70%, 90% to 23%).
- **Confetti**: Celebrates wave/stint completion.
- **Keyboard Display**: On-screen keyboard (Desktop only) highlights keys.
- **Info Panel**: Shows score, wave/stint, time, misses (Desktop); on canvas (Tablet).
- **Compact Header**: Fixed, minimal title.

### Customization
- **Device Support**:
  - **Desktop**: Full UI with keyboard and info panel.
  - **Tablet**: Smaller canvas, no keyboard, info on canvas.
- **words.csv Structure**:
  - Row-based, with columns: `two_letter`, `three_letter`, `four_letter`, `five_letter`, `six_letter`, `seven_letter`, `hyphenated`, `special`, `sat_words`.
  - Each row has one word per category (or empty). Example:
    ```
    two_letter,three_letter,four_letter,five_letter,six_letter,seven_letter,hyphenated,special,sat_words
    to,cat,play,smile,create,perfect,well-known,it's,abate
    of,dog,work,write,design,complex,high-tech,you're,abdicate
    ```
  - Supports random selection from any category, with 100 SAT words in `sat_words`.
- **Certificate**: PDF with player name, mode, score, wave/stint, words typed, WPM, accuracy, time, and misses (fixed syntax error in generation).

### Technical Details
- **Libraries**:
  - [PapaParse](https://www.papaparse.com/) for CSV parsing.
  - [jsPDF](https://github.com/parallax/jsPDF) for PDF certificates.
  - [canvas-confetti](https://github.com/catdad/canvas-confetti) for effects.
- **Canvas API**: Renders words and game state.
- **Responsive Design**: CSS media queries for Tablet (max-width: 1024px).
- **Error Handling**: Handles empty CSV categories, jsPDF errors.

## Setup

### Prerequisites
- Modern browser (Chrome, Firefox, Safari).
- Local server (e.g., Python’s `http.server`) or hosting (e.g., GitHub Pages).

### Installation
1. **Clone or Download**:
   - Clone or download: `index.html`, `styles.css`, `game.js`, `words.csv`.
2. **Directory Structure**:
   ```
   typing-tempest/
   ├── index.html
   ├── styles.css
   ├── game.js
   ├── words.csv
   ```
3. **Run Locally**:
   - Navigate to directory.
   - Start server:
     ```bash
     python -m http.server 8000
     ```
   - Open `http://localhost:8000`.
4. **Deploy to GitHub Pages**:
   - Push to GitHub repository.
   - Enable GitHub Pages in settings (`main` or `gh-pages` branch).
   - Access at `https://<username>.github.io/<repository>`.

### Customization
- **Add Words**:
  - Edit `words.csv`, ensuring no trailing commas. Example:
    ```
    to,cat,play,smile,create,perfect,well-known,it's,abate
    of,new,work,write,design,complex,high-tech,you're,abdicate
    ```
- **Adjust Difficulty**:
  - Modify `BASE_SPEED`, `WORD_SPAWN_RATE`, `SPEED_INCREMENT` in `game.js`.
- **New Modes**:
  - Add modes (e.g., SAT-only) in `index.html` and `game.js`.

## How to Play
1. **Start Screen**:
   - Select Device Type (Desktop/Tablet), Game Mode (Arcade/Training), Experience Level (1–10).
   - Click **Start Game**.
2. **Gameplay**:
   - Type falling words to score points.
   - Advance waves (Arcade) or stints (Training) every 30 seconds.
   - Game ends after 5 misses.
3. **Game Over**:
   - View score, words typed, WPM.
   - Enter name, download PDF certificate.
   - Click **Restart**.

## Contributing
- **Add Words**: Update `words.csv` with category-appropriate words.
- **Enhance Features**: Submit pull requests for modes, UI, or optimizations.
- **Report Issues**: Open issues for bugs or suggestions.

## License
MIT License (see [LICENSE](LICENSE) if included).

## Acknowledgments
- SAT vocabulary from [Vocabulary.com](https://www.vocabulary.com/lists/191545).
- Uses [PapaParse](https://www.papaparse.com/), [jsPDF](https://github.com/parallax/jsPDF), [canvas-confetti](https://github.com/catdad/canvas-confetti).