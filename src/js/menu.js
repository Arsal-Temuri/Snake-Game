// Handle localStorage and file storage for high scores
const HIGH_SCORES_KEY = 'snakeLeaderboard';

function getHighScores() {
    const scores = localStorage.getItem(HIGH_SCORES_KEY);
    return scores ? JSON.parse(scores) : [];
}

function saveHighScore(name, score) {
    const highScores = getHighScores();
    highScores.push({ name, score });
    highScores.sort((a, b) => b.score - a.score); // Sort by highest score
    const topScores = highScores.slice(0, 10); // Keep only top 10 scores
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(topScores));

    // Also save to file
    saveScoresToFile(topScores);
}

function saveScoresToFile(scores) {
    const scoresText = scores.map((score, index) =>
        `${index + 1}. ${score.name}: ${score.score}`
    ).join('\n');

    const blob = new Blob([scoresText], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'snake_scores.txt';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
}

// Dialog management
// Only show leaderboard content
function showLeaderboard() {
    const leaderboardList = document.getElementById('leaderboardList');
    if (!leaderboardList) return;

    leaderboardList.innerHTML = ''; // Clear existing entries

    const highScores = getHighScores();
    if (highScores.length === 0) {
        leaderboardList.innerHTML = '<p class="no-scores">No scores yet!</p>';
    } else {
        highScores.forEach((score, index) => {
            const scoreElement = document.createElement('div');
            scoreElement.className = 'score-entry';
            scoreElement.innerHTML = `
                <span class="rank">${index + 1}</span>
                <span class="name">${score.name}</span>
                <span class="score">${score.score}</span>
            `;
            leaderboardList.appendChild(scoreElement);
        });
    }

    document.getElementById('leaderboardDialog').classList.remove('hidden');
}

function hideLeaderboard() {
    document.getElementById('leaderboardDialog').classList.add('hidden');
}

function startGame() {
    const nameInput = document.getElementById('playerName');
    const playerName = nameInput.value.trim() || 'PLAYER';

    // Store the player name in localStorage for the game
    localStorage.setItem('currentPlayer', playerName);

    // Navigate to the game page
    window.location.href = 'game.html';
}

// Generate tadpole-like animations
function createSnakeLines() {
    const container = document.getElementById('snakeContainer');
    const numberOfLines = 25; // More lines for better effect

    for (let i = 0; i < numberOfLines; i++) {
        const line = document.createElement('div');
        line.className = 'snake-line';

        // Randomize position and animation
        line.style.top = `${Math.random() * 100}%`;
        line.style.animationDelay = `${Math.random() * 3}s`;
        line.style.animationDuration = `${2 + Math.random() * 2}s`; // Faster animation
        line.style.opacity = `${0.1 + Math.random() * 0.1}`;

        // Add transform origin for better wiggle effect
        line.style.transformOrigin = 'center left';

        // Randomize initial position slightly
        line.style.left = `${Math.random() * 20 - 10}%`;

        // Alternate colors with more variation
        const colorChoice = Math.random();
        if (colorChoice < 0.33) {
            line.style.background = 'var(--neon-blue)';
        } else if (colorChoice < 0.66) {
            line.style.background = 'var(--neon-pink)';
        } else {
            line.style.background = 'var(--neon-green)';
        }

        container.appendChild(line);
    }
}

function spawnNewTadpole() {
    const container = document.getElementById('snakeContainer');

    // Create new tadpole
    const line = document.createElement('div');
    line.className = 'snake-line';

    // Start from left side with random vertical position
    line.style.top = `${Math.random() * 100}%`;
    line.style.left = '-20px';
    line.style.opacity = `${0.1 + Math.random() * 0.1}`;
    line.style.animationDuration = `${2 + Math.random() * 2}s`;

    // Random color
    const colorChoice = Math.random();
    if (colorChoice < 0.33) {
        line.style.background = 'var(--neon-blue)';
    } else if (colorChoice < 0.66) {
        line.style.background = 'var(--neon-pink)';
    } else {
        line.style.background = 'var(--neon-green)';
    }

    container.appendChild(line);

    // Remove the tadpole after animation completes
    setTimeout(() => {
        if (container.contains(line)) {
            container.removeChild(line);
        }
    }, 4000);
}

// Initialize snake animations when page loads
window.addEventListener('load', () => {
    createSnakeLines();
    // Spawn new tadpoles periodically
    setInterval(spawnNewTadpole, 200);
});