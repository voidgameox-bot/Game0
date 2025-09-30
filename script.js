(() => {
  /**
   * Lights Out Game
   * - Grid of size N x N (3..7)
   * - Click toggles (r,c) and orthogonal neighbors
   * - Goal: all tiles off (false)
   */

  const boardEl = document.getElementById('board');
  const movesEl = document.getElementById('moves');
  const timeEl = document.getElementById('time');
  const sizeEl = document.getElementById('size');
  const difficultyEl = document.getElementById('difficulty');
  const newGameBtn = document.getElementById('newGame');
  const resetBtn = document.getElementById('reset');
  const helpBtn = document.getElementById('help');
  const toastEl = document.getElementById('toast');
  const howtoDialog = document.getElementById('howto');

  /** Game state */
  let gridSize = Number(sizeEl.value);
  let gridState = createEmptyGrid(gridSize);
  let initialState = cloneGrid(gridState);
  let movesCount = 0;
  let startTimeMs = null;
  let timerInterval = null;

  /*------------------ Utilities ------------------*/
  function createEmptyGrid(size) {
    return Array.from({ length: size }, () => Array.from({ length: size }, () => false));
  }

  function cloneGrid(grid) {
    return grid.map((row) => row.slice());
  }

  function gridEveryOff(grid) {
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c]) return false;
      }
    }
    return true;
  }

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  function getDifficultyShuffles(difficulty, size) {
    switch (difficulty) {
      case 'easy': return Math.max(size * size * 0.6, size * 2) | 0;
      case 'medium': return Math.max(size * size * 1.0, size * 3) | 0;
      case 'hard': return Math.max(size * size * 1.6, size * 4) | 0;
      default: return size * size;
    }
  }

  /*------------------ Rendering ------------------*/
  function renderBoard() {
    boardEl.innerHTML = '';
    boardEl.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    const fragment = document.createDocumentFragment();
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const tile = document.createElement('button');
        tile.className = `tile${gridState[r][c] ? ' on' : ''}`;
        tile.setAttribute('role', 'gridcell');
        tile.setAttribute('aria-pressed', String(gridState[r][c]));
        tile.dataset.r = String(r);
        tile.dataset.c = String(c);
        tile.addEventListener('click', onTileClick, { passive: true });
        fragment.appendChild(tile);
      }
    }
    boardEl.appendChild(fragment);
  }

  function updateTilesFromState() {
    const tiles = boardEl.querySelectorAll('.tile');
    tiles.forEach((tile) => {
      const r = Number(tile.dataset.r);
      const c = Number(tile.dataset.c);
      const isOn = gridState[r][c];
      tile.classList.toggle('on', isOn);
      tile.setAttribute('aria-pressed', String(isOn));
    });
  }

  function updateStats() {
    movesEl.textContent = String(movesCount);
    if (startTimeMs == null) {
      timeEl.textContent = '00:00';
    }
  }

  function startTimerIfNeeded() {
    if (startTimeMs != null || timerInterval != null) return;
    startTimeMs = Date.now();
    timerInterval = setInterval(() => {
      const seconds = Math.floor((Date.now() - startTimeMs) / 1000);
      timeEl.textContent = formatTime(seconds);
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval != null) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  /*------------------ Game mechanics ------------------*/
  function toggleAt(r, c) {
    if (r < 0 || c < 0 || r >= gridSize || c >= gridSize) return;
    gridState[r][c] = !gridState[r][c];
  }

  function applyMove(r, c) {
    toggleAt(r, c);
    toggleAt(r - 1, c);
    toggleAt(r + 1, c);
    toggleAt(r, c - 1);
    toggleAt(r, c + 1);
  }

  function onTileClick(e) {
    const r = Number(e.currentTarget.dataset.r);
    const c = Number(e.currentTarget.dataset.c);
    if (startTimeMs == null) startTimerIfNeeded();
    applyMove(r, c);
    movesCount += 1;
    updateTilesFromState();
    updateStats();
    checkForWin();
  }

  function checkForWin() {
    if (gridEveryOff(gridState)) {
      stopTimer();
      const seconds = startTimeMs ? Math.floor((Date.now() - startTimeMs) / 1000) : 0;
      showToast(`You win! ${movesCount} moves • ${formatTime(seconds)}`);
    }
  }

  function shuffleBoard() {
    // start from all-off, apply random valid moves so the puzzle is solvable
    gridState = createEmptyGrid(gridSize);
    const difficulty = difficultyEl.value;
    const shuffles = getDifficultyShuffles(difficulty, gridSize);
    for (let i = 0; i < shuffles; i++) {
      const r = Math.floor(Math.random() * gridSize);
      const c = Math.floor(Math.random() * gridSize);
      applyMove(r, c);
    }
    initialState = cloneGrid(gridState);
    movesCount = 0;
    startTimeMs = null;
    stopTimer();
    updateStats();
    renderBoard();
  }

  function resetBoard() {
    gridState = cloneGrid(initialState);
    movesCount = 0;
    startTimeMs = null;
    stopTimer();
    updateStats();
    renderBoard();
  }

  function resizeBoard(newSize) {
    gridSize = newSize;
    shuffleBoard();
  }

  /*------------------ Events ------------------*/
  sizeEl.addEventListener('change', () => resizeBoard(Number(sizeEl.value)));
  difficultyEl.addEventListener('change', () => shuffleBoard());
  newGameBtn.addEventListener('click', () => shuffleBoard());
  resetBtn.addEventListener('click', () => resetBoard());
  helpBtn.addEventListener('click', () => {
    if (typeof howtoDialog.showModal === 'function') {
      howtoDialog.showModal();
    } else {
      alert('Click tiles to toggle them and their neighbors. Turn all off to win.');
    }
  });

  /*------------------ Init ------------------*/
  function init() {
    renderBoard();
    shuffleBoard();
  }

  init();
})();

