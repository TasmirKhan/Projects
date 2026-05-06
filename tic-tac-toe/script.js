const cells = document.querySelectorAll('.cell');
const statusEl = document.getElementById('status');
const restartButton = document.getElementById('restart');

const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let boardState = Array(9).fill('');
let currentPlayer = 'X';
let gameIsActive = true;

function updateStatus(message) {
  statusEl.textContent = message;
}

function checkWinner() {
  return winningCombinations.find(([a, b, c]) => {
    return boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c];
  });
}

function isDraw() {
  return boardState.every((cell) => cell !== '');
}

function handleCellClick(event) {
  const cell = event.currentTarget;
  const index = Number(cell.dataset.index);

  if (!gameIsActive || boardState[index]) {
    return;
  }

  boardState[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase());
  cell.disabled = true;

  const winningLine = checkWinner();
  if (winningLine) {
    gameIsActive = false;
    updateStatus(`Player ${currentPlayer} wins!`);
    cells.forEach((boardCell) => {
      boardCell.disabled = true;
    });
    return;
  }

  if (isDraw()) {
    gameIsActive = false;
    updateStatus('It\'s a draw!');
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateStatus(`Current turn: ${currentPlayer}`);
}

function resetGame() {
  boardState = Array(9).fill('');
  currentPlayer = 'X';
  gameIsActive = true;

  cells.forEach((cell) => {
    cell.textContent = '';
    cell.classList.remove('x', 'o');
    cell.disabled = false;
  });

  updateStatus('Current turn: X');
}

cells.forEach((cell) => {
  cell.addEventListener('click', handleCellClick);
});

restartButton.addEventListener('click', resetGame);
