/**
 * Renderer Module
 * 
 * Handles all canvas rendering and visualization logic.
 */

const Renderer = (function() {
    'use strict';
    
    // Canvas elements
    let canvas, ctx;
    let width, height, centerX, centerY, radius;
    
    // View state
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    
    // Selection state
    let hoveredVerse = null;
    let selectedVerse = null;
    
    /**
     * Initialize the renderer
     * @param {HTMLCanvasElement} canvasElement - Canvas element
     */
    function init(canvasElement) {
        canvas = canvasElement;
        ctx = canvas.getContext('2d');
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }
    
    /**
     * Resize canvas to fill container
     */
    function resizeCanvas() {
        const container = canvas.parentElement;
        width = container.clientWidth;
        height = container.clientHeight;
        canvas.width = width;
        canvas.height = height;
        
        centerX = width / 2;
        centerY = height / 2;
        radius = Math.min(width, height) * CONFIG.canvas.radiusMultiplier;
    }
    
    /**
     * Calculate positions for verses in circular layout
     * @param {Array} verses - Array of verse objects
     */
    function calculatePositions(verses) {
        if (verses.length === 0) return;
        
        const angleStep = (Math.PI * 2) / verses.length;
        
        verses.forEach((verse, i) => {
            const angle = i * angleStep - Math.PI / 2;
            verse.x = centerX + offsetX + Math.cos(angle) * radius * scale;
            verse.y = centerY + offsetY + Math.sin(angle) * radius * scale;
        });
    }
    
    /**
     * Draw reference lines for a verse
     * @param {Object} verse - Verse object
     * @param {Array} allVerses - All verses for lookup
     * @param {string} color - Line color
     */
    function drawReferenceLines(verse, allVerses, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = CONFIG.visual.referenceLine.width;
        
        verse.refs.forEach(refId => {
            const targetVerse = allVerses.find(v => v.id === refId);
            if (targetVerse) {
                ctx.beginPath();
                ctx.moveTo(verse.x, verse.y);
                ctx.lineTo(targetVerse.x, targetVerse.y);
                ctx.stroke();
            }
        });
    }
    
    /**
     * Draw a single verse point
     * @param {Object} verse - Verse object
     * @param {boolean} isSelected - Whether verse is selected
     * @param {boolean} isHovered - Whether verse is hovered
     */
    function drawVersePoint(verse, isSelected, isHovered) {
        const pointSize = isSelected ? 
            CONFIG.visual.pointRadius.selected :
            isHovered ?
            CONFIG.visual.pointRadius.hovered :
            CONFIG.visual.pointRadius.normal;
        
        ctx.beginPath();
        ctx.arc(verse.x, verse.y, pointSize, 0, Math.PI * 2);
        
        // Determine color
        if (isSelected) {
            ctx.fillStyle = CONFIG.highlightColors.selected;
        } else if (isHovered) {
            ctx.fillStyle = CONFIG.highlightColors.hovered;
        } else {
            const color = CONFIG.bookColors[verse.book] || CONFIG.defaultColor;
            ctx.fillStyle = color;
        }
        
        ctx.fill();
        
        // Add glow for hovered/selected
        if (isHovered || isSelected) {
            ctx.strokeStyle = isSelected ? 
                CONFIG.visual.glow.selectedColor : 
                CONFIG.visual.glow.hoveredColor;
            ctx.lineWidth = CONFIG.visual.glow.lineWidth;
            ctx.stroke();
        }
    }
    
    /**
     * Draw verse label
     * @param {Object} verse - Verse object
     */
    function drawVerseLabel(verse) {
        ctx.fillStyle = CONFIG.visual.label.color;
        ctx.font = CONFIG.visual.label.font;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(verse.verse, verse.x, verse.y - CONFIG.visual.label.offset);
    }
    
    /**
     * Main render function
     * @param {Array} filteredVerses - Verses to render
     */
    function render(filteredVerses) {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        if (filteredVerses.length === 0) {
            drawEmptyMessage();
            return;
        }
        
        // Calculate positions
        calculatePositions(filteredVerses);
        
        // Draw reference lines for selected verse
        if (selectedVerse) {
            drawReferenceLines(
                selectedVerse, 
                filteredVerses, 
                CONFIG.visual.referenceLine.selectedColor
            );
        }
        
        // Draw reference lines for hovered verse
        if (hoveredVerse && hoveredVerse !== selectedVerse) {
            drawReferenceLines(
                hoveredVerse, 
                filteredVerses, 
                CONFIG.visual.referenceLine.hoveredColor
            );
        }
        
        // Draw all verse points
        filteredVerses.forEach(verse => {
            const isSelected = verse === selectedVerse;
            const isHovered = verse === hoveredVerse;
            drawVersePoint(verse, isSelected, isHovered);
        });
        
        // Draw labels for selected/hovered verses
        if (selectedVerse || hoveredVerse) {
            const labelVerse = selectedVerse || hoveredVerse;
            drawVerseLabel(labelVerse);
        }
    }
    
    /**
     * Draw message when no verses match filters
     */
    function drawEmptyMessage() {
        ctx.fillStyle = '#a8b8c8';
        ctx.font = '16px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No verses match current filters', centerX, centerY);
    }
    
    /**
     * Find verse at mouse position
     * @param {number} mouseX - Mouse X coordinate
     * @param {number} mouseY - Mouse Y coordinate
     * @param {Array} verses - Verses to search
     * @returns {Object|null} Found verse or null
     */
    function findVerseAtPosition(mouseX, mouseY, verses) {
        for (const verse of verses) {
            const dx = mouseX - verse.x;
            const dy = mouseY - verse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < CONFIG.visual.hitRadius) {
                return verse;
            }
        }
        return null;
    }
    
    /**
     * Zoom in/out
     * @param {number} delta - Zoom delta (positive = zoom in, negative = zoom out)
     */
    function zoom(delta) {
        const factor = delta > 0 ? (1 + CONFIG.canvas.zoomSpeed) : (1 - CONFIG.canvas.zoomSpeed);
        scale *= factor;
        scale = Math.max(CONFIG.canvas.minScale, Math.min(scale, CONFIG.canvas.maxScale));
    }
    
    /**
     * Reset view to default
     */
    function resetView() {
        scale = 1;
        offsetX = 0;
        offsetY = 0;
        selectedVerse = null;
        hoveredVerse = null;
    }
    
    /**
     * Set hovered verse
     * @param {Object|null} verse - Verse to set as hovered
     */
    function setHoveredVerse(verse) {
        hoveredVerse = verse;
    }
    
    /**
     * Set selected verse
     * @param {Object|null} verse - Verse to set as selected
     */
    function setSelectedVerse(verse) {
        selectedVerse = verse;
    }
    
    /**
     * Get current view state
     * @returns {Object} View state
     */
    function getViewState() {
        return {
            scale,
            offsetX,
            offsetY,
            hoveredVerse,
            selectedVerse
        };
    }
    
    // Public API
    return {
        init,
        render,
        resizeCanvas,
        findVerseAtPosition,
        zoom,
        resetView,
        setHoveredVerse,
        setSelectedVerse,
        getViewState
    };
})();

// Make Renderer globally available
window.Renderer = Renderer;