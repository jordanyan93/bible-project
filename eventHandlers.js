/**
 * Event Handlers Module
 * 
 * Handles all user interactions and UI updates.
 */

const EventHandlers = (function() {
    'use strict';
    
    // UI Elements
    let searchInput, bookFilter, minRefsInput, resetBtn;
    let infoPanel, verseRefEl, statsEl, referencesEl;
    let verseCountEl, refCountEl, bookCountEl;
    
    /**
     * Initialize event handlers
     */
    function init() {
        console.log('EventHandlers.init() called');
        
        // Get UI elements
        searchInput = document.getElementById('search');
        bookFilter = document.getElementById('book-filter');
        minRefsInput = document.getElementById('min-refs');
        resetBtn = document.getElementById('reset-btn');
        
        infoPanel = document.getElementById('info-panel');
        
        if (!infoPanel) {
            console.error('Info panel not found!');
            return;
        }
        
        verseRefEl = infoPanel.querySelector('.verse-ref');
        statsEl = infoPanel.querySelector('.stats');
        referencesEl = infoPanel.querySelector('.references');
        
        verseCountEl = document.getElementById('verse-count');
        refCountEl = document.getElementById('ref-count');
        bookCountEl = document.getElementById('book-count');
        
        // Setup event listeners
        setupCanvasListeners();
        setupControlListeners();
        
        console.log('EventHandlers initialized');
    }
    
    /**
     * Setup canvas event listeners
     */
    function setupCanvasListeners() {
        const canvas = document.getElementById('canvas');
        
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('click', handleClick);
        canvas.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    /**
     * Setup control panel listeners
     */
    function setupControlListeners() {
        console.log('Setting up control listeners...');
        
        if (!searchInput || !bookFilter || !minRefsInput || !resetBtn) {
            console.error('Some control elements not found!');
            console.log('searchInput:', searchInput);
            console.log('bookFilter:', bookFilter);
            console.log('minRefsInput:', minRefsInput);
            console.log('resetBtn:', resetBtn);
            return;
        }
        
        searchInput.addEventListener('input', handleSearch);
        bookFilter.addEventListener('change', () => window.app.render());
        minRefsInput.addEventListener('input', () => window.app.render());
        resetBtn.addEventListener('click', handleReset);
        
        console.log('Basic controls set up');
        
        // Stats button - with extra debugging
        console.log('Looking for stats button...');
        const statsBtn = document.getElementById('show-stats-btn');
        console.log('Stats button element:', statsBtn);
        
        if (statsBtn) {
            console.log('Stats button found! Adding listener...');
            statsBtn.addEventListener('click', () => {
                console.log('Stats button clicked!');
                const verses = DataLoader.getVerses();
                console.log('Got verses:', verses.length);
                
                if (typeof StatsPanel === 'undefined') {
                    console.error('StatsPanel is not defined!');
                    alert('StatsPanel module not loaded. Check browser console.');
                    return;
                }
                
                if (typeof StatsPanel.computeAndDisplay !== 'function') {
                    console.error('StatsPanel.computeAndDisplay is not a function!');
                    return;
                }
                
                StatsPanel.computeAndDisplay(verses);
            });
            console.log('Stats button listener attached successfully!');
        } else {
            console.error('Stats button NOT found! Element with id="show-stats-btn" does not exist.');
            console.log('Available buttons:', document.querySelectorAll('button'));
        }
    }
    
    /**
     * Handle mouse move on canvas
     */
    function handleMouseMove(e) {
        const canvas = e.target;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const filteredVerses = window.app.getFilteredVerses();
        const foundVerse = Renderer.findVerseAtPosition(mouseX, mouseY, filteredVerses);
        
        const viewState = Renderer.getViewState();
        if (foundVerse !== viewState.hoveredVerse) {
            Renderer.setHoveredVerse(foundVerse);
            updateInfoPanel(foundVerse);
            window.app.render();
        }
        
        canvas.style.cursor = foundVerse ? 'pointer' : 'default';
    }
    
    /**
     * Handle click on canvas
     */
    function handleClick(e) {
        const viewState = Renderer.getViewState();
        
        if (viewState.hoveredVerse) {
            Renderer.setSelectedVerse(viewState.hoveredVerse);
            updateInfoPanel(viewState.hoveredVerse);
            window.app.render();
        } else {
            Renderer.setSelectedVerse(null);
            infoPanel.style.display = 'none';
            window.app.render();
        }
    }
    
    /**
     * Handle mouse wheel for zooming
     */
    function handleWheel(e) {
        e.preventDefault();
        Renderer.zoom(e.deltaY);
        window.app.render();
    }
    
    /**
     * Handle search input
     */
    function handleSearch(e) {
        const searchTerm = e.target.value.toUpperCase().trim();
        
        if (!searchTerm) {
            Renderer.setSelectedVerse(null);
            infoPanel.style.display = 'none';
            window.app.render();
            return;
        }
        
        const found = DataLoader.findVerse(searchTerm);
        if (found) {
            Renderer.setSelectedVerse(found);
            Renderer.setHoveredVerse(found);
            updateInfoPanel(found);
            window.app.render();
        }
    }
    
    /**
     * Handle reset button
     */
    function handleReset() {
        Renderer.resetView();
        searchInput.value = '';
        bookFilter.value = '';
        minRefsInput.value = '0';
        infoPanel.style.display = 'none';
        window.app.render();
    }
    
    /**
     * Update info panel with verse details
     * @param {Object|null} verse - Verse to display
     */
    function updateInfoPanel(verse) {
        if (!verse) {
            infoPanel.style.display = 'none';
            return;
        }
        
        infoPanel.style.display = 'block';
        
        // Update verse reference
        verseRefEl.textContent = verse.verse;
        
        // Update stats
        const refText = verse.refCount === 1 ? 'cross-reference' : 'cross-references';
        statsEl.textContent = `${verse.refCount} ${refText}`;
        
        // Update references list
        updateReferencesList(verse);
    }
    
    /**
     * Update the references list in info panel
     * @param {Object} verse - Verse object
     */
    function updateReferencesList(verse) {
        referencesEl.innerHTML = '';
        
        const bibleData = DataLoader.getBibleData();
        
        verse.refs.forEach(refId => {
            const refVerse = bibleData[refId];
            if (refVerse) {
                const div = document.createElement('div');
                div.className = 'ref-item';
                div.textContent = refVerse.v;
                div.onclick = () => searchAndSelect(refVerse.v);
                referencesEl.appendChild(div);
            }
        });
    }
    
    /**
     * Search for and select a verse by reference
     * @param {string} verseRef - Verse reference
     */
    function searchAndSelect(verseRef) {
        const found = DataLoader.findVerse(verseRef);
        if (found) {
            Renderer.setSelectedVerse(found);
            Renderer.setHoveredVerse(found);
            searchInput.value = verseRef;
            updateInfoPanel(found);
            window.app.render();
        }
    }
    
    /**
     * Populate book filter dropdown
     */
    function populateBookFilter() {
        const books = Array.from(DataLoader.getBooks()).sort();
        
        books.forEach(book => {
            const option = document.createElement('option');
            option.value = book;
            option.textContent = book;
            bookFilter.appendChild(option);
        });
    }
    
    /**
     * Update statistics display
     */
    function updateStatistics() {
        const stats = DataLoader.getStats();
        
        verseCountEl.textContent = stats.verseCount.toLocaleString();
        refCountEl.textContent = stats.referenceCount.toLocaleString();
        bookCountEl.textContent = stats.bookCount;
    }
    
    /**
     * Get current filter values
     * @returns {Object} Filter values
     */
    function getFilters() {
        return {
            book: bookFilter.value,
            minRefs: parseInt(minRefsInput.value) || 0
        };
    }
    
    // Public API
    return {
        init,
        populateBookFilter,
        updateStatistics,
        getFilters
    };
})();

// Make EventHandlers globally available
window.EventHandlers = EventHandlers;