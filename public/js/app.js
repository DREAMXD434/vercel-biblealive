// Bible Alive - Aplicación Principal
class BibleAliveApp {
    constructor() {
        this.currentSection = 'home';
        this.currentBook = null;
        this.currentChapter = null;
        this.currentVersion = 'en-kjv';
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupApp());
        } else {
            await this.setupApp();
        }
    }

    async setupApp() {
        console.log('Inicializando Bible Alive...');
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Cargar datos iniciales
        await this.loadInitialData();
        
        // Cargar estadísticas del perfil
        await this.loadProfileStats();
        
        // Ocultar pantalla de carga
        this.hideLoadingScreen();
        
        console.log('Bible Alive inicializado correctamente');
    }

    setupEventListeners() {
        // Navigation
        this.setupNavigation();
        
        // Theme toggle
        this.setupThemeToggle();
        
        // Reading controls
        this.setupReadingControls();
        
        // Action cards
        this.setupActionCards();
        
        // FAB menu
        this.setupFABMenu();
        
        // Modal
        this.setupModal();
    }

    setupNavigation() {
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('sidebar');
        const sidebarClose = document.getElementById('sidebar-close');
        const navLinks = document.querySelectorAll('.nav-link');

        // Toggle sidebar
        menuToggle?.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        sidebarClose?.addEventListener('click', () => {
            sidebar.classList.remove('open');
        });

        // Navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.navigateToSection(section);
                sidebar.classList.remove('open');
            });
        });

        // Close sidebar on outside click
        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        const savedTheme = localStorage.getItem('bible-alive-theme') || 'light';
        
        document.body.className = `theme-${savedTheme}`;
        
        themeToggle?.addEventListener('click', () => {
            const currentTheme = document.body.classList.contains('theme-dark') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.body.className = `theme-${newTheme}`;
            localStorage.setItem('bible-alive-theme', newTheme);
        });
    }

    setupReadingControls() {
        const bookSelect = document.getElementById('book-select');
        const chapterSelect = document.getElementById('chapter-select');
        const versionSelect = document.getElementById('version-select');

        bookSelect?.addEventListener('change', (e) => {
            this.onBookSelected(e.target.value);
        });

        chapterSelect?.addEventListener('change', (e) => {
            this.onChapterSelected(e.target.value);
        });

        versionSelect?.addEventListener('change', async (e) => {
            const newVersion = e.target.value;
            if (newVersion !== this.currentVersion) {
                this.currentVersion = newVersion;
                
                // Agregar al historial de versiones
                await this.addVersionToHistory(newVersion);
                
                // Recargar capítulo si hay uno seleccionado
                if (this.currentBook && this.currentChapter) {
                    this.loadChapter(this.currentBook, this.currentChapter);
                }
                
                // Mostrar información de la versión seleccionada
                this.showVersionInfo(newVersion);
            }
        });
    }

    setupActionCards() {
        const actionCards = document.querySelectorAll('.action-card');
        
        actionCards.forEach(card => {
            card.addEventListener('click', () => {
                const action = card.dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    setupFABMenu() {
        const fabMain = document.getElementById('fab-main');
        const fabMenu = document.querySelector('.fab-menu');
        const fabItems = document.querySelectorAll('.fab-item');

        fabMain?.addEventListener('click', () => {
            fabMenu.classList.toggle('open');
        });

        fabItems.forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                this.handleFABAction(action);
                fabMenu.classList.remove('open');
            });
        });
    }

    setupModal() {
        const modal = document.getElementById('modal');
        const modalClose = document.querySelector('.modal-close');

        modalClose?.addEventListener('click', () => {
            this.closeModal();
        });

        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    async loadInitialData() {
        try {
            // Cargar versículo del día
            await this.loadVerseOfDay();
            
            // Cargar libros de la Biblia
            await this.loadBibleBooks();
            
            // Cargar versiones
            await this.loadBibleVersions();
            
            // Cargar planes de lectura
            await this.loadReadingPlans();
            
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
            this.showNotification('Error cargando la aplicación. Por favor, recarga la página.', 'error');
        }
    }

    async loadVerseOfDay() {
        try {
            const response = await fetch('/api/verse-of-day');
            const data = await response.json();
            
            if (data.success) {
                const verseContainer = document.getElementById('daily-verse');
                if (verseContainer) {
                    verseContainer.innerHTML = `
                        <div class="verse-text">"${data.verse.text}"</div>
                        <div class="verse-reference">${data.verse.reference} (${data.verse.version})</div>
                    `;
                }
            }
        } catch (error) {
            console.error('Error cargando versículo del día:', error);
        }
    }

    async loadBibleBooks() {
        try {
            console.log('Attempting to load books from /api/books');
            const response = await fetch('/api/books');
            console.log('Books API response status:', response.status);
            const data = await response.json();
            
            if (data.success) {
                const bookSelect = document.getElementById('book-select');
                if (bookSelect) {
                    bookSelect.innerHTML = '<option value="">Seleccionar libro...</option>';
                    data.books.forEach(book => {
                        const option = document.createElement('option');
                        option.value = book.name.toLowerCase();
                        option.textContent = book.name;
                        option.dataset.chapters = book.chapters;
                        bookSelect.appendChild(option);
                    });
                }
            }
        } catch (error) {
            console.error('Error cargando libros:', error);
        }
    }

    async loadBibleVersions() {
        try {
            const response = await fetch('/api/versions');
            const data = await response.json();
            
            if (data.success) {
                // Guardar versiones para uso posterior
                this.availableVersions = data.versions;
                
                // Cargar historial de versiones
                await this.loadVersionHistory();
                
                // Actualizar selector de versiones
                this.updateVersionSelector();
            }
        } catch (error) {
            console.error('Error cargando versiones:', error);
        }
    }

    async loadVersionHistory() {
        try {
            const response = await fetch('/api/version-history');
            const data = await response.json();
            
            if (data.success) {
                this.versionHistory = data.history;
                
                // Establecer versión por defecto desde el historial
                if (this.versionHistory.defaultVersion) {
                    this.currentVersion = this.versionHistory.defaultVersion;
                }
            }
        } catch (error) {
            console.error('Error cargando historial de versiones:', error);
            this.versionHistory = {
                recentVersions: [],
                favoriteVersions: [],
                defaultVersion: 'en-kjv'
            };
        }
    }

    updateVersionSelector() {
        const versionSelect = document.getElementById('version-select');
        if (!versionSelect || !this.availableVersions) return;

        // Limpiar selector
        versionSelect.innerHTML = '';

        // Crear grupos de versiones
        const groupedVersions = this.groupVersionsByLanguage();
        
        // Agregar versiones favoritas primero si existen
        if (this.versionHistory.favoriteVersions.length > 0) {
            const favGroup = document.createElement('optgroup');
            favGroup.label = '⭐ Favoritos';
            
            this.versionHistory.favoriteVersions.forEach(favId => {
                const version = this.availableVersions.find(v => v.id === favId);
                if (version) {
                    const option = this.createVersionOption(version, true);
                    favGroup.appendChild(option);
                }
            });
            
            versionSelect.appendChild(favGroup);
        }

        // Agregar versiones recientes
        if (this.versionHistory.recentVersions.length > 0) {
            const recentGroup = document.createElement('optgroup');
            recentGroup.label = '🕒 Recientes';
            
            this.versionHistory.recentVersions.forEach(recent => {
                const version = this.availableVersions.find(v => v.id === recent.id);
                if (version && !this.versionHistory.favoriteVersions.includes(version.id)) {
                    const option = this.createVersionOption(version);
                    option.textContent += ` (usado ${recent.usageCount} vez${recent.usageCount !== 1 ? 'es' : ''})`;
                    recentGroup.appendChild(option);
                }
            });
            
            if (recentGroup.children.length > 0) {
                versionSelect.appendChild(recentGroup);
            }
        }

        // Agregar todas las versiones agrupadas por idioma
        Object.entries(groupedVersions).forEach(([lang, versions]) => {
            const group = document.createElement('optgroup');
            group.label = this.getLanguageName(lang);
            
            // Primero las populares
            versions.filter(v => v.popular).forEach(version => {
                if (!this.isVersionInHistory(version.id)) {
                    group.appendChild(this.createVersionOption(version));
                }
            });
            
            // Luego las demás
            versions.filter(v => !v.popular).forEach(version => {
                if (!this.isVersionInHistory(version.id)) {
                    group.appendChild(this.createVersionOption(version));
                }
            });
            
            if (group.children.length > 0) {
                versionSelect.appendChild(group);
            }
        });

        // Establecer versión seleccionada
        const currentOption = versionSelect.querySelector(`option[value="${this.currentVersion}"]`);
        if (currentOption) {
            currentOption.selected = true;
        }
    }

    createVersionOption(version, isFavorite = false) {
        const option = document.createElement('option');
        option.value = version.id;
        option.textContent = isFavorite ? `⭐ ${version.name}` : version.name;
        option.title = version.description;
        option.dataset.lang = version.lang;
        option.dataset.scope = version.scope;
        return option;
    }

    groupVersionsByLanguage() {
        const grouped = {};
        this.availableVersions.forEach(version => {
            if (!grouped[version.lang]) {
                grouped[version.lang] = [];
            }
            grouped[version.lang].push(version);
        });
        return grouped;
    }

    getLanguageName(code) {
        const languages = {
            'es': '🇪🇸 Español',
            'en': '🇺🇸 English',
            'pt': '🇧🇷 Português',
            'fr': '🇫🇷 Français',
            'de': '🇩🇪 Deutsch',
            'he': '🇮🇱 עברית',
            'grc': '🏛️ Griego Clásico'
        };
        return languages[code] || code.toUpperCase();
    }

    isVersionInHistory(versionId) {
        return this.versionHistory.favoriteVersions.includes(versionId) ||
               this.versionHistory.recentVersions.some(r => r.id === versionId);
    }

    async addVersionToHistory(versionId) {
        const version = this.availableVersions.find(v => v.id === versionId);
        if (!version) return;

        try {
            await fetch('/api/version-history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    versionId: version.id,
                    versionName: version.name,
                    lang: version.lang
                })
            });
            
            // Actualizar historial local
            const existingIndex = this.versionHistory.recentVersions.findIndex(r => r.id === versionId);
            if (existingIndex >= 0) {
                this.versionHistory.recentVersions[existingIndex].usageCount++;
                this.versionHistory.recentVersions[existingIndex].lastUsed = new Date().toISOString();
            } else {
                this.versionHistory.recentVersions.unshift({
                    id: version.id,
                    name: version.name,
                    lang: version.lang,
                    usageCount: 1,
                    lastUsed: new Date().toISOString(),
                    favorite: false
                });
            }
            
            // Mantener solo las 10 más recientes
            this.versionHistory.recentVersions = this.versionHistory.recentVersions.slice(0, 10);
            
        } catch (error) {
            console.error('Error agregando versión al historial:', error);
        }
    }

    async loadReadingPlans() {
        try {
            const response = await fetch('/api/reading-plans');
            const data = await response.json();
            
            if (data.success) {
                const plansList = document.getElementById('plans-list');
                if (plansList) {
                    plansList.innerHTML = '';
                    data.plans.forEach(plan => {
                        const planCard = document.createElement('div');
                        planCard.className = 'card';
                        planCard.innerHTML = `
                            <h3>${plan.name}</h3>
                            <p>${plan.description}</p>
                            <small>${plan.duration} días</small>
                            <button class="action-card" style="margin-top: 1rem;" onclick="app.startPlan(${plan.id})">
                                Comenzar Plan
                            </button>
                        `;
                        plansList.appendChild(planCard);
                    });
                }
            }
        } catch (error) {
            console.error('Error cargando planes:', error);
        }
    }

    navigateToSection(section) {
        // Actualizar navegación activa
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`)?.classList.add('active');

        // Mostrar sección correspondiente
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`${section}-section`)?.classList.add('active');

        this.currentSection = section;
    }

    onBookSelected(bookName) {
        if (!bookName) return;

        const bookSelect = document.getElementById('book-select');
        const chapterSelect = document.getElementById('chapter-select');
        const selectedOption = bookSelect.querySelector(`option[value="${bookName}"]`);
        const chaptersCount = parseInt(selectedOption?.dataset.chapters || 1);

        // Poblar selector de capítulos
        chapterSelect.innerHTML = '<option value="">Capítulo...</option>';
        for (let i = 1; i <= chaptersCount; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Capítulo ${i}`;
            chapterSelect.appendChild(option);
        }
        
        chapterSelect.disabled = false;
        this.currentBook = bookName;
    }

    onChapterSelected(chapter) {
        if (!chapter || !this.currentBook) return;
        
        this.currentChapter = chapter;
        this.loadChapter(this.currentBook, chapter);
    }

    async loadChapter(book, chapter) {
        const bibleContent = document.getElementById('bible-content');
        if (!bibleContent) return;

        try {
            this.setLoading(true);
            bibleContent.innerHTML = '<div class="loading">Cargando capítulo...</div>';

            // Intentar primero con la API mejorada
            let response = await fetch(`/api/chapter-improved?book=${encodeURIComponent(book)}&chapter=${chapter}&version=${this.currentVersion}`);
            let data = await response.json();

            // Si la API no devuelve success, continuar con el manejo de errores

            if (data.success && data.verses) {
                const versionInfo = this.availableVersions?.find(v => v.id === this.currentVersion);
                
                let contentHTML = `
                    <div class="chapter-header">
                        <h2>${data.book} ${data.chapter}</h2>
                        <div class="version-info">
                            <span class="version-name">${versionInfo?.name || this.currentVersion}</span>
                            ${data.apiSource ? `<span class="api-source" title="Fuente: ${data.apiSource}">📡</span>` : ''}
                        </div>
                    </div>
                    <div class="verses">
                `;
                
                data.verses.forEach(verse => {
                    contentHTML += `
                        <div class="verse" data-verse="${verse.verse}">
                            <span class="verse-number">${verse.verse}</span>
                            <span class="verse-text">${verse.text}</span>
                        </div>
                    `;
                });
                
                contentHTML += '</div>';
                
                // Agregar información adicional si está disponible
                if (data.totalVerses) {
                    contentHTML += `<div class="chapter-stats">Total de versículos: ${data.totalVerses}</div>`;
                }
                
                bibleContent.innerHTML = contentHTML;

                // Guardar en storage local para offline
                if (window.storageManager) {
                    await window.storageManager.saveChapter(book, chapter, this.currentVersion, data.verses);
                }

                // Añadir listeners para interacciones con versículos
                this.setupVerseInteractions();
                
                // Actualizar estadísticas de lectura
                this.updateReadingStats(book, chapter);
                
            } else {
                // Intentar cargar desde storage offline
                const offlineData = await this.loadChapterOffline(book, chapter);
                if (offlineData) {
                    bibleContent.innerHTML = offlineData;
                    this.setupVerseInteractions();
                } else {
                    bibleContent.innerHTML = '<div class="error">Error cargando el capítulo. Verifica tu conexión.</div>';
                }
            }
        } catch (error) {
            console.error('Error cargando capítulo:', error);
            
            // Intentar cargar desde storage offline
            const offlineData = await this.loadChapterOffline(book, chapter);
            if (offlineData) {
                bibleContent.innerHTML = offlineData;
                this.setupVerseInteractions();
            } else {
                bibleContent.innerHTML = '<div class="error">Error de conexión. Verifique su internet.</div>';
            }
        } finally {
            this.setLoading(false);
        }
    }

    async loadChapterOffline(book, chapter) {
        try {
            if (window.storageManager) {
                const chapterData = await window.storageManager.getChapter(book, chapter, this.currentVersion);
                if (chapterData && chapterData.verses) {
                    let contentHTML = `
                        <div class="chapter-header">
                            <h2>${chapterData.book} ${chapterData.chapter}</h2>
                            <div class="version-info">
                                <span class="version-name">${this.currentVersion}</span>
                                <span class="offline-indicator" title="Contenido offline">📴</span>
                            </div>
                        </div>
                        <div class="verses">
                    `;
                    
                    chapterData.verses.forEach(verse => {
                        contentHTML += `
                            <div class="verse" data-verse="${verse.verse}">
                                <span class="verse-number">${verse.verse}</span>
                                <span class="verse-text">${verse.text}</span>
                            </div>
                        `;
                    });
                    
                    contentHTML += '</div>';
                    return contentHTML;
                }
            }
            return null;
        } catch (error) {
            console.error('Error cargando capítulo offline:', error);
            return null;
        }
    }

    showVersionInfo(versionId) {
        const version = this.availableVersions?.find(v => v.id === versionId);
        if (version && version.description) {
            this.showNotification(`${version.name}: ${version.description}`, 'info', 3000);
        }
    }

    updateReadingStats(book, chapter) {
        // Actualizar estadísticas de lectura
        const stats = {
            lastRead: {
                book,
                chapter,
                version: this.currentVersion,
                timestamp: Date.now()
            }
        };
        
        localStorage.setItem('bible-reading-stats', JSON.stringify(stats));
    }


    setupVerseInteractions() {
        const verses = document.querySelectorAll('.verse');
        verses.forEach(verse => {
            verse.addEventListener('click', (e) => {
                this.selectVerse(verse);
            });
            
            verse.addEventListener('dblclick', (e) => {
                this.showVerseActions(verse);
            });
        });
    }

    selectVerse(verseElement) {
        // Remover selección anterior
        document.querySelectorAll('.verse.selected').forEach(v => {
            v.classList.remove('selected');
        });
        
        // Seleccionar nuevo versículo
        verseElement.classList.add('selected');
    }

    showVerseActions(verseElement) {
        const verseNumber = verseElement.dataset.verse;
        const verseText = verseElement.querySelector('.verse-text').textContent;
        
        this.showModal('Acciones del Versículo', `
            <h3>${this.currentBook} ${this.currentChapter}:${verseNumber}</h3>
            <p class="verse-preview">${verseText}</p>
            <div class="verse-actions">
                <button onclick="app.addBookmark('${this.currentBook}_${this.currentChapter}_${verseNumber}')">
                    🔖 Guardar en Favoritos
                </button>
                <button onclick="app.addNote('${this.currentBook}_${this.currentChapter}_${verseNumber}')">
                    📝 Agregar Nota
                </button>
                <button onclick="app.highlightVerse('${this.currentBook}_${this.currentChapter}_${verseNumber}')">
                    🖍️ Resaltar
                </button>
                <button onclick="app.shareVerse('${this.currentBook}_${this.currentChapter}_${verseNumber}', '${verseText}')">
                    📤 Compartir
                </button>
            </div>
        `);
    }

    handleQuickAction(action) {
        switch(action) {
            case 'continue-reading':
                this.navigateToSection('read');
                break;
            case 'start-plan':
                this.navigateToSection('plans');
                break;
            case 'play-audio':
                this.navigateToSection('audio');
                break;
            case 'search':
                this.showSearchModal();
                break;
        }
    }

    handleFABAction(action) {
        switch(action) {
            case 'add-note':
                this.showNoteModal();
                break;
            case 'add-bookmark':
                this.showBookmarkModal();
                break;
            case 'highlight':
                this.showHighlightModal();
                break;
        }
    }

    showSearchModal() {
        const searchContent = `
            <div class="search-container">
                <div class="search-input-group">
                    <input type="text" id="search-input" placeholder="Buscar versículos, palabras o frases..." 
                           class="search-input" autocomplete="off">
                    <button id="search-btn" class="search-button">
                        <span class="icon-search"></span>
                    </button>
                </div>
                <div class="search-filters">
                    <select id="search-version" class="search-select">
                        <option value="">Todas las versiones</option>
                    </select>
                    <select id="search-book" class="search-select">
                        <option value="">Todos los libros</option>
                    </select>
                </div>
                <div id="search-results" class="search-results">
                    <div class="search-placeholder">
                        <span class="icon-search"></span>
                        <p>Ingresa un término de búsqueda para encontrar versículos</p>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal('Búsqueda en la Biblia', searchContent);
        
        // Setup search functionality after modal is shown
        setTimeout(() => {
            this.setupSearchModal();
        }, 100);
    }

    setupSearchModal() {
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        const searchVersion = document.getElementById('search-version');
        const searchBook = document.getElementById('search-book');
        
        if (!searchInput) return;
        
        // Populate version selector
        if (this.availableVersions && searchVersion) {
            this.availableVersions.forEach(version => {
                const option = document.createElement('option');
                option.value = version.id;
                option.textContent = `${version.name} (${version.lang})`;
                searchVersion.appendChild(option);
            });
        }
        
        // Populate book selector
        if (searchBook) {
            const bibleBooks = [
                'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
                'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
                '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job',
                'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah',
                'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
                'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah',
                'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John',
                'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians',
                'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians',
                '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
                'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
                'Jude', 'Revelation'
            ];
            
            bibleBooks.forEach(book => {
                const option = document.createElement('option');
                option.value = book;
                option.textContent = book;
                searchBook.appendChild(option);
            });
        }
        
        // Search event listeners
        const performSearch = () => this.performSearch();
        
        searchBtn?.addEventListener('click', performSearch);
        searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Focus on search input
        searchInput?.focus();
    }

    async performSearch() {
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');
        const searchVersion = document.getElementById('search-version');
        const searchBook = document.getElementById('search-book');
        
        if (!searchInput || !searchResults) return;
        
        const query = searchInput.value.trim();
        if (!query || query.length < 2) {
            searchResults.innerHTML = `
                <div class="search-placeholder">
                    <span class="icon-search"></span>
                    <p>Ingresa al menos 2 caracteres para buscar</p>
                </div>
            `;
            return;
        }
        
        // Show loading
        searchResults.innerHTML = `
            <div class="search-loading">
                <div class="loading-spinner"></div>
                <p>Buscando versículos...</p>
            </div>
        `;
        
        try {
            const selectedVersion = searchVersion?.value || 'es-rvr1960';
            const selectedBook = searchBook?.value || '';
            
            // Call search API
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    version: selectedVersion,
                    book: selectedBook
                })
            });
            
            const data = await response.json();
            
            if (data.success && data.results && data.results.length > 0) {
                this.displaySearchResults(data.results);
            } else {
                searchResults.innerHTML = `
                    <div class="search-empty">
                        <span class="icon-search"></span>
                        <p>No se encontraron versículos para "${query}"</p>
                        <small>Intenta con otros términos de búsqueda</small>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error en búsqueda:', error);
            searchResults.innerHTML = `
                <div class="search-error">
                    <p>Error al realizar la búsqueda</p>
                    <small>Inténtalo de nuevo en unos momentos</small>
                </div>
            `;
        }
    }

    displaySearchResults(results) {
        const searchResults = document.getElementById('search-results');
        if (!searchResults) return;
        
        const resultsHtml = results.map(result => `
            <div class="search-result-item" onclick="app.goToVerse('${result.book}', ${result.chapter}, ${result.verse})">
                <div class="search-result-reference">
                    ${result.book} ${result.chapter}:${result.verse}
                </div>
                <div class="search-result-text">
                    ${result.text}
                </div>
                <div class="search-result-version">
                    ${result.version || 'RVR1960'}
                </div>
            </div>
        `).join('');
        
        searchResults.innerHTML = `
            <div class="search-results-header">
                <h4>Resultados encontrados (${results.length})</h4>
            </div>
            <div class="search-results-list">
                ${resultsHtml}
            </div>
        `;
    }

    goToVerse(book, chapter, verse) {
        // Close search modal
        this.closeModal();
        
        // Navigate to read section
        this.navigateToSection('read');
        
        // Load the specific verse
        this.currentBook = book;
        this.currentChapter = chapter;
        
        // Load chapter and scroll to verse
        setTimeout(() => {
            this.loadChapter(book, chapter).then(() => {
                const verseElement = document.querySelector(`[data-verse="${verse}"]`);
                if (verseElement) {
                    verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    verseElement.style.backgroundColor = 'var(--primary-color)';
                    verseElement.style.color = 'white';
                    
                    // Remove highlight after 3 seconds
                    setTimeout(() => {
                        verseElement.style.backgroundColor = '';
                        verseElement.style.color = '';
                    }, 3000);
                }
            });
        }, 300);
    }

    showModal(title, content) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        
        if (modal && modalBody) {
            modalBody.innerHTML = `
                <h2>${title}</h2>
                ${content}
            `;
            modal.classList.add('show');
        }
    }

    closeModal() {
        const modal = document.getElementById('modal');
        modal?.classList.remove('show');
    }

    async addBookmark(verseRef) {
        try {
            const reference = `${this.currentBook} ${this.currentChapter}:${verseRef.split('_').pop()}`;
            
            // Guardar en IndexedDB usando StorageManager
            if (window.storageManager) {
                await window.storageManager.saveBookmark(verseRef, reference);
            }
            
            // También llamar a la API para sincronización futura
            const response = await fetch('/api/bookmarks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verse: verseRef, reference })
            });
            
            const data = await response.json();
            if (data.success) {
                this.showNotification('Versículo guardado en favoritos', 'success');
                this.closeModal();
                this.updateUserStats();
            }
        } catch (error) {
            console.error('Error guardando favorito:', error);
            this.showNotification('Error guardando favorito', 'error');
        }
    }

    async addNote(verseRef) {
        const noteText = prompt('Escribe tu nota:');
        if (!noteText) return;

        try {
            // Guardar en IndexedDB usando StorageManager
            if (window.storageManager) {
                await window.storageManager.saveNote(verseRef, noteText, true);
            }
            
            // También llamar a la API para sincronización futura
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verse: verseRef, note: noteText, isPrivate: true })
            });
            
            const data = await response.json();
            if (data.success) {
                this.showNotification('Nota guardada', 'success');
                this.closeModal();
                this.updateUserStats();
            }
        } catch (error) {
            console.error('Error guardando nota:', error);
            this.showNotification('Error guardando nota', 'error');
        }
    }

    async highlightVerse(verseRef) {
        const color = prompt('Color del resaltado (yellow, blue, green, red):') || 'yellow';
        
        try {
            // Guardar en IndexedDB usando StorageManager
            if (window.storageManager) {
                await window.storageManager.saveHighlight(verseRef, color);
            }
            
            // También usar el BibleReader para aplicar el highlight visualmente
            if (window.bibleReader) {
                window.bibleReader.highlightVerse(verseRef, color);
            }
            
            // También llamar a la API para sincronización futura
            const response = await fetch('/api/highlights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verse: verseRef, color })
            });
            
            const data = await response.json();
            if (data.success) {
                this.showNotification('Versículo resaltado', 'success');
                this.closeModal();
                this.updateUserStats();
            }
        } catch (error) {
            console.error('Error aplicando highlight:', error);
            this.showNotification('Error aplicando highlight', 'error');
        }
    }

    shareVerse(verseRef, text) {
        const shareText = `"${text}" - ${this.currentBook} ${this.currentChapter}:${verseRef.split('_').pop()}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Bible Alive - Versículo',
                text: shareText
            });
        } else {
            // Fallback - copiar al portapapeles
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('Versículo copiado al portapapeles', 'success');
            });
        }
        this.closeModal();
    }

    async startPlan(planId) {
        try {
            // Guardar progreso del plan en IndexedDB
            if (window.storageManager) {
                const planData = {
                    planId,
                    startDate: new Date().toISOString(),
                    currentDay: 1,
                    completed: false
                };
                await window.storageManager.saveUserProgress(`plan_${planId}`, planData);
            }
            
            this.showNotification(`Plan ${planId} iniciado`, 'success');
            this.updateUserStats();
        } catch (error) {
            console.error('Error iniciando plan:', error);
            this.showNotification('Error iniciando plan', 'error');
        }
    }

    setLoading(isLoading) {
        this.isLoading = isLoading;
        const loadingElements = document.querySelectorAll('.loading');
        loadingElements.forEach(el => {
            el.style.display = isLoading ? 'block' : 'none';
        });
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        
        setTimeout(() => {
            if (loadingScreen) loadingScreen.style.display = 'none';
            if (app) app.style.display = 'block';
        }, 1000);
    }

    showNotification(message, type = 'info') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem;
            border-radius: 4px;
            color: white;
            background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Actualizar estadísticas del usuario
    async updateUserStats() {
        try {
            if (!window.storageManager) return;
            
            // Contar estadísticas actuales
            const bookmarks = await window.storageManager.getBookmarks();
            const notesStats = await window.storageManager.getAllFromStore('notes');
            
            // Obtener progreso actual o crear nuevo
            let progress = await window.storageManager.getUserProgress('reading_stats');
            if (!progress) {
                progress = {
                    daysReading: 0,
                    chaptersRead: 0,
                    notesCreated: 0,
                    bookmarksCreated: 0,
                    plansStarted: 0,
                    lastActivity: new Date().toISOString()
                };
            }
            
            // Actualizar estadísticas
            progress.data = progress.data || {};
            progress.data.notesCreated = notesStats.length;
            progress.data.bookmarksCreated = bookmarks.length;
            progress.data.lastActivity = new Date().toISOString();
            
            // Incrementar días leyendo si es una nueva actividad en un día diferente
            const lastActivity = new Date(progress.data.lastActivity);
            const today = new Date();
            if (lastActivity.toDateString() !== today.toDateString()) {
                progress.data.daysReading = (progress.data.daysReading || 0) + 1;
            }
            
            // Guardar progreso actualizado
            await window.storageManager.saveUserProgress('reading_stats', progress.data);
            
            // Actualizar UI si está en la sección de perfil
            this.updateProfileStats(progress.data);
            
        } catch (error) {
            console.error('Error actualizando estadísticas:', error);
        }
    }

    updateProfileStats(stats) {
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers.length >= 3) {
            statNumbers[0].textContent = stats.daysReading || 0;
            statNumbers[1].textContent = stats.chaptersRead || 0;
            statNumbers[2].textContent = stats.notesCreated || 0;
        }
    }

    async loadChapter(book, chapter) {
        const bibleContent = document.getElementById('bible-content');
        if (!bibleContent) return;

        try {
            this.setLoading(true);
            bibleContent.innerHTML = '<div class="loading">Cargando capítulo...</div>';

            // Usar la API mejorada con múltiples fuentes
            const response = await fetch(`/api/chapter-improved?book=${encodeURIComponent(book)}&chapter=${chapter}&version=${this.currentVersion}`);
            const data = await response.json();

            if (data.success && data.verses) {
                // Guardar capítulo en IndexedDB para uso offline
                if (window.storageManager) {
                    await window.storageManager.saveChapter(book, chapter, this.currentVersion, data.verses);
                }
                
                let contentHTML = `
                    <div class="chapter-header">
                        <h2>${data.book} ${data.chapter}</h2>
                        <div class="version-info">
                            <span class="version-name">${this.currentVersion}</span>
                            ${data.apiSource ? `<span class="api-source" title="Fuente: ${data.apiSource}">📡</span>` : ''}
                        </div>
                    </div>
                    <div class="verses">
                `;
                
                data.verses.forEach(verse => {
                    contentHTML += `
                        <div class="verse" data-verse="${verse.verse}">
                            <span class="verse-number">${verse.verse}</span>
                            <span class="verse-text">${verse.text}</span>
                        </div>
                    `;
                });
                
                contentHTML += '</div>';
                bibleContent.innerHTML = contentHTML;

                // Añadir listeners para interacciones con versículos
                this.setupVerseInteractions();
                
                // Cargar highlights y notas guardadas
                if (window.bibleReader) {
                    window.bibleReader.loadSavedHighlights();
                }
                
                // Actualizar estadísticas de capítulos leídos
                await this.updateChapterRead();
            } else {
                // Intentar cargar desde storage offline
                const offlineData = await this.loadChapterOffline(book, chapter);
                if (offlineData) {
                    bibleContent.innerHTML = offlineData;
                    this.setupVerseInteractions();
                } else {
                    bibleContent.innerHTML = '<div class="error">Error cargando el capítulo. Verifica tu conexión.</div>';
                }
            }
        } catch (error) {
            console.error('Error cargando capítulo:', error);
            
            // Intentar cargar desde IndexedDB si falla la red
            if (window.storageManager) {
                try {
                    const offlineChapter = await window.storageManager.getChapter(book, chapter, this.currentVersion);
                    if (offlineChapter) {
                        let contentHTML = `<h2>${offlineChapter.book} ${offlineChapter.chapter} (Offline)</h2><div class="verses">`;
                        
                        offlineChapter.verses.forEach(verse => {
                            contentHTML += `
                                <div class="verse" data-verse="${verse.verse}">
                                    <span class="verse-number">${verse.verse}</span>
                                    <span class="verse-text">${verse.text}</span>
                                </div>
                            `;
                        });
                        
                        contentHTML += '</div>';
                        bibleContent.innerHTML = contentHTML;
                        this.setupVerseInteractions();
                        this.showNotification('Cargado desde almacenamiento offline', 'info');
                    } else {
                        bibleContent.innerHTML = '<div class="error">Error de conexión y no hay datos offline</div>';
                    }
                } catch (offlineError) {
                    bibleContent.innerHTML = '<div class="error">Error de conexión</div>';
                }
            } else {
                bibleContent.innerHTML = '<div class="error">Error de conexión</div>';
            }
        } finally {
            this.setLoading(false);
        }
    }

    async updateChapterRead() {
        try {
            if (!window.storageManager) return;
            
            let progress = await window.storageManager.getUserProgress('reading_stats');
            if (!progress) {
                progress = { data: { chaptersRead: 0 } };
            }
            
            progress.data = progress.data || {};
            progress.data.chaptersRead = (progress.data.chaptersRead || 0) + 1;
            
            await window.storageManager.saveUserProgress('reading_stats', progress.data);
            this.updateProfileStats(progress.data);
            
        } catch (error) {
            console.error('Error actualizando capítulos leídos:', error);
        }
    }

    async loadProfileStats() {
        try {
            // Esperar a que StorageManager esté disponible
            let attempts = 0;
            while (!window.storageManager && attempts < 10) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (window.storageManager) {
                const progress = await window.storageManager.getUserProgress('reading_stats');
                if (progress && progress.data) {
                    this.updateProfileStats(progress.data);
                }
            }
        } catch (error) {
            console.error('Error cargando estadísticas del perfil:', error);
        }
    }
}

// Inicializar la aplicación
const app = new BibleAliveApp();