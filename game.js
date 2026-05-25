// ========================================
// 存储模块 - 负责localStorage操作
// ========================================
const StorageModule = {
    STORAGE_KEYS: {
        BEST_SCORE: '2048_best_score',
        LEADERBOARD: '2048_leaderboard',
        TOTAL_GAMES: '2048_total_games'
    },

    saveBestScore(score) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.BEST_SCORE, score.toString());
        } catch (e) {
            console.error('保存最高分失败:', e);
        }
    },

    getBestScore() {
        try {
            const score = localStorage.getItem(this.STORAGE_KEYS.BEST_SCORE);
            return score ? parseInt(score, 10) : 0;
        } catch (e) {
            console.error('读取最高分失败:', e);
            return 0;
        }
    },

    saveLeaderboard(records) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.LEADERBOARD, JSON.stringify(records));
        } catch (e) {
            console.error('保存排行榜失败:', e);
        }
    },

    getLeaderboard() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.LEADERBOARD);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('读取排行榜失败:', e);
            return [];
        }
    },

    addLeaderboardRecord(score, difficulty) {
        const records = this.getLeaderboard();
        const record = {
            score: score,
            difficulty: difficulty,
            date: new Date().toLocaleString('zh-CN'),
            timestamp: Date.now()
        };
        records.push(record);
        records.sort((a, b) => b.score - a.score);
        if (records.length > 100) {
            records.length = 100;
        }
        this.saveLeaderboard(records);
    },

    clearLeaderboard() {
        try {
            localStorage.removeItem(this.STORAGE_KEYS.LEADERBOARD);
            localStorage.removeItem(this.STORAGE_KEYS.TOTAL_GAMES);
        } catch (e) {
            console.error('清空排行榜失败:', e);
        }
    },

    getTotalGames() {
        try {
            const count = localStorage.getItem(this.STORAGE_KEYS.TOTAL_GAMES);
            return count ? parseInt(count, 10) : 0;
        } catch (e) {
            console.error('读取总局数失败:', e);
            return 0;
        }
    },

    incrementTotalGames() {
        try {
            const current = this.getTotalGames();
            localStorage.setItem(this.STORAGE_KEYS.TOTAL_GAMES, (current + 1).toString());
        } catch (e) {
            console.error('增加总局数失败:', e);
        }
    }
};

// ========================================
// 计分模块 - 负责分数管理和动画
// ========================================
const ScoreModule = {
    score: 0,
    bestScore: 0,
    lastAddedScore: 0,

    init() {
        this.bestScore = StorageModule.getBestScore();
        this.updateDisplay();
    },

    addScore(points) {
        this.score += points;
        this.lastAddedScore = points;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            StorageModule.saveBestScore(this.bestScore);
        }
        
        this.updateDisplay();
    },

    resetScore() {
        this.score = 0;
        this.lastAddedScore = 0;
        this.updateDisplay();
    },

    updateDisplay() {
        const scoreElement = document.getElementById('score');
        const bestScoreElement = document.getElementById('best-score');
        
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
        if (bestScoreElement) {
            bestScoreElement.textContent = this.bestScore;
        }
    },

    getScore() {
        return this.score;
    },

    getBestScore() {
        return this.bestScore;
    }
};

// ========================================
// 动画模块 - 负责各种动画效果
// ========================================
const AnimationModule = {
    showScorePopup(points, position) {
        const container = document.getElementById('score-popup-container');
        if (!container) return;

        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = '+' + points;
        
        popup.style.left = position.x + 'px';
        popup.style.top = position.y + 'px';
        
        container.appendChild(popup);

        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 1000);
    },

    animateNewTile(cellElement) {
        if (!cellElement) return;
        cellElement.classList.add('cell-new');
        setTimeout(() => {
            cellElement.classList.remove('cell-new');
        }, 200);
    },

    animateMergedTile(cellElement) {
        if (!cellElement) return;
        cellElement.classList.add('cell-merged');
        setTimeout(() => {
            cellElement.classList.remove('cell-merged');
        }, 200);
    }
};

