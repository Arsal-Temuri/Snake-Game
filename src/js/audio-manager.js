class AudioManager {
    constructor() {
        if (window.audioManagerInstance) {
            return window.audioManagerInstance;
        }
        window.audioManagerInstance = this;

        // Background music
        this.bgMusic = new Audio();
        this.bgMusic.loop = true;

        // Sound effects
        this.eatSound = new Audio();
        this.gameOverSound = new Audio();

        // Initialize state
        this.isMuted = localStorage.getItem('snakeGameMuted') === 'true';
        this.isGameOver = false;
        this.isPlaying = false;

        // Try to get the last known position or start from 0
        this.lastKnownPosition = parseFloat(localStorage.getItem('audioPosition')) || 0;
        
        // Handle page unload to save position
        window.addEventListener('beforeunload', () => {
            if (this.bgMusic.currentTime > 0) {
                localStorage.setItem('audioPosition', this.bgMusic.currentTime);
            }
        });

        // Handle page visibility and navigation
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.bgMusicTime = this.bgMusic.currentTime;
                localStorage.setItem('audioCurrentTime', this.bgMusicTime);
            } else if (!this.isMuted && !this.isGameOver) {
                this.syncAndPlayMusic();
            }
        });

        // Setup audio context for mobile devices
        this.setupAudioContext();
    }

    loadFromLocalStorage() {
        this.isMuted = localStorage.getItem('snakeGameMuted') === 'true';
        this.updateMuteState();
    }

    setupAudioContext() {
        // Create audio context for mobile device compatibility
        this.audioContext = new(window.AudioContext || window.webkitAudioContext)();

        // Setup click handler to initialize audio on first user interaction
        document.addEventListener('click', () => {
            if (!this.hasInitialized) {
                this.audioContext.resume();
                this.hasInitialized = true;
                if (!this.isMuted) {
                    this.syncAndPlayMusic();
                }
            }
        }, { once: true });
    }

    syncAndPlayMusic() {
        const savedTime = parseFloat(localStorage.getItem('audioCurrentTime')) || 0;
        const timeSinceStart = (Date.now() - this.startTimestamp) / 1000;

        // Calculate where in the song we should be
        if (this.bgMusic.duration) {
            const syncedTime = savedTime + timeSinceStart % this.bgMusic.duration;
            this.bgMusic.currentTime = syncedTime;
        }

        this.playBackgroundMusic();
    }

    setMusicPaths(bgMusicPath, eatSoundPath, gameOverSoundPath) {
        if (!this.bgMusic.src) {
            this.bgMusic.src = bgMusicPath;
            this.eatSound.src = eatSoundPath;
            this.gameOverSound.src = gameOverSoundPath;

            // Set up background music
            this.bgMusic.addEventListener('loadedmetadata', () => {
                if (!this.isMuted && !this.isPlaying) {
                    // Resume from last known position
                    this.bgMusic.currentTime = this.lastKnownPosition;
                    this.playBackgroundMusic();
                }
            });

            // Keep track of current position
            this.bgMusic.addEventListener('timeupdate', () => {
                if (this.bgMusic.currentTime > 0) {
                    localStorage.setItem('audioPosition', this.bgMusic.currentTime);
                }
            });

            // Handle music ending
            this.bgMusic.addEventListener('ended', () => {
                this.lastKnownPosition = 0;
                localStorage.setItem('audioPosition', 0);
            });
        }
    }

    async playBackgroundMusic() {
        if (!this.isMuted && !this.isGameOver) {
            try {
                // Create a new audio context if needed (for mobile)
                if (!this.audioContext) {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }
                await this.audioContext.resume();
                
                // Play the music
                await this.bgMusic.play();
                this.isPlaying = true;
                
                // Resume from last position if needed
                if (this.lastKnownPosition > 0 && this.bgMusic.currentTime === 0) {
                    this.bgMusic.currentTime = this.lastKnownPosition;
                }
            } catch (error) {
                console.log('Playback failed:', error);
                // Set up a one-time click handler to start playback
                const startAudio = async () => {
                    await this.playBackgroundMusic();
                    document.removeEventListener('click', startAudio);
                };
                document.addEventListener('click', startAudio, { once: true });
            }
        }
    }

    resumeBackgroundMusic() {
        if (this.bgMusic.paused && !this.isMuted && !this.isGameOver) {
            this.lastKnownPosition = parseFloat(localStorage.getItem('audioPosition')) || 0;
            this.playBackgroundMusic();
        }
    }

    pauseBackgroundMusic() {
        if (!this.bgMusic.paused) {
            this.bgMusic.pause();
            this.isPlaying = false;
            localStorage.setItem('audioPosition', this.bgMusic.currentTime);
        }
    }

    playEatSound() {
        if (!this.isMuted) {
            this.eatSound.currentTime = 0;
            this.eatSound.play().catch(error => console.log('Audio play failed:', error));
        }
    }

    playGameOverSound() {
        if (!this.isMuted) {
            // Pause background music
            this.isGameOver = true;
            this.pauseBackgroundMusic();

            // Play game over sound
            this.gameOverSound.currentTime = 0;
            this.gameOverSound.play().catch(error => console.log('Audio play failed:', error));

            // Reset background music when game over sound finishes
            this.gameOverSound.onended = () => {
                this.isGameOver = false;
                if (!this.isMuted) {
                    this.bgMusic.currentTime = 0;
                    this.playBackgroundMusic();
                }
            };
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('snakeGameMuted', this.isMuted);
        this.updateMuteState();
    }

    updateMuteState() {
        // Update all mute buttons
        document.querySelectorAll('.mute-button').forEach(btn => {
            if (this.isMuted) {
                btn.classList.remove('unmuted');
                btn.classList.add('muted');
                btn.innerHTML = '🔇';
            } else {
                btn.classList.remove('muted');
                btn.classList.add('unmuted');
                btn.innerHTML = '🔊';
            }
        });

        // Handle audio state
        if (this.isMuted) {
            this.pauseBackgroundMusic();
        } else if (this.bgMusic.readyState >= 2) { // Check if audio is loaded enough to play
            this.resumeBackgroundMusic();
        }
    }
}

// Create a global instance
window.audioManager = new AudioManager();