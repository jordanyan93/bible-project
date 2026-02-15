/**
 * Data Loader Module
 * 
 * Handles loading and processing of Bible cross-reference data.
 */

const DataLoader = (function() {
    'use strict';
    
    // Private variables
    let bibleData = {};
    let verses = [];
    let books = new Set();
    
    /**
     * Load Bible data from JSON file
     * @returns {Promise<boolean>} Success status
     */
    async function loadData() {
        try {
            const response = await fetch(CONFIG.dataFile);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            bibleData = await response.json();
            processData();
            return true;
            
        } catch (error) {
            console.error('Error loading data:', error);
            alert(`Failed to load Bible data. Please ensure '${CONFIG.dataFile}' is in the same folder as this HTML file.`);
            return false;
        }
    }
    
    /**
     * Process loaded data into usable format
     */
    function processData() {
        verses = Object.entries(bibleData).map(([id, data]) => {
            const book = data.v.split(' ')[0];
            books.add(book);
            
            return {
                id,
                verse: data.v,
                book,
                refs: Object.keys(data.r || {}),
                refCount: Object.keys(data.r || {}).length,
                x: 0,  // Will be calculated during render
                y: 0   // Will be calculated during render
            };
        });
        
        // Sort by verse ID for circular layout
        verses.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    }
    
    /**
     * Get all verses
     * @returns {Array} Array of verse objects
     */
    function getVerses() {
        return verses;
    }
    
    /**
     * Get all books
     * @returns {Set} Set of book names
     */
    function getBooks() {
        return books;
    }
    
    /**
     * Get raw Bible data
     * @returns {Object} Bible data object
     */
    function getBibleData() {
        return bibleData;
    }
    
    /**
     * Find a verse by reference
     * @param {string} verseRef - Verse reference (e.g., "GEN 1 1")
     * @returns {Object|null} Verse object or null if not found
     */
    function findVerse(verseRef) {
        const normalized = verseRef.toUpperCase().trim();
        return verses.find(v => v.verse.includes(normalized)) || null;
    }
    
    /**
     * Find a verse by ID
     * @param {string} id - Verse ID
     * @returns {Object|null} Verse object or null if not found
     */
    function findVerseById(id) {
        return verses.find(v => v.id === id) || null;
    }
    
    /**
     * Get statistics
     * @returns {Object} Statistics object
     */
    function getStats() {
        const totalRefs = verses.reduce((sum, v) => sum + v.refCount, 0);
        
        return {
            verseCount: verses.length,
            referenceCount: totalRefs,
            bookCount: books.size
        };
    }
    
    // Public API
    return {
        loadData,
        getVerses,
        getBooks,
        getBibleData,
        findVerse,
        findVerseById,
        getStats
    };
})();

// Make DataLoader globally available
window.DataLoader = DataLoader;