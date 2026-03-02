const fs = require('fs');
const path = require('path');
const https = require('https');

const TEMPLES_FILE = path.join(__dirname, '../data/temples.json');

// Helper to fetch JSON from API
function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'DivyaDarshanApp/1.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

// Map manual overrides for tricky names to get better Wikipedia hits
const searchOverrides = {
    "Kashi Vishwanath": "Kashi Vishwanath Temple",
    "Somnath Jyotirlinga": "Somnath temple",
    "Mahakaleshwar": "Mahakaleshwar Jyotirlinga",
    "Trimbakeshwar": "Trimbakeshwar Shiva Temple",
    "Vaishno Devi": "Vaishno Devi Temple",
    "Golden Temple": "Golden Temple",
    "Meenakshi Temple": "Meenakshi Temple",
    "Brihadeeswarar Temple": "Brihadisvara Temple, Thanjavur",
    "Jagannath Temple": "Jagannath Temple, Puri",
    "Badrinath": "Badrinath Temple",
    "Kedarnath": "Kedarnath Temple",
    "Shirdi Sai Baba": "Sai Baba of Shirdi"
};

async function getWikipediaImageUrl(templeName) {
    try {
        const searchTerm = searchOverrides[templeName] || templeName;

        // 1. Search for the Wikipedia page
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&utf8=&format=json`;
        const searchResult = await fetchJson(searchUrl);

        if (!searchResult.query || !searchResult.query.search || searchResult.query.search.length === 0) {
            console.log(`❌ No Wikipedia page found for: ${templeName}`);
            return null;
        }

        const pageTitle = searchResult.query.search[0].title;

        // 2. Fetch the main image (pageimage) for that page
        const imgUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&format=json&pithumbsize=1000`;
        const imgResult = await fetchJson(imgUrl);

        const pages = imgResult.query.pages;
        const pageId = Object.keys(pages)[0];

        if (pages[pageId].thumbnail && pages[pageId].thumbnail.source) {
            const url = pages[pageId].thumbnail.source;
            console.log(`✅ Found image for ${templeName}: ${url.split('/').pop()}`);
            return url;
        } else {
            console.log(`⚠️ Page found for ${templeName} ("${pageTitle}"), but no image.`);
            return null;
        }
    } catch (err) {
        console.error(`Error fetching image for ${templeName}:`, err.message);
        return null;
    }
}

async function updateTempleImages() {
    console.log('🔄 Starting Wikipedia Image Fetcher...');

    // Read current data
    const rawData = fs.readFileSync(TEMPLES_FILE, 'utf8');
    const temples = JSON.parse(rawData);

    let updatedCount = 0;

    // Process sequentially to be nice to the API
    for (let i = 0; i < temples.length; i++) {
        const temple = temples[i];

        // Always try to fetch unless it's already a wikimedia link that we want to keep
        // Wait, let's just refresh all of them to be safe and ensure high quality
        const imageUrl = await getWikipediaImageUrl(temple.name);

        if (imageUrl) {
            temples[i].image = imageUrl;
            updatedCount++;
        }

        // Small delay to respect rate limits
        await new Promise(r => setTimeout(r, 200));
    }

    // Write back to file
    fs.writeFileSync(TEMPLES_FILE, JSON.stringify(temples, null, 2));

    console.log(`\n🎉 Done! Updated ${updatedCount}/${temples.length} temple images.`);
}

updateTempleImages();