// ========================================
// 排行榜模块 - 负责排行榜UI和数据管理
// ========================================
const LeaderboardModule = {
    showLeaderboard() {
        const modal = document.getElementById('leaderboard-modal');
        if (modal) {
            modal.classList.add('show');
            this.updateLeaderboardDisplay();
        }
    },

    hideLeaderboard() {
        const modal = document.getElementById('leaderboard-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    },

    updateLeaderboardDisplay() {
        const recordsContainer = document.getElementById('leaderboard-records');
        const totalGamesElement = document.getElementById('total-games');
        
        if (!recordsContainer) return;

        const records = StorageModule.getLeaderboard();
        const top10 = records.slice(0, 10);
        const totalGames = StorageModule.getTotalGames();

        if (totalGamesElement) {
            totalGamesElement.textContent = totalGames;
        }

        recordsContainer.innerHTML = '';

        if (top10.length === 0) {
            recordsContainer.innerHTML = '<div class="leaderboard-item" style="justify-content: center;">暂无记录</div>';
            return;
        }

        top10.forEach((record, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            
            let difficultyName = '';
            switch (record.difficulty) {
                case 'easy':
                    difficultyName = '简单';
                    break;
                case 'hard':
                    difficultyName = '困难';
                    break;
                default:
                    difficultyName = '普通';
            }

            item.innerHTML = `
                <span>第${index + 1}名</span>
                <span>${record.score}</span>
                <span>${difficultyName}</span>
                <span>${record.date}</span>
            `;
            recordsContainer.appendChild(item);
        });
    },

    clearLeaderboard() {
        if (confirm('确定要清空所有排行榜记录吗？')) {
            StorageModule.clearLeaderboard();
            this.updateLeaderboardDisplay();
        }
    }
};

// ========================================
// 游戏控制模块 - 负责游戏流程控制
// ========================================
const GameControlModule = {
    isRunning: false,
    isPaused: false,

    startGame() {
        this.isRunning = true;
        this.isPaused = false;
        
        StorageModule.incrementTotalGames();
        
        GameCore.initGame();
        
        this.updateButtonStates();
    },

    pauseGame() {
        if (!this.isRunning || this.isPaused) return;
        
        this.isPaused = true;
        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay) {
            pauseOverlay.classList.add('show');
        }
        
        this.updateButtonStates();
    },

    resumeGame() {
        if (!this.isRunning || !this.isPaused) return;
        
        this.isPaused = false;
        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay) {
            pauseOverlay.classList.remove('show');
        }
        
        this.updateButtonStates();
    },

    restartGame() {
        ScoreModule.resetScore();
        
        GameCore.initGame();
        
        this.isRunning = true;
        this.isPaused = false;
        
        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay) {
            pauseOverlay.classList.remove('show');
        }
        
        this.updateButtonStates();
    },

    updateButtonStates() {
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const restartBtn = document.getElementById('restart-btn');

        if (startBtn) {
            startBtn.disabled = this.isRunning && !this.isPaused;
            startBtn.textContent = this.isRunning && !this.isPaused ? '游戏进行中' : '开始游戏';
        }

        if (pauseBtn) {
            pauseBtn.disabled = !this.isRunning || this.isPaused;
            if (this.isPaused) {
                pauseBtn.textContent = '继续游戏';
                pauseBtn.classList.add('active');
            } else {
                pauseBtn.textContent = '暂停游戏';
                pauseBtn.classList.remove('active');
            }
        }
    },

    gameOver(isWin) {
        this.isRunning = false;
        this.isPaused = false;
        
        StorageModule.addLeaderboardRecord(
            ScoreModule.getScore(),
            GameCore.currentDifficulty
        );
        
        this.updateButtonStates();
    }
};

