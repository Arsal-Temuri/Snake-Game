// Generate retro-style audio for the game
class AudioGenerator {
    constructor() {
        this.audioContext = new(window.AudioContext || window.webkitAudioContext)();
    }

    async generateBackgroundMusic() {
        const duration = 4;
        const bpm = 120;

        const notes = [440, 523.25, 587.33, 659.25, 698.46, 783.99];
        const offlineCtx = new OfflineAudioContext(2, duration * 44100, 44100);

        notes.forEach((freq, i) => {
            const osc = offlineCtx.createOscillator();
            const gain = offlineCtx.createGain();

            osc.type = 'triangle';
            osc.frequency.value = freq;

            gain.gain.value = 0.1;
            gain.gain.setValueAtTime(0.1, i * (duration / notes.length));
            gain.gain.linearRampToValueAtTime(0, (i + 0.8) * (duration / notes.length));

            osc.connect(gain);
            gain.connect(offlineCtx.destination);

            osc.start(i * (duration / notes.length));
            osc.stop((i + 1) * (duration / notes.length));
        });

        const audioBuffer = await offlineCtx.startRendering();
        return this.bufferToWav(audioBuffer);
    }

    async generateEatSound() {
        const duration = 0.1;
        const offlineCtx = new OfflineAudioContext(1, duration * 44100, 44100);

        const osc = offlineCtx.createOscillator();
        const gain = offlineCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, 0);
        osc.frequency.exponentialRampToValueAtTime(440, duration);

        gain.gain.setValueAtTime(0.5, 0);
        gain.gain.exponentialRampToValueAtTime(0.01, duration);

        osc.connect(gain);
        gain.connect(offlineCtx.destination);

        osc.start(0);
        osc.stop(duration);

        const audioBuffer = await offlineCtx.startRendering();
        return this.bufferToWav(audioBuffer);
    }

    async generateGameOverSound() {
        const duration = 1;
        const offlineCtx = new OfflineAudioContext(1, duration * 44100, 44100);

        const osc = offlineCtx.createOscillator();
        const gain = offlineCtx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, 0);
        osc.frequency.exponentialRampToValueAtTime(110, duration);

        gain.gain.setValueAtTime(0.5, 0);
        gain.gain.exponentialRampToValueAtTime(0.01, duration);

        osc.connect(gain);
        gain.connect(offlineCtx.destination);

        osc.start(0);
        osc.stop(duration);

        const audioBuffer = await offlineCtx.startRendering();
        return this.bufferToWav(audioBuffer);
    }

    bufferToWav(audioBuffer) {
        const numOfChan = audioBuffer.numberOfChannels;
        const length = audioBuffer.length * numOfChan * 2;
        const buffer = new ArrayBuffer(44 + length);
        const view = new DataView(buffer);

        // Write WAV header
        const writeString = (view, offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + length, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numOfChan, true);
        view.setUint32(24, audioBuffer.sampleRate, true);
        view.setUint32(28, audioBuffer.sampleRate * 2, true);
        view.setUint16(32, numOfChan * 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, 'data');
        view.setUint32(40, length, true);

        // Write audio data
        const offset = 44;
        const channelData = [];
        for (let i = 0; i < numOfChan; i++) {
            channelData[i] = audioBuffer.getChannelData(i);
        }

        let index = 0;
        for (let i = 0; i < audioBuffer.length; i++) {
            for (let channel = 0; channel < numOfChan; channel++) {
                const sample = channelData[channel][i];
                view.setInt16(offset + index * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                index++;
            }
        }

        return new Blob([buffer], { type: 'audio/wav' });
    }

    async downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    async generateAll() {
        const bgMusic = await this.generateBackgroundMusic();
        const eatSound = await this.generateEatSound();
        const gameOverSound = await this.generateGameOverSound();

        await this.downloadFile(bgMusic, 'background-music.wav');
        await this.downloadFile(eatSound, 'eat.wav');
        await this.downloadFile(gameOverSound, 'game-over.wav');
    }
}