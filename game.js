// 游戏核心逻辑

// 游戏配置常量
const GRID_SIZE = 4; // 棋盘大小 4x4
const CELL_COUNT = GRID_SIZE * GRID_SIZE; // 总格子数

// 游戏状态变量
let board = []; // 棋盘数组
let score = 0; // 当前分数
let bestScore = 0; // 最高分
let hasWon = false; // 是否胜利
let gameOver = false; // 是否游戏结束

// DOM 元素
const gameBoard = document.getElementById('game-board');
const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('best-score');
const gameOverElement = document.getElementById('game-over');
const gameOverTitle = document.getElementById('game-over-title');
const finalScoreElement = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');
const playAgainBtn = document.getElementById('play-again-btn');

// 初始化游戏
function initGame() {
    // 初始化棋盘为空
    board = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        board[i] = [];
        for (let j = 0; j < GRID_SIZE; j++) {
            board[i][j] = 0;
        }
    }
    
    // 重置分数和状态
    score = 0;
    hasWon = false;
    gameOver = false;
    
    // 隐藏游戏结束遮罩
    gameOverElement.classList.remove('show');
    
    // 生成两个初始方块
    addRandomTile();
    addRandomTile();
    
    // 更新显示
    updateDisplay();
}

// 在随机空位生成方块
function addRandomTile() {
    // 获取所有空位
    const emptyCells = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (board[i][j] === 0) {
                emptyCells.push({ row: i, col: j });
            }
        }
    }
    
    // 如果有空位，随机选择一个生成方块
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        // 90% 概率生成 2，10% 概率生成 4
        board[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        
        // 添加新方块动画
        const cellElement = document.querySelector(`.cell[row="${randomCell.row}"][col="${randomCell.col}"]`);
        if (cellElement) {
            cellElement.classList.add('cell-new');
            setTimeout(() => {
                cellElement.classList.remove('cell-new');
            }, 200);
        }
    }
}

// 更新界面显示
function updateDisplay() {
    // 更新分数显示
    scoreElement.textContent = score;
    
    // 更新最高分
    if (score > bestScore) {
        bestScore = score;
        bestScoreElement.textContent = bestScore;
    }
    
    // 更新棋盘显示
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const cellElement = document.querySelector(`.cell[row="${i}"][col="${j}"]`);
            const value = board[i][j];
            
            // 更新方块数值
            cellElement.textContent = value > 0 ? value : '';
            
            // 更新方块样式类
            cellElement.className = 'cell';
            if (value > 0) {
                cellElement.classList.add(`cell-${value}`);
            }
        }
    }
}

// 向左移动一行
function slideRow(row) {
    // 过滤掉零
    let filtered = row.filter(val => val !== 0);
    
    // 合并相邻相同的数字
    for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i + 1]) {
            filtered[i] *= 2;
            filtered[i + 1] = 0;
            score += filtered[i];
            
            // 检查是否达到 2048
            if (filtered[i] === 2048 && !hasWon) {
                hasWon = true;
            }
        }
    }
    
    // 再次过滤掉零
    filtered = filtered.filter(val => val !== 0);
    
    // 填充零使长度为 4
    while (filtered.length < GRID_SIZE) {
        filtered.push(0);
    }
    
    return filtered;
}

// 向左移动
function moveLeft() {
    let moved = false;
    
    for (let i = 0; i < GRID_SIZE; i++) {
        const originalRow = [...board[i]];
        const newRow = slideRow(originalRow);
        
        // 检查是否有移动
        if (JSON.stringify(originalRow) !== JSON.stringify(newRow)) {
            moved = true;
            board[i] = newRow;
        }
    }
    
    return moved;
}

// 向右移动
function moveRight() {
    let moved = false;
    
    for (let i = 0; i < GRID_SIZE; i++) {
        const originalRow = [...board[i]];
        // 反转数组，向左移动，再反转回来
        const reversed = originalRow.reverse();
        const newReversed = slideRow(reversed);
        const newRow = newReversed.reverse();
        
        // 检查是否有移动
        if (JSON.stringify(originalRow) !== JSON.stringify(newRow)) {
            moved = true;
            board[i] = newRow;
        }
    }
    
    return moved;
}

// 向上移动
function moveUp() {
    let moved = false;
    
    for (let j = 0; j < GRID_SIZE; j++) {
        // 提取列
        const originalColumn = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            originalColumn.push(board[i][j]);
        }
        
        const newColumn = slideRow(originalColumn);
        
        // 检查是否有移动
        if (JSON.stringify(originalColumn) !== JSON.stringify(newColumn)) {
            moved = true;
            // 写回列
            for (let i = 0; i < GRID_SIZE; i++) {
                board[i][j] = newColumn[i];
            }
        }
    }
    
    return moved;
}