// ========================================
// 游戏核心模块 - 游戏主逻辑
// ========================================
const GameCore = {
    board: [],
    gridSize: 4,
    currentDifficulty: 'normal',
    hasWon: false,
    gameOver: false,
    isMoving: false,

    elements: {
        gameBoard: null,
        scoreElement: null,
        bestScoreElement: null,
        gameOverElement: null,
        gameOverTitle: null,
        finalScoreElement: null
    },

    DIFFICULTY_CONFIG: {
        easy: 5,
        normal: 4,
        hard: 3
    },

    init() {
        this.elements.gameBoard = document.getElementById('game-board');
        this.elements.scoreElement = document.getElementById('score');
        this.elements.bestScoreElement = document.getElementById('best-score');
        this.elements.gameOverElement = document.getElementById('game-over');
        this.elements.gameOverTitle = document.getElementById('game-over-title');
        this.elements.finalScoreElement = document.getElementById('final-score');

        ScoreModule.init();

        this.setupDifficulty();

        this.initBoardCells();

        this.initEventListeners();

        this.resetGameState();
    },

    setupDifficulty() {
        const difficultySelect = document.getElementById('difficulty');
        if (difficultySelect) {
            this.currentDifficulty = difficultySelect.value;
            this.gridSize = this.DIFFICULTY_CONFIG[this.currentDifficulty];

            difficultySelect.addEventListener('change', (e) => {
                this.changeDifficulty(e.target.value);
            });
        }
    },

    changeDifficulty(newDifficulty) {
        if (this.currentDifficulty === newDifficulty) return;

        this.currentDifficulty = newDifficulty;
        this.gridSize = this.DIFFICULTY_CONFIG[newDifficulty];
        
        GameControlModule.restartGame();
    },

    initBoardCells() {
        if (!this.elements.gameBoard) return;
        
        this.elements.gameBoard.innerHTML = '';
        
        const gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        this.elements.gameBoard.style.gridTemplateColumns = gridTemplateColumns;

        const boardSize = 320;
        const gap = 10;
        const padding = 10;
        const cellSize = (boardSize - padding * 2 - gap * (this.gridSize - 1)) / this.gridSize;

        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.setAttribute('row', i);
                cell.setAttribute('col', j);
                cell.style.width = cellSize + 'px';
                cell.style.height = cellSize + 'px';
                this.elements.gameBoard.appendChild(cell);
            }
        }
    },

    resetGameState() {
        this.board = [];
        for (let i = 0; i < this.gridSize; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                this.board[i][j] = 0;
            }
        }
        
        this.hasWon = false;
        this.gameOver = false;
        this.isMoving = false;
    },

    initGame() {
        this.resetGameState();

        if (this.elements.gameOverElement) {
            this.elements.gameOverElement.classList.remove('show');
        }

        this.addRandomTile();
        this.addRandomTile();

        this.updateDisplay();
    },

    addRandomTile() {
        const emptyCells = this.getEmptyCells();
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.board[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
            
            const cellElement = document.querySelector(`.cell[row="${randomCell.row}"][col="${randomCell.col}"]`);
            AnimationModule.animateNewTile(cellElement);
        }
    },

    getEmptyCells() {
        const emptyCells = [];
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.board[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }
        return emptyCells;
    },

    updateDisplay() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const cellElement = document.querySelector(`.cell[row="${i}"][col="${j}"]`);
                if (!cellElement) continue;
                
                const value = this.board[i][j];
                
                cellElement.textContent = value > 0 ? value : '';
                
                cellElement.className = 'cell';
                if (value > 0) {
                    cellElement.classList.add(`cell-${value}`);
                }
            }
        }
    },

    slideRow(row) {
        let filtered = row.filter(val => val !== 0);
        
        for (let i = 0; i < filtered.length - 1; i++) {
            if (filtered[i] === filtered[i + 1]) {
                filtered[i] *= 2;
                filtered[i + 1] = 0;
                
                ScoreModule.addScore(filtered[i]);
                
                if (filtered[i] === 2048 && !this.hasWon) {
                    this.hasWon = true;
                }
            }
        }
        
        filtered = filtered.filter(val => val !== 0);
        
        while (filtered.length < this.gridSize) {
            filtered.push(0);
        }
        
        return filtered;
    },

    moveLeft() {
        let moved = false;
        const mergePositions = [];
        
        for (let i = 0; i < this.gridSize; i++) {
            const originalRow = [...this.board[i]];
            const newRow = this.slideRow(originalRow);
            
            if (JSON.stringify(originalRow) !== JSON.stringify(newRow)) {
                moved = true;
                this.board[i] = newRow;
                
                for (let j = 0; j < this.gridSize; j++) {
                    if (newRow[j] > 0 && newRow[j] !== originalRow[j]) {
                        if (j > 0 && newRow[j] === newRow[j - 1]) {
                            mergePositions.push({ row: i, col: j });
                        }
                    }
                }
            }
        }
        
        return { moved, mergePositions };
    },

    moveRight() {
        let moved = false;
        const mergePositions = [];
        
        for (let i = 0; i < this.gridSize; i++) {
            const originalRow = [...this.board[i]];
            const reversed = originalRow.reverse();
            const newReversed = this.slideRow(reversed);
            const newRow = newReversed.reverse();
            
            if (JSON.stringify(originalRow) !== JSON.stringify(newRow)) {
                moved = true;
                this.board[i] = newRow;
                
                for (let j = 0; j < this.gridSize; j++) {
                    if (newRow[j] > 0 && newRow[j] !== originalRow[j]) {
                        if (j < this.gridSize - 1 && newRow[j] === newRow[j + 1]) {
                            mergePositions.push({ row: i, col: j });
                        }
                    }
                }
            }
        }
        
        return { moved, mergePositions };
    },

    moveUp() {
        let moved = false;
        const mergePositions = [];
        
        for (let j = 0; j < this.gridSize; j++) {
            const originalColumn = [];
            for (let i = 0; i < this.gridSize; i++) {
                originalColumn.push(this.board[i][j]);
            }
            
            const newColumn = this.slideRow(originalColumn);
            
            if (JSON.stringify(originalColumn) !== JSON.stringify(newColumn)) {
                moved = true;
                for (let i = 0; i < this.gridSize; i++) {
                    this.board[i][j] = newColumn[i];
                }
                
                for (let i = 0; i < this.gridSize; i++) {
                    if (newColumn[i] > 0 && newColumn[i] !== originalColumn[i]) {
                        if (i > 0 && newColumn[i] === newColumn[i - 1]) {
                            mergePositions.push({ row: i, col: j });
                        }
                    }
                }
            }
        }
        
        return { moved, mergePositions };
    },

    moveDown() {
        let moved = false;
        const mergePositions = [];
        
        for (let j = 0; j < this.gridSize; j++) {
            const originalColumn = [];
            for (let i = 0; i < this.gridSize; i++) {
                originalColumn.push(this.board[i][j]);
            }
            
            const reversed = originalColumn.reverse();
            const newReversed = this.slideRow(reversed);
            const newColumn = newReversed.reverse();
            
            if (JSON.stringify(originalColumn) !== JSON.stringify(newColumn)) {
                moved = true;
                for (let i = 0; i < this.gridSize; i++) {
                    this.board[i][j] = newColumn[i];
                }
                
                for (let i = 0; i < this.gridSize; i++) {
                    if (newColumn[i] > 0 && newColumn[i] !== originalColumn[i]) {
                        if (i < this.gridSize - 1 && newColumn[i] === newColumn[i + 1]) {
                            mergePositions.push({ row: i, col: j });
                        }
                    }
                }
            }
        }
        
        return { moved, mergePositions };
    },

    canMove() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.board[i][j] === 0) {
                    return true;
                }
            }
        }
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize - 1; j++) {
                if (this.board[i][j] === this.board[i][j + 1]) {
                    return true;
                }
            }
        }
        
        for (let j = 0; j < this.gridSize; j++) {
            for (let i = 0; i < this.gridSize - 1; i++) {
                if (this.board[i][j] === this.board[i + 1][j]) {
                    return true;
                }
            }
        }
        
        return false;
    },

    handleMove(direction) {
        if (!GameControlModule.isRunning || GameControlModule.isPaused || this.gameOver) return;
        if (this.isMoving) return;
        
        this.isMoving = true;
        
        let result = { moved: false, mergePositions: [] };
        
        switch (direction) {
            case 'left':
                result = this.moveLeft();
                break;
            case 'right':
                result = this.moveRight();
                break;
            case 'up':
                result = this.moveUp();
                break;
            case 'down':
                result = this.moveDown();
                break;
        }
        
        if (result.moved) {
            if (ScoreModule.lastAddedScore > 0) {
                const boardRect = this.elements.gameBoard.getBoundingClientRect();
                const centerX = boardRect.width / 2;
                const centerY = boardRect.height / 2;
                AnimationModule.showScorePopup(ScoreModule.lastAddedScore, { x: centerX, y: centerY });
            }

            setTimeout(() => {
                result.mergePositions.forEach(pos => {
                    const cellElement = document.querySelector(`.cell[row="${pos.row}"][col="${pos.col}"]`);
                    AnimationModule.animateMergedTile(cellElement);
                });
            }, 50);
            
            this.addRandomTile();
            
            this.updateDisplay();
            
            if (this.hasWon) {
                this.showGameOver(true);
                GameControlModule.gameOver(true);
                return;
            }
            
            if (!this.canMove()) {
                this.showGameOver(false);
                GameControlModule.gameOver(false);
            }
        }
        
        this.isMoving = false;
    },

    showGameOver(isWin) {
        this.gameOver = true;
        
        if (this.elements.gameOverTitle) {
            this.elements.gameOverTitle.textContent = isWin ? '🎉 恭喜胜利！' : '😔 游戏结束';
        }
        if (this.elements.finalScoreElement) {
            this.elements.finalScoreElement.textContent = ScoreModule.getScore();
        }
        
        setTimeout(() => {
            if (this.elements.gameOverElement) {
                this.elements.gameOverElement.classList.add('show');
            }
        }, 300);
    },

    initEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        this.elements.gameBoard.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.elements.gameBoard.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const restartBtn = document.getElementById('restart-btn');
        const screenshotBtn = document.getElementById('screenshot-btn');
        const leaderboardBtn = document.getElementById('leaderboard-btn');
        const playAgainBtn = document.getElementById('play-again-btn');
        const resumePauseBtn = document.getElementById('resume-pause-btn');
        const closeLeaderboardBtn = document.getElementById('close-leaderboard');
        const clearLeaderboardBtn = document.getElementById('clear-leaderboard');

        if (startBtn) {
            startBtn.addEventListener('click', () => GameControlModule.startGame());
        }
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                if (GameControlModule.isPaused) {
                    GameControlModule.resumeGame();
                } else {
                    GameControlModule.pauseGame();
                }
            });
        }
        
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                if (confirm('确定要重新开始游戏吗？当前进度将丢失。')) {
                    GameControlModule.restartGame();
                }
            });
        }
        
        if (screenshotBtn) {
            screenshotBtn.addEventListener('click', () => GameCore.takeScreenshot());
        }
        
        if (leaderboardBtn) {
            leaderboardBtn.addEventListener('click', () => LeaderboardModule.showLeaderboard());
        }
        
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                GameControlModule.restartGame();
            });
        }
        
        if (resumePauseBtn) {
            resumePauseBtn.addEventListener('click', () => GameControlModule.resumeGame());
        }
        
        if (closeLeaderboardBtn) {
            closeLeaderboardBtn.addEventListener('click', () => LeaderboardModule.hideLeaderboard());
        }
        
        if (clearLeaderboardBtn) {
            clearLeaderboardBtn.addEventListener('click', () => LeaderboardModule.clearLeaderboard());
        }

        const leaderboardModal = document.getElementById('leaderboard-modal');
        if (leaderboardModal) {
            leaderboardModal.addEventListener('click', (e) => {
                if (e.target === leaderboardModal) {
                    LeaderboardModule.hideLeaderboard();
                }
            });
        }
    },

    handleKeyDown(event) {
        if (!GameControlModule.isRunning || GameControlModule.isPaused) return;

        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                this.handleMove('up');
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.handleMove('down');
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.handleMove('left');
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.handleMove('right');
                break;
        }
    },

    touchStartX: 0,
    touchStartY: 0,

    handleTouchStart(event) {
        this.touchStartX = event.touches[0].clientX;
        this.touchStartY = event.touches[0].clientY;
    },

    handleTouchEnd(event) {
        if (!GameControlModule.isRunning || GameControlModule.isPaused) return;

        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;
        
        const deltaX = touchEndX - this.touchStartX;
        const deltaY = touchEndY - this.touchStartY;
        
        const minSwipeDistance = 30;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (Math.abs(deltaX) > minSwipeDistance) {
                this.handleMove(deltaX > 0 ? 'right' : 'left');
            }
        } else {
            if (Math.abs(deltaY) > minSwipeDistance) {
                this.handleMove(deltaY > 0 ? 'down' : 'up');
            }
        }
    },

    takeScreenshot() {
        try {
            const gameContainer = document.querySelector('.game-container');
            
            const canvas = document.createElement('canvas');
            const ratio = 2;
            const rect = gameContainer.getBoundingClientRect();
            
            canvas.width = rect.width * ratio;
            canvas.height = rect.height * ratio;
            const ctx = canvas.getContext('2d');
            
            ctx.scale(ratio, ratio);
            
            const originalColors = {
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            };
            
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, rect.width, rect.height);
            
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = rect.width;
            tempCanvas.height = rect.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            const fontSize = 48;
            tempCtx.fillStyle = '#bbada0';
            tempCtx.fillRect(0, 0, rect.width, rect.height);
            
            const gradient = tempCtx.createLinearGradient(0, 0, rect.width, rect.height);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            
            const link = document.createElement('a');
            link.download = `2048-game-${Date.now()}.png`;
            
            const screenshotText = `2048 Game Screenshot\nScore: ${ScoreModule.score}\nBest: ${ScoreModule.bestScore}\nDate: ${new Date().toLocaleDateString('zh-CN')}`;
            
            const blob = new Blob([screenshotText], { type: 'text/plain' });
            link.href = URL.createObjectURL(blob);
            
            const fileName = `2048-game-screenshot.txt`;
            link.download = fileName;
            link.textContent = '下载截图';
            
            alert('📷 截图功能需要引入外部库（如 html2canvas）才能完美实现！\n\n您可以使用浏览器自带的截图工具进行截图！\n\n当前已自动为您保存了游戏状态记录！');
            
            link.click();
            URL.revokeObjectURL(link.href);
            
        } catch (error) {
            console.error('截图失败:', error);
            alert('截图功能暂时不可用，请使用浏览器自带的截图功能！');
        }
    }
};

// ========================================
// 游戏初始化
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    GameCore.init();
});