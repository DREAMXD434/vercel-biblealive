// Storage Manager - Gestión de datos offline
class StorageManager {
    constructor() {
        this.dbName = 'BibleAliveDB';
        this.dbVersion = 1;
        this.db = null;
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        try {
            await this.initIndexedDB();
            await this.setupLocalStorage();
            // Solo marcar como inicializado si la base de datos está realmente lista
            if (this.db) {
                this.isInitialized = true;
                console.log('Storage Manager inicializado');
            } else {
                throw new Error('Database connection failed');
            }
        } catch (error) {
            console.error('Error inicializando Storage Manager:', error);
            this.isInitialized = false;
        }
    }

    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => {
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Store para capítulos de la Biblia
                if (!db.objectStoreNames.contains('chapters')) {
                    const chaptersStore = db.createObjectStore('chapters', { keyPath: 'id' });
                    chaptersStore.createIndex('book', 'book', { unique: false });
                    chaptersStore.createIndex('version', 'version', { unique: false });
                }
                
                // Store para notas del usuario
                if (!db.objectStoreNames.contains('notes')) {
                    const notesStore = db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
                    notesStore.createIndex('verseRef', 'verseRef', { unique: false });
                    notesStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                // Store para highlights
                if (!db.objectStoreNames.contains('highlights')) {
                    const highlightsStore = db.createObjectStore('highlights', { keyPath: 'id', autoIncrement: true });
                    highlightsStore.createIndex('verseRef', 'verseRef', { unique: false });
                }
                
                // Store para bookmarks
                if (!db.objectStoreNames.contains('bookmarks')) {
                    const bookmarksStore = db.createObjectStore('bookmarks', { keyPath: 'id', autoIncrement: true });
                    bookmarksStore.createIndex('verseRef', 'verseRef', { unique: false });
                    bookmarksStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                // Store para planes de lectura
                if (!db.objectStoreNames.contains('readingPlans')) {
                    const plansStore = db.createObjectStore('readingPlans', { keyPath: 'id' });
                    plansStore.createIndex('userId', 'userId', { unique: false });
                }
                
                // Store para progreso de usuario
                if (!db.objectStoreNames.contains('userProgress')) {
                    const progressStore = db.createObjectStore('userProgress', { keyPath: 'id' });
                    progressStore.createIndex('type', 'type', { unique: false });
                }
            };
        });
    }

    setupLocalStorage() {
        // Configuración inicial de localStorage
        const defaultSettings = {
            theme: 'light',
            fontSize: 18,
            autoPlay: false,
            notifications: true,
            offlineMode: false
        };

        const existingSettings = localStorage.getItem('bible-alive-settings');
        if (!existingSettings) {
            localStorage.setItem('bible-alive-settings', JSON.stringify(defaultSettings));
        }
    }

    // Métodos para capítulos
    async saveChapter(book, chapter, version, verses) {
        const chapterData = {
            id: `${book}_${chapter}_${version}`,
            book,
            chapter: parseInt(chapter),
            version,
            verses,
            timestamp: Date.now(),
            downloadDate: new Date().toISOString()
        };

        return this.putToStore('chapters', chapterData);
    }

    async getChapter(book, chapter, version) {
        const id = `${book}_${chapter}_${version}`;
        return this.getFromStore('chapters', id);
    }

    async deleteChapter(book, chapter, version) {
        const id = `${book}_${chapter}_${version}`;
        return this.deleteFromStore('chapters', id);
    }

    async getDownloadedChapters() {
        return this.getAllFromStore('chapters');
    }

    // Métodos para notas
    async saveNote(verseRef, text, isPrivate = true) {
        const note = {
            verseRef,
            text,
            isPrivate,
            timestamp: Date.now(),
            createdAt: new Date().toISOString()
        };

        const id = await this.addToStore('notes', note);
        
        // También guardar en localStorage para acceso rápido
        const localNotes = JSON.parse(localStorage.getItem('bible-notes') || '{}');
        if (!localNotes[verseRef]) {
            localNotes[verseRef] = [];
        }
        localNotes[verseRef].push({ ...note, id });
        localStorage.setItem('bible-notes', JSON.stringify(localNotes));

        return id;
    }

    async getNotes(verseRef) {
        if (verseRef) {
            return this.getFromStoreByIndex('notes', 'verseRef', verseRef);
        }
        return this.getAllFromStore('notes');
    }

    async deleteNote(noteId) {
        await this.deleteFromStore('notes', noteId);
        
        // Actualizar localStorage
        const localNotes = JSON.parse(localStorage.getItem('bible-notes') || '{}');
        Object.keys(localNotes).forEach(verseRef => {
            localNotes[verseRef] = localNotes[verseRef].filter(note => note.id !== noteId);
            if (localNotes[verseRef].length === 0) {
                delete localNotes[verseRef];
            }
        });
        localStorage.setItem('bible-notes', JSON.stringify(localNotes));
    }

    // Métodos para highlights
    async saveHighlight(verseRef, color) {
        const highlight = {
            verseRef,
            color,
            timestamp: Date.now(),
            createdAt: new Date().toISOString()
        };

        const id = await this.addToStore('highlights', highlight);
        
        // También guardar en localStorage
        const localHighlights = JSON.parse(localStorage.getItem('bible-highlights') || '{}');
        localHighlights[verseRef] = color;
        localStorage.setItem('bible-highlights', JSON.stringify(localHighlights));

        return id;
    }

    async deleteHighlight(verseRef) {
        const highlights = await this.getFromStoreByIndex('highlights', 'verseRef', verseRef);
        if (highlights.length > 0) {
            await this.deleteFromStore('highlights', highlights[0].id);
        }
        
        // Actualizar localStorage
        const localHighlights = JSON.parse(localStorage.getItem('bible-highlights') || '{}');
        delete localHighlights[verseRef];
        localStorage.setItem('bible-highlights', JSON.stringify(localHighlights));
    }

    // Métodos para bookmarks
    async saveBookmark(verseRef, reference) {
        const bookmark = {
            verseRef,
            reference,
            timestamp: Date.now(),
            createdAt: new Date().toISOString()
        };

        const id = await this.addToStore('bookmarks', bookmark);
        
        // También guardar en localStorage
        const localBookmarks = JSON.parse(localStorage.getItem('bible-bookmarks') || '[]');
        localBookmarks.push({ ...bookmark, id });
        localStorage.setItem('bible-bookmarks', JSON.stringify(localBookmarks));

        return id;
    }

    async getBookmarks() {
        return this.getAllFromStore('bookmarks');
    }

    async deleteBookmark(bookmarkId) {
        await this.deleteFromStore('bookmarks', bookmarkId);
        
        // Actualizar localStorage
        const localBookmarks = JSON.parse(localStorage.getItem('bible-bookmarks') || '[]');
        const updatedBookmarks = localBookmarks.filter(b => b.id !== bookmarkId);
        localStorage.setItem('bible-bookmarks', JSON.stringify(updatedBookmarks));
    }

    // Métodos para progreso de usuario
    async saveUserProgress(type, data) {
        const progress = {
            id: type,
            type,
            data,
            timestamp: Date.now(),
            updatedAt: new Date().toISOString()
        };

        return this.putToStore('userProgress', progress);
    }

    async getUserProgress(type) {
        return this.getFromStore('userProgress', type);
    }

    // Métodos genéricos para IndexedDB
    async addToStore(storeName, data) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async putToStore(storeName, data) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getFromStore(storeName, key) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllFromStore(storeName) {
        return new Promise((resolve, reject) => {
            if (!this.db || !this.isInitialized) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            try {
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.getAll();
                
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => reject(request.error);
            } catch (error) {
                reject(error);
            }
        });
    }

    async getFromStoreByIndex(storeName, indexName, key) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(key);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteFromStore(storeName, key) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Utilidades
    async clearAllData() {
        const stores = ['chapters', 'notes', 'highlights', 'bookmarks', 'readingPlans', 'userProgress'];
        
        for (const storeName of stores) {
            await this.clearStore(storeName);
        }
        
        // También limpiar localStorage
        const keysToRemove = [
            'bible-notes',
            'bible-highlights', 
            'bible-bookmarks',
            'bible-alive-settings'
        ];
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }

    async clearStore(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getStorageUsage() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            return navigator.storage.estimate();
        }
        return { usage: 0, quota: 0 };
    }

    // Configuración
    getSettings() {
        return JSON.parse(localStorage.getItem('bible-alive-settings') || '{}');
    }

    saveSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        localStorage.setItem('bible-alive-settings', JSON.stringify(settings));
    }

    // Sincronización (para futuras versiones con backend)
    async syncData() {
        // Placeholder para sincronización con servidor
        console.log('Sync placeholder - implementar en fase 2');
    }
}

// Inicializar el storage manager
document.addEventListener('DOMContentLoaded', () => {
    window.storageManager = new StorageManager();
});