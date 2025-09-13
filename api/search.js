// API endpoint para búsqueda de versículos
// Soporte para búsqueda en múltiples versiones y libros

module.exports = async (req, res) => {
    // Solo permitir POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed' 
        });
    }

    try {
        const { query, version = 'es-rvr1960', book = '' } = req.body;

        if (!query || query.trim().length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Query must be at least 2 characters'
            });
        }

        console.log(`Bible Search API: Searching for "${query}" in version "${version}" ${book ? `book "${book}"` : '(all books)'}`);

        const searchResults = await performSearch(query.trim(), version, book);

        return res.status(200).json({
            success: true,
            results: searchResults,
            query: query,
            version: version,
            book: book,
            count: searchResults.length
        });

    } catch (error) {
        console.error('Search API Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error during search'
        });
    }
};

async function performSearch(query, version, book = '') {
    try {
        // Determine API source based on version
        const versionConfig = getVersionConfig(version);
        
        if (versionConfig.apiSource === 'bible-api') {
            return await searchBibleAPI(query, versionConfig, book);
        } else if (versionConfig.apiSource === 'bolls') {
            return await searchBollsAPI(query, versionConfig, book);
        } else if (versionConfig.apiSource === 'github') {
            return await searchGitHubAPI(query, versionConfig, book);
        }
        
        return [];
    } catch (error) {
        console.error('Search performance error:', error);
        return [];
    }
}

function getVersionConfig(versionId) {
    // Version configurations - Fixed to route versions to correct APIs
    const versionConfigs = {
        // Use Bible API only for KJV (bible-api.com doesn't support other versions)
        'en-kjv': { apiId: 'kjv', apiSource: 'bible-api', name: 'King James Version' },
        
        // Use GitHub API for other English versions (supports multiple versions)
        'en-asv': { apiId: 'en-asv', apiSource: 'github', name: 'American Standard Version' },
        'en-web': { apiId: 'en-web', apiSource: 'github', name: 'World English Bible' },
        'en-ylt': { apiId: 'en-ylt', apiSource: 'github', name: 'Young\'s Literal Translation' },
        
        // Use Bolls API for Spanish versions (better coverage)
        'es-rvr1960': { apiId: 'RVR1960', apiSource: 'bolls', name: 'Reina-Valera 1960' },
        'es-rvr1909': { apiId: 'RVR1909', apiSource: 'bolls', name: 'Reina-Valera 1909' },
        'es-btx': { apiId: 'BTX', apiSource: 'bolls', name: 'Biblia Textual' },
        'es-nvi': { apiId: 'NVI', apiSource: 'bolls', name: 'Nueva Versión Internacional' },
        'es-pddpt': { apiId: 'RVR1960', apiSource: 'bolls', name: 'La Palabra de Dios para Todos' }, // Fallback to RVR1960
        'es-valera': { apiId: 'RVR1909', apiSource: 'bolls', name: 'Sagradas Escrituras (1569)' } // Fallback to RVR1909
    };
    
    return versionConfigs[versionId] || versionConfigs['en-kjv'];
}

