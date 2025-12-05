/**
 * Advanced Tic-Tac-Toe Game
 * A responsive, accessible tic-tac-toe game with customizable grid sizes
 */

// Game State
const GameState = {
    board: [],
    currentPlayer: 'X',
    gameActive: true,
    gridSize: 3,
    scores: { X: 0, O: 0, draw: 0 },
    cells: []
};

// DOM Elements
const DOM = {
    gameBoard: null,
    statusMessage: null,
    restartButton: null,
    sizeSelector: null,
    scoreX: null,
    scoreO: null,
    scoreDraw: null
};

// Initialize DOM references
function initializeDOM() {
    DOM.gameBoard = document.getElementById('game-board');
    DOM.statusMessage = document.getElementById('status-message');
    DOM.restartButton = document.getElementById('restart-btn');
    DOM.sizeSelector = document.getElementById('size-selector');
    DOM.scoreX = document.getElementById('score-x');
    DOM.scoreO = document.getElementById('score-o');
    DOM.scoreDraw = document.getElementById('score-draw');

    // Validate all DOM elements exist
    const missingElements = Object.entries(DOM)
        .filter(([key, value]) => value === null)
        .map(([key]) => key);

    if (missingElements.length > 0) {
        console.error('Missing DOM elements:', missingElements);
        throw new Error(`Required DOM elements not found: ${missingElements.join(', ')}`);
    }
}

/**
 * Initialize or reset the game
 */
function initializeGame() {
    try {
        // Validate DOM elements
        if (!DOM.sizeSelector || !DOM.gameBoard) {
            throw new Error('Required DOM elements not available');
        }

        const selectedSize = parseInt(DOM.sizeSelector.value, 10);
        
        // Comprehensive input validation
        if (isNaN(selectedSize)) {
            throw new Error('Grid size must be a number');
        }
        
        if (selectedSize < 3 || selectedSize > 6) {
            throw new Error(`Grid size must be between 3 and 6. Received: ${selectedSize}`);
        }

        if (!Number.isInteger(selectedSize)) {
            throw new Error('Grid size must be an integer');
        }

        // Reset game state
        GameState.gridSize = selectedSize;
        GameState.board = new Array(GameState.gridSize * GameState.gridSize).fill('');
        GameState.gameActive = true;
        GameState.currentPlayer = 'X';
        GameState.cells = [];
        
        // Update UI
        DOM.gameBoard.className = `game-board size-${GameState.gridSize}`;
        DOM.gameBoard.setAttribute('aria-label', `${GameState.gridSize} by ${GameState.gridSize} tic-tac-toe game board`);
        
        // Generate board with error handling
        generateBoard();
        
        // Update status
        updateStatusMessage(`Player ${GameState.currentPlayer}'s turn`);
        DOM.restartButton.style.display = 'none';
        DOM.restartButton.setAttribute('aria-hidden', 'true');
        
        // Clear any previous error states
        if (DOM.statusMessage) {
            DOM.statusMessage.classList.remove('error');
        }
    } catch (error) {
        console.error('Error initializing game:', error);
        const errorMessage = error.message || 'Failed to initialize game. Please refresh the page.';
        showError(errorMessage);
    }
}

/**
 * Generate the game board with cells
 */
function generateBoard() {
    try {
        DOM.gameBoard.innerHTML = '';
        GameState.cells = [];
        
        const totalCells = GameState.gridSize * GameState.gridSize;
        
        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.className = `cell size-${GameState.gridSize}`;
            cell.setAttribute('data-index', i);
            cell.setAttribute('role', 'gridcell');
            cell.setAttribute('tabindex', '0');
            cell.setAttribute('aria-disabled', 'false');
            const row = Math.floor(i / GameState.gridSize) + 1;
            const col = (i % GameState.gridSize) + 1;
            cell.setAttribute('aria-label', `Cell ${i + 1}, row ${row}, column ${col}, empty`);
            
            // Click handler
            cell.addEventListener('click', handleCellClick);
            
            // Keyboard navigation
            cell.addEventListener('keydown', handleCellKeyDown);
            
            // Focus management
            cell.addEventListener('focus', handleCellFocus);
            
            DOM.gameBoard.appendChild(cell);
            GameState.cells.push(cell);
        }
    } catch (error) {
        console.error('Error generating board:', error);
        showError('Failed to generate game board.');
    }
}

