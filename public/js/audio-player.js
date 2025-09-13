// Audio Player - Reproductor de Audio Biblia
class AudioPlayer {
    constructor() {
        this.audio = null;
        this.currentPassage = null;
        this.isPlaying = false;
        this.duration = 0;
        this.currentTime = 0;
        this.volume = 0.8;
        
        this.init();
    }

    init() {
        this.setupControls();
        this.loadAudioSettings();
    }

    setupControls() {
        const playPauseBtn = document.getElementById('play-pause-btn');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const progressBar = document.getElementById('progress-bar');

        playPauseBtn?.addEventListener('click', () => {
            this.togglePlayPause();
        });

        prevBtn?.addEventListener('click', () => {
            this.previousChapter();
        });

        nextBtn?.addEventListener('click', () => {
            this.nextChapter();
        });

        progressBar?.addEventListener('input', (e) => {
            this.seekTo(e.target.value);
        });

        progressBar?.addEventListener('change', (e) => {
            this.seekTo(e.target.value);
        });
    }

    loadAudioSettings() {
        const savedVolume = localStorage.getItem('bible-audio-volume');
        if (savedVolume) {
            this.volume = parseFloat(savedVolume);
        }
    }

    async loadPassage(book, chapter, version = 'rvr1960') {
        const passageKey = `${book}_${chapter}_${version}`;
        
        // En un entorno real, esto cargaría archivos de audio reales
        // Por ahora, simulamos el audio
        this.currentPassage = {
            book,
            chapter,
            version,
            title: `${book} ${chapter}`,
            audioUrl: `/assets/audio/${passageKey}.mp3`,
            duration: 300 // 5 minutos simulados
        };

        this.updatePlayerUI();
        this.setupAudioElement();
    }

    setupAudioElement() {
        if (this.audio) {
            this.audio.pause();
            this.audio = null;
        }

        // Crear elemento audio simulado
        this.audio = {
            src: this.currentPassage.audioUrl,
            currentTime: 0,
            duration: this.currentPassage.duration,
            volume: this.volume,
            paused: true,
            ended: false,
            
            play: () => {
                this.isPlaying = true;
                this.updatePlayButton();
                this.startProgressUpdate();
                return Promise.resolve();
            },
            
            pause: () => {
                this.isPlaying = false;
                this.updatePlayButton();
                this.stopProgressUpdate();
            },
            
            addEventListener: (event, callback) => {
                // Simular eventos de audio
                if (event === 'ended') {
                    setTimeout(() => {
                        if (this.isPlaying) {
                            this.isPlaying = false;
                            this.updatePlayButton();
                            callback();
                        }
                    }, this.currentPassage.duration * 1000);
                }
            }
        };

        this.audio.addEventListener('ended', () => {
            this.onAudioEnded();
        });
    }

    updatePlayerUI() {
        const currentPassageEl = document.getElementById('current-passage');
        const currentVersionEl = document.getElementById('current-version');

        if (currentPassageEl && this.currentPassage) {
            currentPassageEl.textContent = this.currentPassage.title;
        }

        if (currentVersionEl && this.currentPassage) {
            currentVersionEl.textContent = this.currentPassage.version.toUpperCase();
        }

        this.updateTimeDisplay();
    }

    togglePlayPause() {
        if (!this.audio || !this.currentPassage) {
            app.showNotification('Selecciona un pasaje para reproducir', 'info');
            return;
        }

        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        if (this.audio) {
            this.audio.play();
            app.showNotification(`Reproduciendo ${this.currentPassage.title}`, 'info');
        }
    }

    pause() {
        if (this.audio) {
            this.audio.pause();
        }
    }

