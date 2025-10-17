# Quiz-IQ Frontend Game Loading Flow Documentation

## Overview
This document describes the end-to-end flow of how games are loaded and executed in the Quiz-IQ Frontend application, starting from the entry point (`test.html`) through the Core Gaming SDK (`GameSelector`), and integrating with game plugins.

## Architecture Components
- **test.html**: Entry point HTML file that initializes the Core Gaming SDK.
- **Core Gaming SDK**: Contains `GameSelector`, `GameRegistry`, `GameLoader`, etc., responsible for game discovery, validation, loading, and management.
- **Game Plugins**: Individual game modules (e.g., puzzle, trivia) that register themselves and provide game logic.
- **S3 Hosting**: Games are hosted on AWS S3, with scripts loaded dynamically.

## Flow Diagram
```
test.html
    ↓
Load Core Gaming SDK Scripts
    ↓
GameSelector Constructor
    ↓
Render Initial UI (Gaming Hub)
    ↓
User Clicks "Select a Game"
    ↓
Show Game Options (from Registry)
    ↓
User Selects a Game (e.g., Trivia)
    ↓
loadGame() Method
    ↓
Validate Game Rules
    ↓
Load Game Scripts from S3
    ↓
Wait for Scripts Loaded
    ↓
Find/Create Game Instance
    ↓
Set window.currentGameInstance
    ↓
React App Mounts (waits for instance)
    ↓
Add Game Controls
    ↓
Game Ready for Play
```

## Detailed Flow Steps

### 1. Entry Point: test.html
- **File**: `core-gaming-sdk/test.html` (or similar entry HTML).
- **Purpose**: Loads the Core Gaming SDK and initializes the GameSelector.
- **Key Actions**:
  - Includes scripts for Core Gaming SDK (e.g., `bootstrap.js` or built bundle).
  - Calls `initGameSelector('game-container')` to start the SDK.
- **Output**: GameSelector instance created, initial UI rendered.

### 2. GameSelector Initialization
- **Class**: `GameSelector` in `core-gaming-sdk/src/GameSelector.ts`.
- **Constructor**:
  - Sets up container, S3 base URL, registry, loader, validator.
  - Calls `renderInitialUI()` to show the "Gaming Hub" screen.
- **Global Exposure**: Exposes `window.CoreGaming` with `Game`, `GameRegistry`, `GameSelector`, and `RegistryInstance`.

### 3. Game Registration (Plugins)
- **How Plugins Register**:
  - Game plugins (e.g., `puzzle-game-plugin.js`, `trivia-game-plugin.js`) call `window.CoreGaming.RegistryInstance.registerGame(new Game(...))`.
  - This happens when plugins are loaded or initialized.
- **Example**: Puzzle plugin registers a `PuzzleGame` instance with name 'puzzle', base URL, emoji, etc.
- **Registry**: `GameRegistry` holds all registered games in a Map.

### 4. User Interaction: Select Game
- **Initial UI**: Shows "🎮 Gaming Hub" with "🚀 Select a Game" button.
- **On Click**: Calls `showGameOptions()`, which:
  - Retrieves all games from `GameRegistry`.
  - Renders buttons for each game (e.g., "🧩 Puzzle", "❓ Trivia").
- **Game Buttons**: Each button has an event listener calling `loadGame(game)`.

### 5. Game Loading: loadGame()
- **Input**: Selected `Game` object (e.g., TriviaGame).
- **Validation Phase**:
  - Calls `game.validateRules()` with rules like `BrowserCompatibilityRule`, `NetworkConnectivityRule`, `GameResourceRule`.
  - If validation fails, shows error UI.
- **Loading Phase**:
  - Shows loading UI with spinner.
  - Calls `gameLoader.loadGame()` to dynamically load scripts from S3 (e.g., `https://si-gaming-fantasy.s3.amazonaws.com/trivia/load-app-scripts.js`).
  - Waits for scripts to load via `waitForGameScripts()` (listens for custom event like 'trivia-scripts-loaded').
- **Instance Creation**:
  - After scripts loaded, calls `findGameInstance()`:
    - Checks `window[gameName + 'Game']` or `window.gameInstances[gameName]`.
    - If not found, returns a mock instance with `start`, `pause`, `resume`, `restart`, `end` methods (includes API calls for tracking).
  - Sets `this.currentGameInstance` and `window.currentGameInstance`.
- **React Mounting**:
  - Game scripts include React app (e.g., `trivia-react/src/index.js`).
  - React app waits for `window.currentGameInstance` before mounting and rendering `<App gameInstance={...} />`.
- **Controls**: After 2 seconds, adds floating control buttons (Start, Pause, etc.) via `addGameControls()`.

### 6. Game Execution
- **React App**: Receives `gameInstance` prop, uses it for game actions (e.g., start game, track events).
- **Controls**: Buttons call `handleGameAction()` on GameSelector, which invokes methods on `currentGameInstance`.
- **API Integration**: Mock instance makes POST requests to `https://secure-lacewing-sweeping.ngrok-free.app/api/events` for events like `game_play_start`, `game_play_end`.

## Key Files and Directories
- **core-gaming-sdk/**: Core SDK code.
  - `src/GameSelector.ts`: Main selector logic.
  - `src/Game.ts`: Abstract game class.
  - `src/GameRegistry.ts`: Game registry.
  - `test.html`: Entry point.
- **game-plugins/**: Plugin scripts.
  - `puzzle/puzzle-game-plugin.js`: Registers puzzle game.
  - `trivia/trivia-game-plugin.js`: Registers trivia game.
- **puzzle/** and **trivia-game/**: Individual game React apps.
  - `src/index.js`: Entry point, waits for `window.currentGameInstance`.
  - `src/App.jsx`: Game UI, uses `gameInstance` prop.

## Common Issues and Fixes
- **window.currentGameInstance is null**:
  - Cause: React app mounts before GameSelector sets the global variable.
  - Fix: React app polls for `window.currentGameInstance` before rendering (as implemented in `index.js`).
- **Scripts not loading**: Check S3 URLs, network, CORS.
- **Validation failures**: Ensure browser supports required features, network is accessible.
- **Mock Instance**: Used when games don't expose their own instance; provides API tracking.

## API Endpoints
- **Game Events**: POST to `https://secure-lacewing-sweeping.ngrok-free.app/api/events` with auth `Basic YWRtaW46Z2FtaW5nMTIz`.
- **Event Types**: `game_play_start`, `game_play_end`.

## Future Improvements
- Replace mock instances with real game instances exposed by plugins.
- Add more validation rules or error handling.
- Support for local game loading without S3.

This flow ensures modular, dynamic game loading with centralized management via the Core Gaming SDK.
