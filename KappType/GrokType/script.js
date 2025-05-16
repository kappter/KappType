const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const userInput = document.getElementById('userInput');
const scoreDisplay = document.getElementById('score');
const waveDisplay = document.getElementById('wave');
const timerDisplay = document.getElementById('timer');
const wpmDisplay = document.getElementById('wpm');
const startScreen = document.getElementById('startScreen');
const gameContainer = document.getElementById('gameContainer');
const startButton = document.getElementById('startButton');
const levelInput = document.getElementById('levelInput');
const modeSelect = document.getElementById('modeSelect');
const vocabSelect = document.getElementById('vocabSelect');
const certificateButton = document.getElementById('certificateButton');
const definitionDisplay = document.getElementById('definition');
const loadingIndicator = document.getElementById('loadingIndicator');

canvas.width = 800;
canvas.height = 400;

let words = [];
let vocabData = [];
let score = 0;
let wave = 1;
let timeLeft = 30;
let gameActive = false;
let mode = 'game';
let level = 1;
let totalTime = 0;
let missedWords = [];
let totalChars = 0;
let correctChars = 0;
let lastFrameTime = performance.now();

// Embedded default vocabulary (53 computer science terms)
const defaultVocabData = [
  { Term: "Binary", Definition: "A numbering system that uses only 0s and 1s" },
  { Term: "Algorithm", Definition: "A set of rules to be followed in calculations or other problem-solving operations" },
  { Term: "Variable", Definition: "A named storage location in a program that can hold different values" },
  { Term: "Computer Science", Definition: "The study of computers and computational systems including programming and problem-solving" },
  { Term: "Computational Thinking", Definition: "A problem-solving approach using decomposition abstraction algorithms and data" },
  { Term: "Decomposition", Definition: "Breaking a complex problem into smaller manageable parts" },
  { Term: "Abstraction", Definition: "Simplifying a problem by focusing on essential details and ignoring irrelevant ones" },
  { Term: "Career Pathway", Definition: "A sequence of courses and experiences preparing students for computer science careers" },
  { Term: "Computer Scientist", Definition: "A professional who designs and develops computational systems or software" },
  { Term: "Pseudocode", Definition: "A simplified human-readable description of a program’s logic" },
  { Term: "Flowchart", Definition: "A visual diagram representing the steps of an algorithm or process" },
  { Term: "Pattern Recognition", Definition: "Identifying similarities or trends in data to solve problems" },
  { Term: "Iteration", Definition: "Repeating a process or set of instructions to achieve a goal" },
  { Term: "Data", Definition: "Information processed or stored by a computer such as numbers or text" },
  { Term: "Data Analysis", Definition: "The process of examining data to draw conclusions or identify patterns" },
  { Term: "Binary Number", Definition: "A number system using