    stop() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.currentTime = 0;
            this.updateTimeDisplay();
            this.updateProgressBar();
        }
    }

    seekTo(percentage) {
        if (this.audio && this.currentPassage) {
            const newTime = (percentage / 100) * this.currentPassage.duration;
            this.audio.currentTime = newTime;
            this.currentTime = newTime;
            this.updateTimeDisplay();
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.audio) {
            this.audio.volume = this.volume;
        }
        localStorage.setItem('bible-audio-volume', this.volume.toString());
    }

    previousChapter() {
        if (!this.currentPassage) return;
        
        const currentChapter = parseInt(this.currentPassage.chapter);
        if (currentChapter > 1) {
            this.loadPassage(this.currentPassage.book, (currentChapter - 1).toString(), this.currentPassage.version);
        } else {
            app.showNotification('Ya estás en el primer capítulo', 'info');
        }
    }

    nextChapter() {
        if (!this.currentPassage) return;
        
        const currentChapter = parseInt(this.currentPassage.chapter);
        // En una implementación real, verificaríamos el número máximo de capítulos
        this.loadPassage(this.currentPassage.book, (currentChapter + 1).toString(), this.currentPassage.version);
    }

    startProgressUpdate() {
        this.progressInterval = setInterval(() => {
            if (this.isPlaying && this.audio) {
                this.currentTime += 1;
                if (this.currentTime >= this.currentPassage.duration) {
                    this.currentTime = this.currentPassage.duration;
                    this.onAudioEnded();
                    return;
                }
                this.updateTimeDisplay();
                this.updateProgressBar();
            }
        }, 1000);
    }

    stopProgressUpdate() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }

    updatePlayButton() {
        const playPauseBtn = document.getElementById('play-pause-btn');
        if (playPauseBtn) {
            playPauseBtn.textContent = this.isPlaying ? '⏸️' : '▶️';
            playPauseBtn.title = this.isPlaying ? 'Pausar' : 'Reproducir';
        }
    }

    updateTimeDisplay() {
        const currentTimeEl = document.getElementById('current-time');
        const totalTimeEl = document.getElementById('total-time');

        if (currentTimeEl) {
            currentTimeEl.textContent = this.formatTime(this.currentTime);
        }

        if (totalTimeEl && this.currentPassage) {
            totalTimeEl.textContent = this.formatTime(this.currentPassage.duration);
        }
    }

    updateProgressBar() {
        const progressBar = document.getElementById('progress-bar');
        if (progressBar && this.currentPassage) {
            const percentage = (this.currentTime / this.currentPassage.duration) * 100;
            progressBar.value = percentage;
        }
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    onAudioEnded() {
        this.isPlaying = false;
        this.currentTime = 0;
        this.updatePlayButton();
        this.updateTimeDisplay();
        this.updateProgressBar();
        this.stopProgressUpdate();
        
        app.showNotification('Reproducción terminada', 'info');
    }

    // Método para integración con el lector de Biblia
    playCurrentChapter() {
        if (app.currentBook && app.currentChapter) {
            this.loadPassage(app.currentBook, app.currentChapter, app.currentVersion);
            // Cambiar automáticamente a la sección de audio
            app.navigateToSection('audio');
        } else {
            app.showNotification('Selecciona un capítulo en el lector primero', 'info');
        }
    }

    // Configuración avanzada de audio
    setPlaybackSpeed(speed) {
        if (this.audio) {
            this.audio.playbackRate = speed;
        }
        app.showNotification(`Velocidad: ${speed}x`, 'info');
    }

    setSleepTimer(minutes) {
        if (this.sleepTimer) {
            clearTimeout(this.sleepTimer);
        }
        
        this.sleepTimer = setTimeout(() => {
            this.pause();
            app.showNotification('Sleep timer activado - reproducción pausada', 'info');
        }, minutes * 60 * 1000);
        
        app.showNotification(`Sleep timer configurado para ${minutes} minutos`, 'info');
    }
}

// Inicializar el reproductor cuando esté disponible
document.addEventListener('DOMContentLoaded', () => {
    window.audioPlayer = new AudioPlayer();
});