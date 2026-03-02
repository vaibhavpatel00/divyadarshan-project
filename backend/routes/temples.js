const express = require('express');
const temples = require('../data/temples.json');
const router = express.Router();

// Simulate real-time status changes
function getSimulatedStatus(temple) {
    const now = new Date();
    const hour = now.getHours();

    const morningOpen = parseInt(temple.timings.morning.open.split(':')[0]);
    const morningClose = parseInt(temple.timings.morning.close.split(':')[0]);
    const eveningOpen = parseInt(temple.timings.evening.open.split(':')[0]);
    const eveningClose = parseInt(temple.timings.evening.close.split(':')[0]);

    const isOpen = (hour >= morningOpen && hour < morningClose) || (hour >= eveningOpen && hour < eveningClose);

    const rushLevels = ['low', 'medium', 'high', 'extreme'];
    let rushIndex;
    if (hour >= 5 && hour <= 7) rushIndex = 2;
    else if (hour >= 8 && hour <= 10) rushIndex = 3;
    else if (hour >= 11 && hour <= 14) rushIndex = 1;
    else if (hour >= 17 && hour <= 19) rushIndex = 2;
    else if (hour >= 19 && hour <= 21) rushIndex = 3;
    else rushIndex = 0;

    const randomShift = Math.random() > 0.5 ? 1 : 0;
    rushIndex = Math.min(3, Math.max(0, rushIndex + (Math.random() > 0.7 ? randomShift : -randomShift)));

    const waitTimes = ['15-30 min', '30-60 min', '1-3 hours', '3-6 hours'];
    const footfallMultipliers = [0.3, 0.6, 0.85, 1.0];

    return {
        isOpen,
        rushLevel: rushLevels[rushIndex],
        estimatedWait: isOpen ? waitTimes[rushIndex] : 'Temple Closed',
        currentFootfall: isOpen ? Math.round((temple.liveStatus?.currentFootfall || 5000) * footfallMultipliers[rushIndex] * (0.8 + Math.random() * 0.4)) : 0,
        lastUpdated: now.toISOString()
    };
}

// GET /api/temples/categories — All unique categories
router.get('/categories', (req, res) => {
    const categories = [...new Set(temples.map(t => t.category).filter(Boolean))];
    res.json({ categories });
});

// Fuzzy match helper — Levenshtein distance
function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, (_, i) => {
        const row = new Array(n + 1);
        row[0] = i;
        return row;
    });
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
    }
    return dp[m][n];
}

// Fuzzy score — higher = better match (0 = no match)
function fuzzyScore(query, text) {
    const q = query.toLowerCase().trim();
    const t = text.toLowerCase();
    // Exact contains = best
    if (t.includes(q)) return 100;
    // Check each word
    const qWords = q.split(/\s+/);
    const tWords = t.split(/\s+/);
    let totalScore = 0;
    for (const qw of qWords) {
        let bestWordScore = 0;
        for (const tw of tWords) {
            if (tw.includes(qw) || qw.includes(tw)) { bestWordScore = Math.max(bestWordScore, 80); continue; }
            // Starts with same letter(s)
            if (tw.startsWith(qw.substring(0, 2))) {
                const dist = levenshtein(qw, tw);
                const maxLen = Math.max(qw.length, tw.length);
                const sim = 1 - (dist / maxLen);
                if (sim >= 0.45) bestWordScore = Math.max(bestWordScore, Math.round(sim * 70));
            } else {
                const dist = levenshtein(qw, tw);
                const maxLen = Math.max(qw.length, tw.length);
                const sim = 1 - (dist / maxLen);
                if (sim >= 0.55) bestWordScore = Math.max(bestWordScore, Math.round(sim * 60));
            }
        }
        totalScore += bestWordScore;
    }
    return qWords.length > 0 ? totalScore / qWords.length : 0;
}

// GET /api/temples — List all temples, with smart fuzzy search & category filter
router.get('/', (req, res) => {
    const { search, state, category } = req.query;
    let results = temples.map(t => ({
        id: t.id,
        name: t.name,
        deity: t.deity,
        location: t.location,
        state: t.state,
        category: t.category,
        image: t.image,
        description: t.description.substring(0, 150) + '...',
        highlights: t.highlights,
        liveStatus: getSimulatedStatus(t)
    }));

    if (search) {
        // Smart fuzzy search across multiple fields
        const scored = results.map(t => {
            const nameScore = fuzzyScore(search, t.name);
            const deityScore = fuzzyScore(search, t.deity);
            const locScore = fuzzyScore(search, t.location);
            const stateScore = fuzzyScore(search, t.state);
            const catScore = t.category ? fuzzyScore(search, t.category) : 0;
            const bestScore = Math.max(nameScore, deityScore, locScore, stateScore, catScore);
            return { ...t, _score: bestScore };
        });
        results = scored.filter(t => t._score >= 25).sort((a, b) => b._score - a._score);
        // Remove internal score
        results = results.map(({ _score, ...rest }) => rest);
    }

    if (state) {
        results = results.filter(t => t.state.toLowerCase() === state.toLowerCase());
    }

    if (category) {
        results = results.filter(t => t.category && t.category.toLowerCase() === category.toLowerCase());
    }

    res.json({ temples: results, total: results.length });
});

// GET /api/temples/:id — Full temple details
router.get('/:id', (req, res) => {
    const temple = temples.find(t => t.id === req.params.id);
    if (!temple) {
        return res.status(404).json({ error: 'Temple not found.' });
    }
    res.json({
        ...temple,
        liveStatus: getSimulatedStatus(temple)
    });
});

// GET /api/temples/:id/status — Real-time status only
router.get('/:id/status', (req, res) => {
    const temple = temples.find(t => t.id === req.params.id);
    if (!temple) {
        return res.status(404).json({ error: 'Temple not found.' });
    }
    res.json({
        templeId: temple.id,
        templeName: temple.name,
        ...getSimulatedStatus(temple)
    });
});

// GET /api/temples/:id/nearby?radius=10 — Nearby places filtered by radius
router.get('/:id/nearby', (req, res) => {
    const temple = temples.find(t => t.id === req.params.id);
    if (!temple) {
        return res.status(404).json({ error: 'Temple not found.' });
    }
    const radius = parseInt(req.query.radius) || 50;
    const nearbyPlaces = (temple.nearbyPlaces || []).filter(p => p.distance <= radius);
    res.json({ nearbyPlaces, radius, total: nearbyPlaces.length });
});

module.exports = router;
