// Handle name input and game start
function startGameWithName() {
    const nameInput = document.getElementById('playerName');
    const playerName = nameInput.value.trim();

    // Require a name
    if (!playerName) {
        nameInput.classList.add('shake');
        setTimeout(() => nameInput.classList.remove('shake'), 500);
        return;
    } // Save player name in localStorage
    localStorage.setItem('currentPlayer', playerName);
    console.log('Player name saved:', playerName);

    // Animate the transition
    const overlay = document.getElementById('nameOverlay');
    const gameContent = document.getElementById('gameContent');

    overlay.style.opacity = '0';
    gameContent.classList.remove('blur');
    setTimeout(() => {
        overlay.style.display = 'none';
        // Remove the blur effect first
        document.getElementById('gameContent').classList.remove('blur');
        // Initialize the game
        window.gameInstance = new Game();
        // Show "Press any arrow key to start" message
        const message = document.createElement('div');
        message.className = 'start-message';
        message.textContent = 'Press any arrow key to start';
        document.querySelector('.game-wrapper').appendChild(message);

        // Start game on first arrow key press
        const startHandler = (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                message.remove();
                window.gameInstance.start();
                document.removeEventListener('keydown', startHandler);
            }
        };
        document.addEventListener('keydown', startHandler);
    }, 500);
}

// Add enter key support
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        startGameWithName();
    }
}

// When the page loads
window.onload = () => {
    const nameInput = document.getElementById('playerName');
    nameInput.addEventListener('keypress', handleKeyPress);
    nameInput.focus();
};