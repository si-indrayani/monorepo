// Trivia Game Plugin - Uses global CoreGaming SDK
(function(window) {
    'use strict';

    // Check if CoreGaming SDK is available
    if (!window.CoreGaming || !window.CoreGaming.Game) {
        console.error('❌ CoreGaming.Game not found! Make sure core-gaming-sdk is loaded first.');
        return;
    }

    // Option 1: Reference directly (more explicit)
    class TriviaGame extends window.CoreGaming.Game {
        constructor(baseUrl) {
            super('trivia', baseUrl, '❓');
        }

        getScriptsLoadedEvent() {
            return 'trivia-scripts-loaded';
        }

        getGradient() {
            return 'linear-gradient(45deg, #ffd93d, #ff8c42)';
        }
    }

    // Register this game with the global registry
    const triviaGame = new TriviaGame('https://si-gaming-fantasy.s3.amazonaws.com');
    window.CoreGaming.RegistryInstance.registerGame(triviaGame);

    console.log('🧠 Trivia game plugin loaded and registered!');

})(window);
