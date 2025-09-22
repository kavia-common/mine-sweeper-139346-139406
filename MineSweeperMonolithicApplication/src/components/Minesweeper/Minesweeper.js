import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./Minesweeper.css";

/**
 * Game constants, presets, and helpers
 */
const DIFFICULTY_PRESETS = {
  Easy: { rows: 9, cols: 9, mines: 10 },
  Medium: { rows: 16, cols: 16, mines: 40 },
  Hard: { rows: 16, cols: 30, mines: 99 },
};

/**
 * Board cell object:
 * {
 *  row, col, isMine, isRevealed, isFlagged, adjacent
 * }
 */

/**
 * Creates an empty board.
 */
function createEmptyBoard(rows, cols) {
  const board = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r,
        col: c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacent: 0,
      });
    }
    board.push(row);
  }
  return board;
}

/**
 * Randomly lays mines, avoiding the first clicked cell (safe start).
 */
function layMines(board, mines, safeRow, safeCol) {
  const rows = board.length;
  const cols = board[0].length;
  const candidates = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // avoid safe cell and neighbors to improve UX on first click
      const isSafeNeighbor = Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1;
      if (!isSafeNeighbor) candidates.push([r, c]);
    }
  }
  // Shuffle
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  const placed = candidates.slice(0, Math.min(mines, candidates.length));
  placed.forEach(([r, c]) => {
    board[r][c].isMine = true;
  });
  return board;
}

/**
 * Computes adjacent mine counts for each cell.
 */
function computeAdjacency(board) {
  const rows = board.length;
  const cols = board[0].length;
  const dirs = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isMine) {
        board[r][c].adjacent = -1;
        continue;
      }
      let count = 0;
      for (const [dr, dc] of dirs) {
        const rr = r + dr;
        const cc = c + dc;
        if (rr >= 0 && rr < rows && cc >= 0 && cc < cols && board[rr][cc].isMine) {
          count++;
        }
      }
      board[r][c].adjacent = count;
    }
  }
  return board;
}

/**
 * Reveal flood fill (BFS) for zero-adjacent cells.
 */
function floodReveal(board, startRow, startCol) {
  const rows = board.length;
  const cols = board[0].length;
  const queue = [[startRow, startCol]];
  const visited = new Set();

  const key = (r, c) => `${r},${c}`;
  const neighbors = (r, c) => {
    const res = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const rr = r + dr;
        const cc = c + dc;
        if (rr >= 0 && rr < rows && cc >= 0 && cc < cols) {
          res.push([rr, cc]);
        }
      }
    }
    return res;
  };

  while (queue.length > 0) {
    const [r, c] = queue.shift();
    if (visited.has(key(r, c))) continue;
    visited.add(key(r, c));
    const cell = board[r][c];
    if (cell.isRevealed || cell.isFlagged) continue;
    cell.isRevealed = true;

    if (cell.adjacent === 0 && !cell.isMine) {
      const n = neighbors(r, c);
      for (const [rr, cc] of n) {
        const neighbor = board[rr][cc];
        if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
          queue.push([rr, cc]);
        }
      }
    }
  }
  return board;
}

/**
 * Count flags on board.
 */
function countFlags(board) {
  return board.flat().filter((c) => c.isFlagged).length;
}

/**
 * Count revealed non-mine cells.
 */
function countRevealedSafe(board) {
  return board.flat().filter((c) => c.isRevealed && !c.isMine).length;
}

/**
 * Reveals all mines - end game.
 */
function revealAllMines(board) {
  board.forEach((row) =>
    row.forEach((cell) => {
      if (cell.isMine) cell.isRevealed = true;
    })
  );
  return board;
}

/**
 * Deep clone simple board data
 */
function cloneBoard(board) {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

/**
 * Accessible label for a cell for screen readers
 */
function cellAriaLabel(cell, gameOver) {
  if (!cell.isRevealed && !gameOver) {
    return cell.isFlagged ? "Flagged cell, covered" : "Covered cell";
  }
  if (cell.isMine) {
    return "Mine";
  }
  if (cell.adjacent === 0) {
    return "Empty cell";
  }
  return `Cell with ${cell.adjacent} adjacent mines`;
}

/**
 * Timer hook with pause control
 */
function useGameTimer(active) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (active) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [active]);

  const reset = useCallback(() => setSeconds(0), []);
  return { seconds, reset };
}

