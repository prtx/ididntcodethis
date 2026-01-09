# Football Lineup Builder

A web-based tool for designing football (soccer) starting lineups by selecting players from the API-Football database.

## Features

- **Formation Selection**: Choose from popular formations (4-4-2, 4-3-3, 3-5-2, 4-2-3-1, 3-4-3, 4-5-1)
- **Player Selection**: Browse and select players from various leagues
- **Visual Pitch**: Interactive football pitch layout showing your formation
- **Save & Share**: Save lineups locally and share them via links
- **Export**: Export your lineup as an image

## API Configuration

This project uses the API-Football API (v3.football.api-sports.io). To use the API:

1. Get an API key from [API-Football](https://www.api-football.com/)
2. For local development, set the API key in localStorage:
   ```javascript
   localStorage.setItem('api_football_key', 'YOUR_API_KEY');
   ```
3. For production/GitHub Pages, configure the API key via:
   - GitHub Secrets (for serverless functions)
   - Environment variables
   - A proxy server

**Note**: The app includes mock data for demonstration purposes when the API key is not available.

## Usage

1. Select a league and season
2. Choose your preferred formation
3. Click "Load Players" to fetch player data
4. Click on any position on the pitch to select a player
5. Save, export, or share your lineup

## Project Structure

```
lineup-builder/
├── index.html      # Main application page
├── styles.css      # Styling
├── script.js       # Application logic
└── README.md       # This file
```

## Supported Leagues

- Premier League (39)
- La Liga (140)
- Bundesliga (78)
- Serie A (135)
- Ligue 1 (61)

## Browser Compatibility

Works in all modern browsers. Requires JavaScript enabled.

---

*This project was created entirely through AI collaboration as part of the "I Didn't Code This" repository.*