async function searchBibleAPI(query, versionConfig, book) {
    try {
        const searchTerm = query.toLowerCase();
        const results = [];
        
        // Get books to search with proper normalization
        const booksToSearch = book ? [normalizeBookName(book)] : getAllBibleBooks();
        
        console.log(`Bible API Search: Searching ${booksToSearch.length} books for "${query}" in version ${versionConfig.apiId}`);
        
        for (const bookName of booksToSearch) {
            try {
                // Search through multiple chapters of each book (limit chapters for performance)
                const maxChapters = getMaxChaptersForBook(bookName);
                const chaptersToSearch = Math.min(maxChapters, 5); // Limit to 5 chapters per book for Bible API
                
                for (let chapterNum = 1; chapterNum <= chaptersToSearch; chapterNum++) {
                    try {
                        // Use Bible API format: https://bible-api.com/book+chapter
                        const chapterUrl = `https://bible-api.com/${bookName}+${chapterNum}`;
                        const response = await fetch(chapterUrl);
                        
                        if (response.ok) {
                            const chapterData = await response.json();
                            
                            if (chapterData && chapterData.verses) {
                                // Search through verses in this chapter
                                for (const verseData of chapterData.verses) {
                                    if (verseData.text && 
                                        verseData.text.toLowerCase().includes(searchTerm)) {
                                        
                                        results.push({
                                            book: bookName,
                                            chapter: chapterNum,
                                            verse: verseData.verse,
                                            text: verseData.text,
                                            version: versionConfig.name
                                        });
                                        
                                        // Limit total results for performance
                                        if (results.length >= 30) {
                                            console.log(`Bible API Search: Found ${results.length} results, stopping search`);
                                            return results;
                                        }
                                    }
                                }
                            }
                        } else {
                            console.log(`Bible API: Chapter ${bookName} ${chapterNum} returned ${response.status}`);
                        }
                    } catch (chapterError) {
                        console.log(`Bible API: Failed to fetch ${bookName} chapter ${chapterNum}: ${chapterError.message}`);
                        continue;
                    }
                }
            } catch (bookError) {
                console.log(`Bible API: Failed to search book ${bookName}: ${bookError.message}`);
                continue;
            }
        }
        
        console.log(`Bible API Search: Completed search, found ${results.length} results`);
        return results;
    } catch (error) {
        console.error('Bible API search error:', error);
        return [];
    }
}

