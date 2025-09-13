// Bible Reader - Funcionalidad específica de lectura
class BibleReader {
    constructor() {
        this.fontSize = parseInt(localStorage.getItem('bible-font-size')) || 18;
        this.highlightedVerses = {};
        this.bookmarks = [];
        this.notes = {};
        
        this.init();
    }

    async init() {
        this.setupFontSizeControl();
        await this.loadDataFromIndexedDB();
        this.loadSavedHighlights();
    }

    async loadDataFromIndexedDB() {
        try {
            // Esperar a que StorageManager esté disponible y completamente inicializado
            let attempts = 0;
            while ((!window.storageManager || !window.storageManager.isInitialized || !window.storageManager.db) && attempts < 100) {
                await new Promise(resolve => setTimeout(resolve, 50));
                attempts++;
            }
            
            if (window.storageManager && window.storageManager.isInitialized && window.storageManager.db) {
                // Cargar highlights desde IndexedDB
                const highlights = await window.storageManager.getAllFromStore('highlights');
                this.highlightedVerses = {};
                highlights.forEach(highlight => {
                    this.highlightedVerses[highlight.verseRef] = highlight.color;
                });
                
                // Cargar bookmarks desde IndexedDB
                this.bookmarks = await window.storageManager.getBookmarks();
                
                // Cargar notas desde IndexedDB
                const notes = await window.storageManager.getAllFromStore('notes');
                this.notes = {};
                notes.forEach(note => {
                    if (!this.notes[note.verseRef]) {
                        this.notes[note.verseRef] = [];
                    }
                    this.notes[note.verseRef].push(note);
                });
            }
        } catch (error) {
            console.error('Error cargando datos desde IndexedDB:', error);
        }
    }

    setupFontSizeControl() {
        const fontSizeToggle = document.getElementById('font-size-toggle');
        if (fontSizeToggle) {
            fontSizeToggle.addEventListener('click', () => {
                this.cycleFontSize();
            });
        }
        
        this.applyFontSize();
    }

    cycleFontSize() {
        const sizes = [16, 18, 20, 22, 24];
        const currentIndex = sizes.indexOf(this.fontSize);
        const nextIndex = (currentIndex + 1) % sizes.length;
        
        this.fontSize = sizes[nextIndex];
        this.applyFontSize();
        this.saveFontSize();
        
        app.showNotification(`Tamaño de texto: ${this.fontSize}px`, 'info');
    }

    applyFontSize() {
        const bibleContent = document.getElementById('bible-content');
        if (bibleContent) {
            bibleContent.style.fontSize = `${this.fontSize}px`;
        }
    }

    saveFontSize() {
        localStorage.setItem('bible-font-size', this.fontSize.toString());
    }

    async highlightVerse(verseRef, color = 'yellow') {
        this.highlightedVerses[verseRef] = color;
        
        // Guardar en IndexedDB usando StorageManager
        if (window.storageManager) {
            await window.storageManager.saveHighlight(verseRef, color);
        }
        
        this.applyHighlightToDOM(verseRef, color);
    }

    async removeHighlight(verseRef) {
        delete this.highlightedVerses[verseRef];
        
        // Eliminar de IndexedDB usando StorageManager
        if (window.storageManager) {
            await window.storageManager.deleteHighlight(verseRef);
        }
        
        this.removeHighlightFromDOM(verseRef);
    }

    saveHighlights() {
        // Mantener compatibilidad con localStorage como backup
        localStorage.setItem('bible-highlights', JSON.stringify(this.highlightedVerses));
    }

    loadSavedHighlights() {
        // Se aplicarán cuando se cargue el capítulo
        setTimeout(() => {
            Object.entries(this.highlightedVerses).forEach(([verseRef, color]) => {
                this.applyHighlightToDOM(verseRef, color);
            });
        }, 500);
    }

    applyHighlightToDOM(verseRef, color) {
        const verseNumber = verseRef.split('_').pop();
        const verseElement = document.querySelector(`[data-verse="${verseNumber}"]`);
        if (verseElement) {
            verseElement.style.backgroundColor = this.getHighlightColor(color);
            verseElement.classList.add('highlighted');
        }
    }

    removeHighlightFromDOM(verseRef) {
        const verseNumber = verseRef.split('_').pop();
        const verseElement = document.querySelector(`[data-verse="${verseNumber}"]`);
        if (verseElement) {
            verseElement.style.backgroundColor = '';
            verseElement.classList.remove('highlighted');
        }
    }

    getHighlightColor(color) {
        const colors = {
            yellow: '#F5E6A3',
            blue: '#C7D6E8',
            green: '#D4DFBC',
            red: '#E8C4C4',
            purple: '#E0D1E8',
            orange: '#F0D4A8',
            beige: '#EDE5D8'
        };
        return colors[color] || colors.yellow;
    }

    async addBookmark(verseRef, reference) {
        const bookmark = {
            id: Date.now(),
            verseRef,
            reference,
            timestamp: new Date().toISOString()
        };
        
        this.bookmarks.push(bookmark);
        
        // Guardar en IndexedDB usando StorageManager
        if (window.storageManager) {
            await window.storageManager.saveBookmark(verseRef, reference);
        }
        
        this.saveBookmarks();
        return bookmark.id;
    }

