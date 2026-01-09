// Football Lineup Builder Script

const API_BASE_URL = 'https://v3.football.api-sports.io';
let apiKey = '';
let currentPlayers = [];
let currentLineup = {};
let currentFormation = '4-4-2';
let currentLeague = '39';
let currentSeason = '2024';

// Formation configurations: [defenders, midfielders, forwards]
const formations = {
    '4-4-2': { defenders: 4, midfielders: 4, forwards: 2, layout: [1, 4, 4, 2] },
    '4-3-3': { defenders: 4, midfielders: 3, forwards: 3, layout: [1, 4, 3, 3] },
    '3-5-2': { defenders: 3, midfielders: 5, forwards: 2, layout: [1, 3, 5, 2] },
    '4-2-3-1': { defenders: 4, midfielders: 5, forwards: 1, layout: [1, 4, 2, 3, 1] },
    '3-4-3': { defenders: 3, midfielders: 4, forwards: 3, layout: [1, 3, 4, 3] },
    '4-5-1': { defenders: 4, midfielders: 5, forwards: 1, layout: [1, 4, 5, 1] }
};

const positions = {
    'GK': 'Goalkeeper',
    'DEF': 'Defender',
    'MID': 'Midfielder',
    'FWD': 'Forward'
};

// Get API key from environment or use placeholder
async function getApiKey() {
    // In production, this would come from environment variables
    // For GitHub Pages, we'll need to use a proxy or client-side approach
    // For now, we'll use a placeholder that can be configured
    if (typeof process !== 'undefined' && process.env && process.env.API_FOOTBALL_KEY) {
        return process.env.API_FOOTBALL_KEY;
    }
    // For client-side, we'll need to use a serverless function or proxy
    // This is a placeholder - in production, you'd set this via GitHub Secrets
    return localStorage.getItem('api_football_key') || '';
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('formationSelect').addEventListener('change', (e) => {
        currentFormation = e.target.value;
        renderPitch();
    });
    
    renderPitch();
    loadSavedLineups();
});

// Render the football pitch with formation
function renderPitch() {
    const pitch = document.getElementById('pitch');
    const positionsGrid = document.getElementById('positionsGrid');
    positionsGrid.innerHTML = '';
    
    currentFormation = document.getElementById('formationSelect').value;
    const formation = formations[currentFormation];
    const layout = formation.layout;
    
    // Create position slots based on formation
    let positionIndex = 0;
    const positionNames = ['GK', 'DEF', 'MID', 'FWD'];
    
    layout.forEach((count, rowIndex) => {
        const row = document.createElement('div');
        row.style.gridColumn = '1 / -1';
        row.style.gridRow = `${rowIndex + 1} / ${rowIndex + 2}`;
        row.style.display = 'grid';
        row.style.gridTemplateColumns = `repeat(${count}, 1fr)`;
        row.style.gap = '10px';
        
        for (let i = 0; i < count; i++) {
            const slot = document.createElement('div');
            slot.className = 'position-slot';
            const posType = positionNames[Math.min(rowIndex, positionNames.length - 1)];
            slot.dataset.position = `${posType}-${positionIndex}`;
            slot.dataset.positionType = posType;
            
            const label = document.createElement('div');
            label.className = 'position-label';
            label.textContent = posType;
            
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card empty';
            playerCard.id = `player-${positionIndex}`;
            
            const playerName = document.createElement('div');
            playerName.className = 'player-name';
            playerName.textContent = 'Click to select';
            
            playerCard.appendChild(playerName);
            slot.appendChild(label);
            slot.appendChild(playerCard);
            
            slot.addEventListener('click', () => selectPosition(positionIndex, posType));
            
            row.appendChild(slot);
            positionIndex++;
        }
        
        positionsGrid.appendChild(row);
    });
    
    // Clear current lineup when formation changes
    currentLineup = {};
}

// Select a position to fill
function selectPosition(index, positionType) {
    if (currentPlayers.length === 0) {
        alert('Please load players first!');
        return;
    }
    
    document.getElementById('selectedPosition').textContent = positions[positionType] || positionType;
    document.getElementById('playersPanel').style.display = 'block';
    
    // Filter players by position type
    const filteredPlayers = currentPlayers.filter(player => {
        const pos = player.position || '';
        if (positionType === 'GK') return pos.includes('Goalkeeper');
        if (positionType === 'DEF') return pos.includes('Defender');
        if (positionType === 'MID') return pos.includes('Midfielder');
        if (positionType === 'FWD') return pos.includes('Attacker') || pos.includes('Forward');
        return true;
    });
    
    displayPlayers(filteredPlayers, index);
}