/**
 * Generate all possible winning conditions for the current grid size
 */
function generateWinningConditions() {
    const conditions = [];
    const size = GameState.gridSize;
    
    // Horizontal winning conditions
    for (let row = 0; row < size; row++) {
        for (let col = 0; col <= size - 3; col++) {
            const condition = [];
            for (let i = 0; i < 3; i++) {
                condition.push(row * size + col + i);
            }
            conditions.push(condition);
        }
    }
    
    // Vertical winning conditions
    for (let col = 0; col < size; col++) {
        for (let row = 0; row <= size - 3; row++) {
            const condition = [];
            for (let i = 0; i < 3; i++) {
                condition.push((row + i) * size + col);
            }
            conditions.push(condition);
        }
    }
    
    // Diagonal (top-left to bottom-right) winning conditions
    for (let row = 0; row <= size - 3; row++) {
        for (let col = 0; col <= size - 3; col++) {
            const condition = [];
            for (let i = 0; i < 3; i++) {
                condition.push((row + i) * size + col + i);
            }
            conditions.push(condition);
        }
    }
    
    // Anti-diagonal (top-right to bottom-left) winning conditions
    for (let row = 0; row <= size - 3; row++) {
        for (let col = 2; col < size; col++) {
            const condition = [];
            for (let i = 0; i < 3; i++) {
                condition.push((row + i) * size + col - i);
            }
            conditions.push(condition);
        }
    }
    
    return conditions;
}

/**
 * Handle cell click event
 */
function handleCellClick(event) {
    const clickedCell = event.target;
    makeMove(clickedCell);
}

/**
 * Handle keyboard events on cells
 */
function handleCellKeyDown(event) {
    const cell = event.target;
    const key = event.key;

    if (key === 'Enter' || key === ' ') {
        event.preventDefault();
        makeMove(cell);
    } else if (key.startsWith('Arrow')) {
        event.preventDefault();
        navigateCells(key, cell);
    }
}

/**
 * Handle cell focus for accessibility
 */
function handleCellFocus(event) {
    const cell = event.target;
    const index = parseInt(cell.getAttribute('data-index'), 10);
    const row = Math.floor(index / GameState.gridSize) + 1;
    const col = (index % GameState.gridSize) + 1;
    const value = GameState.board[index] || 'empty';
    
    cell.setAttribute('aria-label', `Cell ${index + 1}, row ${row}, column ${col}, ${value}`);
}

/**
 * Navigate between cells using arrow keys
 */
function navigateCells(direction, currentCell) {
    const currentIndex = parseInt(currentCell.getAttribute('data-index'), 10);
    const size = GameState.gridSize;
    let newIndex = currentIndex;
    const currentRow = Math.floor(currentIndex / size);
    const currentCol = currentIndex % size;

    switch (direction) {
        case 'ArrowUp':
            if (currentRow > 0) {
                newIndex = currentIndex - size;
            } else {
                // Wrap to bottom of same column
                newIndex = (size - 1) * size + currentCol;
            }
            break;
        case 'ArrowDown':
            if (currentRow < size - 1) {
                newIndex = currentIndex + size;
            } else {
                // Wrap to top of same column
                newIndex = currentCol;
            }
            break;
        case 'ArrowLeft':
            if (currentCol > 0) {
                newIndex = currentIndex - 1;
            } else {
                // Wrap to rightmost cell of same row
                newIndex = currentRow * size + (size - 1);
            }
            break;
        case 'ArrowRight':
            if (currentCol < size - 1) {
                newIndex = currentIndex + 1;
            } else {
                // Wrap to leftmost cell of same row
                newIndex = currentRow * size;
            }
            break;
    }

    // Only navigate to empty cells or allow navigation to any cell
    if (newIndex !== currentIndex && GameState.cells[newIndex]) {
        GameState.cells[newIndex].focus();
    }
}

