# Typing Game

A web-based typing game where players type falling words to score points. Words increase in speed over time and are grouped in 30-second waves. The game pulls words from a CSV file and features a rendered keyboard showing key presses.

## Features
- Falling words with increasing speed across waves
- 30-second waves with pauses between
- Words sourced from a CSV file with categories (2-letter, 3-letter, etc.)
- Rendered keyboard highlighting pressed keys
- Score tracking, miss counter, and game-over screen
- Built with HTML, CSS, and JavaScript, using the Canvas API and Papa Parse for CSV parsing

## Setup
1. **Clone or Download**: Download the project files (`index.html`, `styles.css`, `game.js`, `words.csv`).
2. **Host Locally**: Serve the files using a local server (e.g., Python’s `http.server` or VS Code’s Live Server) to enable CSV loading.
   ```bash
   python -m http.server 8000
   ```
3. **Open in Browser**: Navigate to `http://localhost:8000` to play.

## How to Play
- **Objective**: Type the falling words before they reach the bottom of the screen.
- **Controls**: Use your keyboard to type words (case-insensitive).
- **Waves**: Each wave lasts 30 seconds, with word speed increasing per wave.
- **Scoring**: Earn 10 points per character for each word typed.
- **Game Over**: Miss 5 words, and the game ends. Click "Restart" to play again.
- **Keyboard**: The on-screen keyboard highlights pressed keys.

## Project Structure
- `index.html`: Main HTML file with game canvas and keyboard.
- `styles.css`: Styles for the game UI and keyboard.
- `game.js`: Game logic, canvas rendering, and input handling.
- `words.csv`: Word data with columns for different word categories.

## Customization
- **Words**: Edit `words.csv` to add or modify words. Ensure comma-separated values match the column headers.
- **Game Settings**: Adjust constants in `game.js` (e.g., `MAX_MISSES`, `BASE_SPEED`, `WORD_SPAWN_RATE`) to tweak difficulty.

## Dependencies
- [Papa Parse](https://www.papaparse.com/) (loaded via CDN): For parsing the CSV file.

## Future Improvements
- Add sound effects for typing and wave transitions.
- Support mobile devices with touch input.
- Include difficulty settings or word category selection.