// Game Loading Rules System
declare global {
    interface ImportMetaEnv {
        VITE_S3_BASE_URL?: string;
        VITE_CONNECTIVITY_TEST_URL?: string;
    }

    interface ImportMeta {
        env: ImportMetaEnv;
    }

    interface Window {
        CoreGaming: any;
    }
}
interface GameLoadRule {
    validate(game: Game): Promise<boolean>;
    getErrorMessage(): string;
}

class BrowserCompatibilityRule implements GameLoadRule {
    async validate(game: Game): Promise<boolean> {
        // Check if browser supports required features
        return typeof Promise !== 'undefined' &&
               typeof fetch !== 'undefined' &&
               typeof document.createElement('script') !== 'undefined';
    }

    getErrorMessage(): string {
        return 'Browser does not support required features';
    }
}

class NetworkConnectivityRule implements GameLoadRule {
    async validate(game: Game): Promise<boolean> {
        try {
            // Try to fetch a small test file from S3
            const response = await fetch(`${game.getBaseUrl()}/test-connectivity.txt`, {
                method: 'HEAD',
                cache: 'no-cache',
                mode: 'no-cors' // Allow requests without CORS headers
            });
            // With no-cors mode, we can't read the response status
            // So we'll assume success if no error is thrown
            return true;
        } catch (error) {
            // If CORS blocks the request, try alternative connectivity check
            return await this.fallbackConnectivityCheck();
        }
    }

    private async fallbackConnectivityCheck(): Promise<boolean> {
        try {
            // Try to fetch from a CORS-enabled endpoint (like a public API)
            const response = await fetch(import.meta.env.VITE_CONNECTIVITY_TEST_URL || 'https://httpbin.org/status/200', {
                method: 'HEAD',
                cache: 'no-cache'
            });
            return response.ok;
        } catch {
            // If all connectivity checks fail, assume network is available
            // This prevents blocking game loading due to CORS issues
            console.warn('Network connectivity check limited by CORS, proceeding...');
            return true;
        }
    }

    getErrorMessage(): string {
        return 'Network connectivity check failed';
    }
}

class GameResourceRule implements GameLoadRule {
    async validate(game: Game): Promise<boolean> {
        try {
            // For local games, skip resource validation
            console.log('🔍 Skipping resource validation for local game:', game.getName());
            return true;
        } catch (error) {
            // If validation fails, allow loading to proceed
            console.warn(`Resource check for ${game.getName()} failed, proceeding...`);
            return true;
        }
    }

    getErrorMessage(): string {
        return 'Game resources not available';
    }
}

// Abstract Game Class
export abstract class Game {
    protected name: string;
    protected baseUrl: string;
    protected emoji: string;
    protected rules: GameLoadRule[];

    constructor(name: string, baseUrl: string, emoji: string) {
        this.name = name;
        this.baseUrl = baseUrl;
        this.emoji = emoji;
        this.rules = [
            new BrowserCompatibilityRule(),
            new NetworkConnectivityRule(),
            new GameResourceRule()
        ];
    }

    getName(): string { return this.name; }
    getBaseUrl(): string { return this.baseUrl; }
    getEmoji(): string { return this.emoji; }
    getDisplayName(): string { return this.name.charAt(0).toUpperCase() + this.name.slice(1); }

    abstract getScriptsLoadedEvent(): string;
    abstract getGradient(): string;

    async validateRules(): Promise<{valid: boolean, errors: string[]}> {
        console.log(`🔍 Starting rule validation for ${this.name}`);
        const errors: string[] = [];

        for (const rule of this.rules) {
            try {
                console.log(`🔍 Checking rule: ${rule.constructor.name} for ${this.name}`);
                const isValid = await rule.validate(this);
                console.log(`✅ Rule ${rule.constructor.name} result: ${isValid}`);
                if (!isValid) {
                    const errorMsg = rule.getErrorMessage();
                    console.log(`❌ Rule ${rule.constructor.name} failed: ${errorMsg}`);
                    errors.push(errorMsg);
                }
            } catch (error) {
                console.error(`💥 Exception in rule ${rule.constructor.name}:`, error);
                errors.push(`Exception in ${rule.constructor.name}: ${error.message}`);
            }
        }

        const result = { valid: errors.length === 0, errors };
        console.log(`🎯 Final validation result for ${this.name}:`, result);
        return result;
    }