/**
 * Make a move on the board
 */
function makeMove(cell) {
    try {
        // Validate cell element
        if (!cell || !cell.getAttribute) {
            console.warn('Invalid cell element provided');
            return;
        }

        const cellIndex = parseInt(cell.getAttribute('data-index'), 10);

        // Comprehensive validation
        if (isNaN(cellIndex)) {
            console.warn('Invalid cell index: not a number');
            return;
        }

        if (cellIndex < 0 || cellIndex >= GameState.board.length) {
            console.warn(`Invalid cell index: ${cellIndex}. Board length: ${GameState.board.length}`);
            showError('Invalid cell selected. Please try again.');
            return;
        }

        // Check game state
        if (!GameState.gameActive) {
            updateStatusMessage('⚠️ Game is over. Please start a new game.');
            return;
        }

        // Check if cell is already occupied
        if (GameState.board[cellIndex] !== '') {
            updateStatusMessage('⚠️ This cell is already occupied. Please choose another.');
            return;
        }

        // Validate current player
        if (GameState.currentPlayer !== 'X' && GameState.currentPlayer !== 'O') {
            console.error('Invalid current player:', GameState.currentPlayer);
            showError('Game state error. Please restart the game.');
            return;
        }

        // Make the move
        GameState.board[cellIndex] = GameState.currentPlayer;
        cell.classList.add(GameState.currentPlayer.toLowerCase());
        cell.textContent = GameState.currentPlayer;
        cell.setAttribute('aria-label', `Cell ${cellIndex + 1}, occupied by Player ${GameState.currentPlayer}`);
        cell.setAttribute('tabindex', '-1');
        cell.setAttribute('aria-disabled', 'true');
        
        // Update visual feedback
        cell.classList.add('played');
        
        // Remove focus from played cell
        cell.blur();

        // Check for game end
        checkGameEnd();
    } catch (error) {
        console.error('Error making move:', error);
        showError('Failed to make move. Please try again.');
    }
}

/**
 * Check if the game has ended (win or draw)
 */
function checkGameEnd() {
    try {
        const winningConditions = generateWinningConditions();
        let roundWon = false;
        let winningCombo = [];

        // Check all winning conditions
        for (let i = 0; i < winningConditions.length; i++) {
            const winCondition = winningConditions[i];
            
            // Validate win condition indices
            if (winCondition.length < 3) continue;
            
            const a = GameState.board[winCondition[0]];
            const b = GameState.board[winCondition[1]];
            const c = GameState.board[winCondition[2]];

            if (a === '' || b === '' || c === '') {
                continue;
            }
            
            if (a === b && b === c) {
                roundWon = true;
                winningCombo = winCondition;
                break;
            }
        }

        if (roundWon) {
            const winner = GameState.currentPlayer;
            updateStatusMessage(`🎉 Player ${winner} Wins! 🎉`);
            GameState.gameActive = false;
            highlightWinningCells(winningCombo);
            updateScore(winner);
            
            // Disable all cells
            GameState.cells.forEach(cell => {
                cell.setAttribute('tabindex', '-1');
                cell.setAttribute('aria-disabled', 'true');
            });
            
            DOM.restartButton.style.display = 'block';
            DOM.restartButton.setAttribute('aria-hidden', 'false');
            DOM.restartButton.focus();
            
            // Announce win to screen readers
            DOM.statusMessage.setAttribute('aria-live', 'assertive');
            return;
        }

        // Check for draw
        const roundDraw = !GameState.board.includes('');
        if (roundDraw) {
            updateStatusMessage(`🤝 It's a Draw! 🤝`);
            GameState.gameActive = false;
            updateScore('draw');
            
            // Disable all cells
            GameState.cells.forEach(cell => {
                cell.setAttribute('tabindex', '-1');
                cell.setAttribute('aria-disabled', 'true');
            });
            
            DOM.restartButton.style.display = 'block';
            DOM.restartButton.setAttribute('aria-hidden', 'false');
            DOM.restartButton.focus();
            return;
        }

        switchPlayer();
    } catch (error) {
        console.error('Error checking game end:', error);
        showError('Error checking game status.');
    }
}