// PUBLIC_INTERFACE
export default function Minesweeper() {
  /**
   * Game state
   */
  const [rows, setRows] = useState(DIFFICULTY_PRESETS.Easy.rows);
  const [cols, setCols] = useState(DIFFICULTY_PRESETS.Easy.cols);
  const [mines, setMines] = useState(DIFFICULTY_PRESETS.Easy.mines);

  const [board, setBoard] = useState(() => createEmptyBoard(rows, cols));
  const [firstClickDone, setFirstClickDone] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Start a new game and make your first move!");
  const [keyboardMode, setKeyboardMode] = useState(false); // toggled when using keyboard
  const [focusPos, setFocusPos] = useState([0, 0]); // row, col for keyboard navigation

  const coveredSafeCells = useMemo(
    () => rows * cols - mines,
    [rows, cols, mines]
  );

  const flagsPlaced = useMemo(() => countFlags(board), [board]);

  const gameActive = !gameOver && firstClickDone;
  const { seconds, reset: resetTimer } = useGameTimer(gameActive);

  const remainingMines = Math.max(0, mines - flagsPlaced);

  /**
   * Initialize a new game
   */
  const initGame = useCallback(
    (r, c, m) => {
      setFirstClickDone(false);
      setGameOver(false);
      setWon(false);
      setStatusMessage("Game ready. Click a cell to start!");
      setBoard(createEmptyBoard(r, c));
      setRows(r);
      setCols(c);
      setMines(m);
      resetTimer();
      setFocusPos([0, 0]);
    },
    [resetTimer]
  );

  // PUBLIC_INTERFACE
  const newGame = useCallback(() => {
    initGame(rows, cols, mines);
  }, [initGame, rows, cols, mines]);

  /**
   * Handle first-reveal lazy mine placement to ensure first click isn't a mine.
   */
  const ensureMinesLaid = useCallback(
    (safeRow, safeCol) => {
      if (firstClickDone) return board;
      let next = cloneBoard(board);
      next = layMines(next, mines, safeRow, safeCol);
      next = computeAdjacency(next);
      setFirstClickDone(true);
      return next;
    },
    [board, firstClickDone, mines]
  );

  /**
   * Check for win condition
   */
  const evaluateWin = useCallback(
    (nextBoard) => {
      const revealedSafe = countRevealedSafe(nextBoard);
      if (revealedSafe >= coveredSafeCells) {
        // win
        setGameOver(true);
        setWon(true);
        setStatusMessage(`You win! Time: ${seconds}s. Press Restart to play again.`);
        // Optional: call future high score submit hook here.
        return true;
      }
      return false;
    },
    [coveredSafeCells, seconds]
  );

  /**
   * Reveal a cell (left click / Enter)
   */
  const revealCell = useCallback(
    (r, c) => {
      if (gameOver) return;
      let next = ensureMinesLaid(r, c);
      next = cloneBoard(next);

      const cell = next[r][c];
      if (cell.isRevealed || cell.isFlagged) return;

      if (cell.isMine) {
        // lose
        revealAllMines(next);
        setBoard(next);
        setGameOver(true);
        setWon(false);
        setStatusMessage("Boom! You hit a mine. Press Restart to try again.");
        return;
      }

      if (cell.adjacent === 0) {
        next = floodReveal(next, r, c);
      } else {
        cell.isRevealed = true;
      }

      setBoard(next);
      evaluateWin(next);
    },
    [ensureMinesLaid, gameOver, evaluateWin]
  );

  /**
   * Toggle flag (right click / Space)
   */
  const toggleFlag = useCallback(
    (r, c) => {
      if (gameOver) return;
      let next = cloneBoard(board);
      const cell = next[r][c];
      if (cell.isRevealed) return;
      cell.isFlagged = !cell.isFlagged;
      setBoard(next);
      setStatusMessage(cell.isFlagged ? "Flag placed." : "Flag removed.");
    },
    [board, gameOver]
  );

  /**
   * Keyboard navigation and interaction
   */
  const handleKeyDown = useCallback(
    (e) => {
      // Enable keyboard mode after any key press on board region
      setKeyboardMode(true);
      const [r, c] = focusPos;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      switch (e.key) {
        case "ArrowUp":
          setFocusPos([Math.max(0, r - 1), c]);
          break;
        case "ArrowDown":
          setFocusPos([Math.min(rows - 1, r + 1), c]);
          break;
        case "ArrowLeft":
          setFocusPos([r, Math.max(0, c - 1)]);
          break;
        case "ArrowRight":
          setFocusPos([r, Math.min(cols - 1, c + 1)]);
          break;
        case "Enter":
        case "o":
        case "O":
          revealCell(r, c);
          break;
        case " ":
        case "f":
        case "F":
          e.preventDefault();
          toggleFlag(r, c);
          break;
        default:
          break;
      }
    },
    [focusPos, rows, cols, revealCell, toggleFlag]
  );

  /**
   * Difficulty change handler
   */
  const onPresetChange = useCallback((presetName) => {
    const preset = DIFFICULTY_PRESETS[presetName];
    if (!preset) return;
    initGame(preset.rows, preset.cols, preset.mines);
  }, [initGame]);

  /**
   * Custom configuration apply
   */
  const applyCustomConfig = useCallback((r, c, m) => {
    const rr = Math.max(5, Math.min(30, Number(r) || 9));
    const cc = Math.max(5, Math.min(30, Number(c) || 9));
    const maxMines = Math.max(1, rr * cc - 9); // keep at least a 3x3 safe zone
    const mm = Math.max(1, Math.min(maxMines, Number(m) || 10));
    initGame(rr, cc, mm);
  }, [initGame]);

  /**
   * End game overlay description
   */
  const endGameLabel = won ? "You won!" : "You lost!";

  /**
   * ARIA live region updates for status
   */
  useEffect(() => {
    // No-op; messages updated by setStatusMessage already read by SR via aria-live
  }, [statusMessage]);

  return (
    <div className="ms-wrapper">
      <header className="ms-header" role="banner">
        <h1 className="ms-title">Minesweeper</h1>
        <div className="ms-controls">
          <div className="ms-preset">
            <label htmlFor="preset" className="sr-only">Select difficulty preset</label>
            <select
              id="preset"
              aria-label="Select difficulty preset"
              onChange={(e) => onPresetChange(e.target.value)}
              defaultValue="Easy"
              className="ms-select"
            >
              {Object.keys(DIFFICULTY_PRESETS).map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <div className="ms-config">
            <label className="sr-only" htmlFor="rows">Rows</label>
            <input
              id="rows"
              className="ms-input"
              type="number"
              min="5"
              max="30"
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              aria-label="Rows"
            />
            <label className="sr-only" htmlFor="cols">Columns</label>
            <input
              id="cols"
              className="ms-input"
              type="number"
              min="5"
              max="30"
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
              aria-label="Columns"
            />
            <label className="sr-only" htmlFor="mines">Mines</label>
            <input
              id="mines"
              className="ms-input"
              type="number"
              min="1"
              max={Math.max(1, rows * cols - 9)}
              value={mines}
              onChange={(e) => setMines(Number(e.target.value))}
              aria-label="Mines"
            />
            <button
              className="ms-btn"
              onClick={() => applyCustomConfig(rows, cols, mines)}
              aria-label="Start new game with custom configuration"
            >
              New Game
            </button>
          </div>
          <button
            className="ms-btn ms-secondary"
            onClick={() => setShowHelp(true)}
            aria-haspopup="dialog"
            aria-controls="help-modal"
            aria-label="Open game instructions"
          >
            Help
          </button>
          <button
            className="ms-btn ms-warning"
            onClick={newGame}
            aria-label="Restart current game"
          >
            Restart
          </button>
        </div>
      </header>

      <section className="ms-status" aria-live="polite" aria-atomic="true">
        <div className="ms-status-item" role="status" aria-label={`Mines remaining: ${remainingMines}`}>
          💣 Mines: {remainingMines}
        </div>
        <div className="ms-status-item" role="status" aria-label={`Elapsed time: ${seconds} seconds`}>
          ⏱ Time: {seconds}s
        </div>
        <div
          className="ms-status-item"
          role="status"
          aria-label={`Game state: ${gameOver ? (won ? "won" : "lost") : firstClickDone ? "in progress" : "ready"}`}
        >
          🎮 State: {gameOver ? (won ? "Won" : "Lost") : firstClickDone ? "In Progress" : "Ready"}
        </div>
      </section>

      <p className="sr-only" aria-live="polite">{statusMessage}</p>

      <section
        className="ms-board-container"
        role="region"
        aria-label="Minesweeper board"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={() => setKeyboardMode(true)}
      >
        <Board
          board={board}
          gameOver={gameOver}
          focusPos={focusPos}
          keyboardMode={keyboardMode}
          onReveal={revealCell}
          onFlag={toggleFlag}
          setFocusPos={setFocusPos}
        />
        {gameOver && (
          <div className="ms-overlay" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="ms-overlay-card" role="dialog" aria-modal="true" aria-label={`Game over dialog: ${endGameLabel}`}>
              <h2 className="ms-overlay-title">{endGameLabel}</h2>
              <p className="ms-overlay-body">
                {won
                  ? `Great job! You cleared the board in ${seconds} seconds.`
                  : "You clicked on a mine. Better luck next time!"}
              </p>
              <button className="ms-btn" onClick={newGame} autoFocus aria-label="Play again">
                Play Again
              </button>
            </div>
          </div>
        )}
      </section>

      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)} />
      )}

      <footer className="ms-footer" role="contentinfo">
        <small>
          Tip: Use arrow keys to move, Enter to reveal, and Space to flag. Right click also flags.
        </small>
      </footer>
    </div>
  );
}

