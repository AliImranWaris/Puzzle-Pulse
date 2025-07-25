const gameBoard = document.getElementById("gameBoard");
const scoreDisplay = document.getElementById("score");
const movesDisplay = document.getElementById("moves");
const timerDisplay = document.getElementById("timer");
const playerTurnDisplay = document.getElementById("playerTurn");

const resetBtn = document.getElementById("resetBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const winModal = document.getElementById("winModal");
const finalResult = document.getElementById("finalResult");
const finalTime = document.getElementById("finalTime");
const scoreList = document.getElementById("scoreList");

const imageUploader = document.getElementById("imageUploader");
const darkModeToggle = document.getElementById("darkModeToggle");

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchesFound = 0;
let moves = 0;
let timeLeft = 60;
let timerInterval = null;

let playerTurn = 1;
let player1Score = 0;
let player2Score = 0;

let customImages = [];

// Default fruit images
let imagePaths = [
  "https://www.nalis.gov.tt/wp-content/uploads/2024/04/local-fruits-banana.jpg ",
  "https://media-cldnry.s-nbcnews.com/image/upload/rockcms/2025-03/fruits-with-the-most-potassium-te-250319-f94687.jpg ",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn :ANd9GcRQdpOGq6wJ6aLmTkaWrfwWU6S09zmNlqbtcQ&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn :ANd9GcQVgzbUlG1c4mhMUUAxwl_Slkytus9bQ0OmMhMo4DBMvFWV6dTcQwkTSpx2LBF1LbEmQdE&usqp=CAU"
];

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function createCard(imagePath) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.dataset.value = imagePath;

  card.innerHTML = `
    <div class="inner">
      <div class="face back">❓</div>
      <div class="face front">
        <img src="${imagePath}" alt="Fruit Image" />
      </div>
    </div>
  `;

  card.addEventListener("click", handleCardClick);

  return card;
}

function handleCardClick(e) {
  if (lockBoard || this.classList.contains("flipped")) return;

  this.classList.add("flipped");

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  lockBoard = true;
  moves++;
  movesDisplay.textContent = `Moves: ${moves}`;

  const isMatch = firstCard.dataset.value === secondCard.dataset.value;

  if (isMatch) {
    matchesFound++;
    scoreDisplay.textContent = `Matches: ${matchesFound} / 8`;
    updatePlayerScore();
    resetTurn();
    if (matchesFound === 8) endGame();
  } else {
    switchPlayerTurn();
    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      resetTurn();
    }, 1000);
  }
}

function updatePlayerScore() {
  if (playerTurn === 1) player1Score++;
  else player2Score++;
}

function switchPlayerTurn() {
  playerTurn = playerTurn === 1 ? 2 : 1;
  playerTurnDisplay.textContent = `Player ${playerTurn}'s Turn`;
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

function startGame(custom = false) {
  clearInterval(timerInterval);
  timeLeft = 60;
  timerDisplay.textContent = `Time Left: ${timeLeft}s`;

  gameBoard.innerHTML = "";
  matchesFound = 0;
  moves = 0;
  lockBoard = false;
  scoreDisplay.textContent = "Matches: 0 / 8";
  movesDisplay.textContent = "Moves: 0";
  playerTurn = 1;
  playerTurnDisplay.textContent = "Player 1's Turn";
  player1Score = 0;
  player2Score = 0;

  const doubledImages = [...imagePaths, ...imagePaths];
  const shuffledImages = shuffle(doubledImages);

  shuffledImages.forEach((imgPath) => {
    const card = createCard(imgPath);
    gameBoard.appendChild(card);
  });

  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time Left: ${timeLeft}s`;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  clearInterval(timerInterval);
  let resultText = "You matched all cards!";
  if (player1Score > player2Score) resultText = "Player 1 Wins!";
  else if (player2Score > player1Score) resultText = "Player 2 Wins!";
  else resultText = "It's a Tie!";
  finalResult.textContent = resultText;
  finalTime.textContent = `Final Time: ${Math.max(timeLeft, 0)}s`;
  winModal.classList.remove("hidden");
  saveScore(moves);
}

function showLeaderboard() {
  const scores = JSON.parse(localStorage.getItem("scores") || "[]").sort((a, b) => a - b);
  scoreList.innerHTML = "";
  scores.slice(0, 5).forEach((score, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${score} moves`;
    scoreList.appendChild(li);
  });
}

function saveScore(score) {
  let scores = JSON.parse(localStorage.getItem("scores") || "[]");
  scores.push(score);
  scores.sort((a, b) => a - b);
  scores = scores.slice(0, 5);
  localStorage.setItem("scores", JSON.stringify(scores));
  showLeaderboard();
}

resetBtn.addEventListener("click", () => {
  winModal.classList.add("hidden");
  startGame();
});

playAgainBtn.addEventListener("click", () => {
  winModal.classList.add("hidden");
  startGame();
});

darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  darkModeToggle.textContent = document.body.classList.contains("dark-mode") ? "☀️ Light Mode" : "🌙 Dark Mode";
});

imageUploader.addEventListener("change", (e) => {
  const files = Array.from(e.target.files);
  if (files.length !== 8) {
    alert("Please select exactly 8 images.");
    return;
  }
  customImages = files.map(file => URL.createObjectURL(file));
  imagePaths = [...customImages];
  startGame(true);
});

showLeaderboard();

startGame();