// Display list of players
function displayPlayers(players, positionIndex) {
    const playersList = document.getElementById('playersList');
    playersList.innerHTML = '';
    
    if (players.length === 0) {
        playersList.innerHTML = '<p>No players found for this position.</p>';
        return;
    }
    
    players.forEach(player => {
        const item = document.createElement('div');
        item.className = 'player-item';
        item.innerHTML = `
            <img src="${player.photo || 'https://via.placeholder.com/50'}" 
                 alt="${player.name}" 
                 class="player-item-photo"
                 onerror="this.src='https://via.placeholder.com/50'">
            <div class="player-item-info">
                <div class="player-item-name">${player.name}</div>
                <div class="player-item-position">${player.position || 'Player'}</div>
            </div>
        `;
        
        item.addEventListener('click', () => assignPlayer(player, positionIndex));
        playersList.appendChild(item);
    });
}

// Assign player to position
function assignPlayer(player, positionIndex) {
    currentLineup[positionIndex] = player;
    updatePlayerCard(positionIndex, player);
    document.getElementById('playersPanel').style.display = 'none';
}

// Update player card on pitch
function updatePlayerCard(positionIndex, player) {
    const card = document.getElementById(`player-${positionIndex}`);
    if (!card) return;
    
    card.className = 'player-card';
    card.innerHTML = `
        ${player.photo ? `<img src="${player.photo}" alt="${player.name}" class="player-photo" onerror="this.style.display='none'">` : ''}
        <div class="player-name">${player.name}</div>
    `;
}

