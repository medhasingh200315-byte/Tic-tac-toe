let board = [];
let currentPlayer = 'X';
let gameActive = true;
let gridSize = 3;
let scores = { X: 0, O: 0, draw: 0 };

const cells = [];
const gameBoard = document.getElementById('game-board');
const statusMessage = document.getElementById('status-message');
const restartButton = document.getElementById('restart-btn');
const sizeSelector = document.getElementById('size-selector');
const scoreX = document.getElementById('score-x');
const scoreO = document.getElementById('score-o');
const scoreDraw = document.getElementById('score-draw');

function initializeGame() {
    gridSize = parseInt(sizeSelector.value);
    board = new Array(gridSize * gridSize).fill('');
    gameActive = true;
    currentPlayer = 'X';
    
    gameBoard.className = `game-board size-${gridSize}`;
    generateBoard();
    
    updateStatusMessage(`Player ${currentPlayer}'s turn`);
    restartButton.style.display = 'none';
}

function generateBoard() {
    gameBoard.innerHTML = '';
    cells.length = 0;
    
    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div');
        cell.className = `cell size-${gridSize}`;
        cell.setAttribute('data-index', i);
        cell.addEventListener('click', handleCellClick);
        gameBoard.appendChild(cell);
        cells.push(cell);
    }
}

function generateWinningConditions() {
    const conditions = [];
    
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col <= gridSize - 3; col++) {
            const condition = [];
            for (let i = 0; i < 3; i++) {
                condition.push(row * gridSize + col + i);
            }
            conditions.push(condition);
        }
    }
    
    for (let col = 0; col < gridSize; col++) {
        for (let row = 0; row <= gridSize - 3; row++) {
            const condition = [];
            for (let i = 0; i < 3; i++) {
                condition.push((row + i) * gridSize + col);
            }
            conditions.push(condition);
        }
    }
    
    for (let row = 0; row <= gridSize - 3; row++) {
        for (let col = 0; col <= gridSize - 3; col++) {
            const condition = [];
            for (let i = 0; i < 3; i++) {
                condition.push((row + i) * gridSize + col + i);
            }
            conditions.push(condition);
        }
    }
    
    for (let row = 0; row <= gridSize - 3; row++) {
        for (let col = 2; col < gridSize; col++) {
            const condition = [];
            for (let i = 0; i < 3; i++) {
                condition.push((row + i) * gridSize + col - i);
            }
            conditions.push(condition);
        }
    }
    
    return conditions;
}

function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (board[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    board[clickedCellIndex] = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());
    clickedCell.innerHTML = currentPlayer;

    checkGameEnd();
}

function checkGameEnd() {
    const winningConditions = generateWinningConditions();
    let roundWon = false;
    let winningCombo = [];

    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        const a = board[winCondition[0]];
        const b = board[winCondition[1]];
        const c = board[winCondition[2]];

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
        updateStatusMessage(`🎉 Player ${currentPlayer} Wins! 🎉`);
        gameActive = false;
        highlightWinningCells(winningCombo);
        updateScore(currentPlayer);
        restartButton.style.display = 'block';
        return;
    }

    const roundDraw = !board.includes('');
    if (roundDraw) {
        updateStatusMessage(`🤝 It's a Draw! 🤝`);
        gameActive = false;
        updateScore('draw');
        restartButton.style.display = 'block';
        return;
    }

    switchPlayer();
}

function highlightWinningCells(combo) {
    combo.forEach(index => {
        cells[index].classList.add('win');
    });
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatusMessage(`Player ${currentPlayer}'s turn`);
}

function updateStatusMessage(message) {
    statusMessage.textContent = message;
}

function updateScore(winner) {
    if (winner === 'draw') {
        scores.draw++;
        scoreDraw.textContent = scores.draw;
    } else {
        scores[winner]++;
        if (winner === 'X') {
            scoreX.textContent = scores.X;
        } else {
            scoreO.textContent = scores.O;
        }
    }
}

function restartGame() {
    initializeGame();
}

sizeSelector.addEventListener('change', initializeGame);
restartButton.addEventListener('click', restartGame);

initializeGame();