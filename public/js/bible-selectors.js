// Bible Selectors - YouVersion-style selectors
class BibleSelectors {
    constructor() {
        this.books = [];
        this.availableVersions = []; // Store loaded versions
        this.currentBook = null;
        this.currentChapter = null;
        this.currentVersion = 'en-kjv';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadBooks();
        this.loadBibleVersions(); // Load versions from API
        this.setupClickOutsideHandler();
    }

    setupEventListeners() {
        // Book selector
        const bookBtn = document.getElementById('book-selector-btn');
        const bookDropdown = document.getElementById('book-dropdown');
        const bookSearch = document.getElementById('book-search');

        if (bookBtn) {
            bookBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleDropdown('book');
            });
        }

        if (bookSearch) {
            bookSearch.addEventListener('input', (e) => {
                this.filterBooks(e.target.value);
            });
        }

        // Chapter selector
        const chapterBtn = document.getElementById('chapter-selector-btn');
        if (chapterBtn) {
            chapterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!chapterBtn.disabled) {
                    this.toggleDropdown('chapter');
                }
            });
        }

        // Version selector
        const versionBtn = document.getElementById('version-selector-btn');
        if (versionBtn) {
            versionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleDropdown('version');
            });
        }
    }

    toggleDropdown(type) {
        // Close all dropdowns first
        this.closeAllDropdowns();
        
        // Open the requested dropdown
        const selectorGroup = document.querySelector(`#${type}-selector-btn`).parentElement;
        selectorGroup.classList.add('open');
    }

    closeAllDropdowns() {
        document.querySelectorAll('.selector-group').forEach(group => {
            group.classList.remove('open');
        });
    }

    setupClickOutsideHandler() {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.selector-group')) {
                this.closeAllDropdowns();
            }
        });
    }

    async loadBooks() {
        try {
            const response = await fetch('/api/books');
            const data = await response.json();
            
            if (data.success) {
                this.books = data.books;
                this.renderBooks();
            }
        } catch (error) {
            console.error('Error loading books:', error);
        }
    }

    renderBooks() {
        const oldTestamentContainer = document.getElementById('old-testament-books');
        const newTestamentContainer = document.getElementById('new-testament-books');
        
        if (!oldTestamentContainer || !newTestamentContainer) return;

        // Clear containers
        oldTestamentContainer.innerHTML = '';
        newTestamentContainer.innerHTML = '';

        // Old Testament books (roughly first 39 books)
        const oldTestamentBooks = this.books.slice(0, 39);
        const newTestamentBooks = this.books.slice(39);

        oldTestamentBooks.forEach(book => {
            const bookElement = this.createBookElement(book);
            oldTestamentContainer.appendChild(bookElement);
        });

        newTestamentBooks.forEach(book => {
            const bookElement = this.createBookElement(book);
            newTestamentContainer.appendChild(bookElement);
        });
    }

    createBookElement(book) {
        const bookElement = document.createElement('div');
        bookElement.className = 'book-item';
        bookElement.textContent = book.name;
        bookElement.dataset.bookId = book.name.toLowerCase();
        bookElement.dataset.chapters = book.chapters;

        bookElement.addEventListener('click', () => {
            this.selectBook(book);
        });

        return bookElement;
    }

    selectBook(book) {
        this.currentBook = book;
        
        // Update book button
        const selectedBook = document.getElementById('selected-book');
        if (selectedBook) {
            selectedBook.textContent = book.name;
        }

        // Enable chapter selector
        const chapterBtn = document.getElementById('chapter-selector-btn');
        if (chapterBtn) {
            chapterBtn.disabled = false;
        }

        // Generate chapters
        this.generateChapters(book.chapters);
        
        // Close dropdown
        this.closeAllDropdowns();
        
        // Reset chapter selection
        this.currentChapter = null;
        const selectedChapter = document.getElementById('selected-chapter');
        if (selectedChapter) {
            selectedChapter.textContent = '--';
        }
    }

    generateChapters(totalChapters) {
        const chaptersContainer = document.getElementById('chapters-grid');
        if (!chaptersContainer) return;

        chaptersContainer.innerHTML = '';

        for (let i = 1; i <= totalChapters; i++) {
            const chapterElement = document.createElement('div');
            chapterElement.className = 'chapter-item';
            chapterElement.textContent = i;
            chapterElement.dataset.chapter = i;

            chapterElement.addEventListener('click', () => {
                this.selectChapter(i);
            });

            chaptersContainer.appendChild(chapterElement);
        }
    }

    selectChapter(chapter) {
        this.currentChapter = chapter;
        
        // Update chapter button
        const selectedChapter = document.getElementById('selected-chapter');
        if (selectedChapter) {
            selectedChapter.textContent = chapter;
        }

        // Close dropdown
        this.closeAllDropdowns();
        
        // Load the chapter content
        this.loadChapterContent();
    }

    async loadChapterContent() {
        if (!this.currentBook || !this.currentChapter) return;

        try {
            const response = await fetch(`/api/chapter-improved?book=${encodeURIComponent(this.currentBook.name.toLowerCase())}&chapter=${this.currentChapter}&version=${this.currentVersion}`);
            const data = await response.json();
            
            if (data.success) {
                this.displayChapterContent(data);
            } else {
                // Handle Spanish version error gracefully
                if (data.code === 503) {
                    this.displayVersionError(data);
                } else {
                    this.displayError('Error cargando el capítulo');
                }
            }
        } catch (error) {
            console.error('Error loading chapter:', error);
            this.displayError('Error de conexión');
        }
    }

    displayChapterContent(data) {
        const contentContainer = document.getElementById('bible-content');
        if (!contentContainer) return;

        const verses = data.verses.map(verse => 
            `<div class="verse" data-verse="${verse.verse}">
                <span class="verse-number">${verse.verse}</span>
                <span class="verse-text">${verse.text}</span>
            </div>`
        ).join('');

        contentContainer.innerHTML = `
            <div class="chapter-header">
                <h2>${this.currentBook.name} ${this.currentChapter}</h2>
                <div class="chapter-info">${data.totalVerses} versículos • ${data.version.toUpperCase()}</div>
            </div>
            <div class="verses-container">
                ${verses}
            </div>
        `;
    }

    displayVersionError(data) {
        const contentContainer = document.getElementById('bible-content');
        if (!contentContainer) return;

        contentContainer.innerHTML = `
            <div class="version-error">
                <div class="error-icon">⚠️</div>
                <h3>Versión no disponible temporalmente</h3>
                <p>${data.message}</p>
                <div class="error-actions">
                    <button onclick="window.bibleSelectors.selectVersion('en-kjv')" class="btn-primary">
                        Cambiar a versión en inglés (KJV)
                    </button>
                </div>
            </div>
        `;
    }

    displayError(message) {
        const contentContainer = document.getElementById('bible-content');
        if (!contentContainer) return;

        contentContainer.innerHTML = `
            <div class="error-message">
                <div class="error-icon">❌</div>
                <p>${message}</p>
            </div>
        `;
    }

    // Load Bible versions from API
    async loadBibleVersions() {
        try {
            const response = await fetch('/api/versions');
            const data = await response.json();
            
            if (data.success) {
                this.availableVersions = data.versions;
                this.updateVersionSelector();
            } else {
                console.error('Error loading versions:', data.error);
                // Use fallback versions if API fails
                this.availableVersions = [
                    { id: 'en-kjv', name: 'King James Version', lang: 'en' },
                    { id: 'es-rvr1960', name: 'Reina-Valera 1960', lang: 'es' }
                ];
                this.updateVersionSelector();
            }
        } catch (error) {
            console.error('Error fetching versions:', error);
            // Use fallback versions if fetch fails
            this.availableVersions = [
                { id: 'en-kjv', name: 'King James Version', lang: 'en' },
                { id: 'es-rvr1960', name: 'Reina-Valera 1960', lang: 'es' }
            ];
            this.updateVersionSelector();
        }
    }

    // Update version selector dropdown
    updateVersionSelector() {
        const versionDropdown = document.querySelector('#version-dropdown .dropdown-content');
        if (!versionDropdown) return;

        // Clear existing options
        versionDropdown.innerHTML = '';

        // Group versions by language
        const versionsByLanguage = {};
        this.availableVersions.forEach(version => {
            if (!versionsByLanguage[version.lang]) {
                versionsByLanguage[version.lang] = [];
            }
            versionsByLanguage[version.lang].push(version);
        });

        // Language labels
        const languageLabels = {
            'es': '🇪🇸 Español',
            'en': '🇺🇸 English',
            'pt': '🇧🇷 Português',
            'fr': '🇫🇷 Français',
            'de': '🇩🇪 Deutsch',
            'it': '🇮🇹 Italiano',
            'ru': '🇷🇺 Русский'
        };

        // Add versions grouped by language
        Object.keys(versionsByLanguage).forEach(lang => {
            // Add language group header
            const langHeader = document.createElement('div');
            langHeader.className = 'version-group-header';
            langHeader.textContent = languageLabels[lang] || lang.toUpperCase();
            versionDropdown.appendChild(langHeader);

            // Sort versions by popularity (popular first)
            const versions = versionsByLanguage[lang].sort((a, b) => {
                if (a.popular && !b.popular) return -1;
                if (!a.popular && b.popular) return 1;
                return a.name.localeCompare(b.name);
            });

            // Add version options
            versions.forEach(version => {
                const versionItem = document.createElement('div');
                versionItem.className = 'version-item';
                versionItem.innerHTML = `
                    <div class="version-name">${version.name}</div>
                    <div class="version-description">${version.description || ''}</div>
                `;
                versionItem.addEventListener('click', () => {
                    this.selectVersion(version.id, version.name);
                });
                versionDropdown.appendChild(versionItem);
            });
        });
    }

    selectVersion(versionId, versionName) {
        this.currentVersion = versionId;
        
        // Update version button
        const selectedVersion = document.getElementById('selected-version');
        if (selectedVersion) {
            selectedVersion.textContent = versionName || versionId.toUpperCase();
        }

        // Close dropdown
        this.closeAllDropdowns();

        // Reload current chapter if selected
        if (this.currentBook && this.currentChapter) {
            this.loadChapterContent();
        }
    }

    filterBooks(query) {
        const books = document.querySelectorAll('.book-item');
        const searchTerm = query.toLowerCase();

        books.forEach(book => {
            const bookName = book.textContent.toLowerCase();
            if (bookName.includes(searchTerm)) {
                book.style.display = '';
            } else {
                book.style.display = 'none';
            }
        });
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.bibleSelectors = new BibleSelectors();
    });
} else {
    window.bibleSelectors = new BibleSelectors();
}