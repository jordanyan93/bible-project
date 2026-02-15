/**
 * Statistics Panel UI
 * 
 * Displays network statistics in an interactive panel
 */

const StatsPanel = (function() {
    'use strict';
    
    let panel;
    let currentStats = null;
    
    /**
     * Initialize the statistics panel
     */
    function init() {
        console.log('StatsPanel.init() called');
        try {
            createPanel();
            setupEventListeners();
            console.log('StatsPanel initialized successfully, panel created');
        } catch (error) {
            console.error('Error initializing StatsPanel:', error);
            throw error;
        }
    }
    
    /**
     * Create the panel HTML structure
     */
    function createPanel() {
        panel = document.createElement('div');
        panel.id = 'stats-panel';
        panel.className = 'stats-panel hidden';
        
        panel.innerHTML = `
            <div class="stats-panel-header">
                <h3>Network Statistics</h3>
                <button class="close-btn" id="close-stats">×</button>
            </div>
            
            <div class="stats-panel-content">
                <div id="stats-loading" class="stats-loading">
                    <div class="spinner"></div>
                    <p>Computing statistics...</p>
                </div>
                
                <div id="stats-results" class="stats-results hidden">
                    <div class="stats-tabs">
                        <button class="stats-tab active" data-tab="overview">Overview</button>
                        <button class="stats-tab" data-tab="centrality">Centrality</button>
                        <button class="stats-tab" data-tab="betweenness">Betweenness</button>
                        <button class="stats-tab" data-tab="clustering">Clustering</button>
                        <button class="stats-tab" data-tab="hubs">Hubs</button>
                        <button class="stats-tab" data-tab="communities">Communities</button>
                    </div>
                    
                    <div class="stats-tab-content">
                        <div class="tab-pane active" id="tab-overview"></div>
                        <div class="tab-pane" id="tab-centrality"></div>
                        <div class="tab-pane" id="tab-betweenness"></div>
                        <div class="tab-pane" id="tab-clustering"></div>
                        <div class="tab-pane" id="tab-hubs"></div>
                        <div class="tab-pane" id="tab-communities"></div>
                    </div>
                    
                    <div class="stats-actions">
                        <button id="export-stats">Export Stats (JSON)</button>
                        <button id="refresh-stats">Refresh</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
    }
    
    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Close button
        document.getElementById('close-stats').addEventListener('click', hide);
        
        // Tab switching
        document.querySelectorAll('.stats-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                switchTab(e.target.dataset.tab);
            });
        });
        
        // Export button
        document.getElementById('export-stats').addEventListener('click', () => {
            if (currentStats) {
                NetworkStats.exportStats(currentStats);
            }
        });
        
        // Refresh button
        document.getElementById('refresh-stats').addEventListener('click', () => {
            NetworkStats.clearCache();
            const verses = DataLoader.getVerses();
            computeAndDisplay(verses);
        });
    }
    
    /**
     * Switch between tabs
     */
    function switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.stats-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update tab panes
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === `tab-${tabName}`);
        });
    }
    
    /**
     * Show the panel
     */
    function show() {
        if (!panel) {
            console.error('Panel not initialized! Call StatsPanel.init() first.');
            console.error('Attempting to initialize now...');
            try {
                init();
            } catch (e) {
                console.error('Failed to initialize:', e);
                return;
            }
        }
        if (panel) {
            panel.classList.remove('hidden');
            console.log('Panel shown');
        }
    }
    
    /**
     * Hide the panel
     */
    function hide() {
        panel.classList.add('hidden');
    }
    
    /**
     * Compute and display statistics
     */
    async function computeAndDisplay(verses) {
        console.log('Computing stats for', verses.length, 'verses');
        
        if (!panel) {
            console.error('Stats panel not initialized!');
            return;
        }
        
        show();
        
        // Show loading
        const loadingEl = document.getElementById('stats-loading');
        const resultsEl = document.getElementById('stats-results');
        
        if (!loadingEl || !resultsEl) {
            console.error('Loading or results element not found!');
            return;
        }
        
        loadingEl.classList.remove('hidden');
        resultsEl.classList.add('hidden');
        
        // Use longer delay to ensure UI updates before heavy computation
        await new Promise(resolve => setTimeout(resolve, 200));
        
        try {
            console.log('Starting computation...');
            
            // Force UI update
            loadingEl.querySelector('p').textContent = 'Computing statistics... This may take 10-30 seconds...';
            
            // Give browser time to render
            await new Promise(resolve => setTimeout(resolve, 100));
            
            currentStats = NetworkStats.computeAllStats(verses);
            
            console.log('Stats computed, displaying results...');
            displayStats(currentStats);
            
            // Hide loading, show results
            loadingEl.classList.add('hidden');
            resultsEl.classList.remove('hidden');
            
            console.log('Stats panel updated successfully');
        } catch (error) {
            console.error('Error computing stats:', error);
            loadingEl.querySelector('p').textContent = 'Error computing statistics. Check console.';
        }
    }
    
    /**
     * Display computed statistics
     */
    function displayStats(stats) {
        displayOverview(stats.network);
        displayCentrality(stats.centrality);
        displayBetweenness(stats.betweenness);
        displayClustering(stats.clustering);
        displayHubs(stats.hubs);
        displayCommunities(stats.communities);
    }
    
    /**
     * Display overview statistics
     */
    function displayOverview(network) {
        const content = document.getElementById('tab-overview');
        
        content.innerHTML = `
            <h4>Network Overview</h4>
            <div class="stat-grid">
                <div class="stat-card">
                    <div class="stat-label">Total Verses</div>
                    <div class="stat-value">${network.nodeCount.toLocaleString()}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Total References</div>
                    <div class="stat-value">${network.edgeCount.toLocaleString()}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Avg. References/Verse</div>
                    <div class="stat-value">${network.avgDegree}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Median References</div>
                    <div class="stat-value">${network.medianDegree}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Max References</div>
                    <div class="stat-value">${network.maxDegree}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Network Density</div>
                    <div class="stat-value">${network.density}</div>
                </div>
            </div>
            
            <h4>Top 10 Most Connected Verses</h4>
            <div class="verse-list">
                ${network.topVerses.map((v, i) => `
                    <div class="verse-item" data-verse="${v.verse}">
                        <span class="rank">${i + 1}</span>
                        <span class="verse-ref">${v.verse}</span>
                        <span class="verse-stat">${v.refs} refs</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Add click handlers
        content.querySelectorAll('.verse-item').forEach(item => {
            item.addEventListener('click', () => {
                const verseRef = item.dataset.verse;
                selectVerseFromPanel(verseRef);
            });
        });
    }
    
    /**
     * Display degree centrality
     */
    function displayCentrality(centrality) {
        const content = document.getElementById('tab-centrality');
        
        content.innerHTML = `
            <h4>Degree Centrality</h4>
            <p class="explanation">
                Verses with the most cross-references. These are the most "connected" 
                verses in the Bible.
            </p>
            <div class="verse-list">
                ${centrality.map((v, i) => `
                    <div class="verse-item" data-verse="${v.verse}">
                        <span class="rank">${i + 1}</span>
                        <span class="verse-ref">${v.verse}</span>
                        <span class="verse-stat">${v.refCount} refs</span>
                        <span class="verse-score">${(v.degreeCentrality * 100).toFixed(1)}%</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        content.querySelectorAll('.verse-item').forEach(item => {
            item.addEventListener('click', () => {
                selectVerseFromPanel(item.dataset.verse);
            });
        });
    }
    
    /**
     * Display betweenness centrality
     */
    function displayBetweenness(betweenness) {
        const content = document.getElementById('tab-betweenness');
        
        content.innerHTML = `
            <h4>Betweenness Centrality</h4>
            <p class="explanation">
                Verses that act as "bridges" connecting different parts of the Bible. 
                These verses are important for navigating between topics.
            </p>
            <div class="verse-list">
                ${betweenness.map((v, i) => `
                    <div class="verse-item" data-verse="${v.verse}">
                        <span class="rank">${i + 1}</span>
                        <span class="verse-ref">${v.verse}</span>
                        <span class="verse-stat">${v.refCount} refs</span>
                        <span class="verse-score">${(v.betweennessCentrality * 100).toFixed(1)}%</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        content.querySelectorAll('.verse-item').forEach(item => {
            item.addEventListener('click', () => {
                selectVerseFromPanel(item.dataset.verse);
            });
        });
    }
    
    /**
     * Display clustering coefficient
     */
    function displayClustering(clustering) {
        const content = document.getElementById('tab-clustering');
        
        content.innerHTML = `
            <h4>Clustering Coefficient</h4>
            <p class="explanation">
                How interconnected a verse's neighbors are. High clustering means 
                the verse is part of a tightly-knit group.
            </p>
            <div class="verse-list">
                ${clustering.filter(v => v.clusteringCoefficient > 0).map((v, i) => `
                    <div class="verse-item" data-verse="${v.verse}">
                        <span class="rank">${i + 1}</span>
                        <span class="verse-ref">${v.verse}</span>
                        <span class="verse-stat">${v.refCount} refs</span>
                        <span class="verse-score">${(v.clusteringCoefficient * 100).toFixed(1)}%</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        content.querySelectorAll('.verse-item').forEach(item => {
            item.addEventListener('click', () => {
                selectVerseFromPanel(item.dataset.verse);
            });
        });
    }
    
    /**
     * Display hub verses
     */
    function displayHubs(hubs) {
        const content = document.getElementById('tab-hubs');
        
        content.innerHTML = `
            <h4>Hub Verses</h4>
            <p class="explanation">
                Verses that connect different clusters. High connectivity + low clustering 
                = bridges between communities.
            </p>
            <div class="verse-list">
                ${hubs.map((v, i) => `
                    <div class="verse-item hub-item" data-verse="${v.verse}">
                        <span class="rank">${i + 1}</span>
                        <span class="verse-ref">${v.verse}</span>
                        <span class="verse-stat">${v.refCount} refs</span>
                        <span class="verse-score">Hub Score: ${(v.hubScore * 100).toFixed(1)}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        content.querySelectorAll('.verse-item').forEach(item => {
            item.addEventListener('click', () => {
                selectVerseFromPanel(item.dataset.verse);
            });
        });
    }
    
    /**
     * Display detected communities
     */
    function displayCommunities(communityData) {
        const content = document.getElementById('tab-communities');
        
        content.innerHTML = `
            <h4>Detected Communities</h4>
            <p class="explanation">
                Found ${communityData.communityCount} groups of tightly-connected verses. 
                These may represent thematic or topical clusters.
            </p>
            <div class="community-list">
                ${communityData.communities.slice(0, 10).map(([id, members], i) => `
                    <div class="community-card">
                        <div class="community-header">
                            <h5>Community ${i + 1}</h5>
                            <span class="community-size">${members.length} verses</span>
                        </div>
                        <div class="community-books">
                            Books: ${getBookDistribution(members)}
                        </div>
                        <div class="community-members">
                            ${members.slice(0, 5).map(v => 
                                `<span class="mini-verse" data-verse="${v.verse}">${v.verse}</span>`
                            ).join(' ')}
                            ${members.length > 5 ? `<span class="more">+${members.length - 5} more</span>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        content.querySelectorAll('.mini-verse').forEach(item => {
            item.addEventListener('click', () => {
                selectVerseFromPanel(item.dataset.verse);
            });
        });
    }
    
    /**
     * Get book distribution for a community
     */
    function getBookDistribution(members) {
        const books = {};
        members.forEach(v => {
            books[v.book] = (books[v.book] || 0) + 1;
        });
        
        return Object.entries(books)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([book, count]) => `${book} (${count})`)
            .join(', ');
    }
    
    /**
     * Select a verse from the panel
     */
    function selectVerseFromPanel(verseRef) {
        hide();
        
        // Use existing search functionality
        const searchInput = document.getElementById('search');
        searchInput.value = verseRef;
        searchInput.dispatchEvent(new Event('input'));
    }
    
    // Public API
    return {
        init,
        show,
        hide,
        computeAndDisplay
    };
})();

// Make StatsPanel globally available
window.StatsPanel = StatsPanel;