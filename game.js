// ========================================
// 存储模块 - 负责localStorage操作
// ========================================
const StorageModule = {
    STORAGE_KEYS: {
        BEST_SCORE: '2048_best_score',
        LEADERBOARD: '2048_leaderboard',
        TOTAL_GAMES: '2048_total_games',
        AUDIO_ENABLED: '2048_audio_enabled',
        THEME: '2048_theme'
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
    },

    saveAudioEnabled(enabled) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.AUDIO_ENABLED, enabled.toString());
        } catch (e) {
            console.error('保存音效设置失败:', e);
        }
    },

    getAudioEnabled() {
        try {
            const enabled = localStorage.getItem(this.STORAGE_KEYS.AUDIO_ENABLED);
            return enabled === null ? true : enabled === 'true';
        } catch (e) {
            console.error('读取音效设置失败:', e);
            return true;
        }
    },

    saveTheme(theme) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.THEME, theme);
        } catch (e) {
            console.error('保存主题设置失败:', e);
        }
    },

    getTheme() {
        try {
            const theme = localStorage.getItem(this.STORAGE_KEYS.THEME);
            return theme || 'classic';
        } catch (e) {
            console.error('读取主题设置失败:', e);
            return 'classic';
        }
    }
};

// ========================================
// 音效模块 - 使用Web Audio API实现音效
// ========================================
const AudioModule = {
    audioContext: null,
    enabled: true,
    sounds: {},

    init() {
        this.enabled = StorageModule.getAudioEnabled();
        this.createSounds();
        this.updateButtonDisplay();
    },

    createSounds() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            this.sounds = {
                move: () => this.playMoveSound(),
                merge: () => this.playMergeSound(),
                newTile: () => this.playNewTileSound(),
                win: () => this.playWinSound(),
                gameOver: () => this.playGameOverSound()
            };
        } catch (e) {
            console.error('Web Audio API不可用:', e);
        }
    },

    ensureContext() {
        if (!this.audioContext) {
            this.createSounds();
        }
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    },

    playMoveSound() {
        if (!this.enabled) return;
        this.ensureContext();
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = 200;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch (e) {
            console.error('播放移动音效失败:', e);
        }
    },

    playMergeSound() {
        if (!this.enabled) return;
        this.ensureContext();
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.15);
        } catch (e) {
            console.error('播放合并音效失败:', e);
        }
    },

    playNewTileSound() {
        if (!this.enabled) return;
        this.ensureContext();
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = 600;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.05);
        } catch (e) {
            console.error('播放新方块音效失败:', e);
        }
    },

    playWinSound() {
        if (!this.enabled) return;
        this.ensureContext();
        
        try {
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.frequency.value = freq;
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.3);
                }, index * 150);
            });
        } catch (e) {
            console.error('播放胜利音效失败:', e);
        }
    },

    playGameOverSound() {
        if (!this.enabled) return;
        this.ensureContext();
        
        try {
            const notes = [392, 349.23, 329.63, 293.66];
            notes.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.frequency.value = freq;
                    oscillator.type = 'sawtooth';
                    
                    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.4);
                }, index * 200);
            });
        } catch (e) {
            console.error('播放游戏结束音效失败:', e);
        }
    },

    play(type) {
        if (this.sounds[type]) {
            this.sounds[type]();
        }
    },

    toggle() {
        this.ensureContext();
        this.enabled = !this.enabled;
        StorageModule.saveAudioEnabled(this.enabled);
        this.updateButtonDisplay();
    },

    updateButtonDisplay() {
        const button = document.getElementById('audio-toggle');
        if (button) {
            button.textContent = this.enabled ? '🔊' : '🔇';
            button.title = this.enabled ? '音效已开启' : '音效已关闭';
        }
    }
};