// 向下移动
function moveDown() {
    let moved = false;
    
    for (let j = 0; j < GRID_SIZE; j++) {
        // 提取列
        const originalColumn = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            originalColumn.push(board[i][j]);
        }
        
        // 反转，向左移动，再反转回来
        const reversed = originalColumn.reverse();
        const newReversed = slideRow(reversed);
        const newColumn = newReversed.reverse();
        
        // 检查是否有移动
        if (JSON.stringify(originalColumn) !== JSON.stringify(newColumn)) {
            moved = true;
            // 写回列
            for (let i = 0; i < GRID_SIZE; i++) {
                board[i][j] = newColumn[i];
            }
        }
    }
    
    return moved;
}

// 检查是否还能移动
function canMove() {
    // 检查是否有空位
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (board[i][j] === 0) {
                return true;
            }
        }
    }
    
    // 检查水平方向是否有相邻相同的数字
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE - 1; j++) {
            if (board[i][j] === board[i][j + 1]) {
                return true;
            }
        }
    }
    
    // 检查垂直方向是否有相邻相同的数字
    for (let j = 0; j < GRID_SIZE; j++) {
        for (let i = 0; i < GRID_SIZE - 1; i++) {
            if (board[i][j] === board[i + 1][j]) {
                return true;
            }
        }
    }
    
    return false;
}

// 处理移动
function handleMove(direction) {
    // 如果游戏已经结束，不处理移动
    if (gameOver) return;
    
    let moved = false;
    
    // 根据方向执行移动
    switch (direction) {
        case 'left':
            moved = moveLeft();
            break;
        case 'right':
            moved = moveRight();
            break;
        case 'up':
            moved = moveUp();
            break;
        case 'down':
            moved = moveDown();
            break;
    }
    
    // 如果有移动
    if (moved) {
        // 生成新方块
        addRandomTile();
        
        // 更新显示
        updateDisplay();
        
        // 检查胜利
        if (hasWon) {
            gameOverTitle.textContent = '🎉 恭喜胜利！';
            finalScoreElement.textContent = score;
            gameOver = true;
            setTimeout(() => {
                gameOverElement.classList.add('show');
            }, 300);
            return;
        }
        
        // 检查游戏结束
        if (!canMove()) {
            gameOverTitle.textContent = '😔 游戏结束';
            finalScoreElement.textContent = score;
            gameOver = true;
            setTimeout(() => {
                gameOverElement.classList.add('show');
            }, 300);
        }
    }
}

// 键盘事件处理
function handleKeyDown(event) {
    switch (event.key) {
        case 'ArrowUp':
            event.preventDefault();
            handleMove('up');
            break;
        case 'ArrowDown':
            event.preventDefault();
            handleMove('down');
            break;
        case 'ArrowLeft':
            event.preventDefault();
            handleMove('left');
            break;
        case 'ArrowRight':
            event.preventDefault();
            handleMove('right');
            break;
    }
}

// 触摸事件处理
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}

function handleTouchEnd(event) {
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // 判断滑动方向（忽略小幅度滑动）
    const minSwipeDistance = 30;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平滑动
        if (Math.abs(deltaX) > minSwipeDistance) {
            handleMove(deltaX > 0 ? 'right' : 'left');
        }
    } else {
        // 垂直滑动
        if (Math.abs(deltaY) > minSwipeDistance) {
            handleMove(deltaY > 0 ? 'down' : 'up');
        }
    }
}

// 初始化棋盘格子
function initBoardCells() {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.setAttribute('row', i);
            cell.setAttribute('col', j);
            gameBoard.appendChild(cell);
        }
    }
}

// 初始化事件监听
function initEventListeners() {
    // 键盘事件
    document.addEventListener('keydown', handleKeyDown);
    
    // 触摸事件
    gameBoard.addEventListener('touchstart', handleTouchStart);
    gameBoard.addEventListener('touchend', handleTouchEnd);
    
    // 按钮点击事件
    restartBtn.addEventListener('click', initGame);
    playAgainBtn.addEventListener('click', initGame);
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    // 初始化棋盘格子
    initBoardCells();
    
    // 初始化事件监听
    initEventListeners();
    
    // 开始游戏
    initGame();
});