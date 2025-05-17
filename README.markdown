# KappType

KappType is a typing game designed to enhance vocabulary and typing skills, particularly in educational contexts like computer science. It integrates with external CSV vocabulary sets and offers features like theme toggling, certificates, and amalgamation of terms.

## Features
- **Vocabulary Learning**: Type terms or definitions based on prompts, with definitions displayed as a background for learning.
- **Amalgamation Mode**: Combines terms and definitions from two vocabulary sets with a space (e.g., "Binary Algorithm") to inspire creative connections.
- **Theme Toggle**: Switch between light and dark modes.
- **Certificates**: Generate a LaTeX certificate upon completion.
- **Custom Levels**: Adjust difficulty with a level selector.

## Delayed WPM Calculation
To support a learning-focused experience, WPM (Words Per Minute) calculation is delayed until the user makes their first keystroke after a word is cleared. This allows learners to study the definition and guess the word without impacting their typing speed score. Each new word acts as a fresh "session" where WPM begins tracking only after the initial input.

## Random or Structured Word Order
Teachers can choose between two modes for word presentation:
- **Random**: Words are selected randomly from the vocabulary list (default).
- **Structured**: Words are presented in the order they appear in the vocabulary list, looping back to the start when the list ends. This supports a scaffolded learning approach.

## Installation
1. Clone the repository: `git clone https://github.com/kappter/KappType.git`
2. Ensure `papaparse.min.js` is in the root directory for CSV parsing.
3. Serve locally (e.g., `python -m http.server 8000`) or use GitHub Pages.

## Usage
- Select a vocabulary set and optional amalgamation set from the dropdowns.
- Choose a prompt type (Term, Definition, or Both) and case sensitivity.
- Select word order (Random or Structured) to control word presentation.
- Adjust the level and start the game.
- Type the prompted text to score points and progress through waves.

## Development
- **Script**: `script.js` handles game logic and CSV loading.
- **Styles**: `styles.css` provides theme and layout styling.
- **HTML**: `index.html` structures the game interface.
- **Certificate**: `certificate.tex` generates the LaTeX certificate.

## Deployment
- Push changes to the `main` branch.
- Enable GitHub Pages under Settings > Pages, using the `/ (root)` source.
- Access at `https://kappter.github.io/KappType/`.

## Contributing
Fork the repository, make changes, and submit a pull request.

## License
[MIT License](LICENSE)