/**
 * Board component renders grid and handles mouse interactions
 */
function Board({ board, gameOver, focusPos, keyboardMode, onReveal, onFlag, setFocusPos }) {
  const rows = board.length;
  const cols = board[0]?.length || 0;

  const handleContext = (e, r, c) => {
    e.preventDefault();
    onFlag(r, c);
  };

  return (
    <div
      className="ms-board"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      role="grid"
      aria-rowcount={rows}
      aria-colcount={cols}
    >
      {board.map((row, rIdx) =>
        row.map((cell, cIdx) => {
          const focused = keyboardMode && focusPos[0] === rIdx && focusPos[1] === cIdx;
          return (
            <Cell
              key={`${rIdx}-${cIdx}`}
              cell={cell}
              focused={focused}
              gameOver={gameOver}
              onClick={() => onReveal(rIdx, cIdx)}
              onContextMenu={(e) => handleContext(e, rIdx, cIdx)}
              onMouseEnter={() => setFocusPos([rIdx, cIdx])}
            />
          );
        })
      )}
    </div>
  );
}

/**
 * Single Cell component
 */
function Cell({ cell, focused, gameOver, onClick, onContextMenu, onMouseEnter }) {
  const { isRevealed, isFlagged, isMine, adjacent } = cell;

  let display = "";
  let className = "ms-cell";
  if (isRevealed) {
    className += " revealed";
    if (isMine) display = "💣";
    else if (adjacent > 0) display = adjacent.toString();
  } else {
    className += " covered";
    if (isFlagged) display = "🚩";
  }
  const colorClass = isRevealed && !isMine && adjacent > 0 ? `c${adjacent}` : "";

  return (
    <button
      type="button"
      className={`${className} ${colorClass} ${focused ? "focused" : ""}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseEnter={onMouseEnter}
      aria-label={cellAriaLabel(cell, gameOver)}
      aria-pressed={isRevealed}
      role="gridcell"
      tabIndex={-1}
      disabled={isRevealed && !isMine ? false : false}
    >
      {display}
    </button>
  );
}

/**
 * Accessible Help/Instructions Modal
 */
// PUBLIC_INTERFACE
export function HelpModal({ onClose }) {
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="ms-modal-backdrop" role="dialog" aria-modal="true" id="help-modal" aria-labelledby="help-title">
      <div className="ms-modal">
        <h2 id="help-title">How to Play</h2>
        <div className="ms-modal-body">
          <p>
            Uncover all cells that do not contain mines. Numbers indicate how many mines are adjacent
            to a cell. Use logic to avoid clicking on mines.
          </p>
          <ul>
            <li>Left click or press Enter on a cell to uncover it.</li>
            <li>Right click or press Space/F to toggle a flag.</li>
            <li>Use arrow keys to move focus across the grid.</li>
            <li>The first click is always safe.</li>
          </ul>
          <p>
            Difficulty presets configure the board size and mine count automatically. You can also set
            custom rows, columns, and mines. The timer starts after your first move.
          </p>
          <p>
            End the game by either uncovering all safe cells (win) or clicking on a mine (loss).
          </p>
        </div>
        <div className="ms-modal-actions">
          <button className="ms-btn" onClick={onClose} aria-label="Close help">Close</button>
        </div>
      </div>
    </div>
  );
}