// Load players from API
async function loadPlayers() {
    const leagueSelect = document.getElementById('leagueSelect');
    const seasonSelect = document.getElementById('seasonSelect');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    
    currentLeague = leagueSelect.value;
    currentSeason = seasonSelect.value;
    
    loading.style.display = 'block';
    error.style.display = 'none';
    
    try {
        apiKey = await getApiKey();
        
        if (!apiKey) {
            throw new Error('API key not configured. Please set API_FOOTBALL_KEY in environment variables or localStorage.');
        }
        
        // Fetch players from API
        const response = await fetch(`${API_BASE_URL}/players?league=${currentLeague}&season=${currentSeason}`, {
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'v3.football.api-sports.io'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.errors && data.errors.length > 0) {
            throw new Error(data.errors[0].message || 'API Error');
        }
        
        // Process players data
        currentPlayers = (data.response || []).map(item => ({
            id: item.player.id,
            name: item.player.name,
            photo: item.player.photo,
            position: item.statistics[0]?.games?.position || 'Player',
            team: item.statistics[0]?.team?.name || 'Unknown'
        }));
        
        loading.style.display = 'none';
        
        if (currentPlayers.length === 0) {
            error.textContent = 'No players found. Try a different league or season.';
            error.style.display = 'block';
        } else {
            alert(`Loaded ${currentPlayers.length} players!`);
        }
        
    } catch (err) {
        loading.style.display = 'none';
        error.textContent = `Error loading players: ${err.message}. Note: API key must be configured. For testing, you can use mock data.`;
        error.style.display = 'block';
        
        // Fallback to mock data for demonstration
        console.log('Using mock data for demonstration');
        currentPlayers = generateMockPlayers();
    }
}

// Generate mock players for demonstration
function generateMockPlayers() {
    const mockPlayers = [];
    const names = [
        'Lionel Messi', 'Cristiano Ronaldo', 'Kylian Mbappé', 'Erling Haaland',
        'Kevin De Bruyne', 'Mohamed Salah', 'Virgil van Dijk', 'Manuel Neuer',
        'Luka Modrić', 'Neymar Jr', 'Robert Lewandowski', 'Karim Benzema',
        'Sadio Mané', 'Son Heung-min', 'Harry Kane', 'Bruno Fernandes',
        'Joshua Kimmich', 'Toni Kroos', 'Sergio Ramos', 'Marcelo',
        'Thiago Silva', 'Casemiro', 'Paul Pogba', 'Eden Hazard',
        'Antoine Griezmann', 'Luis Suárez', 'Gareth Bale', 'Eden Hazard'
    ];
    
    const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'];
    
    names.forEach((name, index) => {
        mockPlayers.push({
            id: index + 1,
            name: name,
            photo: `https://via.placeholder.com/50?text=${name.split(' ')[0][0]}${name.split(' ')[1] ? name.split(' ')[1][0] : ''}`,
            position: positions[Math.floor(Math.random() * positions.length)],
            team: 'Team ' + (Math.floor(index / 4) + 1)
        });
    });
    
    return mockPlayers;
}

// Save lineup
function saveLineup() {
    if (Object.keys(currentLineup).length === 0) {
        alert('Please create a lineup first!');
        return;
    }
    
    const name = prompt('Enter a name for this lineup:');
    if (!name) return;
    
    const lineupData = {
        name: name,
        formation: currentFormation,
        league: currentLeague,
        season: currentSeason,
        players: currentLineup,
        createdAt: new Date().toISOString()
    };
    
    const saved = JSON.parse(localStorage.getItem('savedLineups') || '[]');
    saved.push(lineupData);
    localStorage.setItem('savedLineups', JSON.stringify(saved));
    
    alert('Lineup saved!');
    loadSavedLineups();
}

// Load saved lineups
function loadSavedLineups() {
    const saved = JSON.parse(localStorage.getItem('savedLineups') || '[]');
    const savedSection = document.getElementById('savedLineups');
    const savedList = document.getElementById('savedList');
    
    if (saved.length === 0) {
        savedSection.style.display = 'none';
        return;
    }
    
    savedSection.style.display = 'block';
    savedList.innerHTML = '';
    
    saved.forEach((lineup, index) => {
        const item = document.createElement('div');
        item.className = 'saved-lineup-item';
        item.innerHTML = `
            <div class="saved-lineup-info">
                <div class="saved-lineup-name">${lineup.name}</div>
                <div class="saved-lineup-details">${lineup.formation} • ${lineup.league} • ${lineup.season}</div>
            </div>
            <div class="saved-lineup-actions">
                <button class="action-btn btn-small" onclick="loadSavedLineup(${index})">Load</button>
                <button class="action-btn btn-small" onclick="deleteSavedLineup(${index})">Delete</button>
            </div>
        `;
        savedList.appendChild(item);
    });
}

// Load a saved lineup
function loadSavedLineup(index) {
    const saved = JSON.parse(localStorage.getItem('savedLineups') || '[]');
    if (!saved[index]) return;
    
    const lineup = saved[index];
    currentFormation = lineup.formation;
    currentLineup = lineup.players;
    
    document.getElementById('formationSelect').value = currentFormation;
    document.getElementById('leagueSelect').value = lineup.league;
    document.getElementById('seasonSelect').value = lineup.season;
    
    renderPitch();
    
    // Restore players
    Object.keys(currentLineup).forEach(positionIndex => {
        updatePlayerCard(parseInt(positionIndex), currentLineup[positionIndex]);
    });
    
    alert('Lineup loaded!');
}

// Delete saved lineup
function deleteSavedLineup(index) {
    if (!confirm('Delete this lineup?')) return;
    
    const saved = JSON.parse(localStorage.getItem('savedLineups') || '[]');
    saved.splice(index, 1);
    localStorage.setItem('savedLineups', JSON.stringify(saved));
    
    loadSavedLineups();
}

// Export lineup as image
function exportLineup() {
    const pitch = document.getElementById('pitch');
    
    html2canvas(pitch, {
        backgroundColor: null,
        scale: 2
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `lineup-${currentFormation}-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }).catch(err => {
        alert('Error exporting image. Make sure html2canvas library is loaded.');
        console.error(err);
    });
}

// Share lineup
function shareLineup() {
    const lineupData = {
        formation: currentFormation,
        players: currentLineup
    };
    
    const encoded = btoa(JSON.stringify(lineupData));
    const url = `${window.location.origin}${window.location.pathname}?lineup=${encoded}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'My Football Lineup',
            text: `Check out my ${currentFormation} lineup!`,
            url: url
        });
    } else {
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copied to clipboard!');
        }).catch(() => {
            prompt('Copy this link:', url);
        });
    }
}

// Clear lineup
function clearLineup() {
    if (!confirm('Clear all players from the lineup?')) return;
    
    currentLineup = {};
    renderPitch();
}

// Load lineup from URL parameter
window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search);
    const lineupParam = params.get('lineup');
    
    if (lineupParam) {
        try {
            const lineupData = JSON.parse(atob(lineupParam));
            currentFormation = lineupData.formation;
            currentLineup = lineupData.players;
            
            document.getElementById('formationSelect').value = currentFormation;
            renderPitch();
            
            Object.keys(currentLineup).forEach(positionIndex => {
                updatePlayerCard(parseInt(positionIndex), currentLineup[positionIndex]);
            });
        } catch (err) {
            console.error('Error loading lineup from URL:', err);
        }
    }
});

