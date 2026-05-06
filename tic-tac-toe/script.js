const cells = document.querySelectorAll('.cell');
const statusEl = document.getElementById('status');
const restartButton = document.getElementById('restart');
const modeSelect = document.getElementById('mode');

const PLAYER_X = 'X';
const PLAYER_O = 'O';

const winningCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

let boardState = Array(9).fill('');
let currentPlayer = PLAYER_X;
let gameIsActive = true;
let gameMode = 'pvp';
let audioCtx;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(type) {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;

  if (type === 'place') {
    beep(ctx, now, 520, 0.07, 'triangle');
  } else if (type === 'win') {
    beep(ctx, now, 660, 0.12, 'sine');
    beep(ctx, now + 0.12, 880, 0.12, 'sine');
    beep(ctx, now + 0.24, 1100, 0.16, 'sine');
  } else if (type === 'draw') {
    beep(ctx, now, 440, 0.1, 'sawtooth');
    beep(ctx, now + 0.12, 392, 0.12, 'sawtooth');
  } else if (type === 'restart') {
    beep(ctx, now, 700, 0.08, 'square');
    beep(ctx, now + 0.1, 520, 0.08, 'square');
  }
}

function beep(ctx, start, freq, duration, wave) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = wave;
  osc.frequency.setValueAtTime(freq, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.08, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(start);
  osc.stop(start + duration);
}

function updateStatus(message) {
  statusEl.textContent = message;
}

function checkWinner() {
  return winningCombinations.find(([a, b, c]) => boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]);
}

function isDraw() {
  return boardState.every((cell) => cell !== '');
}

function makeMove(index, player) {
  boardState[index] = player;
  const cell = cells[index];
  cell.textContent = player;
  cell.classList.add(player.toLowerCase());
  cell.disabled = true;
  playTone('place');
}

function endGame(message, toneType) {
  gameIsActive = false;
  updateStatus(message);
  cells.forEach((cell) => {
    cell.disabled = true;
  });
  playTone(toneType);
}

function handleTurnEnd() {
  const winningLine = checkWinner();
  if (winningLine) {
    endGame(`Player ${currentPlayer} wins!`, 'win');
    return true;
  }

  if (isDraw()) {
    endGame('It\'s a draw!', 'draw');
    return true;
  }

  currentPlayer = currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
  updateStatus(`Current turn: ${currentPlayer}`);
  return false;
}

function getBestAIMove() {
  const emptyIndices = boardState
    .map((value, index) => (value === '' ? index : null))
    .filter((value) => value !== null);

  for (const index of emptyIndices) {
    boardState[index] = PLAYER_O;
    if (checkWinner()) {
      boardState[index] = '';
      return index;
    }
    boardState[index] = '';
  }

  for (const index of emptyIndices) {
    boardState[index] = PLAYER_X;
    if (checkWinner()) {
      boardState[index] = '';
      return index;
    }
    boardState[index] = '';
  }

  if (boardState[4] === '') return 4;

  const corners = [0, 2, 6, 8].filter((i) => boardState[i] === '');
  if (corners.length) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
}

function handleAIMove() {
  if (!gameIsActive || gameMode !== 'ai' || currentPlayer !== PLAYER_O) {
    return;
  }

  const aiMove = getBestAIMove();
  if (aiMove === undefined) return;

  setTimeout(() => {
    if (!gameIsActive) return;
    makeMove(aiMove, PLAYER_O);
    handleTurnEnd();
  }, 320);
}

function handleCellClick(event) {
  const index = Number(event.currentTarget.dataset.index);

  if (!gameIsActive || boardState[index] || (gameMode === 'ai' && currentPlayer === PLAYER_O)) {
    return;
  }

  makeMove(index, currentPlayer);
  const ended = handleTurnEnd();

  if (!ended) {
    handleAIMove();
  }
}

function resetGame() {
  boardState = Array(9).fill('');
  currentPlayer = PLAYER_X;
  gameIsActive = true;

  cells.forEach((cell) => {
    cell.textContent = '';
    cell.classList.remove('x', 'o');
    cell.disabled = false;
  });

  updateStatus('Current turn: X');
  playTone('restart');

  if (gameMode === 'ai' && currentPlayer === PLAYER_O) {
    handleAIMove();
  }
}

function handleModeChange() {
  gameMode = modeSelect.value;
  resetGame();
}

cells.forEach((cell) => {
  cell.addEventListener('click', handleCellClick);
});

restartButton.addEventListener('click', resetGame);
modeSelect.addEventListener('change', handleModeChange);