async function searchGitHubAPI(query, versionConfig, book) {
    try {
        const searchTerm = query.toLowerCase();
        const results = [];
        
        // Get books to search with proper normalization
        const booksToSearch = book ? [normalizeBookName(book)] : getAllBibleBooks();
        
        console.log(`GitHub API Search: Searching ${booksToSearch.length} books for "${query}" in version ${versionConfig.apiId}`);
        
        for (const bookName of booksToSearch) { // Removed artificial 5-book limit
            try {
                // Search through multiple chapters of each book (limit chapters for performance)
                const maxChapters = getMaxChaptersForBook(bookName);
                const chaptersToSearch = Math.min(maxChapters, 10); // Limit to 10 chapters per book
                
                for (let chapterNum = 1; chapterNum <= chaptersToSearch; chapterNum++) {
                    try {
                        // Use correct GitHub CDN URL format from chapter-improved.js
                        const chapterUrl = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/${versionConfig.apiId}/books/${bookName}/chapters/${chapterNum}.json`;
                        const response = await fetch(chapterUrl);
                        
                        if (response.ok) {
                            const chapterData = await response.json();
                            
                            if (chapterData && chapterData.verses) {
                                // Search through verses in this chapter
                                for (const verseData of chapterData.verses) {
                                    if (verseData.text && 
                                        verseData.text.toLowerCase().includes(searchTerm)) {
                                        
                                        results.push({
                                            book: bookName,
                                            chapter: chapterNum,
                                            verse: verseData.verse,
                                            text: verseData.text,
                                            version: versionConfig.name
                                        });
                                        
                                        // Limit total results for performance
                                        if (results.length >= 50) {
                                            console.log(`GitHub API Search: Found ${results.length} results, stopping search`);
                                            return results;
                                        }
                                    }
                                }
                            }
                        } else {
                            console.log(`GitHub API: Chapter ${bookName} ${chapterNum} returned ${response.status}`);
                        }
                    } catch (chapterError) {
                        console.log(`GitHub API: Failed to fetch ${bookName} chapter ${chapterNum}: ${chapterError.message}`);
                        continue;
                    }
                }
            } catch (bookError) {
                console.log(`GitHub API: Failed to search book ${bookName}: ${bookError.message}`);
                continue;
            }
        }
        
        console.log(`GitHub API Search: Completed search, found ${results.length} results`);
        return results;
    } catch (error) {
        console.error('GitHub API search error:', error);
        return [];
    }
}

async function searchBollsAPI(query, versionConfig, book) {
    try {
        const searchTerm = encodeURIComponent(query);
        const results = [];
        
        // Bolls API doesn't have a direct search endpoint, so we'll search through chapters
        const booksToSearch = book ? [book] : ['Matthew', 'John', 'Romans', 'Psalms']; // Limited set for Bolls
        
        for (const bookName of booksToSearch) {
            try {
                const bookId = getBollsBookId(bookName);
                if (!bookId) continue;
                
                // Search first few chapters of each book
                for (let chapter = 1; chapter <= 3; chapter++) {
                    const chapterUrl = `https://bolls.life/get-chapter/${versionConfig.apiId}/${bookId}/${chapter}/`;
                    const response = await fetch(chapterUrl);
                    
                    if (response.ok) {
                        const chapterData = await response.json();
                        
                        if (chapterData && Array.isArray(chapterData)) {
                            chapterData.forEach(verseData => {
                                if (verseData.text && 
                                    verseData.text.toLowerCase().includes(query.toLowerCase())) {
                                    
                                    results.push({
                                        book: bookName,
                                        chapter: chapter,
                                        verse: verseData.pk,
                                        text: verseData.text,
                                        version: versionConfig.name
                                    });
                                    
                                    // Limit results
                                    if (results.length >= 15) {
                                        return results;
                                    }
                                }
                            });
                        }
                    }
                }
            } catch (bookError) {
                console.log(`Skipping Bolls book ${bookName}:`, bookError.message);
                continue;
            }
        }
        
        return results;
    } catch (error) {
        console.error('Bolls API search error:', error);
        return [];
    }
}

function getAllBibleBooks() {
    return [
        'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
        'Joshua', 'Judges', 'Ruth', '1Samuel', '2Samuel', '1Kings', '2Kings',
        '1Chronicles', '2Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job',
        'Psalms', 'Proverbs', 'Ecclesiastes', 'SongofSolomon', 'Isaiah',
        'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
        'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah',
        'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John',
        'Acts', 'Romans', '1Corinthians', '2Corinthians', 'Galatians',
        'Ephesians', 'Philippians', 'Colossians', '1Thessalonians',
        '2Thessalonians', '1Timothy', '2Timothy', 'Titus', 'Philemon',
        'Hebrews', 'James', '1Peter', '2Peter', '1John', '2John', '3John',
        'Jude', 'Revelation'
    ];
}

// Copy the exact book normalization logic from chapter-improved.js
function normalizeBookName(book) {
    const bookMappings = {
        'genesis': 'genesis',
        'génesis': 'genesis',
        'exodus': 'exodus',
        'éxodo': 'exodus',
        'leviticus': 'leviticus',
        'levítico': 'leviticus',
        'numbers': 'numbers',
        'números': 'numbers',
        'deuteronomy': 'deuteronomy',
        'deuteronomio': 'deuteronomy',
        'joshua': 'joshua',
        'josué': 'joshua',
        'judges': 'judges',
        'jueces': 'judges',
        'ruth': 'ruth',
        'rut': 'ruth',
        '1 samuel': '1samuel',
        '2 samuel': '2samuel',
        '1 kings': '1kings',
        '1 reyes': '1kings',
        '2 kings': '2kings',
        '2 reyes': '2kings',
        'psalms': 'psalms',
        'salmos': 'psalms',
        'proverbs': 'proverbs',
        'proverbios': 'proverbs',
        'ecclesiastes': 'ecclesiastes',
        'eclesiastés': 'ecclesiastes',
        'isaiah': 'isaiah',
        'isaías': 'isaiah',
        'jeremiah': 'jeremiah',
        'jeremías': 'jeremiah',
        'ezekiel': 'ezekiel',
        'ezequiel': 'ezekiel',
        'daniel': 'daniel',
        'matthew': 'matthew',
        'mateo': 'matthew',
        'mark': 'mark',
        'marcos': 'mark',
        'luke': 'luke',
        'lucas': 'luke',
        'john': 'john',
        'juan': 'john',
        'acts': 'acts',
        'hechos': 'acts',
        'romans': 'romans',
        'romanos': 'romans',
        '1 corinthians': '1corinthians',
        '1 corintios': '1corinthians',
        '2 corinthians': '2corinthians',
        '2 corintios': '2corinthians',
        'galatians': 'galatians',
        'gálatas': 'galatians',
        'ephesians': 'ephesians',
        'efesios': 'ephesians',
        'philippians': 'philippians',
        'filipenses': 'philippians',
        'colossians': 'colossians',
        'colosenses': 'colossians',
        '1 thessalonians': '1thessalonians',
        '1 tesalonicenses': '1thessalonians',
        '2 thessalonians': '2thessalonians',
        '2 tesalonicenses': '2thessalonians',
        '1 timothy': '1timothy',
        '1 timoteo': '1timothy',
        '2 timothy': '2timothy',
        '2 timoteo': '2timothy',
        'hebrews': 'hebrews',
        'hebreos': 'hebrews',
        'james': 'james',
        'santiago': 'james',
        '1 peter': '1peter',
        '1 pedro': '1peter',
        '2 peter': '2peter',
        '2 pedro': '2peter',
        '1 john': '1john',
        '1 juan': '1john',
        '2 john': '2john',
        '2 juan': '2john',
        '3 john': '3john',
        '3 juan': '3john',
        'revelation': 'revelation',
        'apocalipsis': 'revelation'
    };
    
    return bookMappings[book.toLowerCase()] || book.toLowerCase();
}

function getBollsBookId(bookName) {
    const bollsBookIds = {
        'Genesis': 'GEN', 'Exodus': 'EXO', 'Matthew': 'MAT', 'Mark': 'MRK',
        'Luke': 'LUK', 'John': 'JHN', 'Acts': 'ACT', 'Romans': 'ROM',
        'Psalms': 'PSA', 'Proverbs': 'PRO', 'Isaiah': 'ISA'
    };
    
    return bollsBookIds[bookName] || null;
}

// Helper function to get approximate max chapters for a book (for search performance)
function getMaxChaptersForBook(bookName) {
    const maxChapters = {
        'genesis': 50, 'exodus': 40, 'leviticus': 27, 'numbers': 36, 'deuteronomy': 34,
        'joshua': 24, 'judges': 21, 'ruth': 4, '1samuel': 31, '2samuel': 24,
        '1kings': 22, '2kings': 25, '1chronicles': 29, '2chronicles': 36,
        'ezra': 10, 'nehemiah': 13, 'esther': 10, 'job': 42,
        'psalms': 150, 'proverbs': 31, 'ecclesiastes': 12, 'songofsolomon': 8,
        'isaiah': 66, 'jeremiah': 52, 'lamentations': 5, 'ezekiel': 48, 'daniel': 12,
        'hosea': 14, 'joel': 3, 'amos': 9, 'obadiah': 1, 'jonah': 4, 'micah': 7,
        'nahum': 3, 'habakkuk': 3, 'zephaniah': 3, 'haggai': 2, 'zechariah': 14, 'malachi': 4,
        'matthew': 28, 'mark': 16, 'luke': 24, 'john': 21, 'acts': 28, 'romans': 16,
        '1corinthians': 16, '2corinthians': 13, 'galatians': 6, 'ephesians': 6,
        'philippians': 4, 'colossians': 4, '1thessalonians': 5, '2thessalonians': 3,
        '1timothy': 6, '2timothy': 4, 'titus': 3, 'philemon': 1, 'hebrews': 13,
        'james': 5, '1peter': 5, '2peter': 3, '1john': 5, '2john': 1, '3john': 1,
        'jude': 1, 'revelation': 22
    };
    
    return maxChapters[bookName.toLowerCase()] || 25; // Default to 25 chapters if unknown
}