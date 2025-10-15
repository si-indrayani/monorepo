// Production Bootstrap with Dynamic Game Loading
// This could be hosted at: https://si-gaming-fantasy.s3.amazonaws.com/bootstrap.js

(async function() {
    const S3_BASE_URL = 'https://si-gaming-fantasy.s3.amazonaws.com';

    // Load script utility
    function loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    try {
        // Step 1: Load Core SDK
        console.log('📦 Loading Core Gaming SDK...');
        await loadScript(`${S3_BASE_URL}/core-gaming-sdk/index.js`);

        // Step 2: Load game configuration (could be from API)
        // For now, hardcoded - in production this could be from a config file or API
        const availableGames = ['puzzle', 'trivia'];

        // Step 3: Load all game plugins in parallel
        console.log('🎯 Loading game plugins...');
        const pluginPromises = availableGames.map(gameName =>
            loadScript(`${S3_BASE_URL}/${gameName}/${gameName}-game-plugin.js`)
        );

        await Promise.all(pluginPromises);
        console.log('✅ All plugins loaded. Games registered:', window.CoreGaming.RegistryInstance.getAllGames().map(g => g.getName()));

        // Step 4: Initialize GameSelector
        const gameSelector = new window.CoreGaming.GameSelector('game-container', S3_BASE_URL);

        // Optional: Dispatch event to notify other parts of the app
        window.dispatchEvent(new CustomEvent('gaming-hub-ready', {
            detail: { games: window.CoreGaming.RegistryInstance.getAllGames() }
        }));

    } catch (error) {
        console.error('❌ Bootstrap failed:', error);
        window.dispatchEvent(new CustomEvent('gaming-hub-error', { detail: error }));
    }
})();
