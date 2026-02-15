/**
 * Network Statistics Module
 * 
 * Analyzes the Bible cross-reference network to compute various metrics:
 * - Degree centrality (most connected verses)
 * - Betweenness centrality (bridge verses)
 * - Clustering coefficient (how interconnected neighborhoods are)
 * - Community detection (verse clusters)
 * - Hub identification (most influential verses)
 */

const NetworkStats = (function() {
    'use strict';
    
    // Cache computed statistics
    let statsCache = {
        centrality: null,
        betweenness: null,
        clustering: null,
        communities: null,
        hubs: null,
        lastComputed: null
    };
    
    /**
     * Calculate degree centrality for all verses
     * Higher score = more connections = more central to the network
     * 
     * @param {Array} verses - All verses
     * @returns {Array} Verses sorted by centrality (highest first)
     */
    function calculateDegreeCentrality(verses) {
        if (statsCache.centrality) return statsCache.centrality;
        
        const maxRefs = Math.max(...verses.map(v => v.refCount));
        
        const centralityScores = verses.map(verse => ({
            ...verse,
            degreeCentrality: verse.refCount / maxRefs,
            normalizedDegree: verse.refCount
        }));
        
        const sorted = centralityScores.sort((a, b) => 
            b.degreeCentrality - a.degreeCentrality
        );
        
        statsCache.centrality = sorted;
        return sorted;
    }
    
    /**
     * Calculate betweenness centrality using sampling
     * Identifies verses that act as "bridges" between different parts
     * 
     * @param {Array} verses - All verses
     * @param {number} sampleSize - Number of verse pairs to sample
     * @returns {Array} Verses sorted by betweenness (highest first)
     */
    function calculateBetweennessCentrality(verses, sampleSize = 200) {
        if (statsCache.betweenness) return statsCache.betweenness;
        
        console.log('Computing betweenness centrality (sampled)...');
        
        // Create verse lookup
        const verseMap = new Map(verses.map(v => [v.id, v]));
        
        // Initialize betweenness scores
        const betweenness = new Map(verses.map(v => [v.id, 0]));
        
        // Use smaller sample for speed - 200 paths is enough for pattern detection
        const sample = Math.min(sampleSize, verses.length);
        let foundPaths = 0;
        
        for (let i = 0; i < sample; i++) {
            // Progress update every 50 iterations
            if (i % 50 === 0) {
                console.log(`Betweenness: ${i}/${sample} samples processed...`);
            }
            
            const source = verses[Math.floor(Math.random() * verses.length)];
            const target = verses[Math.floor(Math.random() * verses.length)];
            
            if (source.id === target.id) continue;
            
            const path = findShortestPath(source, target, verseMap);
            
            if (path && path.length > 2) {
                foundPaths++;
                // Increment betweenness for intermediate nodes
                for (let j = 1; j < path.length - 1; j++) {
                    const current = betweenness.get(path[j].id) || 0;
                    betweenness.set(path[j].id, current + 1);
                }
            }
        }
        
        console.log(`Found ${foundPaths} paths out of ${sample} samples`);
        
        // Normalize scores
        const maxBetweenness = Math.max(...betweenness.values()) || 1;
        
        const scores = verses.map(verse => ({
            ...verse,
            betweennessCentrality: (betweenness.get(verse.id) || 0) / maxBetweenness,
            betweennessScore: betweenness.get(verse.id) || 0
        }));
        
        const sorted = scores.sort((a, b) => 
            b.betweennessCentrality - a.betweennessCentrality
        );
        
        statsCache.betweenness = sorted;
        console.log('Betweenness centrality computed');
        return sorted;
    }
    
    /**
     * Find shortest path between two verses using BFS
     * 
     * @param {Object} start - Starting verse
     * @param {Object} end - Target verse
     * @param {Map} verseMap - Map of verse ID to verse object
     * @returns {Array|null} Path as array of verses, or null if no path
     */
    function findShortestPath(start, end, verseMap) {
        const queue = [[start]];
        const visited = new Set([start.id]);
        const maxDepth = 6; // Limit search depth for performance
        
        while (queue.length > 0) {
            const path = queue.shift();
            const current = path[path.length - 1];
            
            if (path.length > maxDepth) continue;
            if (current.id === end.id) return path;
            
            for (const refId of current.refs) {
                if (!visited.has(refId)) {
                    visited.add(refId);
                    const nextVerse = verseMap.get(refId);
                    if (nextVerse) {
                        queue.push([...path, nextVerse]);
                    }
                }
            }
        }
        
        return null;
    }
    
    /**
     * Calculate clustering coefficient for each verse
     * Measures how interconnected a verse's neighbors are
     * 
     * @param {Array} verses - All verses
     * @returns {Array} Verses sorted by clustering coefficient
     */
    function calculateClusteringCoefficient(verses) {
        if (statsCache.clustering) return statsCache.clustering;
        
        console.log('Computing clustering coefficients...');
        
        const verseMap = new Map(verses.map(v => [v.id, v]));
        
        const scores = verses.map(verse => {
            if (verse.refCount < 2) {
                return { ...verse, clusteringCoefficient: 0 };
            }
            
            // Get neighbors
            const neighbors = verse.refs
                .map(id => verseMap.get(id))
                .filter(v => v);
            
            if (neighbors.length < 2) {
                return { ...verse, clusteringCoefficient: 0 };
            }
            
            // Count connections between neighbors
            let connections = 0;
            for (let i = 0; i < neighbors.length; i++) {
                for (let j = i + 1; j < neighbors.length; j++) {
                    if (neighbors[i].refs.includes(neighbors[j].id)) {
                        connections++;
                    }
                }
            }
            
            // Clustering coefficient = actual connections / possible connections
            const possibleConnections = (neighbors.length * (neighbors.length - 1)) / 2;
            const coefficient = connections / possibleConnections;
            
            return {
                ...verse,
                clusteringCoefficient: coefficient,
                neighborConnections: connections,
                possibleConnections
            };
        });
        
        const sorted = scores.sort((a, b) => 
            b.clusteringCoefficient - a.clusteringCoefficient
        );
        
        statsCache.clustering = sorted;
        console.log('Clustering coefficients computed');
        return sorted;
    }
    
    /**
     * Identify hub verses (high degree + high centrality)
     * 
     * @param {Array} verses - All verses
     * @returns {Array} Top hub verses
     */
    function identifyHubs(verses, topN = 50) {
        if (statsCache.hubs) return statsCache.hubs;
        
        const centrality = calculateDegreeCentrality(verses);
        const clustering = calculateClusteringCoefficient(verses);
        
        // Create a combined score
        const hubScores = verses.map(verse => {
            const centralityData = centrality.find(v => v.id === verse.id);
            const clusteringData = clustering.find(v => v.id === verse.id);
            
            // Hub score = high degree + low clustering (connects different clusters)
            const hubScore = centralityData.degreeCentrality * 
                            (1 - clusteringData.clusteringCoefficient);
            
            return {
                ...verse,
                hubScore,
                isHub: false
            };
        });
        
        const sorted = hubScores.sort((a, b) => b.hubScore - a.hubScore);
        
        // Mark top N as hubs
        for (let i = 0; i < Math.min(topN, sorted.length); i++) {
            sorted[i].isHub = true;
        }
        
        statsCache.hubs = sorted;
        return sorted;
    }
    
    /**
     * Detect communities using simple label propagation
     * Groups verses that are highly interconnected
     * 
     * @param {Array} verses - All verses
     * @param {number} iterations - Number of iterations
     * @returns {Object} Community assignments
     */
    function detectCommunities(verses, iterations = 5) {
        if (statsCache.communities) return statsCache.communities;
        
        console.log('Detecting communities...');
        
        const verseMap = new Map(verses.map(v => [v.id, v]));
        
        // Initialize each verse to its own community
        const labels = new Map(verses.map(v => [v.id, v.id]));
        
        // Label propagation - reduced to 5 iterations for speed
        for (let iter = 0; iter < iterations; iter++) {
            let changed = 0;
            
            // Randomize order
            const shuffled = [...verses].sort(() => Math.random() - 0.5);
            
            for (const verse of shuffled) {
                if (verse.refCount === 0) continue;
                
                // Count neighbor labels
                const labelCounts = new Map();
                
                for (const refId of verse.refs) {
                    const label = labels.get(refId);
                    if (label) {
                        labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
                    }
                }
                
                // Find most common label
                let maxCount = 0;
                let maxLabel = labels.get(verse.id);
                
                for (const [label, count] of labelCounts) {
                    if (count > maxCount) {
                        maxCount = count;
                        maxLabel = label;
                    }
                }
                
                if (labels.get(verse.id) !== maxLabel) {
                    labels.set(verse.id, maxLabel);
                    changed++;
                }
            }
            
            console.log(`Community detection - Iteration ${iter + 1}/${iterations}: ${changed} changes`);
            
            if (changed === 0) {
                console.log('Converged early at iteration', iter + 1);
                break;
            }
        }
        
        // Group verses by community
        const communities = new Map();
        
        for (const verse of verses) {
            const label = labels.get(verse.id);
            if (!communities.has(label)) {
                communities.set(label, []);
            }
            communities.get(label).push(verse);
        }
        
        // Filter out tiny communities
        const significantCommunities = Array.from(communities.entries())
            .filter(([_, members]) => members.length >= 3)
            .sort((a, b) => b[1].length - a[1].length);
        
        const result = {
            communities: significantCommunities,
            communityCount: significantCommunities.length,
            labels
        };
        
        statsCache.communities = result;
        console.log(`Found ${result.communityCount} communities`);
        return result;
    }
    
    /**
     * Get network-wide statistics
     * 
     * @param {Array} verses - All verses
     * @returns {Object} Network statistics
     */
    function getNetworkStatistics(verses) {
        const totalRefs = verses.reduce((sum, v) => sum + v.refCount, 0);
        const avgRefs = totalRefs / verses.length;
        
        const refCounts = verses.map(v => v.refCount).sort((a, b) => b - a);
        const medianRefs = refCounts[Math.floor(refCounts.length / 2)];
        const maxRefs = refCounts[0];
        
        // Get top verses
        const centrality = calculateDegreeCentrality(verses);
        const topVerses = centrality.slice(0, 10);
        
        // Network density
        const possibleConnections = (verses.length * (verses.length - 1)) / 2;
        const actualConnections = totalRefs / 2; // Each ref is bidirectional
        const density = actualConnections / possibleConnections;
        
        return {
            nodeCount: verses.length,
            edgeCount: totalRefs,
            avgDegree: avgRefs.toFixed(2),
            medianDegree: medianRefs,
            maxDegree: maxRefs,
            density: (density * 100).toFixed(4) + '%',
            topVerses: topVerses.slice(0, 10).map(v => ({
                verse: v.verse,
                refs: v.refCount,
                centrality: v.degreeCentrality.toFixed(3)
            }))
        };
    }
    
    /**
     * Compute all statistics
     * 
     * @param {Array} verses - All verses
     * @returns {Object} All computed statistics
     */
    function computeAllStats(verses) {
        console.log('='.repeat(60));
        console.log('Computing all network statistics...');
        console.log(`Dataset: ${verses.length} verses`);
        console.log('='.repeat(60));
        const startTime = Date.now();
        
        const stats = {
            network: getNetworkStatistics(verses),
            centrality: calculateDegreeCentrality(verses).slice(0, 20),
            betweenness: calculateBetweennessCentrality(verses, 200).slice(0, 20),  // Reduced sample
            clustering: calculateClusteringCoefficient(verses).slice(0, 20),
            hubs: identifyHubs(verses, 30).filter(v => v.isHub),
            communities: detectCommunities(verses, 5)  // Reduced iterations
        };
        
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log('='.repeat(60));
        console.log(`✓ All statistics computed in ${elapsed}s`);
        console.log('='.repeat(60));
        
        statsCache.lastComputed = new Date();
        return stats;
    }
    
    /**
     * Clear cache (call when data changes)
     */
    function clearCache() {
        statsCache = {
            centrality: null,
            betweenness: null,
            clustering: null,
            communities: null,
            hubs: null,
            lastComputed: null
        };
    }
    
    /**
     * Export statistics as JSON
     */
    function exportStats(stats) {
        const data = JSON.stringify(stats, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'bible-network-stats.json';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }
    
    // Public API
    return {
        calculateDegreeCentrality,
        calculateBetweennessCentrality,
        calculateClusteringCoefficient,
        identifyHubs,
        detectCommunities,
        getNetworkStatistics,
        computeAllStats,
        findShortestPath,
        clearCache,
        exportStats
    };
})();

// Make NetworkStats globally available
window.NetworkStats = NetworkStats;