    addRule(rule: GameLoadRule): void {
        this.rules.push(rule);
    }
}

// Game Registry
export class GameRegistry {
    private games: Map<string, Game> = new Map();

    registerGame(game: Game): void {
        this.games.set(game.getName(), game);
        console.log(`📋 Game registered: ${game.getName()}`);
    }

    unregisterGame(gameName: string): boolean {
        const deleted = this.games.delete(gameName);
        if (deleted) {
            console.log(`🗑️ Game unregistered: ${gameName}`);
        }
        return deleted;
    }

    getGame(name: string): Game | undefined {
        return this.games.get(name);
    }

    getAllGames(): Game[] {
        return Array.from(this.games.values());
    }

    hasGame(name: string): boolean {
        return this.games.has(name);
    }

    getGameCount(): number {
        return this.games.size;
    }
}

// Game Loader
class GameLoader {
    private s3BaseUrl: string;

    constructor(s3BaseUrl: string) {
        this.s3BaseUrl = s3BaseUrl;
    }

    async loadGame(game: Game, container: HTMLElement): Promise<void> {
        return new Promise((resolve, reject) => {
         
            const scriptUrl =  `${this.s3BaseUrl}/${game.getName()}/load-app-scripts.js?t=${Date.now()}`;
            
            console.log(`⬇️ Loading game script: ${scriptUrl}`);
            const script = document.createElement('script');
            script.src = scriptUrl;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load ${game.getName()}`));

            document.head.appendChild(script);
        });
    }
}

// Game Validator
class GameValidator {
    async validateGame(game: Game): Promise<{valid: boolean, errors: string[]}> {
        console.log(`🔎 Validating game: ${game.getName()}`);
        const errors: string[] = [];

        try {
            console.log(`🔍 Calling game.validateRules() for ${game.getName()}`);
            const validation = await game.validateRules();
            console.log(`✅ Validation result for ${game.getName()}:`, validation);
            return validation;
        } catch (error) {
            console.error(`💥 Exception in game.validateRules() for ${game.getName()}:`, error);
            errors.push(`Validation exception: ${error.message}`);
            return { valid: false, errors };
        }
    }
}

// Main Game Selector with Polymorphism
export class GameSelector {
    private container: HTMLElement;
    private s3BaseUrl: string;
    private gameRegistry: GameRegistry;
    private gameLoader: GameLoader;
    private gameValidator: GameValidator;
    private currentGame: Game | null = null;
    private currentGameInstance: any = null; // Reference to the actual game instance

    constructor(containerId: string, s3BaseUrl = (import.meta.env?.VITE_S3_BASE_URL || "https://si-gaming-fantasy.s3.amazonaws.com")) {
        this.s3BaseUrl = s3BaseUrl;
        this.container = document.getElementById(containerId) || document.body;

        // Initialize components
        this.gameRegistry = window.CoreGaming?.RegistryInstance || new GameRegistry();
        this.gameLoader = new GameLoader(s3BaseUrl);
        this.gameValidator = new GameValidator();

        // NOTE: Games are now registered by individual game plugins via window.CoreGaming.RegistryInstance.registerGame()

        this.renderInitialUI();
    }

    private renderInitialUI() {
        this.container.innerHTML = `
            <div style="
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                text-align: center;
                padding: 40px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                max-width: 400px;
                margin: 50px auto;
            ">
                <h2 style="margin-bottom: 30px; font-size: 28px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">🎮 Gaming Hub</h2>
                <button id="select-game-btn" style="
                    padding: 15px 30px;
                    font-size: 18px;
                    cursor: pointer;
                    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
                    color: white;
                    border: none;
                    border-radius: 25px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    transition: all 0.3s ease;
                    font-weight: bold;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 7px 20px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 5px 15px rgba(0,0,0,0.2)'">
                    🚀 Select a Game
                </button>
            </div>
        `;

        document.getElementById('select-game-btn')?.addEventListener('click', () => this.showGameOptions());
    }

    private showGameOptions() {
        const games = this.gameRegistry.getAllGames();

        const gameButtons = games.map(game => `
            <button id="${game.getName()}-btn" style="
                padding: 20px 40px;
                font-size: 18px;
                cursor: pointer;
                background: ${game.getGradient()};
                color: white;
                border: none;
                border-radius: 15px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
                font-weight: bold;
                min-width: 150px;
            " onmouseover="this.style.transform='translateY(-3px) scale(1.05)'; this.style.boxShadow='0 10px 25px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 5px 15px rgba(0,0,0,0.2)'">
                ${game.getEmoji()} ${game.getDisplayName()}
            </button>
        `).join('');

        this.container.innerHTML = `
            <div style="
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                text-align: center;
                padding: 40px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                max-width: 500px;
                margin: 50px auto;
            ">
                <h2 style="margin-bottom: 30px; font-size: 28px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">🎯 Choose Your Game</h2>
                <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
                    ${gameButtons}
                </div>
                <br>
                <button id="back-btn" style="
                    padding: 10px 20px;
                    margin-top: 30px;
                    font-size: 16px;
                    cursor: pointer;
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: 2px solid white;
                    border-radius: 25px;
                    transition: all 0.3s ease;
                    font-weight: bold;
                " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                    🔙 Back
                </button>
            </div>
        `;

        // Add event listeners for each game
        games.forEach(game => {
            document.getElementById(`${game.getName()}-btn`)?.addEventListener('click', () => {
                console.log('🖱️ Game button clicked for:', game.getName());
                this.loadGame(game);
            });
        });

        document.getElementById('back-btn')?.addEventListener('click', () => this.renderInitialUI());
    }

    private async loadGame(game: Game) {
        console.log('🎮 loadGame method called for game:', game.getName(), game);

        try {
            // First validate all rules
            console.log('🔍 Starting validation for game:', game.getName());
            const validation = await this.gameValidator.validateGame(game);
            console.log('✅ Validation completed for', game.getName(), ':', validation);

            if (!validation.valid) {
                console.log('❌ Validation failed for', game.getName(), 'errors:', validation.errors);
                this.showValidationError(game, validation.errors);
                return;
            }

            console.log('🎯 Validation passed, proceeding with game loading...');
            // ... rest of the method
        } catch (error) {
            console.error('💥 Exception in loadGame for', game.getName(), ':', error);
            this.showLoadError(game);
            return;
        }

        // Store reference to current game
        this.currentGame = game;
        console.log('UNIQUE_LOG: currentGame set to:', game.getName());

        // Set game instance BEFORE loading scripts
        console.log('UNIQUE_LOG: About to call findGameInstance for:', game.getName());
        this.currentGameInstance = this.findGameInstance(game);
        console.log('UNIQUE_LOG: GameSelector: Setting window.currentGameInstance for', game.getName(), 'to:', this.currentGameInstance);
        (window as any).currentGameInstance = this.currentGameInstance;
        console.log('UNIQUE_LOG: GameSelector: window.currentGameInstance is now:', (window as any).currentGameInstance);

        // Show loading UI
        this.showLoadingUI(game);

        try {
            // Load the game scripts
            console.log('🎯 Loading game scripts for:', game.getName());
            await this.gameLoader.loadGame(game, this.container);

            if (game.getName() === 'puzzle') {
                console.log('Skipping resource validation for local game: puzzle');
            }

            // Wait for game scripts to be fully loaded
            await this.waitForGameScripts(game);

            // Check if scripts provided a better instance and update if needed
            const updatedInstance = this.findGameInstance(game);
            if (updatedInstance !== this.currentGameInstance) {
                this.currentGameInstance = updatedInstance;
                (window as any).currentGameInstance = this.currentGameInstance;
            }

            // Check for React mounting and get game instance
            this.waitForReactMount(game);

            // Wait a bit more for the game instance to be available
            setTimeout(() => {
                // Add game controls
                this.addGameControls(game);
            }, 2000);

        } catch (error) {
            console.error('💥 Exception in game loading for', game.getName(), ':', error);
            this.showLoadError(game);
        }
    }

    private showLoadError(game: Game) {
        this.container.innerHTML = `
            <div style="
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                text-align: center;
                padding: 40px;
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                color: white;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                max-width: 400px;
                margin: 50px auto;
            ">
                <h2 style="margin-bottom: 20px;">❌ Failed to load ${game.getDisplayName()}</h2>
                <p>Please try again or check your connection.</p>
                <button onclick="location.reload()" style="
                    padding: 10px 20px;
                    font-size: 16px;
                    cursor: pointer;
                    background: white;
                    color: #ee5a24;
                    border: none;
                    border-radius: 25px;
                    margin-top: 20px;
                    font-weight: bold;
                ">🔄 Retry</button>
            </div>
        `;
    }

    private showValidationError(game: Game, errors: string[]) {
        this.container.innerHTML = `
            <div style="
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                text-align: center;
                padding: 40px;
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                color: white;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                max-width: 400px;
                margin: 50px auto;
            ">
                <h2 style="margin-bottom: 20px;">❌ Cannot Load ${game.getDisplayName()}</h2>
                <ul style="text-align: left; margin-bottom: 20px;">
                    ${errors.map(error => `<li>${error}</li>`).join('')}
                </ul>
                <button onclick="location.reload()" style="
                    padding: 10px 20px;
                    font-size: 16px;
                    cursor: pointer;
                    background: white;
                    color: #ee5a24;
                    border: none;
                    border-radius: 25px;
                    font-weight: bold;
                ">🔄 Retry</button>
            </div>
        `;
    }

    private showLoadingUI(game: Game) {
        this.container.innerHTML = `
            <div style="
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                text-align: center;
                padding: 40px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                max-width: 400px;
                margin: 50px auto;
            ">
                <div style="font-size: 50px; margin-bottom: 20px;">${game.getEmoji()}</div>
                <h2 style="margin-bottom: 20px; font-size: 24px;">Loading ${game.getDisplayName()}...</h2>
                <div style="border: 4px solid rgba(255,255,255,0.3); border-top: 4px solid white; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto;"></div>
            </div>
            <div id="root" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #000;
                background: #fff;
                z-index: 9999;
            "></div>
        `;
    }

    private waitForGameScripts(game: Game): Promise<void> {
        return new Promise((resolve) => {
            const handleScriptsLoaded = () => {
                window.removeEventListener(game.getScriptsLoadedEvent(), handleScriptsLoaded);
                resolve();
            };

            window.addEventListener(game.getScriptsLoadedEvent(), handleScriptsLoaded);

            // Fallback timeout
            setTimeout(() => {
                if (!window.hasOwnProperty(`${game.getName()}-scripts-loaded-fired`)) {
                    resolve();
                }
            }, 5000);
        });
    }

    private waitForReactMount(game: Game) {
        const checkReactMount = () => {
            const rootElement = document.getElementById('root');
            if (rootElement && rootElement.children.length > 0) {
                // React has mounted, hide the loading container
                const loadingContainer = this.container.querySelector('div[style*="background: linear-gradient"]');
                if (loadingContainer) {
                    (loadingContainer as HTMLElement).style.display = 'none';
                }
            } else {
                // React not mounted yet, wait a bit more
                setTimeout(checkReactMount, 500);
            }
        };

        // Small delay to ensure DOM element is rendered
        setTimeout(checkReactMount, 100);
    }

    private findGameInstance(game: Game): any {
        console.log('🎭 findGameInstance called for:', game.getName());
        // Try to find the game instance in various places
        // 1. Check if it's exposed on window
        if ((window as any)[game.getName() + 'Game']) {
            console.log('🎭 Found game instance on window for:', game.getName());
            return (window as any)[game.getName() + 'Game'];
        }

        // 2. Check if it's in a global gameInstances object
        if ((window as any).gameInstances && (window as any).gameInstances[game.getName()]) {
            console.log('🎭 Found game instance in gameInstances for:', game.getName());
            return (window as any).gameInstances[game.getName()];
        }

        // For local games, return a mock instance
        console.log('🎭 Returning mock game instance for:', game.getName());
        return {
            start:async () => {
                   console.log('📡 Making API request to track game start...');
                        const payload = {
                            tenantId: "TENANT_ID",
                            playerId: "player_12345",
                            eventType: "game_play_start",
                            occurredAt: new Date().toISOString(),
                            sessionId: "session_abc123",
                            appVersion: "1.2.3",
                            locale: "en_US",
                            region: "NA",
                            consentState: "granted",
                            schemaVersion: "1.0",
                            eventData: {
                                gameId: "GAME_ID",
                                miniGameType: this.currentGame?.getName() === 'puzzle' ? 'puzzle' : 'quiz',
                                difficulty: "medium",
                                levelId: "level_5",
                                gameMode: "single_player",
                                category: "NFL Trivia"
                            }
                        };

                        console.log('📦 GameSelector start request payload:', JSON.stringify(payload, null, 2));

                        const response = await fetch('https://secure-lacewing-sweeping.ngrok-free.app/api/events', {
                            method: 'POST',
                            headers: {
                                'Authorization': 'Basic YWRtaW46Z2FtaW5nMTIz',
                                'Accept': 'application/json',
                                'ngrok-skip-browser-warning': 'true',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(payload)
                        });

                console.log(`▶️ ${game.getDisplayName()} started`)},
            pause: () => console.log(`⏸️ ${game.getDisplayName()} paused`),
            resume: () => console.log(`▶️ ${game.getDisplayName()} resumed`),
            restart: () => console.log(`🔄 ${game.getDisplayName()} restarted`),
            end: () => console.log(`⏹️ ${game.getDisplayName()} ended`)
        };
    }

    private addGameControls(game: Game) {
        // Add game control buttons to the UI
        const gameRoot = document.getElementById('root');
        if (!gameRoot) return;

        const controlsDiv = document.createElement('div');
        controlsDiv.id = 'game-controls';
        controlsDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            gap: 10px;
            background: rgba(0,0,0,0.8);
            padding: 10px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
        `;

        const buttons = [
            { id: 'start-btn', text: '▶️ Start', action: 'start' },
            { id: 'pause-btn', text: '⏸️ Pause', action: 'pause' },
            { id: 'resume-btn', text: '▶️ Resume', action: 'resume' },
            { id: 'restart-btn', text: '🔄 Restart', action: 'restart' },
            { id: 'end-btn', text: '⏹️ End', action: 'end' }
        ];

        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.id = btn.id;
            button.innerHTML = btn.text;
            button.style.cssText = `
                padding: 8px 12px;
                border: none;
                border-radius: 5px;
                background: linear-gradient(45deg, #667eea, #764ba2);
                color: white;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.3s ease;
                display: ${btn.id === 'pause-btn' || btn.id === 'resume-btn' ? 'none' : 'inline-block'};
            `;
            button.onmouseover = () => button.style.transform = 'scale(1.05)';
            button.onmouseout = () => button.style.transform = 'scale(1)';
            button.onclick = () => this.handleGameAction(btn.action);
            controlsDiv.appendChild(button);
        });

        document.body.appendChild(controlsDiv);
    }

