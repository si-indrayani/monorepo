// Puzzle Game Plugin - Uses global CoreGaming SDK
(function(window) {
    'use strict';

    // Check if CoreGaming SDK is available
    if (!window.CoreGaming || !window.CoreGaming.Game) {
        console.error('❌ CoreGaming.Game not found! Make sure core-gaming-sdk is loaded first.');
        return;
    }

    // Option 1: Reference directly (more explicit)
    class PuzzleGame extends window.CoreGaming.Game {
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

    // Register this game with the global registry
    const puzzleGame = new PuzzleGame('https://si-gaming-fantasy.s3.amazonaws.com');
    window.CoreGaming.RegistryInstance.registerGame(puzzleGame);

    console.log('🧩 Puzzle game plugin loaded and registered!');

})(window);
