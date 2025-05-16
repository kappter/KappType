# KappType

KappType is an interactive vocabulary typing game designed to help users improve typing speed and accuracy while learning key terms and definitions. Originally developed as "Typing Trainer," it has been rebranded to KappType with a modernized color scheme, enhanced certificate generation, and a streamlined user experience. The app is hosted on GitHub Pages at [https://kappter.github.io/KappType/KappType/GrokType/](https://kappter.github.io/KappType/KappType/GrokType/) and is gaining popularity at our school for educational and competitive use.

## Features

### Core Gameplay
- **Two Modes**:
  - **Game Mode**: Words fall from the top of a canvas, and players must type them correctly before they reach the bottom. Missing a word ends the game.
  - **Training Mode**: Words appear sequentially, allowing unlimited practice without game-over conditions.
- **Dynamic Word Spawning**: Words are sourced from a vocabulary set, with definitions displayed to aid learning.
- **Real-Time Feedback**:
  - On-screen keyboard highlights pressed keys.
  - Typed characters turn red as they match, with underscores indicating remaining letters.
- **Scoring and Metrics**:
  - Tracks score (based on word length), wave (difficulty level), time, and words per minute (WPM).
  - Accuracy percentage calculated from correct vs. total characters typed.
- **Level Selection**: Choose experience level (1–10) to adjust word speed and difficulty.

### Vocabulary Sets
- **Embedded Vocabulary**: Includes 53 computer science terms by default (e.g., "Binary," "Algorithm").
- **Custom Vocabulary**: Load external CSV files from [https://github.com/kappter/vocab-sets](https://github.com/kappter/vocab-sets) via a dropdown menu. Supported sets include:
  - Exploring Computer Science
  - ARRL Ham Radio Licenses
  - Psychology Terms
  - Music Theory
  - Web Development
  - And more (21 total sets).
- **CSV Validation**: Ensures valid "Term" and "Definition" columns, with fallback to embedded vocabulary if loading fails.

### User Interface
- **Canvas-Based Display**: Words move on an 800x400 canvas for a clean, game-like experience.
- **Responsive Design**: Built with Tailwind CSS for a consistent look across devices.
- **Interactive Keyboard**: Virtual keyboard highlights keys as they’re pressed, aiding touch-typing practice.
- **Definition Box**: Displays the definition of the current word, scrollable for longer text.

### Certificate Generation
- **Achievement Certificates**: Generate a certificate with:
  - Player’s name
  - Typing speed (WPM)
  - Accuracy percentage
  - Wave reached
  - Total time
  - Missed terms
  - Score
- **PDF Download (Planned)**: Sends LaTeX content to a server for PDF compilation (requires server setup).
- **Fallback**: Downloads a `.tex` file if PDF compilation fails, with instructions to compile on [Overleaf](https://www.overleaf.com/).
- **Security**: Sanitizes user input to prevent LaTeX injection.

### Recent Enhancements
- **Rebranding to KappType** (May 2025):
  - Updated app name from "Typing Trainer" to "KappType" in title, UI, and certificates.
  - Added copyright notice: "© 2025 KappType. All rights reserved." in the footer.
- **New Color Theme**:
  - Primary: #21949E (teal) for backgrounds/buttons.
  - Accent: #2094FD (blue) for focus rings/pressed keys.
  - Dark: #412223 (dark brown) for text/canvas background.
  - Highlight: #53D7C3 (cyan) for button hovers.
  - Light: #78AFB7 (light blue-gray) for secondary backgrounds/keys.
- **Improved Certificate Handling**:
  - Added LaTeX-based certificate generation with a modern layout.
  - Implemented server-side PDF compilation logic (pending server setup).
  - Enhanced fallback with Overleaf instructions for `.tex` files.
- **UI Polish**:
  - Streamlined start screen with a teal background.
  - Updated Tailwind classes to use custom color variables.
  - Ensured consistent typography with Noto font in certificates.

## Installation and Setup

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, etc.).
- Internet access for loading external vocabulary CSVs and (optionally) PDF compilation.
- For local testing: A simple HTTP server (e.g., `python -m http.server`) to avoid `file://` restrictions.

### Running Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/kappter/KappType.git
   cd KappType/KappType/GrokType
   ```
2. Start a local server:
   ```bash
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser.

### Deploying to GitHub Pages
1. Ensure files (`index.html`, `styles.css`, `script.js`) are in the `KappType/GrokType` directory.
2. Push changes to the `main` branch:
   ```bash
   git add .
   git commit -m "Update KappType"
   git push origin main
   ```
3. Verify the app at [https://kappter.github.io/KappType/KappType/GrokType/](https://kappter.github.io/KappType/KappType/GrokType/).

### Setting Up PDF Certificate Generation
To enable direct PDF downloads:
1. **Option 1: Use a LaTeX Compilation Service**:
   - Find a service like [LaTeX Online](https://latexonline.cc/) or Overleaf’s API.
   - Update `serverUrl` in `script.js` (line ~330) with the service’s API endpoint.
2. **Option 2: Host a Custom Server**:
   - Set up a Node.js or Python server with `pdflatex` installed.
   - Example Node.js endpoint:
     ```javascript
     const express = require('express');
     const { exec } = require('child_process');
     const fs = require('fs');
     const app = express();
     app.use(express.json());
     app.post('/api/compile', (req, res) => {
       const latex = req.body.latex;
       fs.writeFileSync('certificate.tex', latex);
       exec('pdflatex certificate.tex', (err) => {
         if (err) return res.status(500).send('Compilation failed');
         res.sendFile('certificate.pdf', { root: __dirname });
       });
     });
     app.listen(3000);
     ```
   - Deploy on Heroku/AWS and update `serverUrl` in `script.js`.
3. **Fallback**: Users can compile `.tex` files on Overleaf if no server is set up.

## Usage
1. **Start Screen**:
   - Select experience level (1–10).
   - Choose mode (Game or Training).
   - Pick a vocabulary set or use the default (53 computer science terms).
   - Click "Start."
2. **Gameplay**:
   - Type words displayed on the canvas, guided by definitions.
   - Monitor score, wave, time, and WPM.
   - In Game Mode, avoid letting words reach the bottom.
3. **Certificate**:
   - Click "Download Certificate" after a session.
   - Enter your name and download the PDF (or `.tex` if server isn’t set up).
4. **Local Testing Note**: Run a server for external CSV loading, as `file://` protocols block fetch requests.

## Project Structure
- `index.html`: Main HTML file with UI structure.
- `styles.css`: Custom CSS with Tailwind and color theme definitions.
- `script.js`: Game logic, vocabulary loading, and certificate generation.
- External dependencies:
  - [Papa Parse](https://cdnjs.cloudflare.com/ajax/libs/papaparse/5.3.2/papaparse.min.js) for CSV parsing.
  - [Tailwind CSS](https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css) for styling.

## Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit changes (`git commit -m "Add feature"`).
4. Push to the branch (`git push origin feature-name`).
5. Open a pull request.

Please ensure code follows the existing style (e.g., Tailwind for CSS, vanilla JS for logic) and test thoroughly.

## License
© 2025 KappType. All rights reserved. This project is proprietary, but contributions are welcome under the terms above.

## Contact
For issues or suggestions, open an issue on [GitHub](https://github.com/kappter/KappType) or contact the maintainer at [your-email@example.com] (replace with actual contact).

---

*Developed for Typing Mastery*