# KappType

KappType is an interactive vocabulary typing game designed to help users improve typing speed and accuracy while learning key terms and definitions. Originally developed as "Typing Trainer," it has been rebranded to KappType with a modernized color scheme, enhanced certificate generation, and a streamlined user experience. The app is hosted on GitHub Pages at [https://kappter.github.io/KappType/](https://kappter.github.io/KappType/) and is gaining popularity at our school for educational and competitive use.

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
- **Custom Vocabulary**: Load external CSV files from [https://kappter.github.io/KappType/vocab-sets/](https://kappter.github.io/KappType/vocab-sets/) via a dropdown menu. Supported sets include:
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
- **PDF Compilation**: Download a `.tex` file and compile it into a PDF using Overleaf (https://www.overleaf.com/).
- **GitHub Sync**: Certificates are synced to [https://github.com/kappter/KappType](https://github.com/kappter/KappType) for version control.
- **Security**: Sanitizes user input to prevent LaTeX injection.

### Recent Enhancements
- **Rebranding to KappType** (May 2025):
  - Updated app name to "KappType" in title, UI, and certificates.
  - Added copyright notice: "© 2025 KappType. All rights reserved." in the footer.
- **New Color Theme**:
  - Primary: #21949E (teal) for backgrounds/buttons.
  - Accent: #2094FD (blue) for focus rings/pressed keys.
  - Dark: #412223 (dark brown) for text/canvas background.
  - Highlight: #53D7C3 (cyan) for button hovers.
  - Light: #78AFB7 (light blue-gray) for secondary backgrounds/keys.
- **Improved Certificate Handling**:
  - LaTeX-based certificate generation with a modern layout.
  - Synced with GitHub for easy Overleaf access.
- **UI Polish**:
  - Streamlined start screen with a teal background.
  - Updated Tailwind classes to use custom color variables.
  - Ensured consistent typography with Noto font in certificates.

## Installation and Setup

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, etc.).
- Internet access for loading external vocabulary CSVs and Overleaf compilation.
- For local testing: A simple HTTP server (e.g., `python -m http.server`) to avoid `file://` restrictions.

### Running Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/kappter/KappType.git
   cd KappType
   ```
2. Start a local server:
   ```bash
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser.

### Deploying to GitHub Pages
1. Ensure files (`index.html`, `styles.css`, `script.js`, `certificate.tex`, `favicon.ico`) are in the repository root.
2. Push changes to the `main` branch:
   ```bash
   git add .
   git commit -m "Update KappType"
   git push origin main
   ```
3. Configure GitHub Pages:
   - Go to **Settings** > **Pages** in the repository.
   - Set **Source** to **Deploy from a branch**, select `main`, and choose `/ (root)`.
   - Save and verify the app at [https://kappter.github.io/KappType/](https://kappter.github.io/KappType/).

### Setting Up Overleaf for Certificates
1. **Create an Overleaf Project**:
   - Go to [https://www.overleaf.com/](https://www.overleaf.com/) and create a new project named `KappType-Certificate`.
   - Add `certificate.tex` from the repository.
   - Compile to verify it generates a PDF with placeholders.
2. **Sync with GitHub**:
   - In Overleaf, go to **Menu** > **Sync** > **GitHub**.
   - Link to `https://github.com/kappter/KappType` and pull `certificate.tex`.
   - Alternatively, manually upload `certificate.tex` to Overleaf.
3. **Generate Certificates**:
   - In the app, click **Download Certificate** after a session.
   - Download the `.tex` file, upload it to Overleaf, and compile to PDF.
   - Or update the synced `certificate.tex` in GitHub and pull to Overleaf.

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
   - Enter your name and download the `.tex` file.
   - Upload to Overleaf to compile into a PDF.
4. **Local Testing Note**: Run a server for external CSV loading, as `file://` protocols block fetch requests.

## Project Structure
- `index.html`: Main HTML file with UI structure.
- `styles.css`: Custom CSS with Tailwind and color theme definitions.
- `script.js`: Game logic, vocabulary loading, and certificate generation.
- `certificate.tex`: LaTeX template for certificates.
- `favicon.ico`: App icon.
- `vocab-sets/`: Directory containing CSV vocabulary files.
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