// ========================================
// 主题模块 - 管理主题切换
// ========================================
const ThemeModule = {
    currentTheme: 'classic',

    init() {
        this.currentTheme = StorageModule.getTheme();
        this.applyTheme();
        this.updateButtonDisplay();
    },

    toggle() {
        this.currentTheme = this.currentTheme === 'classic' ? 'dark' : 'classic';
        StorageModule.saveTheme(this.currentTheme);
        this.applyTheme();
        this.updateButtonDisplay();
    },

    applyTheme() {
        document.body.classList.remove('theme-classic', 'theme-dark');
        document.body.classList.add(`theme-${this.currentTheme}`);
    },

    updateButtonDisplay() {
        const button = document.getElementById('theme-toggle');
        if (button) {
            button.textContent = this.currentTheme === 'classic' ? '🌙' : '☀️';
            button.title = this.currentTheme === 'classic' ? '切换到暗夜主题' : '切换到经典主题';
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
        AudioModule.play('newTile');
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
        
        GameCore.initBoardCells();
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

        let boardSize = 320;
        let fontSize = 32;
        if (this.gridSize === 5) {
            boardSize = 360;
            fontSize = 24;
        } else if (this.gridSize === 3) {
            boardSize = 280;
            fontSize = 36;
        }

        this.elements.gameBoard.style.width = boardSize + 'px';
        this.elements.gameBoard.style.height = boardSize + 'px';

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
                cell.style.fontSize = fontSize + 'px';
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
                    AudioModule.play('win');
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

        for (let i = 0; i < this.gridSize; i++) {
            const originalRow = [...this.board[i]];
            const newRow = this.slideRow(originalRow);

            if (JSON.stringify(originalRow) !== JSON.stringify(newRow)) {
                moved = true;
                this.board[i] = newRow;
            }
        }

        return moved;
    },

    moveRight() {
        let moved = false;

        for (let i = 0; i < this.gridSize; i++) {
            const originalRow = [...this.board[i]];
            const reversed = originalRow.reverse();
            const newReversed = this.slideRow(reversed);
            const newRow = newReversed.reverse();

            if (JSON.stringify(originalRow) !== JSON.stringify(newRow)) {
                moved = true;
                this.board[i] = newRow;
            }
        }

        return moved;
    },

    moveUp() {
        let moved = false;

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
            }
        }

        return moved;
    },

    moveDown() {
        let moved = false;

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
            }
        }

        return moved;
    },

    hasWonGame() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.board[i][j] === 2048) {
                    return true;
                }
            }
        }
        return false;
    },

    canMove() {
        if (this.getEmptyCells().length > 0) {
            return true;
        }

        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const current = this.board[i][j];
                if (j < this.gridSize - 1 && this.board[i][j + 1] === current) {
                    return true;
                }
                if (i < this.gridSize - 1 && this.board[i + 1][j] === current) {
                    return true;
                }
            }
        }

        return false;
    },

    move(direction) {
        if (this.gameOver || this.isMoving) return;

        this.isMoving = true;
        let moved = false;

        switch (direction) {
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
        }

        if (moved) {
            AudioModule.play('move');
            setTimeout(() => {
                this.addRandomTile();
                this.updateDisplay();

                if (this.hasWonGame() && !this.hasWon) {
                    this.hasWon = true;
                    this.showGameOver(true);
                } else if (!this.canMove()) {
                    this.gameOver = true;
                    this.showGameOver(false);
                }

                this.isMoving = false;
            }, 100);
        } else {
            this.isMoving = false;
        }
    },

    showGameOver(isWin) {
        if (this.elements.gameOverElement) {
            this.elements.gameOverElement.classList.add('show');
        }

        if (this.elements.gameOverTitle) {
            this.elements.gameOverTitle.textContent = isWin ? '🎉 恭喜胜利！' : '😔 游戏结束';
        }

        if (this.elements.finalScoreElement) {
            this.elements.finalScoreElement.textContent = ScoreModule.getScore();
        }

        if (!isWin) {
            AudioModule.play('gameOver');
        }

        GameControlModule.gameOver(isWin);
    },

    initEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (GameControlModule.isPaused) return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.move('right');
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.move('down');
                    break;
            }
        });

        let touchStartX = 0;
        let touchStartY = 0;
        const minSwipeDistance = 30;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (GameControlModule.isPaused) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);

            if (Math.max(absX, absY) < minSwipeDistance) return;

            if (absX > absY) {
                if (deltaX > 0) {
                    this.move('right');
                } else {
                    this.move('left');
                }
            } else {
                if (deltaY > 0) {
                    this.move('down');
                } else {
                    this.move('up');
                }
            }
        }, { passive: true });
    }
};

// ========================================
// 页面初始化
// ========================================
window.addEventListener('DOMContentLoaded', () => {
    GameCore.init();
    AudioModule.init();
    ThemeModule.init();

    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const restartBtn = document.getElementById('restart-btn');
    const leaderboardBtn = document.getElementById('leaderboard-btn');
    const closeLeaderboardBtn = document.getElementById('close-leaderboard');
    const clearLeaderboardBtn = document.getElementById('clear-leaderboard');
    const resumeBtn = document.getElementById('resume-btn');
    const audioToggleBtn = document.getElementById('audio-toggle');
    const themeToggleBtn = document.getElementById('theme-toggle');

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
        restartBtn.addEventListener('click', () => GameControlModule.restartGame());
    }

    if (leaderboardBtn) {
        leaderboardBtn.addEventListener('click', () => LeaderboardModule.showLeaderboard());
    }

    if (closeLeaderboardBtn) {
        closeLeaderboardBtn.addEventListener('click', () => LeaderboardModule.hideLeaderboard());
    }

    if (clearLeaderboardBtn) {
        clearLeaderboardBtn.addEventListener('click', () => LeaderboardModule.clearLeaderboard());
    }

    if (resumeBtn) {
        resumeBtn.addEventListener('click', () => GameControlModule.resumeGame());
    }

    if (audioToggleBtn) {
        audioToggleBtn.addEventListener('click', () => AudioModule.toggle());
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => ThemeModule.toggle());
    }

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('leaderboard-modal')) {
            LeaderboardModule.hideLeaderboard();
        }
    });
});