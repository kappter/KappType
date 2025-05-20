# KappType - Typing Game with Vocabulary Challenge

KappType is an engaging typing game designed to improve typing speed and accuracy while testing vocabulary knowledge. Built with HTML, CSS, and JavaScript, it offers a variety of features to enhance the learning and gaming experience. Whether you're a beginner or an advanced typist, KappType provides a customizable and immersive environment.

## Features

### Core Gameplay
- **Wave-Based Challenge**: Progress through 10 waves with increasing difficulty. Each wave lasts 30 seconds, and a new wave begins with a pulsing effect on the typing box to signal the transition.
- **Typing Speed Measurement**: Tracks Words Per Minute (WPM) in real-time, with a cap at 200 WPM for accuracy.
- **Accuracy Tracking**: Calculates typing accuracy based on correct characters entered versus total characters attempted.
- **Score System**: Earn points based on the length of correctly typed words, displayed throughout the game.

### Customization Options
- **Multiple Themes**: Choose from five stunning themes—Natural Light, Natural Dark, Architecture, Space, and Medieval—each with unique gradients, fonts, and background patterns. Themes are saved in local storage.
- **Difficulty Levels**: Adjust the starting difficulty (levels 1–10) to tailor the initial word speed in practice mode.
- **Game Modes**: Play in "Game" mode (wave-based with a game-over condition) or "Practice" mode (continuous play with slower scaling speed).
- **Prompt Types**: Select from "Definition" (type the term), "Term" (type the definition), or "Mixed" (random mix of both) to challenge vocabulary recall.
- **Case Sensitivity**: Toggle case-sensitive typing for added difficulty.
- **Randomization**: Option to randomize vocabulary terms or cycle through them sequentially.

### Vocabulary System
- **Embedded Vocabulary**: Includes a default set of 53 computer science terms with definitions.
- **Custom Vocabulary Upload**: Upload up to two custom CSV files with "Term" and "Definition" columns to personalize the game (see below for instructions).
- **Amalgamation Support**: Combine a primary vocabulary set with a secondary set for mixed challenges, with separate upload options.
- **External Vocabulary Sets**: Access over 20 preloaded vocabulary sets from GitHub (e.g., Computer Science, Psychology, Music Theory) via dropdown selection.

### Visual and Interactive Elements
- **Dynamic Canvas**: Words fall from the top of a 800x350px canvas, with a red warning line near the bottom to indicate missed words.
- **Pulse Effect**: The typing box pulses when a new wave is reached, providing visual feedback.
- **Keyboard Highlighting**: Virtual keyboard highlights pressed keys in real-time.
- **Definition Display**: Shows the word’s definition in the center of the canvas during gameplay.

### Advanced Features
- **Certificate Generation**: Generate a LaTeX-based certificate (.tex file) with your name, WPM, accuracy, wave reached, missed terms, and score. Compile it using Overleaf for a professional PDF.
- **Reset Functionality**: Reset the game to initial conditions with a single button click.
- **Responsive Design**: Optimized for desktop and iPad (768x1024px) with adjusted layouts and font sizes.

## How to Upload Your Own Two Files

KappType allows you to upload up to two custom vocabulary files to enhance your gaming experience with personalized terms. Follow these steps to upload your own CSV files:

1. **Prepare Your CSV Files**:
   - Create two CSV files (e.g., `custom_vocab1.csv` and `custom_vocab2.csv`) using a text editor or spreadsheet software (e.g., Excel, Google Sheets).
   - Ensure each file has two columns: `Term` and `Definition`.
   - Example content for `custom_vocab1.csv`:
     ```
     Term,Definition
     Algorithm,A set of rules to solve a problem
     Loop,A structure that repeats code
     ```
   - Example content for `custom_vocab2.csv`:
     ```
     Term,Definition
     Variable,A storage location in memory
     Function,A reusable code block
     ```
   - Save the files with a `.csv` extension.

2. **Upload the Files**:
   - Open the KappType game in your browser.
   - On the start screen, locate the "Custom Vocabulary File" input field (labeled for the primary set) and the "Amalgamate Vocabulary File" input field (for the secondary set).
   - Click the "Choose File" button for the primary set and select `custom_vocab1.csv` from your device.
   - Optionally, click the "Choose File" button for the amalgamate set and select `custom_vocab2.csv` to combine with the primary set.
   - The game will automatically parse the uploaded files if they contain valid "Term" and "Definition" columns.

3. **Start the Game**:
   - After uploading, select any other desired options (e.g., theme, mode) and click the "Start Game" button.
   - The game will use your custom vocabulary sets, with the primary set as the main source and the amalgamate set mixed in if provided.
   - The vocabulary set title will update to reflect the names of your uploaded files (e.g., "custom_vocab1 + custom_vocab2").

4. **Notes**:
   - If a file fails to parse (e.g., missing columns), the game will fall back to the embedded vocabulary (53 computer science terms) and display an alert.
   - For external CSV loading, run a local server (e.g., `python -m http.server` and access `http://localhost:8000`) to avoid file protocol restrictions.
   - Uploaded files are not stored permanently; they are used only for the current session.

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, etc.).
- Optional: Papa Parse library (`papaparse.min.js`) for CSV parsing (included in the repository root).

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/kappter/KappType.git
   ```
2. Navigate to the project directory:
   ```
   cd KappType
   ```
3. Open `index.html` in a web browser to start playing.

### Development
- Edit `index.html`, `styles.css`, and `script.js` to customize the game.
- Add new vocabulary sets to the `vocab-sets` GitHub directory and update `populateVocabDropdown()` in `script.js` to include them.

## Contributing
Contributions are welcome! Please fork the repository, create a feature branch, and submit a pull request with your changes. Ensure compatibility with existing features and test across devices.

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments
- Inspired by typing games and educational tools.
- Uses Papa Parse for CSV handling and Noto fonts for typography.