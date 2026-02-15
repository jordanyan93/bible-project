/**
 * Configuration and Constants
 * 
 * This file contains all configuration settings, color schemes,
 * and constant values used throughout the application.
 */

const CONFIG = {
    // Data file location
    dataFile: 'merged_bible_references.json',
    
    // Canvas rendering settings
    canvas: {
        radiusMultiplier: 0.35,  // Radius as fraction of smallest dimension
        minScale: 0.5,           // Minimum zoom level
        maxScale: 3.0,           // Maximum zoom level
        zoomSpeed: 0.1,          // How fast to zoom in/out
    },
    
    // Visual settings
    visual: {
        // Verse point sizes
        pointRadius: {
            normal: 3,
            hovered: 5,
            selected: 6
        },
        
        // Reference line styles
        referenceLine: {
            width: 0.5,
            selectedColor: 'rgba(255, 200, 100, 0.15)',
            hoveredColor: 'rgba(107, 163, 255, 0.25)'
        },
        
        // Glow effects
        glow: {
            selectedColor: 'rgba(255, 107, 107, 0.5)',
            hoveredColor: 'rgba(255, 217, 61, 0.5)',
            lineWidth: 2
        },
        
        // Hit detection
        hitRadius: 10,  // Distance in pixels for mouse interaction
        
        // Text labels
        label: {
            font: '12px "Segoe UI"',
            color: '#ffffff',
            offset: 10  // Distance from point
        }
    },
    
    // Book color scheme
    bookColors: {
        // Old Testament
        'GEN': '#FF6B6B', 'EXO': '#4ECDC4', 'LEV': '#45B7D1', 'NUM': '#96CEB4',
        'DEU': '#FFEAA7', 'JOS': '#DFE6E9', 'JDG': '#74B9FF', 'RUT': '#A29BFE',
        '1SA': '#FD79A8', '2SA': '#FDCB6E', '1KI': '#6C5CE7', '2KI': '#00B894',
        '1CH': '#00CEC9', '2CH': '#0984E3', 'EZR': '#B53471', 'NEH': '#E17055',
        'EST': '#F093FB', 'JOB': '#4ECDC4', 'PSA': '#6BA3FF', 'PRO': '#A8E6CF',
        'ECC': '#FFD3B6', 'SOS': '#FFAAA5', 'ISA': '#FF8B94', 'JER': '#A8D8EA',
        'LAM': '#AA96DA', 'EZE': '#FCBAD3', 'DAN': '#C7CEEA', 'HOS': '#F38181',
        'JOE': '#95E1D3', 'AMO': '#FFE66D', 'OBA': '#F6E58D', 'JON': '#FFBE76',
        'MIC': '#FF7979', 'NAH': '#BADC58', 'HAB': '#DFE4EA', 'ZEP': '#6C5CE7',
        'HAG': '#A29BFE', 'ZEC': '#FD79A8', 'MAL': '#FDCB6E',
        
        // New Testament
        'MAT': '#FF6B9D', 'MAR': '#C44569', 'LUK': '#F8B195', 'JOH': '#6BA3FF',
        'ACT': '#F67280', 'ROM': '#C06C84', '1CO': '#6C5B7B', '2CO': '#355C7D',
        'GAL': '#F8B500', 'EPH': '#2C3A47', 'PHP': '#FF6348', 'COL': '#FFA502',
        '1TH': '#747D8C', '2TH': '#2F3542', '1TI': '#57606F', '2TI': '#A4B0BE',
        'TIT': '#FF6348', 'PHM': '#FFA502', 'HEB': '#FF4757', 'JAM': '#5F27CD',
        '1PE': '#00D2D3', '2PE': '#1DD1A1', '1JO': '#54A0FF', '2JO': '#48DBFB',
        '3JO': '#0ABDE3', 'JUD': '#EE5A6F', 'REV': '#FF6B81'
    },
    
    // Default colors for unknown books
    defaultColor: '#6ba3ff',
    
    // Highlight colors
    highlightColors: {
        selected: '#ff6b6b',
        hovered: '#ffd93d',
        normal: null  // Use book color
    }
};

// Make CONFIG globally available
window.CONFIG = CONFIG;