class Game {
    constructor() {
        // Clear any existing intervals first
        if (window.gameInstance && window.gameInstance.gameLoop) {
            clearInterval(window.gameInstance.gameLoop);
        }

        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.snake = new Snake(this.canvas);
        this.food = new Food(this.canvas);
        this.score = 0;
        this.speed = 1;
        this.level = 1;
        this.gameLoop = null;
        this.isPaused = false;
        this.baseSpeed = 200;
        this.levelTransitioning = false;

        // Initialize audio paths (you'll replace these with actual paths)
        if (window.audioManager) {
            window.audioManager.setMusicPaths(
                'assets/audio/background-music.mp3',
                'assets/audio/eat.mp3',
                'assets/audio/game-over.mp3'
            );
        }

        // Initialize the game
        this.setupEventListeners();
        this.updateScoreDisplay();
        this.updateLevelDisplay();
        this.updateSpeedDisplay();

        // Clear canvas and draw initial state
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.draw();
    }

    cleanup() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        // Remove event listeners
        document.removeEventListener('keydown', this._boundKeyHandler);
    }

    setupEventListeners() {
        // Store bound handler for cleanup
        this._boundKeyHandler = (e) => {
            if (this.gameLoop === null && !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                return; // Don't handle non-arrow keys before game starts
            }

            switch (e.key) {
                case 'ArrowUp':
                    this.snake.setDirection('up');
                    break;
                case 'ArrowDown':
                    this.snake.setDirection('down');
                    break;
                case 'ArrowLeft':
                    this.snake.setDirection('left');
                    break;
                case 'ArrowRight':
                    this.snake.setDirection('right');
                    break;
                case 'p':
                case 'P':
                    this.togglePause();
                    break;
            }
        };
        document.addEventListener('keydown', this._boundKeyHandler);
    }
    start() {
        if (this.gameLoop) return;
        // Play background music when game starts
        if (window.audioManager) {
            window.audioManager.playBackgroundMusic();
        }
        const interval = Math.floor(this.baseSpeed / this.speed);
        console.log(`Starting game loop with interval: ${interval}ms, speed: ${this.speed}`);
        this.gameLoop = setInterval(() => this.update(), interval);
    }

    update() {
        if (this.isPaused) return;

        this.snake.move();

        // Check wall and self collision
        if (this.snake.checkCollision()) {
            this.gameOver();
            return;
        } // Check food collision
        const head = this.snake.body[0];
        if (head.x === this.food.position.x && head.y === this.food.position.y) {
            // Play eat sound
            if (window.audioManager) {
                window.audioManager.playEatSound();
            }
            // Handle fruit eating
            this.snake.grow();
            this.food.generatePosition();
            this.score += 10;
            this.updateScoreDisplay();

            // Only check for level changes if not already transitioning
            if (!this.levelTransitioning) {
                if (this.score === 50 && this.level === 1) {
                    this.levelTransitioning = true;
                    setTimeout(() => {
                        this.showLevelPopup(2);
                    }, 500);
                } else if (this.score === 100 && this.level === 2) {
                    this.levelTransitioning = true;
                    setTimeout(() => {
                        this.showLevelPopup(3);
                    }, 500);
                } else if (this.score >= 150) {
                    setTimeout(() => {
                        this.win();
                    }, 500);
                }
            }
        }

        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.snake.draw(this.ctx);
        this.food.draw(this.ctx);
    }
    updateScoreDisplay() {
        document.getElementById('score').textContent = this.score;
    }

    updateSpeedDisplay() {
        document.getElementById('speed').textContent = this.speed.toFixed(1);
    }

    updateLevelDisplay() {
        const levelText = document.getElementById('level');
        if (levelText) {
            levelText.textContent = this.level;
        }
    }

    resetGameLoop() {
        clearInterval(this.gameLoop);
        this.start();
    }

    togglePause() {
        this.isPaused = !this.isPaused;
    }
    gameOver() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;

        // Play game over sound
        if (window.audioManager) {
            window.audioManager.playGameOverSound();
        }

        const playerName = localStorage.getItem('currentPlayer') || 'Player';

        // Save score to leaderboard
        const highScores = JSON.parse(localStorage.getItem('snakeLeaderboard') || '[]');
        highScores.push({ name: playerName, score: this.score });
        highScores.sort((a, b) => b.score - a.score);
        localStorage.setItem('snakeLeaderboard', JSON.stringify(highScores.slice(0, 10)));

        // Show game over popup
        document.getElementById('gameOverText').textContent = `GAME OVER!\nScore: ${this.score}`;
        document.getElementById('gameOverPopup').classList.remove('hidden');
    }

    checkCollision() {
        // Check wall collision
        const head = this.snake.getHead();
        if (head.x < 0 || head.x >= this.canvas.width ||
            head.y < 0 || head.y >= this.canvas.height) {
            this.gameOver();
            return true;
        }

        // Check self collision
        const body = this.snake.getBody();
        for (let i = 1; i < body.length; i++) {
            if (head.x === body[i].x && head.y === body[i].y) {
                this.gameOver();
                return true;
            }
        }

        return false;
    }
    win() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;

        // Save score to leaderboard
        const playerName = localStorage.getItem('currentPlayer') || 'PLAYER';
        const highScores = JSON.parse(localStorage.getItem('snakeLeaderboard') || '[]');
        highScores.push({ name: playerName, score: this.score });
        highScores.sort((a, b) => b.score - a.score);
        localStorage.setItem('snakeLeaderboard', JSON.stringify(highScores.slice(0, 10)));

        document.getElementById('gameOverText').textContent = 'YOU WIN!';
        document.getElementById('gameOverPopup').classList.remove('hidden');
    }

    showLevelPopup(level) {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        document.getElementById('levelText').textContent = `LEVEL ${level}!`;
        document.getElementById('levelPopup').classList.remove('hidden');
    }
    continueToNextLevel() {
        document.getElementById('levelPopup').classList.add('hidden');

        if (this.score >= 100) {
            this.level = 3;
            this.speed = 3;
        } else if (this.score >= 50) {
            this.level = 2;
            this.speed = 2;
        }

        this.updateLevelDisplay();
        this.updateSpeedDisplay();
        this.levelTransitioning = false;
        this.isPaused = false;
        this.gameLoop = null; // Clear any existing game loop
        this.start();
    }
}

function continueGame() {
    const game = window.gameInstance;
    if (game) {
        game.continueToNextLevel();
    }
}

function resetGame() {
    document.getElementById('gameOverPopup').classList.add('hidden');
    new Game();
}

// Start the game when the page loads
window.onload = () => {
    window.gameInstance = new Game();
};