/**
 * Main Application Controller
 * 
 * Coordinates all modules and manages application state.
 */

const App = (function() {
    'use strict';
    
    /**
     * Initialize the application
     */
    async function init() {
        console.log('Initializing Bible Cross-Reference Visualization...');
        
        // Show loading message
        showLoadingMessage();
        
        // Load data
        const success = await DataLoader.loadData();
        
        if (!success) {
            showErrorMessage();
            return;
        }
        
        // Initialize modules
        const canvas = document.getElementById('canvas');
        Renderer.init(canvas);
        EventHandlers.init();
        
        // Initialize StatsPanel (must be after DOM is ready)
        if (typeof StatsPanel !== 'undefined') {
            StatsPanel.init();
            console.log('StatsPanel module loaded and initialized');
        } else {
            console.warn('StatsPanel module not found - stats button will not work');
        }
        
        // Setup UI
        EventHandlers.populateBookFilter();
        EventHandlers.updateStatistics();
        
        // Initial render
        render();
        
        console.log('Application initialized successfully');
        hideLoadingMessage();
    }
    
    /**
     * Get filtered verses based on current UI filters
     * @returns {Array} Filtered verses
     */
    function getFilteredVerses() {
        const filters = EventHandlers.getFilters();
        const allVerses = DataLoader.getVerses();
        
        return allVerses.filter(verse => {
            // Book filter
            if (filters.book && verse.book !== filters.book) {
                return false;
            }
            
            // Minimum references filter
            if (verse.refCount < filters.minRefs) {
                return false;
            }
            
            return true;
        });
    }
    
    /**
     * Render the visualization
     */
    function render() {
        const filteredVerses = getFilteredVerses();
        Renderer.render(filteredVerses);
    }
    
    /**
     * Show loading message
     */
    function showLoadingMessage() {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#6ba3ff';
        ctx.font = '18px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Loading Bible data...', canvas.width / 2, canvas.height / 2);
    }
    
    /**
     * Hide loading message
     */
    function hideLoadingMessage() {
        // Render will clear the canvas
        render();
    }
    
    /**
     * Show error message
     */
    function showErrorMessage() {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#ff6b6b';
        ctx.font = '18px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Error loading data', canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.fillStyle = '#a8b8c8';
        ctx.font = '14px "Segoe UI"';
        ctx.fillText('Please ensure merged_bible_references.json is in the same folder', 
                     canvas.width / 2, canvas.height / 2 + 20);
    }
    
    // Public API
    return {
        init,
        render,
        getFilteredVerses
    };
})();

// Make App globally available
window.app = App;

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', App.init);
} else {
    App.init();
}