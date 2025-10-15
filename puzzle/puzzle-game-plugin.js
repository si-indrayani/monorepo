// Puzzle Game Plugin - Uses global CoreGaming SDK from S3
// This file is deployed to: https://si-gaming-fantasy.s3.amazonaws.com/puzzle/puzzle-game-plugin.js
// It accesses window.CoreGaming exposed by the core SDK loaded separately

(function(window) {
    'use strict';

    // Check if CoreGaming SDK is available (loaded from separate S3 location)
    if (!window.CoreGaming || !window.CoreGaming.Game) {
        console.error('❌ CoreGaming.Game not found! Make sure core-gaming-sdk is loaded first from: https://si-gaming-fantasy.s3.amazonaws.com/core-gaming-sdk/index.js');
        return;
    }

    // Access the Game class exposed globally by core SDK
    const Game = window.CoreGaming.Game;

    // Concrete Puzzle Game implementation
    class PuzzleGame extends Game {
        constructor(baseUrl) {
            super('puzzle', baseUrl, '🧩');
        }

        getScriptsLoadedEvent() {
            return 'puzzle-scripts-loaded';
        }

        getGradient() {
            return 'linear-gradient(45deg, #4ecdc4, #44a08d)';
        }
    }

    // Register this game with the global registry (shared across all plugins)
    const puzzleGame = new PuzzleGame('https://si-gaming-fantasy.s3.amazonaws.com');
    window.CoreGaming.RegistryInstance.registerGame(puzzleGame);

    console.log('🧩 Puzzle game plugin loaded from S3 and registered globally!');
    console.log('Available games in registry:', window.CoreGaming.RegistryInstance.getAllGames().map(g => g.getName()));

})(window);