/**
 * Highlight winning cells
 */
function highlightWinningCells(combo) {
    combo.forEach(index => {
        if (GameState.cells[index]) {
            GameState.cells[index].classList.add('win');
        }
    });
}

/**
 * Switch to the next player
 */
function switchPlayer() {
    GameState.currentPlayer = GameState.currentPlayer === 'X' ? 'O' : 'X';
    updateStatusMessage(`Player ${GameState.currentPlayer}'s turn`);
}

/**
 * Update the status message
 */
function updateStatusMessage(message) {
    if (DOM.statusMessage) {
        DOM.statusMessage.textContent = message;
        DOM.statusMessage.setAttribute('aria-label', message);
    }
}

/**
 * Update the score display
 */
function updateScore(winner) {
    try {
        if (winner === 'draw') {
            GameState.scores.draw++;
            if (DOM.scoreDraw) {
                DOM.scoreDraw.textContent = GameState.scores.draw;
            }
        } else if (winner === 'X' || winner === 'O') {
            GameState.scores[winner]++;
            if (winner === 'X' && DOM.scoreX) {
                DOM.scoreX.textContent = GameState.scores.X;
            } else if (winner === 'O' && DOM.scoreO) {
                DOM.scoreO.textContent = GameState.scores.O;
            }
        }
    } catch (error) {
        console.error('Error updating score:', error);
    }
}

/**
 * Restart the game
 */
function restartGame() {
    initializeGame();
}

/**
 * Show error message to user
 */
function showError(message) {
    if (DOM.statusMessage) {
        const errorText = message.startsWith('⚠️') ? message : `⚠️ ${message}`;
        DOM.statusMessage.textContent = errorText;
        DOM.statusMessage.setAttribute('aria-label', `Error: ${message}`);
        DOM.statusMessage.classList.add('error');
        
        // Announce to screen readers
        DOM.statusMessage.setAttribute('aria-live', 'assertive');
        
        // Remove error state after 4 seconds
        setTimeout(() => {
            if (DOM.statusMessage) {
                DOM.statusMessage.classList.remove('error');
                DOM.statusMessage.setAttribute('aria-live', 'polite');
            }
        }, 4000);
    } else {
        // Fallback to console if DOM not available
        console.error('Error:', message);
    }
}

/**
 * Initialize the application
 */
function init() {
    try {
        initializeDOM();
        initializeGame();
        setupEventListeners();
    } catch (error) {
        console.error('Failed to initialize application:', error);
        // Show user-friendly error message
        if (document.body) {
            document.body.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #e94560;">
                    <h1>Error Loading Game</h1>
                    <p>Failed to initialize the game. Please refresh the page.</p>
                    <p style="font-size: 0.9em; margin-top: 10px;">Error: ${error.message}</p>
                </div>
            `;
        }
    }
}

// Initialize when DOM is ready (works with defer attribute)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM already loaded
    init();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Grid size selector
    DOM.sizeSelector.addEventListener('change', initializeGame);
    
    // Restart button
    DOM.restartButton.addEventListener('click', restartGame);
    
    // Keyboard shortcut for restart (Ctrl+R or Cmd+R)
    document.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
            event.preventDefault();
            if (DOM.restartButton.style.display !== 'none') {
                restartGame();
            }
        }
    });
}