    async removeBookmark(bookmarkId) {
        this.bookmarks = this.bookmarks.filter(b => b.id !== bookmarkId);
        
        // Eliminar de IndexedDB usando StorageManager
        if (window.storageManager) {
            await window.storageManager.deleteBookmark(bookmarkId);
        }
        
        this.saveBookmarks();
    }

    saveBookmarks() {
        // Mantener compatibilidad con localStorage como backup
        localStorage.setItem('bible-bookmarks', JSON.stringify(this.bookmarks));
    }

    async addNote(verseRef, noteText, isPrivate = true) {
        const note = {
            id: Date.now(),
            verseRef,
            text: noteText,
            isPrivate,
            timestamp: new Date().toISOString()
        };
        
        if (!this.notes[verseRef]) {
            this.notes[verseRef] = [];
        }
        
        this.notes[verseRef].push(note);
        
        // Guardar en IndexedDB usando StorageManager
        if (window.storageManager) {
            await window.storageManager.saveNote(verseRef, noteText, isPrivate);
        }
        
        this.saveNotes();
        return note.id;
    }

    async removeNote(verseRef, noteId) {
        if (this.notes[verseRef]) {
            this.notes[verseRef] = this.notes[verseRef].filter(n => n.id !== noteId);
            if (this.notes[verseRef].length === 0) {
                delete this.notes[verseRef];
            }
        }
        
        // Eliminar de IndexedDB usando StorageManager
        if (window.storageManager) {
            await window.storageManager.deleteNote(noteId);
        }
        
        this.saveNotes();
    }

    saveNotes() {
        // Mantener compatibilidad con localStorage como backup
        localStorage.setItem('bible-notes', JSON.stringify(this.notes));
    }

    getVerseNotes(verseRef) {
        return this.notes[verseRef] || [];
    }

    searchVerses(query, searchType = 'text') {
        // Esta funcionalidad se expandirá en fases posteriores
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([]);
            }, 100);
        });
    }

    async compareVersions(book, chapter, versions) {
        try {
            if (!versions || versions.length < 2) {
                throw new Error('Se necesitan al menos 2 versiones para comparar');
            }

            const comparisonData = {
                book: book,
                chapter: chapter,
                versions: [],
                verses: {}
            };

            // Cargar datos para cada versión
            for (const version of versions) {
                try {
                    const chapterData = await this.loadChapterData(book, chapter, version);
                    
                    if (chapterData.success && chapterData.verses) {
                        comparisonData.versions.push({
                            id: version,
                            name: this.getVersionName(version),
                            versesCount: Object.keys(chapterData.verses).length
                        });

                        // Organizar versículos por número
                        Object.entries(chapterData.verses).forEach(([verseNum, verseText]) => {
                            if (!comparisonData.verses[verseNum]) {
                                comparisonData.verses[verseNum] = {};
                            }
                            comparisonData.verses[verseNum][version] = verseText;
                        });
                    }
                } catch (versionError) {
                    console.error(`Error loading version ${version}:`, versionError);
                }
            }

            return comparisonData;
        } catch (error) {
            console.error('Error comparing versions:', error);
            throw error;
        }
    }

    async loadChapterData(book, chapter, version) {
        try {
            // Use GET with query parameters to match the API's expected method
            const params = new URLSearchParams({
                book: book,
                chapter: chapter,
                version: version
            });
            
            const response = await fetch(`/api/chapter-improved?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error loading chapter data:', error);
            return { success: false, error: error.message };
        }
    }

    getVersionName(versionId) {
        const versionNames = {
            'es-rvr1960': 'Reina-Valera 1960',
            'es-pddpt': 'La Palabra de Dios para Todos',
            'es-valera': 'Sagradas Escrituras (1569)',
            'en-kjv': 'King James Version',
            'en-asv': 'American Standard Version',
            'en-web': 'World English Bible',
            'en-ylt': 'Young\'s Literal Translation',
            'es-rvr1909': 'Reina-Valera 1909',
            'es-btx': 'Biblia Textual',
            'es-nvi': 'Nueva Versión Internacional'
        };
        
        return versionNames[versionId] || versionId;
    }

    displayVersionComparison(comparisonData) {
        const { book, chapter, versions, verses } = comparisonData;
        
        let comparisonHtml = `
            <div class="version-comparison">
                <div class="comparison-header">
                    <h3>${book} ${chapter} - Comparación de Versiones</h3>
                    <div class="comparison-versions">
                        ${versions.map(v => `
                            <span class="version-tag">${v.name}</span>
                        `).join('')}
                    </div>
                </div>
                <div class="comparison-content">
        `;

        // Generate verses comparison
        Object.entries(verses).forEach(([verseNum, versionTexts]) => {
            comparisonHtml += `
                <div class="verse-comparison" data-verse="${verseNum}">
                    <div class="verse-number">${verseNum}</div>
                    <div class="verse-versions">
            `;

            versions.forEach(version => {
                const text = versionTexts[version.id] || 'Versículo no disponible';
                comparisonHtml += `
                    <div class="verse-version">
                        <div class="version-name">${version.name}</div>
                        <div class="verse-text">${text}</div>
                    </div>
                `;
            });

            comparisonHtml += `
                    </div>
                </div>
            `;
        });

        comparisonHtml += `
                </div>
            </div>
        `;

        return comparisonHtml;
    }
}

// Inicializar el lector cuando esté disponible
document.addEventListener('DOMContentLoaded', () => {
    window.bibleReader = new BibleReader();
});