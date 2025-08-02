function resetGame() {
    // Hide all popups
    document.getElementById('gameOverPopup').classList.add('hidden');
    document.getElementById('levelPopup').classList.add('hidden');

    // Clear the canvas
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Reset score and level displays
    document.getElementById('score').textContent = '0';
    document.getElementById('level').textContent = '1';
    document.getElementById('speed').textContent = '1';

    // Remove any existing game loop
    if (window.gameInstance && window.gameInstance.gameLoop) {
        clearInterval(window.gameInstance.gameLoop);
        window.gameInstance.gameLoop = null;
    }

    // Create new game instance
    window.gameInstance = new Game();

    // Show "Press any arrow key to start" message
    let message = document.querySelector('.start-message');
    if (!message) {
        message = document.createElement('div');
        message.className = 'start-message';
        message.textContent = 'Press any arrow key to start';
        document.querySelector('.game-wrapper').appendChild(message);
    }

    // Start game on first arrow key press
    const startHandler = (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            message.remove();
            window.gameInstance.start();
            document.removeEventListener('keydown', startHandler);
        }
    };
    document.addEventListener('keydown', startHandler);
}