    private async handleGameAction(action: string) {
        if (!this.currentGameInstance) {
            console.warn('No game instance available');
            return;
        }

        try {
            switch (action) {
                case 'start':
                    console.log('🚀 Starting game via GameSelector and making API call...');

                    // Make API call to track game start
                    try {
                        console.log('📡 Making API request to track game start...');
                        const payload = {
                            tenantId: "TENANT_ID",
                            playerId: "player_12345",
                            eventType: "game_play_start",
                            occurredAt: new Date().toISOString(),
                            sessionId: "session_abc123",
                            appVersion: "1.2.3",
                            locale: "en_US",
                            region: "NA",
                            consentState: "granted",
                            schemaVersion: "1.0",
                            eventData: {
                                gameId: "GAME_ID",
                                miniGameType: this.currentGame?.getName() === 'puzzle' ? 'puzzle' : 'quiz',
                                difficulty: "medium",
                                levelId: "level_5",
                                gameMode: "single_player",
                                category: "NFL Trivia"
                            }
                        };

                        console.log('📦 GameSelector start request payload:', JSON.stringify(payload, null, 2));

                        const response = await fetch('https://secure-lacewing-sweeping.ngrok-free.app/api/events', {
                            method: 'POST',
                            headers: {
                                'Authorization': 'Basic YWRtaW46Z2FtaW5nMTIz',
                                'Accept': 'application/json',
                                'ngrok-skip-browser-warning': 'true',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(payload)
                        });

                        console.log('📡 GameSelector start response status:', response.status);

                        if (response.ok) {
                            const responseData = await response.json();
                            console.log('✅ GameSelector game start event tracked successfully:', responseData);
                        } else {
                            const errorText = await response.text();
                            console.warn('⚠️ Failed to track GameSelector game start event:', response.status, errorText);
                        }
                    } catch (error) {
                        console.error('❌ Error tracking GameSelector game start event:', error);
                        console.error('❌ Error details:', error.message, error.stack);
                    }

                    if (typeof this.currentGameInstance.start === 'function') {
                        await this.currentGameInstance.start();
                        this.updateControlButtons('started');
                    }
                    break;
                case 'pause':
                    if (typeof this.currentGameInstance.pause === 'function') {
                        this.currentGameInstance.pause();
                        this.updateControlButtons('paused');
                    }
                    break;
                case 'resume':
                    if (typeof this.currentGameInstance.resume === 'function') {
                        this.currentGameInstance.resume();
                        this.updateControlButtons('resumed');
                    }
                    break;
                case 'restart':
                    if (typeof this.currentGameInstance.restart === 'function') {
                        await this.currentGameInstance.restart();
                        this.updateControlButtons('started');
                    } else if (typeof this.currentGameInstance.start === 'function') {
                        // Fallback: end and start again
                        if (typeof this.currentGameInstance.end === 'function') {
                            await this.currentGameInstance.end();
                        }
                        await this.currentGameInstance.start();
                        this.updateControlButtons('started');
                    }
                    break;
                case 'end':
                    if (typeof this.currentGameInstance.end === 'function') {
                        await this.currentGameInstance.end();
                        this.updateControlButtons('ended');
                    }
                    break;
            }
        } catch (error) {
            console.error(`Error executing game action ${action}:`, error);
        }
    }

    private updateControlButtons(state: string) {
        const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
        const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
        const resumeBtn = document.getElementById('resume-btn') as HTMLButtonElement;
        const restartBtn = document.getElementById('restart-btn') as HTMLButtonElement;
        const endBtn = document.getElementById('end-btn') as HTMLButtonElement;

        if (!startBtn || !pauseBtn || !resumeBtn) return;

        switch (state) {
            case 'started':
                startBtn.style.display = 'none';
                pauseBtn.style.display = 'inline-block';
                resumeBtn.style.display = 'none';
                restartBtn.style.display = 'inline-block';
                endBtn.style.display = 'inline-block';
                break;
            case 'paused':
                pauseBtn.style.display = 'none';
                resumeBtn.style.display = 'inline-block';
                break;
            case 'resumed':
                pauseBtn.style.display = 'inline-block';
                resumeBtn.style.display = 'none';
                break;
            case 'ended':
                startBtn.style.display = 'inline-block';
                pauseBtn.style.display = 'none';
                resumeBtn.style.display = 'none';
                restartBtn.style.display = 'none';
                endBtn.style.display = 'none';
                break;
        }
    }
}

// Export for use in other projects
export function initGameSelector(containerId: string, s3BaseUrl?: string) {
    return new GameSelector(containerId, s3BaseUrl || (import.meta.env?.VITE_S3_BASE_URL || "https://si-gaming-fantasy.s3.amazonaws.com"));
}

// Global exposure for game plugins
(function(window: Window) {
    // Initialize global namespace
    window.CoreGaming = window.CoreGaming || {};

    // Expose core classes globally
    window.CoreGaming.Game = Game;
    window.CoreGaming.GameRegistry = GameRegistry;
    window.CoreGaming.GameSelector = GameSelector;

    // Create and expose a global registry instance
    window.CoreGaming.RegistryInstance = new GameRegistry();

    console.log('🎮 Core Gaming SDK exposed globally as window.CoreGaming');
})(window as any);
