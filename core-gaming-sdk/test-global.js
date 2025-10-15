// Test script to verify global exposure works
import '../dist/index.js';

// Wait a bit for the global exposure to happen
setTimeout(() => {
    console.log('Testing global exposure...');

    if (typeof window !== 'undefined' && window.CoreGaming) {
        console.log('✅ window.CoreGaming exists:', Object.keys(window.CoreGaming));

        if (window.CoreGaming.Game) {
            console.log('✅ Game class available globally');

            // Test creating a game instance
            class TestGame extends window.CoreGaming.Game {
                constructor() {
                    super('test', 'https://test.com', '🧪');
                }
                getScriptsLoadedEvent() { return 'test-scripts-loaded'; }
                getGradient() { return 'linear-gradient(45deg, #ff0000, #00ff00)'; }
            }

            const testGame = new TestGame();
            console.log('✅ Test game created:', testGame.getName());

            // Test registry
            if (window.CoreGaming.RegistryInstance) {
                window.CoreGaming.RegistryInstance.registerGame(testGame);
                const games = window.CoreGaming.RegistryInstance.getAllGames();
                console.log('✅ Games in registry:', games.map(g => g.getName()));
            } else {
                console.error('❌ RegistryInstance not available');
            }
        } else {
            console.error('❌ Game class not available globally');
        }
    } else {
        console.error('❌ window.CoreGaming not available');
    }
}, 100);
