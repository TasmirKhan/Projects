const cells = document.querySelectorAll('.cell');
const statusEl = document.getElementById('status');
const restartButton = document.getElementById('restart');
const modeSelect = document.getElementById('mode');
const playerNameEl = document.getElementById('player-name');

const PLAYER_X = 'X';
const PLAYER_O = 'O';
const AI_MEMORY_KEY = 'tttAiMemory';

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
let aiMoveHistory = [];

const playerName = sessionStorage.getItem('tttPlayer');
if (!playerName) window.location.href = 'login.html';
playerNameEl.textContent = `Player: ${playerName}`;

function getAudioCtx() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }
function beep(ctx, start, freq, duration, wave) { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = wave; osc.frequency.setValueAtTime(freq, start); gain.gain.setValueAtTime(0.0001, start); gain.gain.exponentialRampToValueAtTime(0.08, start + 0.01); gain.gain.exponentialRampToValueAtTime(0.0001, start + duration); osc.connect(gain); gain.connect(ctx.destination); osc.start(start); osc.stop(start + duration); }
function playTone(type) { const ctx = getAudioCtx(); const now = ctx.currentTime; if (type === 'place') beep(ctx, now, 520, 0.07, 'triangle'); else if (type === 'win') { beep(ctx, now, 660, 0.12, 'sine'); beep(ctx, now + 0.12, 880, 0.12, 'sine'); beep(ctx, now + 0.24, 1100, 0.16, 'sine'); } else if (type === 'draw') { beep(ctx, now, 440, 0.1, 'sawtooth'); beep(ctx, now + 0.12, 392, 0.12, 'sawtooth'); } else if (type === 'restart') { beep(ctx, now, 700, 0.08, 'square'); beep(ctx, now + 0.1, 520, 0.08, 'square'); } }

function updateLeaderboard(result) {
  const data = JSON.parse(localStorage.getItem('tttLeaderboard') || '{}');
  data[playerName] = data[playerName] || { wins: 0, losses: 0, draws: 0 };
  if (result === 'win') data[playerName].wins += 1;
  if (result === 'loss') data[playerName].losses += 1;
  if (result === 'draw') data[playerName].draws += 1;
  localStorage.setItem('tttLeaderboard', JSON.stringify(data));
}

function getAIMemory() {
  return JSON.parse(localStorage.getItem(AI_MEMORY_KEY) || '{}');
}

function updateAIMemory(gameResult) {
  if (gameMode !== 'ai' || !aiMoveHistory.length) return;
  const memory = getAIMemory();
  const delta = gameResult === 'loss' ? -2 : gameResult === 'win' ? 1 : 0.5;
  aiMoveHistory.forEach((key) => {
    memory[key] = (memory[key] || 0) + delta;
  });
  localStorage.setItem(AI_MEMORY_KEY, JSON.stringify(memory));
}

function updateStatus(message) { statusEl.textContent = message; }
function checkWinnerOn(board) { return winningCombinations.find(([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c]); }
function checkWinner() { return checkWinnerOn(boardState); }
function isDrawOn(board) { return board.every((c) => c !== ''); }
function isDraw() { return isDrawOn(boardState); }

function makeMove(index, player) {
  boardState[index] = player;
  const cell = cells[index];
  cell.textContent = player;
  cell.classList.add(player.toLowerCase());
  cell.disabled = true;
  playTone('place');
}

function endGame(message, toneType, result) {
  gameIsActive = false;
  updateStatus(message);
  cells.forEach((cell) => { cell.disabled = true; });
  playTone(toneType);
  if (result) updateLeaderboard(result);
  updateAIMemory(result);
}

function handleTurnEnd() {
  if (checkWinner()) {
    const result = currentPlayer === PLAYER_X ? 'win' : (gameMode === 'ai' ? 'loss' : null);
    endGame(`Player ${currentPlayer} wins!`, 'win', result);
    return true;
  }
  if (isDraw()) {
    endGame('It\'s a draw!', 'draw', 'draw');
    return true;
  }
  currentPlayer = currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
  updateStatus(`Current turn: ${currentPlayer}`);
  return false;
}

function minimax(board, depth, isMaximizing) {
  const winner = checkWinnerOn(board);
  if (winner) {
    const winningPlayer = board[winner[0]];
    return winningPlayer === PLAYER_O ? 10 - depth : depth - 10;
  }
  if (isDrawOn(board)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] !== '') continue;
      board[i] = PLAYER_O;
      const score = minimax(board, depth + 1, false);
      board[i] = '';
      bestScore = Math.max(bestScore, score);
    }
    return bestScore;
  }

  let bestScore = Infinity;
  for (let i = 0; i < 9; i++) {
    if (board[i] !== '') continue;
    board[i] = PLAYER_X;
    const score = minimax(board, depth + 1, true);
    board[i] = '';
    bestScore = Math.min(bestScore, score);
  }
  return bestScore;
}

function getBestAIMove() {
  const memory = getAIMemory();
  let bestScore = -Infinity;
  let bestMove = -1;

  for (let i = 0; i < 9; i++) {
    if (boardState[i] !== '') continue;
    boardState[i] = PLAYER_O;
    const stateKey = boardState.join('');
    const memoryBonus = memory[stateKey] || 0;
    const score = minimax(boardState, 0, false) + memoryBonus;
    boardState[i] = '';

    if (score > bestScore) {
      bestScore = score;
      bestMove = i;
    }
  }

  return bestMove;
}

function handleAIMove() {
  if (!gameIsActive || gameMode !== 'ai' || currentPlayer !== PLAYER_O) return;
  const aiMove = getBestAIMove();
  if (aiMove === -1) return;

  setTimeout(() => {
    if (!gameIsActive) return;
    makeMove(aiMove, PLAYER_O);
    aiMoveHistory.push(boardState.join(''));
    handleTurnEnd();
  }, 320);
}

function handleCellClick(event) {
  const index = Number(event.currentTarget.dataset.index);
  if (!gameIsActive || boardState[index] || (gameMode === 'ai' && currentPlayer === PLAYER_O)) return;

  makeMove(index, currentPlayer);
  const ended = handleTurnEnd();
  if (!ended) handleAIMove();
}

function resetGame() {
  boardState = Array(9).fill('');
  currentPlayer = PLAYER_X;
  gameIsActive = true;
  aiMoveHistory = [];

  cells.forEach((cell) => {
    cell.textContent = '';
    cell.classList.remove('x', 'o');
    cell.disabled = false;
  });

  updateStatus('Current turn: X');
  playTone('restart');
}

function handleModeChange() {
  gameMode = modeSelect.value;
  resetGame();
}

cells.forEach((cell) => cell.addEventListener('click', handleCellClick));
restartButton.addEventListener('click', resetGame);
modeSelect.addEventListener('change', handleModeChange);
